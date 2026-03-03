# Session ID 类型修复说明

## 问题描述

后端 API 路径参数期望 `session_id` 为整数类型（`int`），但前端传递的是 UUID 字符串格式，导致以下 API 调用失败：

```
GET /admin/user-sessions/{session_id}
POST /admin/user-sessions/{session_id}/flag
POST /admin/user-sessions/{session_id}/revoke
GET /admin/user-sessions/{session_id}/activity
```

**错误信息：**
```json
{
    "detail": [
        {
            "type": "int_parsing",
            "loc": ["path", "session_id"],
            "msg": "Input should be a valid integer, unable to parse string as an integer",
            "input": "6203442f-2451-4e1a-817c-737257373f56"
        }
    ]
}
```

## 根本原因

Session 表结构包含两个 ID 字段：
- `id` - 整数类型，自增主键
- `session_id` - UUID 字符串，用于显示

后端 API 路径参数使用的是整数 `id`，而前端错误地使用了 UUID `session_id`。

## 修复方案

将所有 API 调用从使用 `session.session_id` 改为使用 `session.id`。

## 修改文件清单

### 1. SessionDetailModal.vue
**修改内容：**
- 将 `sessionId` prop 类型从 `String` 改为 `[String, Number]`，支持整数 ID

```javascript
// 修改前
sessionId: {
  type: String,
  default: ''
}

// 修改后
sessionId: {
  type: [String, Number],
  default: ''
}
```

### 2. GlobalSessionManagement.vue
**修改内容：**
- `showSessionDetail()` - 使用 `session.id` 而不是 `session.session_id`
- `flagAsSuspicious()` - 传递 `session.id`
- `unflagSuspicious()` - 使用 `session.id` 调用 API
- `confirmFlag()` - 使用 `currentFlagSession.value.id` 调用 API
- `revokeSession()` - 使用 `session.id` 调用 API
- `bulkRevoke()` - 映射 `session.id` 而不是 `session.session_id`

```javascript
// 修改前
const showSessionDetail = (session) => {
  selectedSessionId.value = session.session_id;
  showDetailModal.value = true;
};

// 修改后
const showSessionDetail = (session) => {
  selectedSessionId.value = session.id; // 使用整数 id
  showDetailModal.value = true;
};
```

### 3. UserSessionManagement.vue
**修改内容：**
- `showSessionDetail()` - 使用 `session.id`
- `revokeSession()` - 使用 `session.id` 调用 API

```javascript
// 修改前
const showSessionDetail = (session) => {
  selectedSessionId.value = session.session_id;
  showDetailModal.value = true;
};

// 修改后
const showSessionDetail = (session) => {
  selectedSessionId.value = session.id; // 使用整数 id
  showDetailModal.value = true;
};
```

## 验证步骤

### 1. 会话详情测试
```bash
# 应该成功返回会话详情
GET /admin/user-sessions/123  # 使用整数 ID
```

### 2. 标记可疑测试
```bash
# 应该成功标记会话
POST /admin/user-sessions/123/flag
{
  "is_suspicious": true,
  "reason": "rapid_ip_change"
}
```

### 3. 撤销会话测试
```bash
# 应该成功撤销会话
POST /admin/user-sessions/123/revoke
{
  "reason": "admin_action"
}
```

### 4. 活动时间线测试
```bash
# 应该成功返回活动记录
GET /admin/user-sessions/123/activity
```

## 构建验证

```bash
npm run build
# ✓ built in 9.80s
# 无编译错误
```

## 注意事项

### 前端显示
- 表格中仍然显示 `session_id`（UUID 格式）供用户查看
- 但所有 API 调用使用 `id`（整数）

### 数据结构
Session 对象应包含以下字段：
```javascript
{
  id: 123,                                    // 整数 ID，用于 API 调用
  session_id: "6203442f-2451-4e1a-817c...",  // UUID，用于显示
  username: "alice",
  current_ip: "192.168.1.100",
  // ... 其他字段
}
```

### API 调用示例
```javascript
// ✅ 正确
await userSessionAPI.getSessionDetail(session.id);

// ❌ 错误
await userSessionAPI.getSessionDetail(session.session_id);
```

## 影响范围

### 已修复的功能
- ✅ 会话详情弹窗
- ✅ 会话活动时间线
- ✅ 标记/取消标记可疑会话
- ✅ 撤销单个会话
- ✅ 批量撤销会话

### 未受影响的功能
- ✅ 会话列表展示（仍显示 UUID）
- ✅ 统计数据
- ✅ 筛选和排序
- ✅ 时间范围选择

## 测试清单

- [ ] 打开会话详情弹窗，验证数据正常加载
- [ ] 切换到活动时间线标签，验证数据正常加载
- [ ] 标记一个会话为可疑，验证操作成功
- [ ] 取消可疑标记，验证操作成功
- [ ] 撤销一个会话，验证操作成功
- [ ] 批量撤销多个会话，验证操作成功
- [ ] 在 UserSessionManagement 页面测试相同功能

## 总结

此修复解决了前端与后端 API 之间的数据类型不匹配问题。所有会话相关的 API 调用现在都使用正确的整数 `id` 字段，而不是 UUID `session_id` 字段。

修复后，所有 Phase 1-4 的功能应该能够正常工作。
