# Admin Session Management API - 快速开始

## 3 分钟快速上手

### 1. 验证安装 ✅

```bash
cd C:\Users\joengzaang\myfiles\server\fastapi

# 验证端点注册
python test_user_sessions_endpoints.py
```

**预期输出**：
```
[SUCCESS] All endpoints verified!
Total: 9/9 new endpoints + 6/6 legacy endpoints
```

---

### 2. 启动服务

```bash
# 开发模式（热重载）
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000

# 生产模式（多进程）
uvicorn app.main:app --host 0.0.0.0 --port 5000 --workers 4
```

访问 API 文档：http://localhost:5000/docs

---

### 3. 获取管理员 Token

```bash
# 登录获取 token
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password"}'
```

**响应示例**：
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "def502...",
  "token_type": "bearer"
}
```

保存 `access_token` 用于后续请求。

---

### 4. 尝试新 API

#### 查看所有会话
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/admin/user-sessions/list
```

#### 查看可疑会话
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/admin/user-sessions/list?is_suspicious=true"
```

#### 查看统计数据
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/admin/user-sessions/stats
```

#### 查看会话详情
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/admin/user-sessions/1
```

#### 查看活动时间线
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/admin/user-sessions/1/activity
```

---

## 常用操作速查

### 查询操作

```bash
# 列出所有会话（分页）
GET /admin/user-sessions/list?skip=0&limit=20

# 筛选特定用户
GET /admin/user-sessions/list?user_id=123

# 筛选可疑会话
GET /admin/user-sessions/list?is_suspicious=true

# 筛选活跃会话
GET /admin/user-sessions/list?revoked=false

# 按 IP 筛选
GET /admin/user-sessions/list?ip_address=192.168.1.100

# 时间范围筛选
GET /admin/user-sessions/list?created_after=2026-02-01T00:00:00&created_before=2026-02-11T23:59:59

# 排序（按 IP 变更次数降序）
GET /admin/user-sessions/list?sort_by=ip_change_count&sort_order=desc
```

### 管理操作

```bash
# 撤销单个会话
POST /admin/user-sessions/123/revoke?reason=suspicious_activity

# 批量撤销
POST /admin/user-sessions/revoke-bulk
Body: {"session_ids": [123, 456], "reason": "admin_action"}

# 撤销用户所有会话
POST /admin/user-sessions/revoke-user/456?reason=account_suspended

# 标记可疑会话
POST /admin/user-sessions/123/flag
Body: {"is_suspicious": true, "reason": "Manual review required"}

# 取消可疑标记
POST /admin/user-sessions/123/flag
Body: {"is_suspicious": false}
```

### 统计操作

```bash
# 全局统计
GET /admin/user-sessions/stats

# 指定时间范围统计
GET /admin/user-sessions/stats?start_date=2026-02-01T00:00:00&end_date=2026-02-11T23:59:59

# 用户会话历史
GET /admin/user-sessions/user/456/history

# 用户活跃会话
GET /admin/user-sessions/user/456/history?include_revoked=false
```

---

## 在 Python 中使用

### 示例代码

```python
import requests

# 配置
BASE_URL = "http://localhost:5000"
ADMIN_TOKEN = "YOUR_ADMIN_TOKEN"

headers = {
    "Authorization": f"Bearer {ADMIN_TOKEN}",
    "Content-Type": "application/json"
}

# 1. 查询可疑会话
response = requests.get(
    f"{BASE_URL}/admin/user-sessions/list",
    headers=headers,
    params={"is_suspicious": True}
)
suspicious_sessions = response.json()
print(f"Found {suspicious_sessions['total']} suspicious sessions")

# 2. 查看会话详情
session_id = suspicious_sessions['sessions'][0]['id']
response = requests.get(
    f"{BASE_URL}/admin/user-sessions/{session_id}",
    headers=headers
)
detail = response.json()
print(f"Session {detail['session_id']} from {detail['username']}")
print(f"IP changes: {detail['ip_change_count']}")
print(f"Device changes: {detail['device_change_count']}")

# 3. 撤销会话
response = requests.post(
    f"{BASE_URL}/admin/user-sessions/{session_id}/revoke",
    headers=headers,
    params={"reason": "suspicious_activity"}
)
result = response.json()
print(f"Revoked {result['revoked_tokens']} tokens")

# 4. 查看统计
response = requests.get(
    f"{BASE_URL}/admin/user-sessions/stats",
    headers=headers
)
stats = response.json()
print(f"Total sessions: {stats['total_sessions']}")
print(f"Active sessions: {stats['active_sessions']}")
print(f"Suspicious sessions: {stats['suspicious_sessions']}")
```

---

## 在 JavaScript/TypeScript 中使用

### 示例代码

```typescript
const BASE_URL = "http://localhost:5000";
const ADMIN_TOKEN = "YOUR_ADMIN_TOKEN";

const headers = {
  "Authorization": `Bearer ${ADMIN_TOKEN}`,
  "Content-Type": "application/json"
};

// 1. 查询可疑会话
const listResponse = await fetch(
  `${BASE_URL}/admin/user-sessions/list?is_suspicious=true`,
  { headers }
);
const suspiciousSessions = await listResponse.json();
console.log(`Found ${suspiciousSessions.total} suspicious sessions`);

// 2. 查看会话详情
const sessionId = suspiciousSessions.sessions[0].id;
const detailResponse = await fetch(
  `${BASE_URL}/admin/user-sessions/${sessionId}`,
  { headers }
);
const detail = await detailResponse.json();
console.log(`Session ${detail.session_id} from ${detail.username}`);

// 3. 撤销会话
const revokeResponse = await fetch(
  `${BASE_URL}/admin/user-sessions/${sessionId}/revoke?reason=suspicious_activity`,
  { method: "POST", headers }
);
const result = await revokeResponse.json();
console.log(`Revoked ${result.revoked_tokens} tokens`);

// 4. 批量撤销
const bulkResponse = await fetch(
  `${BASE_URL}/admin/user-sessions/revoke-bulk`,
  {
    method: "POST",
    headers,
    body: JSON.stringify({
      session_ids: [123, 456],
      reason: "admin_action"
    })
  }
);
const bulkResult = await bulkResponse.json();
console.log(`Bulk revoke: ${bulkResult.revoked_count} success, ${bulkResult.failed_count} failed`);
```

---

## 常见问题

### Q1: 如何区分新旧 API？
- **新 API**：`/admin/user-sessions/*` - 基于 Session 模型，推荐使用
- **旧 API**：`/admin/sessions/*` - 基于 RefreshToken 模型，向后兼容

### Q2: 旧 API 何时会被移除？
- 目前无移除计划，保持向后兼容
- 建议新功能使用新 API
- 旧端点已标记为 `(legacy)`

### Q3: 如何获取管理员权限？
- 所有端点需要管理员权限
- 在数据库中设置 `users.role = 'admin'`
- 或使用 `/admin/users/*` 端点管理用户角色

### Q4: API 有速率限制吗？
- 是的，配置在 `common/api_config.py`
- 管理员端点启用限流（防止滥用）
- 可根据需要调整配置

### Q5: 如何查看 IP 历史？
- 使用 `GET /admin/user-sessions/{session_id}` 获取详情
- 响应中的 `ip_history` 字段包含完整历史
- 格式：`[{"ip": "...", "timestamp": "..."}, ...]`

### Q6: 统计数据是实时的吗？
- 是的，每次请求都重新计算
- 未来可能添加缓存优化
- 可通过 `start_date` / `end_date` 限制范围

---

## 故障排查

### 问题 1: 401 Unauthorized
**原因**：Token 无效或过期
**解决**：重新登录获取新 token

### 问题 2: 403 Forbidden
**原因**：非管理员用户
**解决**：使用管理员账户登录

### 问题 3: 404 Session not found
**原因**：Session ID 不存在
**解决**：使用 `/list` 端点查询有效的 session ID

### 问题 4: 端点返回 404
**原因**：端点未注册
**解决**：运行 `python test_user_sessions_endpoints.py` 验证

### 问题 5: 性能慢
**原因**：大量数据无分页
**解决**：使用 `skip` / `limit` 参数分页查询

---

## 下一步

1. **阅读完整文档**：`ADMIN_SESSION_API_GUIDE.md`
2. **查看实施总结**：`ADMIN_SESSION_IMPLEMENTATION_SUMMARY.md`
3. **运行测试**：`python test_user_sessions_endpoints.py`
4. **集成到前端**：使用上述示例代码
5. **监控和优化**：查看 API 日志和统计数据

---

## 技术支持

- 项目文档：`CLAUDE.md`
- API 文档：http://localhost:5000/docs
- 测试脚本：`test_user_sessions_endpoints.py`
- 问题反馈：项目 GitHub Issues

---

**快速开始指南版本**：v1.0
**最后更新**：2026-02-11
