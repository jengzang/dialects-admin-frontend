# Admin Session Management API - 使用指南

## 概述

新的 `/admin/user-sessions/*` API 基于 **Session 模型**，提供完整的会话追踪、统计和管理功能。相比旧的 `/admin/sessions/*` API（基于 RefreshToken），新 API 提供了更丰富的会话元数据和管理能力。

## 主要特性

- ✅ **完整会话追踪**：IP 历史、设备变更、在线时长
- ✅ **安全监控**：可疑会话检测和标记
- ✅ **详细统计**：会话活动时间线、Top 变更榜单
- ✅ **高级筛选**：支持多字段组合查询和排序
- ✅ **批量操作**：批量撤销、用户级撤销
- ✅ **向后兼容**：旧端点保持可用

## API 端点一览

### 1. 列出会话（高级过滤）
```http
GET /admin/user-sessions/list
```

**查询参数**：
- `user_id` - 按用户 ID 筛选
- `username` - 按用户名筛选（模糊匹配）
- `is_suspicious` - 筛选可疑会话
- `revoked` - 筛选撤销状态
- `ip_address` - 按当前 IP 筛选
- `created_after` / `created_before` - 创建时间范围
- `sort_by` - 排序字段（默认：created_at）
- `sort_order` - 排序方向（asc/desc）
- `skip` / `limit` - 分页参数

**示例**：
```bash
# 查询所有可疑会话
curl -H "Authorization: Bearer <admin_token>" \
  "http://localhost:5000/admin/user-sessions/list?is_suspicious=true"

# 查询特定用户的活跃会话
curl -H "Authorization: Bearer <admin_token>" \
  "http://localhost:5000/admin/user-sessions/list?user_id=123&revoked=false"

# 按 IP 变更次数降序排列
curl -H "Authorization: Bearer <admin_token>" \
  "http://localhost:5000/admin/user-sessions/list?sort_by=ip_change_count&sort_order=desc"
```

**响应**：
```json
{
  "total": 150,
  "skip": 0,
  "limit": 20,
  "sessions": [
    {
      "id": 1,
      "session_id": "a1b2c3d4-...",
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

**示例**：
```bash
curl -H "Authorization: Bearer <admin_token>" \
  "http://localhost:5000/admin/user-sessions/123"
```

**响应**：
```json
{
  "id": 123,
  "session_id": "a1b2c3d4-...",
  "user_id": 456,
  "username": "testuser",
  "created_at": "2026-02-10T10:00:00",
  "expires_at": "2026-03-12T10:00:00",
  "last_activity_at": "2026-02-11T15:30:00",
  "revoked": false,
  "revoked_at": null,
  "revoked_reason": null,
  "device_info": "Mozilla/5.0 (Windows NT 10.0)...",
  "first_device_info": "Mozilla/5.0 (Windows NT 10.0)...",
  "device_fingerprint": "abc123...",
  "device_change_count": 0,
  "device_changed": false,
  "current_ip": "192.168.1.100",
  "first_ip": "192.168.1.100",
  "ip_change_count": 2,
  "ip_history": [
    {"ip": "192.168.1.100", "timestamp": "2026-02-10T10:00:00"},
    {"ip": "192.168.1.101", "timestamp": "2026-02-10T12:00:00"},
    {"ip": "192.168.1.102", "timestamp": "2026-02-11T09:00:00"}
  ],
  "refresh_count": 25,
  "total_online_seconds": 18000,
  "current_session_started_at": "2026-02-11T15:00:00",
  "last_seen": "2026-02-11T15:30:00",
  "is_suspicious": false,
  "suspicious_reason": null,
  "active_token_count": 1
}
```

---

### 3. 获取会话活动时间线
```http
GET /admin/user-sessions/{session_id}/activity
```

**示例**：
```bash
curl -H "Authorization: Bearer <admin_token>" \
  "http://localhost:5000/admin/user-sessions/123/activity"
```

**响应**：
```json
{
  "session_id": "a1b2c3d4-...",
  "user_id": 456,
  "username": "testuser",
  "events": [
    {
      "timestamp": "2026-02-10T10:00:00",
      "event_type": "created",
      "details": "Session created from 192.168.1.100"
    },
    {
      "timestamp": "2026-02-10T10:05:00",
      "event_type": "refreshed",
      "details": "Token refreshed from 192.168.1.100"
    },
    {
      "timestamp": "2026-02-10T12:00:00",
      "event_type": "ip_changed",
      "details": "IP changed to 192.168.1.101"
    },
    {
      "timestamp": "2026-02-11T09:00:00",
      "event_type": "ip_changed",
      "details": "IP changed to 192.168.1.102"
    }
  ]
}
```

---

### 4. 撤销单个会话
```http
POST /admin/user-sessions/{session_id}/revoke
```

**查询参数**：
- `reason` - 撤销原因（默认：admin_action）

**示例**：
```bash
curl -X POST -H "Authorization: Bearer <admin_token>" \
  "http://localhost:5000/admin/user-sessions/123/revoke?reason=suspicious_activity"
```

**响应**：
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

**请求体**：
```json
{
  "session_ids": [123, 456, 789],
  "reason": "admin_action"
}
```

**示例**：
```bash
curl -X POST -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"session_ids": [123, 456], "reason": "security_audit"}' \
  "http://localhost:5000/admin/user-sessions/revoke-bulk"
```

**响应**：
```json
{
  "revoked_count": 2,
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
POST /admin/user-sessions/revoke-user/{user_id}
```

**查询参数**：
- `reason` - 撤销原因（默认：admin_action）

**示例**：
```bash
curl -X POST -H "Authorization: Bearer <admin_token>" \
  "http://localhost:5000/admin/user-sessions/revoke-user/456?reason=account_suspended"
```

**响应**：
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

**请求体**：
```json
{
  "is_suspicious": true,
  "reason": "Unusual IP changes detected"
}
```

**示例**：
```bash
# 标记为可疑
curl -X POST -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"is_suspicious": true, "reason": "Manual review required"}' \
  "http://localhost:5000/admin/user-sessions/123/flag"

# 取消标记
curl -X POST -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"is_suspicious": false}' \
  "http://localhost:5000/admin/user-sessions/123/flag"
```

**响应**：返回完整的会话详情（同端点 2）

---

### 8. 会话统计仪表板
```http
GET /admin/user-sessions/stats
```

**查询参数**：
- `start_date` - 统计开始时间（可选）
- `end_date` - 统计结束时间（可选）

**示例**：
```bash
# 全部统计
curl -H "Authorization: Bearer <admin_token>" \
  "http://localhost:5000/admin/user-sessions/stats"

# 指定时间范围
curl -H "Authorization: Bearer <admin_token>" \
  "http://localhost:5000/admin/user-sessions/stats?start_date=2026-02-01T00:00:00&end_date=2026-02-11T23:59:59"
```

**响应**：
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
    {"session_id": "abc-123", "username": "user1", "count": 15},
    {"session_id": "def-456", "username": "user2", "count": 12}
  ],
  "top_device_changes": [
    {"session_id": "ghi-789", "username": "user3", "count": 8},
    {"session_id": "jkl-012", "username": "user4", "count": 6}
  ]
}
```

---

### 9. 获取用户会话历史
```http
GET /admin/user-sessions/user/{user_id}/history
```

**查询参数**：
- `include_revoked` - 是否包含已撤销的会话（默认：true）
- `skip` / `limit` - 分页参数

**示例**：
```bash
# 获取用户所有会话历史
curl -H "Authorization: Bearer <admin_token>" \
  "http://localhost:5000/admin/user-sessions/user/456/history"

# 仅获取活跃会话
curl -H "Authorization: Bearer <admin_token>" \
  "http://localhost:5000/admin/user-sessions/user/456/history?include_revoked=false"
```

**响应**：与端点 1 相同的分页列表格式

---

## 向后兼容性

旧的 `/admin/sessions/*` 端点保持可用：
- ✅ `GET /admin/sessions/active`
- ✅ `GET /admin/sessions/user/{user_id}`
- ✅ `POST /admin/sessions/revoke/{token_id}`
- ✅ `POST /admin/sessions/revoke-user/{user_id}`
- ✅ `POST /admin/sessions/cleanup-expired`
- ✅ `GET /admin/sessions/stats`

建议逐步迁移到新 API，旧端点未来可能会被弃用。

---

## 使用建议

### 1. 安全监控场景
```bash
# 查询所有可疑会话
GET /admin/user-sessions/list?is_suspicious=true

# 查看详情和活动时间线
GET /admin/user-sessions/{session_id}
GET /admin/user-sessions/{session_id}/activity

# 撤销可疑会话
POST /admin/user-sessions/{session_id}/revoke
```

### 2. 用户管理场景
```bash
# 查看用户所有会话
GET /admin/user-sessions/user/{user_id}/history

# 强制下线用户
POST /admin/user-sessions/revoke-user/{user_id}
```

### 3. 审计场景
```bash
# 查看统计仪表板
GET /admin/user-sessions/stats

# 查看 Top IP/设备变更
# （已包含在 stats 响应中）
```

### 4. 批量清理场景
```bash
# 查询过期会话
GET /admin/user-sessions/list?revoked=false&created_before=2026-01-01

# 批量撤销
POST /admin/user-sessions/revoke-bulk
```

---

## 错误处理

所有端点遵循统一的错误响应格式：

```json
{
  "detail": "Session not found"
}
```

常见状态码：
- `200` - 成功
- `400` - 请求参数错误
- `401` - 未认证
- `403` - 权限不足（非管理员）
- `404` - 会话/用户不存在
- `422` - 请求体验证失败

---

## 性能优化

1. **分页**：列表端点支持 `skip` 和 `limit` 参数，避免一次加载过多数据
2. **筛选**：使用精确筛选参数减少结果集大小
3. **索引**：Session 表已优化索引（user_id, revoked, expires_at, last_activity_at）
4. **缓存**：统计端点可考虑添加缓存（暂未实现）

---

## 开发者注意事项

1. **认证要求**：所有端点需要管理员权限（通过 `get_current_admin_user` 依赖）
2. **日志记录**：所有端点已配置 API 日志记录（参数和请求体）
3. **速率限制**：已启用速率限制（防止滥用）
4. **事务安全**：批量操作使用数据库事务，确保原子性

---

## 实施文件清单

| 文件路径 | 说明 |
|---------|------|
| `app/schemas/session.py` | Pydantic 响应模型 |
| `app/routes/admin/user_sessions.py` | 路由实现 |
| `app/routes/admin/__init__.py` | 路由注册 |
| `common/api_config.py` | API 配置 |
| `app/routes/admin/sessions.py` | 旧端点（添加弃用提示） |

---

## 后续改进建议

1. **导出功能**：添加 CSV/JSON 导出端点（已在计划中但暂未实现）
2. **实时通知**：会话异常时发送通知（需要集成通知系统）
3. **自动撤销规则**：基于可疑行为自动撤销会话
4. **统计缓存**：为 `/stats` 端点添加 Redis 缓存
5. **Grafana 集成**：导出 Prometheus 指标供监控使用

---

## 技术支持

如遇问题，请查看：
- 端点验证脚本：`test_user_sessions_endpoints.py`
- 实施计划文档：README 或项目 Wiki
- 日志文件：检查 `logs.db` 中的 API 日志
