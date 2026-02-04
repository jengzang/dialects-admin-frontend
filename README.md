# 用戶管理系統 (Admin Dashboard)

一個基於 Vue 3 的現代化管理後台系統，提供用戶管理、數據管理、會話監控和 API 使用統計等功能。

## ✨ 功能特性

### 核心功能
- 🔐 **用戶認證系統** - JWT Token 認證，支持自動刷新
- 👥 **用戶管理** - 完整的 CRUD 操作，支持搜索和排序
- 📊 **API 使用統計** - 可視化圖表展示 API 調用數據
- 🗂️ **自定義數據管理** - 靈活的數據管理系統
- 🔍 **會話管理** - 實時監控用戶會話狀態
- 🌍 **IP 地理位置查詢** - 基於 Leaflet 的地圖展示

### 技術亮點
- ⚡ **性能優化** - 使用 Vite 構建，支持熱更新
- 🎨 **現代化 UI** - Element Plus 組件庫
- 📦 **狀態管理** - Pinia 集中式狀態管理
- 🛡️ **安全防護** - 路由守衛、請求攔截、Token 自動刷新
- 📱 **響應式設計** - 適配多種設備尺寸

## 🚀 技術棧

- **框架**: Vue 3.5.20
- **構建工具**: Vite 7.1.4
- **UI 組件**: Element Plus 2.11.1
- **狀態管理**: Pinia 3.0.4
- **路由**: Vue Router 4.5.1
- **HTTP 客戶端**: Axios 1.11.0
- **圖表**: Chart.js 4.5.0 + vue-chartjs 5.3.2
- **地圖**: Leaflet 1.9.4
- **日期處理**: Day.js 1.11.13 + date-fns 4.1.0

## 📦 安裝

### 環境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安裝依賴
```bash
npm install
```

## 🛠️ 開發

### 啟動開發服務器
```bash
npm run dev
```

訪問 http://localhost:5173 查看應用

### 構建生產版本
```bash
npm run build
```

### 預覽生產構建
```bash
npm run preview
```

## 📁 項目結構

```
frontend-admin/
├── src/
│   ├── api/                    # API 服務層
│   │   ├── index.js           # 統一導出
│   │   ├── user.js            # 用戶相關 API
│   │   ├── custom.js          # 自定義數據 API
│   │   └── session.js         # 會話相關 API
│   ├── components/            # 組件目錄
│   │   ├── Login.vue          # 登錄頁面
│   │   ├── UserManagement.vue # 用戶管理主頁
│   │   ├── user/              # 用戶相關組件
│   │   │   ├── CreateUser.vue
│   │   │   ├── EditUser.vue
│   │   │   ├── UserStats.vue
│   │   │   ├── ApiDetail.vue
│   │   │   ├── ApiChart.vue
│   │   │   └── IPQuery.vue
│   │   ├── custom/            # 自定義數據組件
│   │   │   ├── Custom.vue
│   │   │   ├── CustomPerUser.vue
│   │   │   ├── CreateCustom.vue
│   │   │   ├── EditCustom.vue
│   │   │   └── DeleteCustom.vue
│   │   └── session/           # 會話管理組件
│   │       ├── SessionManagement.vue
│   │       └── UserSessions.vue
│   ├── stores/                # Pinia 狀態管理
│   │   ├── index.js           # Store 統一導出
│   │   ├── user.js            # 用戶狀態
│   │   └── custom.js          # 自定義數據狀態
│   ├── router/                # 路由配置
│   │   └── index.js           # 路由定義和守衛
│   ├── utils/                 # 工具函數
│   │   └── auth.js            # 認證相關工具
│   ├── axios.js               # Axios 配置和攔截器
│   ├── utils.js               # 通用工具函數
│   ├── App.vue                # 根組件
│   ├── main.js                # 應用入口
│   └── style.css              # 全局樣式
├── public/                    # 靜態資源
├── index.html                 # HTML 模板
├── vite.config.js             # Vite 配置
├── package.json               # 項目依賴
├── OPTIMIZATION_GUIDE.md      # 優化指南
└── README.md                  # 項目文檔
```

## 🔧 配置

### API 基礎地址
在 `src/axios.js` 中配置後端 API 地址：

```javascript
window.WEB_BASE = "https://dialects.yzup.top"
window.ADMIN_BASE = window.WEB_BASE + "/admin"
```

### 環境變量
可以通過環境變量配置不同環境的 API 地址。

## 🎯 主要功能模塊

### 1. 用戶管理
- **用戶列表**: 查看所有用戶，支持搜索和排序
- **創建用戶**: 添加新用戶賬號
- **編輯用戶**: 修改用戶信息
- **用戶統計**: 查看用戶的 API 使用統計
- **數據管理**: 查看和管理用戶的自定義數據

### 2. API 使用監控
- **API 調用詳情**: 查看最近的 API 調用記錄
- **使用圖表**: 可視化展示 API 使用趨勢
- **統計分析**: 按用戶、時間等維度分析 API 使用情況

### 3. 自定義數據管理
- **數據列表**: 查看所有自定義數據
- **按用戶查看**: 查看特定用戶的數據
- **CRUD 操作**: 創建、編輯、刪除數據
- **批量操作**: 支持批量選擇和操作

### 4. 會話管理
- **會話列表**: 查看所有活躍會話
- **用戶會話**: 查看特定用戶的會話歷史
- **會話監控**: 實時監控會話狀態

### 5. IP 地理位置
- **IP 查詢**: 查詢 IP 地址的地理位置
- **地圖展示**: 使用 Leaflet 在地圖上標記位置

## 🔐 認證系統

### Token 管理
- 使用 JWT Token 進行身份驗證
- 自動檢測 Token 過期並刷新
- Token 存儲在 localStorage
- 支持 Refresh Token 機制

### 路由守衛
- 未登錄用戶自動重定向到登錄頁
- 登錄後跳轉到原始目標頁面
- 已登錄用戶訪問登錄頁自動重定向到首頁

### 請求攔截
- 自動為請求添加 Authorization 頭
- 401 錯誤自動嘗試刷新 Token
- 統一的錯誤處理和提示

## 📊 狀態管理

使用 Pinia 進行狀態管理，主要包括：

### User Store
- 用戶信息管理
- 用戶列表緩存
- 登錄/登出操作
- 用戶 CRUD 操作

### Custom Store
- 自定義數據管理
- 選中數據狀態
- 數據 CRUD 操作
- 加載狀態管理

詳細使用方法請參考 [OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md)

## 🚦 路由結構

| 路徑 | 組件 | 說明 | 需要認證 |
|------|------|------|----------|
| `/` | UserManagement | 用戶管理首頁 | ✅ |
| `/login` | Login | 登錄頁面 | ❌ |
| `/users/create` | CreateUser | 創建用戶 | ✅ |
| `/users/edit` | EditUser | 編輯用戶 | ✅ |
| `/users/stats` | UserStats | 用戶統計 | ✅ |
| `/apiUsage` | ApiDetail | API 使用詳情 | ✅ |
| `/utils-chart` | ApiChart | API 使用圖表 | ✅ |
| `/ip/:ip` | IPQuery | IP 地理位置查詢 | ✅ |
| `/custom` | Custom | 所有自定義數據 | ✅ |
| `/per-user` | CustomPerUser | 用戶數據 | ✅ |
| `/custom/create` | CreateCustom | 創建數據 | ✅ |
| `/custom/edit` | EditCustom | 編輯數據 | ✅ |
| `/custom/delete` | DeleteCustom | 刪除數據 | ✅ |
| `/sessions` | SessionManagement | 會話管理 | ✅ |
| `/sessions/user` | UserSessions | 用戶會話 | ✅ |

## 🔌 API 接口

### 用戶相關
- `GET /admin/users` - 獲取用戶列表
- `POST /admin/users` - 創建用戶
- `PUT /admin/users` - 更新用戶
- `DELETE /admin/users/:username` - 刪除用戶
- `GET /admin/users/:username/stats` - 獲取用戶統計

### 自定義數據
- `GET /admin/custom/all` - 獲取所有數據
- `GET /admin/custom/:username` - 獲取用戶數據
- `POST /admin/custom` - 創建數據
- `PUT /admin/custom` - 更新數據
- `DELETE /admin/custom` - 刪除數據

### 會話管理
- `GET /admin/sessions` - 獲取會話列表
- `GET /admin/sessions/:username` - 獲取用戶會話

### 認證
- `POST /auth/login` - 用戶登錄
- `POST /auth/refresh` - 刷新 Token
- `GET /auth/me` - 獲取當前用戶信息

## 💡 開發指南

### 添加新頁面

1. 在 `src/components/` 創建組件
2. 在 `src/router/index.js` 添加路由
3. 如需認證，設置 `meta: { requiresAuth: true }`

```javascript
{
  path: '/new-page',
  name: 'NewPage',
  component: NewPage,
  meta: { requiresAuth: true }
}
```

### 調用 API

推薦使用 API 服務層：

```javascript
import { userAPI } from '@/api'

// 獲取用戶列表
const response = await userAPI.getAll()
const users = response.data
```

或使用 Pinia Store（推薦）：

```javascript
import { useUserStore } from '@/stores'

const userStore = useUserStore()
await userStore.fetchUserList()
const users = userStore.userList
```

### 組件間傳遞數據

使用 Pinia Store 而不是 localStorage：

```javascript
// 發送組件
this.customStore.setSelectedUsers(this.selectedUsers)
this.$router.push({ name: 'TargetPage' })

// 接收組件
const selectedUsers = this.customStore.selectedUsers
```

### 錯誤處理

Axios 攔截器已處理常見錯誤，通常不需要額外處理：

```javascript
try {
  await userAPI.create(userData)
  ElMessage.success('創建成功')
} catch (error) {
  // 錯誤已被攔截器處理並顯示提示
  console.error(error)
}
```

## 🎨 UI 組件

使用 Element Plus 組件庫，常用組件：

- `el-button` - 按鈕
- `el-input` - 輸入框
- `el-table` - 表格
- `el-form` - 表單
- `el-dialog` - 對話框
- `el-message` - 消息提示
- `el-loading` - 加載狀態

詳細文檔：https://element-plus.org/

## 📈 性能優化

- ✅ 使用 Vite 進行快速構建
- ✅ 路由懶加載（可選）
- ✅ 組件緩存（keep-alive）
- ✅ API 請求去重
- ✅ Token 自動刷新機制
- ✅ 用戶信息緩存

## 🔒 安全特性

- JWT Token 認證
- 請求自動添加 Authorization 頭
- Token 過期自動刷新
- 路由守衛保護頁面
- XSS 防護（Vue 自動轉義）
- CSRF 防護（Token 機制）

## 📝 代碼規範

- 使用 Vue 3 Composition API 或 Options API
- 組件命名使用 PascalCase
- 文件命名使用 PascalCase
- 變量命名使用 camelCase
- 常量命名使用 UPPER_CASE
- 適當添加註釋說明複雜邏輯

## 🐛 常見問題

### 1. Token 過期怎麼辦？
系統會自動檢測並刷新 Token，無需手動處理。

### 2. 如何修改 API 地址？
在 `src/axios.js` 中修改 `window.WEB_BASE` 的值。

### 3. 如何添加新的 API 接口？
在 `src/api/` 目錄下對應的文件中添加新方法。

### 4. 頁面刷新後狀態丟失？
使用 Pinia 的持久化插件或將關鍵數據存儲在 localStorage。

## 📚 相關文檔

- [Vue 3 官方文檔](https://vuejs.org/)
- [Vite 官方文檔](https://vitejs.dev/)
- [Element Plus 文檔](https://element-plus.org/)
- [Pinia 文檔](https://pinia.vuejs.org/)
- [Vue Router 文檔](https://router.vuejs.org/)
- [優化指南](./OPTIMIZATION_GUIDE.md)

## 📄 License

MIT

## 👨‍💻 作者

joengzaang

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

---

**注意**: 本項目為管理後台系統，請確保在安全的環境中使用，並妥善保管認證信息。
