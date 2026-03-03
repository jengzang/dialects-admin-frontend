# 用戶行為分析頁面 API 與數據缺口分析

## 概述

本文檔分析了兩個核心頁面的 API 調用情況和數據缺口：
- **用戶行為分析頁面** (http://localhost:5173/admin/#/user-behavior)
- **用戶畫像詳情頁** (http://localhost:5173/admin/#/user-profile/:username)

---

## 1. 用戶行為分析頁面 (UserBehaviorDashboard.vue)

### 1.1 當前調用的 API

| API 方法 | 端點 | 用途 |
|---------|------|------|
| `userAPI.getAllUsersComplete()` | `GET /admin/users/all` | 獲取所有用戶的完整信息 |
| `sessionAPI.getUserHistory(userId, false)` | `GET /admin/user-sessions/user/:userId/history` | 獲取每個用戶的會話歷史（僅前 50 個用戶） |

### 1.2 獲取的數據字段

從 `/admin/users/all` 獲取：
- `id` - 用戶 ID
- `username` - 用戶名
- `email` - 郵箱
- `role` - 角色
- `status` - 狀態
- `is_verified` - 是否驗證
- `created_at` - 創建時間
- `last_login` - 最後登錄時間 ⭐
- `last_login_ip` - 最後登錄 IP
- `register_ip` - 註冊 IP
- `login_count` - 登錄次數 ⭐
- `failed_attempts` - 失敗次數
- `total_online_seconds` - 總在線時長 ⭐
- `usage_summary` - 使用摘要

從 `/admin/user-sessions/user/:userId/history` 獲取：
- `sessions[]` - 會話列表
  - `session_id` - 會話 ID
  - `ip_change_count` - IP 變更次數
  - `device_change_count` - 設備變更次數
  - `is_suspicious` - 是否可疑
  - `revoked` - 是否撤銷
  - `created_at` - 創建時間
  - `last_activity_at` - 最後活動時間

### 1.3 頁面功能與數據使用

| 功能 | 數據來源 | 實現方式 |
|------|---------|---------|
| **DAU/WAU/MAU 統計** | `last_login` 字段 | ✅ 基於 `last_login` 計算過去 1/7/30 天內登錄的用戶數 |
| **平均在線時長** | `total_online_seconds` 字段 | ✅ 計算所有用戶的平均在線時長 |
| **活躍度趨勢圖** | `loginLogs` 數組 | ❌ **數據缺失** - `loginLogs` 為空數組 |
| **用戶分群餅圖** | `last_login` + `login_count` | ✅ 基於最後登錄時間和登錄次數分群 |
| **活躍時段熱力圖** | `loginLogs` 數組 | ❌ **數據缺失** - 需要詳細的登錄時間戳 |
| **用戶列表** | 所有用戶數據 + 會話數據 | ✅ 顯示用戶名、角色、登錄次數、最後登錄、活躍度、風險評分 |
| **風險評分** | 用戶統計 + 會話數據 | ✅ 基於失敗次數、IP/設備變更、可疑會話計算 |

### 1.4 關鍵數據缺口

#### ❌ 缺口 1：登錄歷史日誌（Login History Logs）

**問題**：
- 代碼中 `this.loginLogs = []` 被硬編碼為空數組（第 379 行）
- 註釋說明：「由于没有详细的登录日志，热力图数据暂时为空」（第 376-377 行）

**影響的功能**：
1. **活躍度趨勢圖** - 無法顯示過去 30 天的每日活躍用戶數
2. **活躍時段熱力圖** - 無法顯示 7x24 小時的登錄熱力圖

**需要的 API**：
```
GET /admin/login-logs/all
或
GET /admin/login-logs/success-login-logs (不帶 query 參數)
```

**需要的數據結構**：
```json
{
  "logs": [
    {
      "username": "user1",
      "timestamp": "2026-03-04T10:30:00Z",
      "ip": "192.168.1.1",
      "success": true
    }
  ]
}
```

**當前限制**：
- `/admin/login-logs/success-login-logs` 需要 `query` 參數（用戶名）
- 無法獲取所有用戶的登錄日誌

#### ❌ 缺口 2：會話數據加載限制

**問題**：
- 僅加載前 50 個用戶的會話數據（第 395 行：`this.users.slice(0, 50)`）
- 如果用戶數超過 50，後續用戶的風險評分將不準確

**影響**：
- 用戶列表中第 51+ 個用戶的風險評分為 0
- 無法準確識別所有高風險用戶

**可能的解決方案**：
1. 增加批量會話查詢 API
2. 在 `/admin/users/all` 中包含會話統計摘要
3. 按需加載（僅在查看用戶詳情時加載）

---

## 2. 用戶畫像詳情頁 (UserProfileDetail.vue)

### 2.1 當前調用的 API

| API 方法 | 端點 | 用途 |
|---------|------|------|
| `statsAPI.getUserStats(username)` | `GET /admin/stats/user/:username` | 獲取用戶統計信息 |
| `userAPI.getAllUsers()` | `GET /admin/users/all` | 獲取所有用戶（用於查找 user.id 和 data_count） |
| `sessionAPI.getUserHistory(userId, true)` | `GET /admin/user-sessions/user/:userId/history` | 獲取用戶會話歷史 |
| `analyticsAPI.getApiDetail(username)` | `GET /admin/api-usage/api-detail?query=username` | 獲取 API 使用詳情 |
| `statsAPI.getSuccessLoginLogs(username)` | `GET /admin/login-logs/success-login-logs?query=username` | 獲取成功登錄日誌 |

### 2.2 獲取的數據字段

從 `/admin/stats/user/:username` 獲取：
- `user.login_count` - 登錄次數
- `user.failed_attempts` - 失敗次數
- `user.total_online_seconds` - 總在線時長
- `user.email` - 郵箱
- `user.role` - 角色
- `user.register_ip` - 註冊 IP
- `user.last_login` - 最後登錄時間

從 `/admin/users/all` 獲取：
- `data_count` - 數據貢獻量 ⭐

從 `/admin/user-sessions/user/:userId/history` 獲取：
- `sessions[]` - 會話列表（包含 IP 變更、設備變更、可疑標記等）

從 `/admin/api-usage/api-detail?query=username` 獲取：
- `logs[]` - API 調用日誌
  - `path` - API 路徑
  - `os` - 操作系統 ⭐
  - `browser` - 瀏覽器 ⭐
  - `timestamp` - 時間戳

從 `/admin/login-logs/success-login-logs?query=username` 獲取：
- `logs[]` - 登錄日誌
  - `ip` 或 `login_ip` - 登錄 IP ⭐
  - `timestamp` - 時間戳

### 2.3 頁面功能與數據使用

| 功能區域 | 數據來源 | 實現狀態 |
|---------|---------|---------|
| **基本信息卡片** | `statsAPI.getUserStats()` | ✅ 完整 |
| **風險分析雷達圖** | 用戶統計 + 會話數據 | ✅ 完整 |
| **API 使用偏好（Top 5）** | `analyticsAPI.getApiDetail()` | ✅ 完整 |
| **API 調用頻率** | `analyticsAPI.getApiDetail()` | ✅ 完整 |
| **操作系統分布** | `analyticsAPI.getApiDetail()` 中的 `os` 字段 | ✅ 完整 |
| **瀏覽器分布** | `analyticsAPI.getApiDetail()` 中的 `browser` 字段 | ✅ 完整 |
| **會話質量分析** | `sessionAPI.getUserHistory()` | ✅ 完整 |
| **地理位置分布** | `statsAPI.getSuccessLoginLogs()` 中的 IP | ⚠️ **部分實現** |

### 2.4 關鍵數據缺口

#### ⚠️ 缺口 1：地理位置信息不完整

**當前實現**：
- 僅顯示 Top 5 IP 地址和登錄次數（第 508-520 行）
- 沒有實際的地理位置信息（國家、城市、經緯度）

**缺失的功能**：
- 地圖可視化（計劃中的 Leaflet 地圖）
- 地理位置異常檢測

**需要的數據**：
```json
{
  "ip": "192.168.1.1",
  "country": "Taiwan",
  "city": "Taipei",
  "latitude": 25.0330,
  "longitude": 121.5654
}
```

**可能的解決方案**：
1. 前端調用 `ipAPI.queryIP(ip)` 批量查詢 IP 地理位置
2. 後端在登錄日誌中預先包含地理位置信息

#### ⚠️ 缺口 2：流量異常指標缺失

**問題**：
- 風險雷達圖中「流量異常」指標硬編碼為 0（第 371 行）
- 註釋說明：「流量异常暂时为0」

**影響**：
- 無法檢測異常 API 調用模式（短時間大量調用）
- 風險評分不完整

**需要的數據**：
- API 調用頻率統計（每小時/每分鐘調用次數）
- 流量峰值檢測
- 異常流量標記

**可能的解決方案**：
1. 在 `analyticsAPI.getApiDetail()` 中添加流量統計
2. 後端計算異常流量評分

#### ✅ 缺口 3：行為時間線（已有數據但未實現）

**計劃功能**（來自 plan 文件）：
- 垂直時間軸展示最近 30 天的活動
- 事件類型：登錄、API 調用高峰、數據操作、會話撤銷

**當前狀態**：
- 數據已可用（登錄日誌 + API 日誌 + 會話數據）
- UI 組件未實現

**不是數據缺口，是實現缺口**

---

## 3. 總結：關鍵數據缺口優先級

### 🔴 高優先級（阻塞核心功能）

1. **全局登錄歷史日誌 API**
   - **影響頁面**：UserBehaviorDashboard
   - **阻塞功能**：
     - 活躍度趨勢圖（過去 30 天 DAU）
     - 活躍時段熱力圖（7x24 小時）
   - **建議 API**：
     ```
     GET /admin/login-logs/all
     或
     GET /admin/login-logs/success-login-logs (支持不帶 query 參數)
     ```
   - **返回數據**：
     ```json
     {
       "logs": [
         {
           "username": "user1",
           "timestamp": "2026-03-04T10:30:00Z",
           "ip": "192.168.1.1",
           "success": true
         }
       ]
     }
     ```

### 🟡 中優先級（影響用戶體驗）

2. **批量會話統計 API**
   - **影響頁面**：UserBehaviorDashboard
   - **問題**：僅加載前 50 個用戶的會話數據
   - **建議 API**：
     ```
     GET /admin/user-sessions/batch-stats
     POST /admin/user-sessions/batch-stats
     Body: { "user_ids": [1, 2, 3, ...] }
     ```
   - **返回數據**：
     ```json
     {
       "stats": {
         "1": {
           "total_sessions": 10,
           "suspicious_count": 1,
           "avg_ip_changes": 0.5,
           "avg_device_changes": 0.2
         }
       }
     }
     ```

3. **地理位置信息增強**
   - **影響頁面**：UserProfileDetail
   - **問題**：僅有 IP 地址，無地理位置信息
   - **建議方案**：
     - 方案 A：後端在登錄日誌中預先包含地理位置
     - 方案 B：前端批量調用 `ipAPI.queryIP()`（可能較慢）

### 🟢 低優先級（功能增強）

4. **流量異常檢測數據**
   - **影響頁面**：UserProfileDetail
   - **問題**：風險雷達圖中「流量異常」指標為 0
   - **建議**：在 API 使用詳情中添加流量統計和異常標記

5. **用戶註冊時間**
   - **影響頁面**：UserBehaviorDashboard（留存率計算）
   - **問題**：`/admin/users/all` 中有 `created_at` 字段，但可能不準確
   - **建議**：確保 `created_at` 字段準確反映註冊時間

---

## 4. 推薦的後端 API 增強

### API 1：全局登錄歷史日誌

```
GET /admin/login-logs/all
Query Parameters:
  - limit: int (default 1000, max 5000)
  - offset: int (default 0)
  - start_date: datetime (optional)
  - end_date: datetime (optional)
  - success_only: bool (default true)

Response:
{
  "logs": [
    {
      "username": "user1",
      "timestamp": "2026-03-04T10:30:00Z",
      "ip": "192.168.1.1",
      "success": true,
      "country": "Taiwan",  // optional
      "city": "Taipei"      // optional
    }
  ],
  "total": 5000,
  "has_more": true
}
```

### API 2：批量會話統計

```
POST /admin/user-sessions/batch-stats
Body:
{
  "user_ids": [1, 2, 3, ...]
}

Response:
{
  "stats": {
    "1": {
      "total_sessions": 10,
      "active_sessions": 3,
      "suspicious_count": 1,
      "revoked_count": 0,
      "avg_ip_changes": 0.5,
      "avg_device_changes": 0.2,
      "avg_duration_seconds": 3600
    }
  }
}
```

### API 3：用戶活躍度趨勢

```
GET /admin/stats/activity-trend
Query Parameters:
  - days: int (default 30, max 90)
  - granularity: string (day|hour)

Response:
{
  "trend": [
    {
      "date": "2026-03-04",
      "active_users": 150,
      "new_users": 5,
      "returning_users": 145
    }
  ]
}
```

---

## 5. 前端優化建議

### 5.1 UserBehaviorDashboard 優化

1. **臨時解決方案**：
   - 使用 `last_login` 估算 DAU/WAU/MAU（已實現）
   - 隱藏或禁用活躍度趨勢圖和熱力圖，直到後端提供數據
   - 添加提示：「詳細登錄歷史功能開發中」

2. **長期解決方案**：
   - 等待後端提供全局登錄日誌 API
   - 實現數據緩存，減少 API 調用

### 5.2 UserProfileDetail 優化

1. **地理位置可視化**：
   - 實現批量 IP 查詢（使用 `Promise.all`）
   - 添加 Leaflet 地圖組件
   - 緩存 IP 查詢結果

2. **流量異常檢測**：
   - 前端計算簡單的流量異常指標（基於 API 日誌）
   - 檢測短時間內的高頻調用

---

## 6. 結論

### 當前可用的功能

✅ **UserBehaviorDashboard**：
- DAU/WAU/MAU 統計（基於 `last_login`）
- 用戶分群餅圖
- 用戶列表（含風險評分）
- 平均在線時長

✅ **UserProfileDetail**：
- 基本信息展示
- 風險分析（除流量異常外）
- API 使用偏好和頻率
- 操作系統和瀏覽器分布
- 會話質量分析
- Top 5 登錄 IP

### 阻塞的功能

❌ **UserBehaviorDashboard**：
- 活躍度趨勢圖（需要全局登錄日誌）
- 活躍時段熱力圖（需要全局登錄日誌）

⚠️ **UserProfileDetail**：
- 地理位置地圖（需要 IP 地理位置信息）
- 流量異常指標（需要流量統計數據）

### 下一步行動

1. **立即可做**：
   - 隱藏或禁用缺失數據的圖表
   - 添加「功能開發中」提示
   - 實現前端 IP 批量查詢（地理位置）

2. **需要後端支持**：
   - 實現全局登錄日誌 API（高優先級）
   - 實現批量會話統計 API（中優先級）
   - 在登錄日誌中添加地理位置信息（中優先級）
