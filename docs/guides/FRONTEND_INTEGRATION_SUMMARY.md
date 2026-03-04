# 用户会话管理系统 - 前端集成摘要

> **目标读者**: 负责用户管理系统前端开发的 Claude Agent
> **更新日期**: 2026-02-11
> **状态**: ✅ 后端已完成，等待前端集成

---

## 📌 核心变更

后端新增了 **9 个会话管理接口**，基于 `Session` 模型，提供比旧接口更强大的功能。

### 新旧对比

| 特性 | 旧接口 `/admin/sessions/*` | 新接口 `/admin/user-sessions/*` |
|------|---------------------------|--------------------------------|
| 数据源 | RefreshToken 表 | Session 表 |
| IP 历史 | ❌ | ✅ 完整历史记录 |
| 设备追踪 | ❌ | ✅ 设备变更检测 |
| 在线时长 | ❌ | ✅ 累计 + 当前会话 |
| 可疑标记 | ❌ | ✅ 手动/自动标记 |
| 活动时间线 | ❌ | ✅ 完整事件重建 |
| 高级筛选 | ❌ | ✅ 多字段组合 |
| 批量操作 | ❌ | ✅ 批量撤销 |
| 统计仪表板 | 基础 | ✅ 全面统计 |

**重要**: 旧接口仍然可用（向后兼容），但建议新功能使用新接口。

---

## 🔐 认证要求

所有接口都需要**管理员权限**：

```javascript
const headers = {
  'Authorization': `Bearer ${adminAccessToken}`,
  'Content-Type': 'application/json'
};
```

非管理员访问将返回 `403 Forbidden`。

---

## 📡 9 个新接口速查

### 1. 列出会话（带高级筛选）
```http
GET /admin/user-sessions/list
```

**常用参数**:
- `user_id` - 按用户筛选
- `username` - 按用户名筛选（模糊）
- `is_suspicious` - 筛选可疑会话
- `revoked` - 筛选撤销状态
- `ip_address` - 按 IP 筛选
- `created_after` / `created_before` - 时间范围
- `sort_by` - 排序字段
- `sort_order` - asc/desc
- `skip` / `limit` - 分页

**响应**:
```json
{
  "total": 150,
  "skip": 0,
  "limit": 20,
  "sessions": [
    {
      "id": 1,
      "session_id": "uuid...",
      "user_id": 123,
      "username": "testuser",
      "created_at": "2026-02-10T10:00:00",
      "expires_at": "2026-03-12T10:00:00",
      "last_activity_at": "2026-02-11T15:30:00",
      "revoked": false,
      "current_ip": "192.168.1.100",
      "device_info": "Mozilla/5.0...",
      "is_suspicious": false,
      "refresh_count": 25,
      "active_token_count": 1
    }
  ]
}
```

---

### 2. 获取会话详情
```http
GET /admin/user-sessions/{session_id}
```

**响应** (比列表更详细):
```json
{
  "id": 123,
  "session_id": "uuid...",
  "user_id": 456,
  "username": "testuser",
  "ip_history": [
    {"ip": "192.168.1.100", "timestamp": "2026-02-10T10:00:00"},
    {"ip": "192.168.1.101", "timestamp": "2026-02-10T12:00:00"}
  ],
  "ip_change_count": 2,
  "device_change_count": 0,
  "total_online_seconds": 18000,
  "is_suspicious": false,
  "suspicious_reason": null,
  ...
}
```

---

### 3. 获取活动时间线
```http
GET /admin/user-sessions/{session_id}/activity
```

**响应**:
```json
{
  "session_id": "uuid...",
  "user_id": 456,
  "username": "testuser",
  "events": [
    {
      "timestamp": "2026-02-10T10:00:00",
      "event_type": "created",
      "details": "Session created from 192.168.1.100"
    },
    {
      "timestamp": "2026-02-10T12:00:00",
      "event_type": "ip_changed",
      "details": "IP changed to 192.168.1.101"
    }
  ]
}
```

---

### 4. 撤销单个会话
```http
POST /admin/user-sessions/{session_id}/revoke?reason=admin_action
```

**响应**:
```json
{
  "message": "Session revoked successfully",
  "revoked_tokens": 3
}
```

---

### 5. 批量撤销会话
```http
POST /admin/user-sessions/revoke-bulk
```

**请求体**:
```json
{
  "session_ids": [123, 456, 789],
  "reason": "admin_action"
}
```

**响应**:
```json
{
  "revoked_count": 3,
  "failed_count": 0,
  "details": [
    {"session_id": 123, "status": "success", "username": "user1"},
    {"session_id": 456, "status": "success", "username": "user2"}
  ]
}
```

---

### 6. 撤销用户所有会话
```http
POST /admin/user-sessions/revoke-user/{user_id}?reason=account_suspended
```

**响应**:
```json
{
  "message": "All sessions revoked for user testuser",
  "user_id": 456,
  "username": "testuser",
  "revoked_count": 3
}
```

---

### 7. 标记/取消标记可疑会话
```http
POST /admin/user-sessions/{session_id}/flag
```

**请求体**:
```json
{
  "is_suspicious": true,
  "reason": "Unusual IP changes detected"
}
```

**响应**: 返回完整的会话详情（同接口 2）

---

### 8. 统计仪表板
```http
GET /admin/user-sessions/stats?start_date=...&end_date=...
```

**响应**:
```json
{
  "total_sessions": 1500,
  "active_sessions": 245,
  "revoked_sessions": 1100,
  "expired_sessions": 155,
  "suspicious_sessions": 23,
  "unique_users_with_sessions": 456,
  "total_online_hours": 12345.67,
  "avg_session_duration_hours": 8.23,
  "top_ip_changes": [
    {"session_id": "abc-123", "username": "user1", "count": 15}
  ],
  "top_device_changes": [
    {"session_id": "ghi-789", "username": "user3", "count": 8}
  ]
}
```

---

### 9. 获取用户会话历史
```http
GET /admin/user-sessions/user/{user_id}/history?include_revoked=true
```

**响应**: 与接口 1 相同的分页列表格式

---

## 💡 前端集成建议

### 推荐的页面结构

#### 1. 会话列表页面
- 使用接口 1 (`/list`) 获取会话列表
- 支持筛选：用户名、可疑状态、时间范围
- 支持排序：创建时间、最后活动时间、IP 变更次数
- 支持分页：`skip` / `limit`
- 显示关键信息：用户名、IP、设备、状态、活跃 token 数

#### 2. 会话详情页面
- 使用接口 2 (`/{session_id}`) 获取详情
- 使用接口 3 (`/{session_id}/activity`) 获取时间线
- 显示完整信息：IP 历史、设备信息、在线时长
- 提供操作按钮：撤销、标记可疑

#### 3. 统计仪表板页面
- 使用接口 8 (`/stats`) 获取统计数据
- 显示关键指标：总会话数、活跃会话数、可疑会话数
- 显示 Top 榜单：IP 变更、设备变更
- 支持时间范围筛选

#### 4. 用户管理页面（集成）
- 在用户详情页添加"会话历史"标签
- 使用接口 9 (`/user/{user_id}/history`) 获取用户会话
- 提供"强制下线"按钮（接口 6）

---

## 🎨 UI 组件建议

### 会话状态徽章
```javascript
function SessionStatusBadge({ session }) {
  if (session.revoked) return <Badge color="gray">已撤销</Badge>;
  if (session.is_suspicious) return <Badge color="red">可疑</Badge>;
  if (session.active_token_count > 0) return <Badge color="green">活跃</Badge>;
  return <Badge color="yellow">过期</Badge>;
}
```

### IP 历史时间线
```javascript
function IPHistoryTimeline({ ipHistory }) {
  return (
    <Timeline>
      {ipHistory.map((item, index) => (
        <Timeline.Item key={index}>
          <div>{item.ip}</div>
          <div>{formatDate(item.timestamp)}</div>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
```

### 活动事件列表
```javascript
function ActivityEventList({ events }) {
  const eventIcons = {
    created: '🎉',
    refreshed: '🔄',
    ip_changed: '🌐',
    device_changed: '📱',
    flagged_suspicious: '⚠️',
    revoked: '🚫'
  };

  return (
    <List>
      {events.map((event, index) => (
        <List.Item key={index}>
          <span>{eventIcons[event.event_type]}</span>
          <span>{event.details}</span>
          <span>{formatDate(event.timestamp)}</span>
        </List.Item>
      ))}
    </List>
  );
}
```

---

## 🔧 JavaScript 集成示例

### 封装 API 客户端

```javascript
class SessionAPI {
  constructor(baseURL, getToken) {
    this.baseURL = baseURL;
    this.getToken = getToken;
  }

  async request(endpoint, options = {}) {
    const token = await this.getToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  // 列出会话
  async listSessions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/user-sessions/list?${query}`);
  }

  // 获取详情
  async getSession(sessionId) {
    return this.request(`/admin/user-sessions/${sessionId}`);
  }

  // 获取活动时间线
  async getActivity(sessionId) {
    return this.request(`/admin/user-sessions/${sessionId}/activity`);
  }

  // 撤销会话
  async revokeSession(sessionId, reason = 'admin_action') {
    return this.request(
      `/admin/user-sessions/${sessionId}/revoke?reason=${reason}`,
      { method: 'POST' }
    );
  }

  // 批量撤销
  async revokeBulk(sessionIds, reason = 'admin_action') {
    return this.request('/admin/user-sessions/revoke-bulk', {
      method: 'POST',
      body: JSON.stringify({ session_ids: sessionIds, reason })
    });
  }

  // 撤销用户所有会话
  async revokeUser(userId, reason = 'admin_action') {
    return this.request(
      `/admin/user-sessions/revoke-user/${userId}?reason=${reason}`,
      { method: 'POST' }
    );
  }

  // 标记可疑
  async flagSession(sessionId, isSuspicious, reason = null) {
    return this.request(`/admin/user-sessions/${sessionId}/flag`, {
      method: 'POST',
      body: JSON.stringify({ is_suspicious: isSuspicious, reason })
    });
  }

  // 获取统计
  async getStats(startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/user-sessions/stats?${query}`);
  }

  // 获取用户历史
  async getUserHistory(userId, includeRevoked = true) {
    return this.request(
      `/admin/user-sessions/user/${userId}/history?include_revoked=${includeRevoked}`
    );
  }
}

// 使用示例
const sessionAPI = new SessionAPI('http://localhost:5000', () => getAdminToken());

// 查询可疑会话
const suspicious = await sessionAPI.listSessions({ is_suspicious: true });

// 撤销会话
await sessionAPI.revokeSession(123, 'suspicious_activity');

// 获取统计
const stats = await sessionAPI.getStats();
```

---

## ⚠️ 常见错误处理

```javascript
async function handleSessionOperation(operation) {
  try {
    const result = await operation();
    showSuccess('操作成功');
    return result;
  } catch (error) {
    if (error.message.includes('401')) {
      showError('登录已过期，请重新登录');
      redirectToLogin();
    } else if (error.message.includes('403')) {
      showError('权限不足，需要管理员权限');
    } else if (error.message.includes('404')) {
      showError('会话不存在或已被删除');
    } else {
      showError(`操作失败: ${error.message}`);
    }
    throw error;
  }
}

// 使用
await handleSessionOperation(() =>
  sessionAPI.revokeSession(sessionId, reason)
);
```

---

## 📊 推荐的数据刷新策略

```javascript
// 1. 列表页面：每 30 秒自动刷新
useEffect(() => {
  const interval = setInterval(() => {
    refreshSessionList();
  }, 30000);
  return () => clearInterval(interval);
}, []);

// 2. 详情页面：每 10 秒刷新
useEffect(() => {
  const interval = setInterval(() => {
    refreshSessionDetail();
  }, 10000);
  return () => clearInterval(interval);
}, [sessionId]);

// 3. 统计页面：手动刷新或每 60 秒
const [stats, setStats] = useState(null);
const [lastUpdate, setLastUpdate] = useState(null);

async function refreshStats() {
  const data = await sessionAPI.getStats();
  setStats(data);
  setLastUpdate(new Date());
}
```

---

## 🧪 测试建议

### 1. 功能测试清单
- [ ] 列表页面加载和筛选
- [ ] 详情页面显示完整信息
- [ ] 活动时间线正确渲染
- [ ] 撤销操作成功并更新 UI
- [ ] 批量撤销正确处理
- [ ] 可疑标记功能正常
- [ ] 统计数据准确显示
- [ ] 用户历史正确加载

### 2. 边界情况测试
- [ ] 空列表显示
- [ ] 分页边界（第一页、最后一页）
- [ ] 无 IP 历史的会话
- [ ] 已撤销的会话操作
- [ ] 权限不足的错误处理
- [ ] 网络错误的重试机制

---

## 📚 完整文档参考

1. **API 技术文档**: `ADMIN_SESSION_API_GUIDE.md`
   - 所有端点的详细说明
   - 完整的请求/响应示例
   - 错误处理指南

2. **快速开始指南**: `ADMIN_SESSION_QUICKSTART.md`
   - curl 命令示例
   - Python/JavaScript 代码示例
   - 常见问题解答

3. **实施总结**: `ADMIN_SESSION_IMPLEMENTATION_SUMMARY.md`
   - 后端实现细节
   - 文件变更清单
   - 测试验证结果

4. **浏览器测试工具**: `admin_session_test_panel.html`
   - 可直接在浏览器中测试所有接口
   - 无需编写代码即可验证功能

---

## ✅ 集成检查清单

### 开发前
- [ ] 阅读本文档
- [ ] 阅读 `ADMIN_SESSION_API_GUIDE.md`
- [ ] 使用 `admin_session_test_panel.html` 测试接口
- [ ] 确认管理员权限配置

### 开发中
- [ ] 封装 API 客户端类
- [ ] 实现会话列表页面
- [ ] 实现会话详情页面
- [ ] 实现统计仪表板
- [ ] 集成到用户管理页面
- [ ] 添加错误处理
- [ ] 添加加载状态

### 开发后
- [ ] 功能测试（所有操作）
- [ ] 边界测试（空数据、错误情况）
- [ ] 性能测试（大量数据）
- [ ] 权限测试（非管理员访问）
- [ ] 跨浏览器测试
- [ ] 移动端适配测试

---

## 🚀 快速开始

1. **验证后端接口**:
   ```bash
   # 打开浏览器测试工具
   open admin_session_test_panel.html

   # 或使用 curl 测试
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/admin/user-sessions/list
   ```

2. **创建 API 客户端**:
   - 复制上面的 `SessionAPI` 类
   - 配置 `baseURL` 和 token 获取函数

3. **实现第一个页面**:
   - 从会话列表页面开始
   - 使用 `listSessions()` 方法
   - 添加基本的筛选和分页

4. **逐步扩展**:
   - 添加详情页面
   - 添加统计仪表板
   - 集成到现有用户管理系统

---

## 💬 需要帮助？

- 查看完整文档：`ADMIN_SESSION_API_GUIDE.md`
- 运行测试脚本：`python test_user_sessions_endpoints.py`
- 使用浏览器工具：`admin_session_test_panel.html`
- 查看项目文档：`CLAUDE.md`

---

**文档版本**: v1.0
**最后更新**: 2026-02-11
**维护者**: Backend Team
