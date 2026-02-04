# 前端架構優化文檔

## 📋 目錄
1. [概述](#概述)
2. [第一階段優化](#第一階段優化)
3. [第二階段優化](#第二階段優化)
4. [使用指南](#使用指南)
5. [遷移指南](#遷移指南)

---

## 🎯 概述

本次優化針對前端項目的安全性、代碼組織和狀態管理進行了全面改進。

### 主要改進

- ✅ **安全性提升**：添加了路由守衛和請求/響應攔截器
- ✅ **代碼組織**：創建了統一的 API 服務層和認證工具
- ✅ **狀態管理**：引入 Pinia 替代 localStorage 進行組件間通信
- ✅ **錯誤處理**：統一的錯誤處理機制
- ✅ **用戶體驗**：添加了加載狀態和錯誤提示

---

## 🔴 第一階段優化

### 1. 認證工具 (`src/utils/auth.js`)

**功能**：統一管理用戶認證相關的操作

```javascript
import { getToken, setToken, removeToken, isAuthenticated } from '@/utils/auth';

// 獲取 Token
const token = getToken();

// 設置 Token
setToken('your-token');

// 移除 Token
removeToken();

// 檢查是否已登錄
if (isAuthenticated()) {
  // 用戶已登錄
}
```

---

### 2. Axios 攔截器 (`src/axios.js`)

**請求攔截器**：自動為每個請求添加 Authorization 頭

```javascript
// 不需要手動添加 token，攔截器會自動處理
const response = await api.get('/custom/all');
```

**響應攔截器**：統一處理錯誤

```javascript
// 401：自動清除 token 並跳轉到登錄頁
// 403：顯示無權限提示
// 404：顯示資源不存在提示
// 500：顯示服務器錯誤提示
// 其他：顯示具體錯誤信息
```

---

### 3. 路由守衛 (`src/router/index.js`)

**功能**：保護需要登錄的頁面

```javascript
// 路由配置中添加 meta 信息
{
  path: '/custom',
  name: 'Custom',
  component: Custom,
  meta: { requiresAuth: true } // 需要登錄
}
```

**特性**：
- 未登錄訪問受保護頁面會自動跳轉到登錄頁
- 登錄後會跳回原始目標頁面
- 已登錄用戶訪問登錄頁會重定向到首頁

---

## 🟡 第二階段優化

### 4. API 服務層

**結構**：
```
src/api/
├── index.js      # 統一導出
├── user.js       # 用戶相關 API
└── custom.js     # 自定義數據相關 API
```

**使用示例**：

```javascript
import { userAPI, customAPI } from '@/api';

// 用戶相關
await userAPI.login(credentials);
await userAPI.getAll();
await userAPI.create(userData);
await userAPI.update(userData);
await userAPI.delete(username);

// 自定義數據相關
await customAPI.getAll();
await customAPI.getUserData(username);
await customAPI.create(dataList);
await customAPI.update(dataList);
await customAPI.delete(createdAtList);
```

---

### 5. Pinia 狀態管理

**安裝**：
```bash
npm install pinia
```

**Store 結構**：
```
src/stores/
├── index.js      # 統一導出
├── user.js       # 用戶狀態
└── custom.js     # 自定義數據狀態
```

#### User Store (`src/stores/user.js`)

```javascript
import { useUserStore } from '@/stores';

export default {
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
  methods: {
    async handleLogin() {
      try {
        await this.userStore.login(credentials);
        // 登錄成功
      } catch (error) {
        // 處理錯誤
      }
    },

    handleLogout() {
      this.userStore.logout();
      this.$router.push('/login');
    }
  }
}
```

**可用方法**：
- `login(credentials)` - 用戶登錄
- `logout()` - 用戶登出
- `fetchUserList()` - 獲取用戶列表
- `createUser(userData)` - 創建用戶
- `updateUser(userData)` - 更新用戶
- `deleteUser(username)` - 刪除用戶

**可用狀態**：
- `userInfo` - 當前用戶信息
- `userList` - 用戶列表
- `loading` - 加載狀態
- `error` - 錯誤信息

---

#### Custom Store (`src/stores/custom.js`)

```javascript
import { useCustomStore } from '@/stores';

export default {
  setup() {
    const customStore = useCustomStore();
    return { customStore };
  },
  methods: {
    goToEditCustom(username) {
      // 使用 store 存儲選中的數據
      this.customStore.setSelectedUsers(this.selectedUsers);
      this.customStore.setCurrentUsername(username);

      this.$router.push({
        name: 'EditCustom',
        query: { username }
      });
    },

    async loadData() {
      // 從 store 獲取數據
      const selectedUsers = this.customStore.selectedUsers;
      // ...處理數據
    }
  }
}
```

**可用方法**：
- `setSelectedUsers(users)` - 設置選中的數據
- `clearSelectedUsers()` - 清空選中的數據
- `setCurrentUsername(username)` - 設置當前用戶名
- `fetchAllData()` - 獲取所有數據
- `fetchUserData(username)` - 獲取用戶數據
- `createData(dataList)` - 創建數據
- `updateData(dataList)` - 更新數據
- `deleteData(createdAtList)` - 刪除數據

**可用狀態**：
- `selectedUsers` - 選中的數據列表
- `currentUsername` - 當前用戶名
- `allData` - 所有數據
- `loading` - 加載狀態
- `error` - 錯誤信息

**可用 Getters**：
- `selectedCount` - 選中數據的數量
- `hasSelected` - 是否有選中的數據

---

## 📖 使用指南

### 創建新組件時

```vue
<template>
  <div>
    <el-button @click="handleAction" :loading="customStore.loading">
      操作按鈕
    </el-button>
    <p v-if="customStore.error">{{ customStore.error }}</p>
  </div>
</template>

<script>
import { useCustomStore } from '@/stores';
import { customAPI } from '@/api';

export default {
  setup() {
    const customStore = useCustomStore();
    return { customStore };
  },

  methods: {
    async handleAction() {
      try {
        // 使用 API
        const response = await customAPI.getAll();
        console.log(response.data);

        // 或使用 Store（推薦，因為有狀態管理）
        await this.customStore.fetchAllData();
      } catch (error) {
        // 錯誤已被攔截器處理，會自動顯示提示
        console.error(error);
      }
    }
  }
}
</script>
```

---

### 處理加載狀態

```vue
<template>
  <div v-loading="loading">
    <!-- 內容 -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false
    };
  },

  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const response = await customAPI.getAll();
        // 處理數據
      } catch (error) {
        // 處理錯誤
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
```

---

### 組件間傳遞數據

**舊方式（不推薦）**：
```javascript
// 發送組件
localStorage.setItem('selectedUsers', JSON.stringify(this.selectedUsers));

// 接收組件
const selectedUsers = JSON.parse(localStorage.getItem('selectedUsers'));
```

**新方式（推薦）**：
```javascript
// 發送組件
this.customStore.setSelectedUsers(this.selectedUsers);
this.$router.push({ name: 'TargetPage' });

// 接收組件
const selectedUsers = this.customStore.selectedUsers;
```

---

## 🔄 遷移指南

### 從舊 API 調用遷移

**之前**：
```javascript
import api from '../../axios.js';

const response = await api.get('/custom/all');
const data = response.data;
```

**之後**：
```javascript
import { customAPI } from '@/api';

// 方式1：直接使用 API
const response = await customAPI.getAll();
const data = response.data;

// 方式2：使用 Store（推薦）
await this.customStore.fetchAllData();
const data = this.customStore.allData;
```

---

### 從 localStorage 遷移

**之前**：
```javascript
// 存儲
localStorage.setItem('selectedUsers', JSON.stringify(users));

// 讀取
const users = JSON.parse(localStorage.getItem('selectedUsers'));

// 清除
localStorage.removeItem('selectedUsers');
```

**之後**：
```javascript
// 存儲
this.customStore.setSelectedUsers(users);

// 讀取
const users = this.customStore.selectedUsers;

// 清除
this.customStore.clearSelectedUsers();
```

---

## 🎨 最佳實踐

### 1. 錯誤處理

```javascript
async fetchData() {
  try {
    await this.customStore.fetchAllData();
    ElMessage.success('數據加載成功');
  } catch (error) {
    // 錯誤已被攔截器處理，顯示了提示
    // 這裡可以做額外的錯誤處理
    console.error('加載數據失敗:', error);
  }
}
```

---

### 2. 加載狀態

```vue
<template>
  <!-- 使用 Store 的 loading 狀態 -->
  <div v-loading="customStore.loading">
    <button @click="loadData" :disabled="customStore.loading">
      {{ customStore.loading ? '加載中...' : '加載數據' }}
    </button>
  </div>
</template>
```

---

### 3. 表單提交

```javascript
async submitForm() {
  // 驗證表單
  if (!this.validateForm()) {
    ElMessage.warning('請填寫完整信息');
    return;
  }

  try {
    await this.customStore.createData(this.formData);
    ElMessage.success('提交成功');
    this.$router.back();
  } catch (error) {
    // 錯誤已被處理
  }
}
```

---

## 📝 注意事項

1. **Token 管理**：不要手動操作 token，使用 `auth.js` 中的工具函數
2. **錯誤處理**：攔截器已處理常見錯誤，通常不需要額外的錯誤提示
3. **狀態管理**：組件間傳遞數據優先使用 Pinia Store
4. **API 調用**：優先使用 API 服務層而不是直接調用 axios
5. **路由保護**：新增路由記得添加 `meta: { requiresAuth: true }`

---

## 🚀 下一步優化建議

1. 添加 TypeScript 支持
2. 實現服務端分頁和搜索
3. 添加搜索防抖
4. 提取公共邏輯到 Composables
5. 添加單元測試

---

## 📞 聯繫支持

如有問題，請查看：
- 項目 README
- 代碼註釋
- 開發文檔
