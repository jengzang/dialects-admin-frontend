import axios from 'axios';
import { getToken, removeToken, refreshAccessToken, isTokenExpiringSoon } from './utils/auth';
import { ElMessage } from 'element-plus';
window.WEB_BASE = "https://dialects.yzup.top"
window.ADMIN_BASE = window.WEB_BASE + "/admin";

// 創建 Axios 實例
const api = axios.create({
  baseURL: window.ADMIN_BASE,  // 後端服務地址
  timeout: 20000,  // 設置請求超時時間
});

// 防止多次重定向的标志
let isRedirecting = false;

// 請求攔截器：動態添加 Token 並檢查是否需要刷新
api.interceptors.request.use(
  async config => {
    let token = getToken();

    // 如果有 token，檢查是否即將過期
    if (token && isTokenExpiringSoon()) {
      console.log('🔄 Token 即將過期，嘗試刷新...');
      const newToken = await refreshAccessToken();
      if (newToken) {
        token = newToken;
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    console.error('請求錯誤:', error);
    return Promise.reject(error);
  }
);

// 響應攔截器：統一處理錯誤，支持 token 刷新重試
api.interceptors.response.use(
  response => {
    // 直接返回響應數據
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // 處理 401 錯誤：嘗試刷新 token 並重試
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log('收到 401，嘗試刷新 token...');
      const newToken = await refreshAccessToken();

      if (newToken) {
        // 用新 token 重試請求
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } else {
        // Token 刷新失敗，清除 token 並跳轉登錄
        if (!isRedirecting) {
          isRedirecting = true;
          removeToken();
          ElMessage.error('登錄已過期，請重新登錄');

          setTimeout(() => {
            window.location.href = '/#/login';
            isRedirecting = false;
          }, 1500);
        }

        return Promise.reject(error);
      }
    }

    // 處理其他錯誤響應
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 403:
          ElMessage.error('沒有權限訪問此資源');
          break;

        case 404:
          ElMessage.error('請求的資源不存在');
          break;

        case 500:
          ElMessage.error('服務器內部錯誤');
          break;

        case 502:
        case 503:
          ElMessage.error('服務暫時不可用，請稍後再試');
          break;

        default:
          // 顯示後端返回的錯誤信息
          const errorMessage = data?.message || data?.error || data?.detail || '請求失敗';
          ElMessage.error(errorMessage);
      }
    } else if (error.request) {
      // 請求已發送但沒有收到響應
      ElMessage.error('網絡連接失敗，請檢查網絡設置');
    } else {
      // 其他錯誤
      ElMessage.error('請求配置錯誤');
    }

    return Promise.reject(error);
  }
);

export default api;
