# 方言管理后台系统

<div align="center">

![Vue 3](https://img.shields.io/badge/Vue-3.5.20-4FC08D?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-7.1.4-646CFF?logo=vite)
![Element Plus](https://img.shields.io/badge/Element_Plus-2.11.1-409EFF)
![ECharts](https://img.shields.io/badge/ECharts-6.0.0-AA344D)
![License](https://img.shields.io/badge/License-MIT-green)

一个功能完整、现代化的 Vue 3 管理后台系统，提供用户管理、会话监控、API 统计分析、自定义数据管理等企业级功能。

[在线演示](https://dialects.yzup.top/admin) | [开发指南](./docs/GUIDE.md) | [更新日志](#-更新日志)

</div>

---

## 📑 目录

- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [快速开始](#-快速开始)
- [功能介绍](#-功能介绍)
- [使用教程](#-使用教程)
- [API 文档](#-api-文档)
- [部署指南](#-部署指南)
- [项目结构](#-项目结构)
- [更新日志](#-更新日志)
- [常见问题](#-常见问题)
- [贡献指南](#-贡献指南)

---

## ✨ 功能特性

### 核心功能

- 🔐 **用户认证系统** - JWT Token 认证，自动刷新，路由守卫
- 👥 **用户管理** - 完整的 CRUD 操作，搜索、排序、分页
- 📊 **用户行为分析** - RFM 模型、用户分层、风险评分、API 多样性分析
- 🔍 **会话管理** - 实时监控、会话详情、批量操作、可疑会话标记
- 📈 **API 统计分析** - 实时监控、趋势分析、排行榜、详细调用记录
- 🌍 **IP 地理位置** - 自动显示 IP 归属地，支持地图展示
- 🗂️ **自定义数据管理** - 灵活的数据 CRUD，按用户查看
- 📊 **数据可视化** - ECharts 图表，多种图表类型，响应式设计

### 技术亮点

- ⚡ **极速开发** - Vite HMR 热更新，毫秒级响应
- 🎨 **现代化 UI** - Element Plus + 自定义组件库
- 📦 **模块化架构** - API 层、组件层、状态层清晰分离
- 🛡️ **安全可靠** - JWT 认证、Token 自动刷新、路由守卫
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🔧 **高度可配置** - 环境变量、主题定制、API 配置

---

## 🛠️ 技术栈

### 核心框架
- **Vue 3.5.20** - 渐进式 JavaScript 框架
- **Vite 7.1.4** - 下一代前端构建工具
- **Vue Router 4.5.1** - 官方路由管理器
- **Pinia 3.0.4** - 新一代状态管理库

### UI 组件
- **Element Plus 2.11.1** - 基于 Vue 3 的组件库
- **ECharts 6.0.0** - 强大的数据可视化库
- **Leaflet 1.9.4** - 开源地图库

### 工具库
- **Axios 1.11.0** - HTTP 客户端
- **Day.js 1.11.13** - 轻量级日期处理
- **date-fns 4.1.0** - 现代化日期工具库
- **Lodash 4.17.21** - JavaScript 实用工具库

---

## 🚀 快速开始

### 环境要求

```bash
Node.js >= 16.0.0
npm >= 8.0.0
```

### 安装

```bash
# 克隆项目
git clone https://github.com/jengzang/dialects-admin-frontend.git
cd dialects-admin-frontend

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev

# 访问地址
# http://localhost:5173
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

---

## 🎯 功能介绍

### 1. 用户管理

#### 用户列表
- 查看所有用户的基本信息
- 支持按用户名、邮箱搜索
- 支持按注册时间、最后登录时间排序
- 分页显示，每页可配置数量

#### 用户操作
- **创建用户**: 添加新用户账号，设置用户名、密码、邮箱
- **编辑用户**: 修改用户信息，更新密码
- **删除用户**: 删除用户账号（需确认）
- **查看统计**: 查看用户的 API 使用统计和行为分析

#### 用户行为分析
- **RFM 模型分析**
  - Recency (最近活跃时间)
  - Frequency (活跃频率)
  - Monetary (API 调用量)
- **用户分层**
  - 高活跃用户（频繁使用）
  - 中等活跃用户（定期使用）
  - 低活跃用户（偶尔使用）
  - 休眠用户（长期未使用）
- **风险评分系统**
  - 基于会话行为的风险评估
  - IP 变更频率分析
  - 异常登录检测
- **API 多样性分析**
  - 用户使用的 API 种类
  - API 调用分布
  - 使用模式识别

### 2. 会话管理

#### 全局会话管理
- 查看所有活跃会话
- 统计卡片（总会话数、在线用户、可疑会话等）
- 高级筛选（用户名、IP、状态）
- 批量撤销会话
- 可疑会话标记

#### 用户会话管理
- 查看特定用户的所有会话
- 会话详情（创建时间、过期时间、IP 历史）
- 会话活动时间线
- IP 地理位置显示
- 单个/批量撤销会话

#### 会话详情
- **基本信息**: Session ID、用户名、创建时间、过期时间
- **IP 信息**: 首次 IP、当前 IP、IP 历史记录
- **活动时间线**: 登录、IP 变更、撤销等事件
- **地理位置**: 自动显示 IP 归属地

### 3. API 统计分析

#### 实时监控
- 最近 24 小时 API 调用趋势
- 实时调用次数统计
- 峰值时段分析
- 活跃 API 数量

#### 趋势分析
- 每日/每周/每月调用趋势
- 单个 API 趋势对比
- 峰值日期识别
- 平均调用量统计

#### API 排行榜
- 全时段排行榜
- 指定日期排行榜
- 日期范围排行榜
- 调用占比分析

#### 详细分析
- 单个 API 详细统计
- 用户调用分布
- IP 调用分布
- 流量统计（上传/下载）

### 4. 自定义数据管理

- 查看所有自定义数据
- 按用户筛选数据
- 创建、编辑、删除数据
- 批量操作支持
- 数据统计展示

---

## 📖 使用教程

### 登录系统

1. 访问 https://dialects.yzup.top/admin
2. 输入管理员用户名和密码
3. 点击"登录"按钮
4. 系统会自动保存登录状态（JWT Token）

### 管理用户

#### 创建新用户

1. 在用户管理页面，点击"创建用户"按钮
2. 填写用户信息：
   - 用户名（必填，唯一）
   - 密码（必填，至少 6 位）
   - 邮箱（可选）
3. 点击"确定"创建用户

#### 编辑用户

1. 在用户列表中找到目标用户
2. 点击"编辑"按钮
3. 修改用户信息
4. 点击"确定"保存更改

#### 查看用户统计

1. 在用户列表中找到目标用户
2. 点击"查看统计"按钮
3. 查看用户的 API 使用情况、行为分析等

### 监控会话

#### 查看全局会话

1. 点击左侧菜单"会话管理" → "全局会话"
2. 查看所有活跃会话
3. 使用筛选器按用户名、IP、状态筛选
4. 点击会话可查看详情

#### 撤销会话

1. 在会话列表中选择要撤销的会话
2. 点击"撤销"按钮
3. 确认操作
4. 用户将被强制登出

#### 标记可疑会话

1. 在会话详情中点击"标记为可疑"
2. 系统会记录该会话为可疑状态
3. 可在全局会话中筛选可疑会话

### 查看 API 统计

#### 实时监控

1. 点击左侧菜单"API 统计" → "实时监控"
2. 查看最近 24 小时的 API 调用趋势
3. 查看实时统计数据

#### 趋势分析

1. 点击"趋势分析"标签
2. 选择时间范围（7 天、30 天、90 天）
3. 查看每日调用趋势图表
4. 输入 API 路径查询单个 API 趋势

#### API 排行榜

1. 点击"API 排行榜"标签
2. 选择查询模式：
   - 全时段排行榜
   - 指定日期排行榜
   - 日期范围排行榜
3. 查看 Top N API 调用排名

---

## 📡 API 文档

### 基础配置

```javascript
// API 基础地址
window.WEB_BASE = "https://dialects.yzup.top"
window.ADMIN_BASE = window.WEB_BASE + "/admin"
```

### 认证 API

| 方法 | 端点 | 说明 | 请求参数 | 响应 |
|------|------|------|----------|------|
| POST | `/auth/login` | 用户登录 | `{ username, password }` | `{ access_token, refresh_token }` |
| POST | `/auth/refresh` | 刷新 Token | `{ refresh_token }` | `{ access_token }` |
| GET | `/auth/me` | 获取当前用户信息 | - | `{ id, username, email }` |

### 用户管理 API

| 方法 | 端点 | 说明 | 请求参数 |
|------|------|------|----------|
| GET | `/admin/users` | 获取用户列表 | - |
| GET | `/admin/users/all` | 获取所有用户详情 | - |
| POST | `/admin/users/create` | 创建用户 | `{ username, password, email }` |
| PUT | `/admin/users/update` | 更新用户 | `{ username, password?, email? }` |
| DELETE | `/admin/users/delete/:username` | 删除用户 | - |
| GET | `/admin/users/stats` | 获取用户统计 | - |

### 会话管理 API

| 方法 | 端点 | 说明 | 请求参数 |
|------|------|------|----------|
| GET | `/admin/user-sessions/list` | 获取会话列表 | `{ username?, ip?, suspicious?, revoked?, sort?, page?, limit? }` |
| GET | `/admin/user-sessions/:sessionId` | 获取会话详情 | - |
| GET | `/admin/user-sessions/:sessionId/activity` | 获取会话活动 | - |
| POST | `/admin/user-sessions/:sessionId/revoke` | 撤销会话 | `{ reason? }` |
| POST | `/admin/user-sessions/revoke-bulk` | 批量撤销会话 | `{ session_ids: [] }` |
| POST | `/admin/user-sessions/revoke-user/:userId` | 撤销用户所有会话 | - |
| POST | `/admin/user-sessions/:sessionId/flag` | 标记可疑会话 | `{ suspicious: boolean }` |
| GET | `/admin/user-sessions/stats` | 获取会话统计 | - |
| GET | `/admin/user-sessions/user/:userId/history` | 获取用户会话历史 | `{ include_revoked? }` |

### API 统计 API

| 方法 | 端点 | 说明 | 请求参数 |
|------|------|------|----------|
| GET | `/logs/stats/hourly` | 获取小时级趋势 | `{ hours: 1-168 }` |
| GET | `/logs/stats/daily` | 获取每日趋势 | `{ days: 1-365, path? }` |
| GET | `/logs/stats/ranking` | 获取 API 排行榜 | `{ limit: 1-100, date?, days? }` |
| GET | `/logs/stats/api-history` | 获取单个 API 历史 | `{ path, days: 1-365 }` |

### 自定义数据 API

| 方法 | 端点 | 说明 | 请求参数 |
|------|------|------|----------|
| GET | `/admin/custom/all` | 获取所有数据 | - |
| GET | `/admin/custom/user` | 获取用户数据 | `{ query: username }` |
| POST | `/admin/custom/create` | 创建数据 | `{ username, region, data }` |
| PUT | `/admin/custom/update` | 更新数据 | `{ username, region, data }` |
| DELETE | `/admin/custom/delete` | 删除数据 | `{ username, region }` |
| GET | `/admin/custom/num` | 获取数据统计 | - |

### IP 地理位置 API

| 方法 | 端点 | 说明 | 请求参数 |
|------|------|------|----------|
| GET | `/admin/ip/:provider/:ip` | 查询 IP 地理位置 | provider: `ip-api`, `ip-sb`, `nordvpn` |

### API 响应格式

#### 成功响应

```json
{
  "data": { ... },
  "message": "Success"
}
```

#### 错误响应

```json
{
  "error": "Error message",
  "code": 400
}
```

### 认证方式

所有需要认证的 API 请求都需要在请求头中包含 JWT Token：

```http
Authorization: Bearer <access_token>
```

Token 会在以下情况自动刷新：
- Token 即将过期（5 分钟内）
- 收到 401 响应

---

## 🚀 部署指南

### 方式一：使用部署脚本（推荐）

项目提供了自动化部署脚本 `deploy.sh`，可以一键构建并部署到服务器。

#### 前置条件

1. 确保已安装 Node.js 和 npm
2. 确保可以通过 SSH 连接到服务器
3. 确保服务器上已创建目标目录

#### 配置部署脚本

编辑 `deploy.sh` 文件，修改以下配置：

```bash
REMOTE_USER="root"                          # 服务器用户名
REMOTE_HOST="47.115.57.138"                 # 服务器 IP
REMOTE_PATH="/srv/myapp/statics/admin/"     # 部署目录
```

#### 执行部署

```bash
# 给脚本添加执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

部署脚本会自动完成以下步骤：
1. 构建项目（`npm run build`）
2. 检查构建产物
3. 上传文件到服务器（index.html, admin.js, admin.css）
4. 验证部署结果

### 方式二：手动部署

#### 步骤 1: 构建项目

```bash
npm run build
```

构建产物位于 `dist/` 目录：
- `index.html` - HTML 入口文件
- `admin.js` - 所有 JavaScript 代码（单文件）
- `admin.css` - 所有样式（单文件）

#### 步骤 2: 上传文件

使用 SCP 上传文件到服务器：

```bash
scp dist/index.html root@47.115.57.138:/srv/myapp/statics/admin/
scp dist/admin.css root@47.115.57.138:/srv/myapp/statics/admin/
scp dist/admin.js root@47.115.57.138:/srv/myapp/statics/admin/
```

或使用 FTP/SFTP 工具上传。

#### 步骤 3: 配置 Nginx

```nginx
server {
    listen 80;
    server_name dialects.yzup.top;
    
    # 管理后台
    location /admin {
        alias /srv/myapp/statics/admin;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }
    
    # API 代理
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 步骤 4: 重启 Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 环境变量配置

#### 开发环境 (`.env.development`)

```env
VITE_API_BASE_URL=https://dialects.yzup.top
VITE_ADMIN_BASE_URL=https://dialects.yzup.top/admin
```

#### 生产环境 (`.env.production`)

```env
VITE_API_BASE_URL=https://dialects.yzup.top
VITE_ADMIN_BASE_URL=https://dialects.yzup.top/admin
```

### 部署检查清单

- [ ] 构建成功，无错误
- [ ] 所有文件已上传到服务器
- [ ] Nginx 配置正确
- [ ] API 地址配置正确
- [ ] 可以正常访问管理后台
- [ ] 可以正常登录
- [ ] API 调用正常

### 常见部署问题

#### 1. 404 错误

**原因**: Nginx 配置不正确或文件路径错误

**解决方案**:
- 检查 Nginx 配置中的 `alias` 路径
- 确保文件已正确上传到服务器
- 检查文件权限

#### 2. API 调用失败

**原因**: API 地址配置错误或 CORS 问题

**解决方案**:
- 检查 `src/axios.js` 中的 API 地址
- 确保后端 API 已启动
- 检查 Nginx 代理配置

#### 3. 白屏

**原因**: JavaScript 加载失败或路径错误

**解决方案**:
- 检查浏览器控制台错误
- 确保 `admin.js` 和 `admin.css` 已正确上传
- 检查 Vite 配置中的 `base` 路径

---

## 📁 项目结构

```
frontend-admin/
├── src/
│   ├── api/                          # API 服务层
│   │   ├── index.js                  # 统一导出
│   │   ├── user.js                   # 用户 API
│   │   ├── custom.js                 # 自定义数据 API
│   │   ├── userSession.js            # 会话 API
│   │   ├── analytics.js              # 分析 API
│   │   ├── apiCallStats.js           # API 统计 API
│   │   ├── stats.js                  # 统计 API
│   │   └── ip.js                     # IP 查询 API
│   │
│   ├── components/                   # 组件目录
│   │   ├── common/                   # 通用组件
│   │   │   ├── BaseChart.vue         # ECharts 图表组件
│   │   │   ├── BaseTable.vue         # 表格组件
│   │   │   ├── BaseModal.vue         # 模态框组件
│   │   │   ├── BasePagination.vue    # 分页组件
│   │   │   ├── BaseSearchInput.vue   # 搜索输入框
│   │   │   ├── StatsCard.vue         # 统计卡片
│   │   │   ├── IPLocationDisplay.vue # IP 地理位置显示
│   │   │   └── ...                   # 其他通用组件
│   │   │
│   │   ├── user/                     # 用户相关组件
│   │   │   ├── UserBehaviorDashboard.vue  # 用户行为分析
│   │   │   ├── UserProfileDetail.vue      # 用户详情
│   │   │   ├── UserStats.vue              # 用户统计
│   │   │   └── ...
│   │   │
│   │   ├── session/                  # 会话管理组件
│   │   │   ├── GlobalSessionManagement.vue  # 全局会话管理
│   │   │   ├── UserSessionManagement.vue    # 用户会话管理
│   │   │   ├── SessionDetailModal.vue       # 会话详情
│   │   │   └── ...
│   │   │
│   │   ├── stats/                    # 统计分析组件
│   │   │   ├── ApiCallStatsPage.vue  # API 统计页面
│   │   │   ├── RealTimeMonitor.vue   # 实时监控
│   │   │   ├── TrendAnalysis.vue     # 趋势分析
│   │   │   ├── ApiRanking.vue        # API 排行榜
│   │   │   └── DetailedAnalysis.vue  # 详细分析
│   │   │
│   │   ├── custom/                   # 自定义数据组件
│   │   │   └── CustomPerUser.vue     # 用户数据管理
│   │   │
│   │   ├── Login.vue                 # 登录页面
│   │   └── UserManagement.vue        # 用户管理主页
│   │
│   ├── composables/                  # 组合式函数
│   │   ├── index.js                  # 统一导出
│   │   ├── useTable.js               # 表格状态管理
│   │   ├── useTimeFormat.js          # 时间格式化
│   │   ├── useApiStats.js            # API 统计计算
│   │   ├── useApiCallStats.js        # API 调用统计
│   │   ├── useChart.js               # 图表配置
│   │   └── useUserBehavior.js        # 用户行为分析
│   │
│   ├── stores/                       # Pinia 状态管理
│   │   ├── index.js                  # Store 统一导出
│   │   ├── user.js                   # 用户状态
│   │   └── custom.js                 # 自定义数据状态
│   │
│   ├── router/                       # 路由配置
│   │   └── index.js                  # 路由定义和守卫
│   │
│   ├── styles/                       # 样式文件
│   │   ├── abstracts/                # 抽象层（变量、混入）
│   │   ├── base/                     # 基础样式
│   │   ├── components/               # 组件样式
│   │   ├── utilities/                # 工具类
│   │   ├── variables.css             # CSS 变量
│   │   └── common.css                # 通用样式
│   │
│   ├── utils/                        # 工具函数
│   │   └── auth.js                   # 认证工具
│   │
│   ├── axios.js                      # Axios 配置
│   ├── App.vue                       # 根组件
│   └── main.js                       # 应用入口
│
├── public/                           # 静态资源
├── docs/                             # 项目文档
│   └── GUIDE.md                      # 开发指南
│
├── .env.development                  # 开发环境配置
├── .env.production                   # 生产环境配置
├── .env.web                          # Web 模式配置
├── index.html                        # HTML 模板
├── vite.config.js                    # Vite 配置
├── package.json                      # 项目依赖
├── deploy.sh                         # 部署脚本
├── CLAUDE.md                         # Claude Code 指南
└── README.md                         # 项目文档
```

---

## 📝 更新日志

### v1.0.0 (2026-03-04)

#### 🎉 重大更新

- **文档系统重构** - 大幅精简文档，只保留核心文档
- **API 统计页面** - 修复图表显示问题，添加 URL 路径 tab 切换
- **IP 地理位置** - 为所有组件添加 IP 地理位置显示功能

#### ✨ 新增功能

- 添加 IP 地理位置自动显示（会话管理、用户统计、API 详情）
- API 统计页面支持 URL 参数切换 tab（`?tab=trend`）
- 添加部署脚本 `deploy.sh`，支持一键部署
- 添加 IPLocationDisplay 通用组件

#### 🐛 Bug 修复

- 修复 ApiDetail 中 IP 地理位置数据丢失问题
- 修复图表高度塌陷问题
- 修复时区转换和图表渲染问题
- 修复 BaseChart 容器尺寸为零导致的初始化失败
- 修复图表缩小到左上角的问题

#### 🔧 技术改进

- 将 `v-show` 改为 `v-if` 控制图表显示，避免初始化问题
- 优化 BaseChart 组件，添加延迟初始化和 ResizeObserver
- 改进用户行为分析页面性能
- 更新 .gitignore，添加更多忽略规则

---

### v0.9.0 (2026-03-03)

#### ✨ 新增功能

- **用户行为分析** - 完整的 RFM 模型、用户分层、风险评分系统
- **自定义数据管理** - 支持按用户查看和管理自定义数据
- **BaseTable 组件** - 创建通用表格组件，支持排序、插槽、加载状态
- **BaseCard 组件** - 创建通用卡片组件
- **BaseTag 组件** - 创建通用标签组件

#### 🔧 技术改进

- 完成 el-table 到 BaseTable 的迁移
- 完成 CSS 到 SCSS 的迁移
- 优化 DataManagement 布局和分页样式
- 改进 API 响应处理

#### 🐛 Bug 修复

- 修复 API 调用错误（UserBehaviorDashboard 和 stats API）
- 修复 getUserRegions API 响应处理
- 修复 DataManagement 路由连接问题

---

### v0.8.0 (2026-03-02)

#### ✨ 新增功能

- **Composition API 迁移** - 完成所有组件的 Composition API 迁移（20/20）
- **Composables 系统** - 提取业务逻辑到可复用的 composables
- **通用组件增强** - 支持自定义样式和更灵活的配置

#### 🔧 技术改进

- 完成 CSS 到 Sass/SCSS 迁移
- 清理项目架构，移除冗余代码
- 统一 API 调用方式，使用统一的 axios 实例
- 改进错误处理和用户体验

#### 🐛 Bug 修复

- 修复 API 响应处理问题
- 修复 Element Plus size 属性（mini → small）
- 修复 UserManagement 中的直接 axios 调用

---

### v0.7.0 (2026-02-11)

#### ✨ 新增功能

- **会话管理系统** - 完整的会话管理功能
  - 全局会话管理
  - 用户会话管理
  - 会话详情查看
  - 批量撤销会话
  - 可疑会话标记

#### 📚 文档更新

- 添加会话管理 API 指南
- 添加会话管理实施总结
- 添加会话管理快速开始指南
- 添加前端集成总结

---

### v0.6.0 (2026-01-22)

#### ✨ 新增功能

- **API 统计分析** - 完整的 API 统计功能
  - 实时监控
  - 趋势分析
  - API 排行榜
  - 详细分析

#### 🔧 技术改进

- 创建 API 服务层架构
- 添加 Pinia 状态管理
- 优化前端架构

#### 📚 文档更新

- 添加优化指南
- 添加架构文档

---

## ❓ 常见问题

### 1. 如何修改 API 地址？

编辑 `src/axios.js` 文件：

```javascript
window.WEB_BASE = "https://your-api-domain.com"
window.ADMIN_BASE = window.WEB_BASE + "/admin"
```

### 2. Token 过期怎么办？

系统会自动检测 Token 过期并刷新，无需手动处理。如果刷新失败，会自动跳转到登录页。

### 3. 图表不显示怎么办？

确保：
- 数据格式正确
- 容器有明确的高度
- 使用 `v-if` 而不是 `v-show` 来控制图表显示
- 检查浏览器控制台是否有错误

### 4. 如何添加新的 API 接口？

1. 在 `src/api/` 对应的文件中添加方法
2. 在 `src/api/index.js` 中导出
3. 在组件中导入使用

```javascript
// src/api/myModule.js
import api from '../axios.js';

export const myModuleAPI = {
  newMethod(params) {
    return api.get('/new-endpoint', { params }).then(res => res.data);
  }
};

// src/api/index.js
export { myModuleAPI } from './myModule';

// 在组件中使用
import { myModuleAPI } from '@/api';
const data = await myModuleAPI.newMethod();
```

### 5. 如何自定义主题颜色？

修改 `src/styles/variables.css`：

```css
:root {
  --color-primary: #4CAF50;  /* 主色调 */
  --color-primary-dark: #388E3C;
  --color-primary-light: #C8E6C9;
}
```

### 6. 部署后无法访问怎么办？

检查：
- Nginx 配置是否正确
- 文件是否已正确上传
- 文件权限是否正确
- API 地址配置是否正确
- 浏览器控制台是否有错误

### 7. 如何调试 API 请求？

在浏览器开发者工具的 Network 面板查看请求详情，或在 `src/axios.js` 中添加日志：

```javascript
api.interceptors.request.use(config => {
  console.log('Request:', config);
  return config;
});
```

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 Vue 3 Composition API 或 Options API
- 组件命名使用 PascalCase
- 变量命名使用 camelCase
- 添加适当的注释
- 保持代码简洁清晰

---

## 📚 相关资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Element Plus 文档](https://element-plus.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [ECharts 文档](https://echarts.apache.org/)
- [开发指南](./docs/GUIDE.md)
- [Claude Code 指南](./CLAUDE.md)

---

## 📄 License

MIT License

Copyright (c) 2026 joengzaang

---

## 👨‍💻 作者

**joengzaang**

- GitHub: [@jengzang](https://github.com/jengzang)

---

## 🙏 致谢

感谢所有开源项目的贡献者！

---

<div align="center">

**[⬆ 回到顶部](#方言管理后台系统)**

Made with ❤️ by joengzaang

</div>
