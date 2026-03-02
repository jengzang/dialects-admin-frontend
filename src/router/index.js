import {createRouter, createWebHashHistory} from 'vue-router'
import { isAuthenticated, getUserCache, saveUserCache, removeToken } from '../utils/auth'
import { ElMessage } from 'element-plus'
import api from '../axios.js'
import UserManagement from '../components/UserManagement.vue'
import EditUser from '../components/user/EditUser.vue'
import UserStats from '../components/user/UserStats.vue'
import Login from '../components/Login.vue'
import CreateUser from '../components/user/CreateUser.vue'
import ApiDetail from "../components/user/ApiDetail.vue"
import Custom from "../components/custom/Custom.vue"
import CustomPerUser from "../components/custom/CustomPerUser.vue"
import CreateCustom from "../components/custom/CreateCustom.vue"
import DeleteCustom from "../components/custom/DeleteCustom.vue"
import EditCustom from "../components/custom/EditCustom.vue"
import IP from "../components/user/IPQuery.vue"
import SessionManagement from "../components/session/SessionManagement.vue"
import UserSessions from "../components/session/UserSessions.vue"
import UserSessionManagement from "../components/session/UserSessionManagement.vue"
import GlobalSessionManagement from "../components/session/GlobalSessionManagement.vue"

// 根路徑配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: UserManagement,
    meta: { requiresAuth: true } // 需要登錄
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false } // 不需要登錄
  },
  {
    path: '/users/create',
    name: 'CreateUser',
    component: CreateUser,
    meta: { requiresAuth: true }
  },
  {
    path: '/users/edit',
    name: 'EditUser',
    component: EditUser,
    meta: { requiresAuth: true }
  },
  {
    path: '/apiUsage',
    name: 'ApiDetail',
    component: ApiDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/ip/:ip',
    name: 'IP',
    component: IP,
    meta: { requiresAuth: true }
  },
  {
    path: '/users/stats',
    name: 'UserStats',
    component: UserStats,
    meta: { requiresAuth: true }
  },
  {
    path: '/custom',
    name: 'Custom',
    component: Custom,
    meta: { requiresAuth: true }
  },
  {
    path: '/per-user',
    name: 'PerUser',
    component: CustomPerUser,
    meta: { requiresAuth: true }
  },
  {
    path: '/custom/create',
    name: 'CreateCustom',
    component: CreateCustom,
    meta: { requiresAuth: true }
  },
  {
    path: '/custom/delete',
    name: 'DeleteCustom',
    component: DeleteCustom,
    meta: { requiresAuth: true }
  },
  {
    path: '/custom/edit',
    name: 'EditCustom',
    component: EditCustom,
    meta: { requiresAuth: true }
  },
  {
    path: '/sessions',
    name: 'SessionManagement',
    component: SessionManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/sessions/user',
    name: 'UserSessions',
    component: UserSessions,
    meta: { requiresAuth: true }
  },
  {
    path: '/user-sessions/:userId',
    name: 'UserSessionManagement',
    component: UserSessionManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/sessions/global',
    name: 'GlobalSessionManagement',
    component: GlobalSessionManagement,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

// 用戶信息初始化標誌
let userInfoInitialized = false;

/**
 * 初始化用戶信息
 * 優先從緩存讀取，如果沒有則從 API 獲取
 */
async function initUserInfo() {
  if (userInfoInitialized) return true;

  // 先檢查緩存
  const cachedUser = getUserCache();
  if (cachedUser) {
    console.log('✅ 從緩存加載用戶信息');
    userInfoInitialized = true;
    return true;
  }

  // 緩存未命中，從 API 獲取
  try {
    // 注意：/auth/me 使用基礎路徑，不是 admin 路徑
    const WEB_BASE = window.WEB_BASE || 'http://localhost:5000';
    const response = await fetch(WEB_BASE + '/auth/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('ACCESS_TOKEN')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await response.json();

    // 保存到緩存
    saveUserCache(userData);
    userInfoInitialized = true;

    console.log('✅ 從 API 獲取用戶信息成功');
    return true;
  } catch (error) {
    console.error('❌ 獲取用戶信息失敗:', error);
    return false;
  }
}

// 全局前置守衛：檢查登錄狀態
router.beforeEach(async (to, from, next) => {
  const isLoggedIn = isAuthenticated();

  // 檢查路由是否需要登錄
  if (to.meta.requiresAuth) {
    if (isLoggedIn) {
      // 已登錄，嘗試初始化用戶信息
      const userInfoLoaded = await initUserInfo();

      if (userInfoLoaded) {
        // 用戶信息加載成功，允許訪問
        next();
      } else {
        // 用戶信息加載失敗（可能 token 無效），清除 token 並跳轉到登錄頁
        removeToken();
        ElMessage.warning('登錄已過期，請重新登錄');
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        });
      }
    } else {
      // 未登錄，跳轉到登錄頁
      ElMessage.warning('請先登錄');
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }
  } else {
    // 不需要登錄的路由
    if (to.path === '/login' && isLoggedIn) {
      // 已登錄用戶訪問登錄頁，重定向到首頁
      next({ path: '/' });
    } else {
      next();
    }
  }
});

// 導出重置函數，供登出時使用
export function resetUserInfoCache() {
  userInfoInitialized = false;
}

// 將重置函數掛載到 window，供 auth.js 調用
if (typeof window !== 'undefined') {
  window.__resetUserInfoCache = resetUserInfoCache;
}

export default router
