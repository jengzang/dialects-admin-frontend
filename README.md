# 方言管理后台系统 (Dialects Admin Dashboard)

<div align="center">

![Vue 3](https://img.shields.io/badge/Vue-3.5.20-4FC08D?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-7.1.4-646CFF?logo=vite)
![Element Plus](https://img.shields.io/badge/Element_Plus-2.11.1-409EFF)
![ECharts](https://img.shields.io/badge/ECharts-6.0.0-AA344D)
![License](https://img.shields.io/badge/License-MIT-green)

一个功能完整、现代化的 Vue 3 管理后台系统，提供用户管理、会话监控、API 统计分析、自定义数据管理等企业级功能。

[在线演示](https://dialects.yzup.top/admin) | [文档](./docs) | [更新日志](#更新日志)

</div>

---

## 📑 目录

- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [快速开始](#-快速开始)
- [项目结构](#-项目结构)
- [核心功能](#-核心功能)
- [架构设计](#-架构设计)
- [开发指南](#-开发指南)
- [API 文档](#-api-文档)
- [部署](#-部署)
- [常见问题](#-常见问题)
- [更新日志](#-更新日志)
- [贡献指南](#-贡献指南)

---

## ✨ 功能特性

### 🎯 核心功能

#### 1. 用户管理系统
- ✅ 完整的用户 CRUD 操作
- ✅ 用户搜索、排序、分页
- ✅ 用户行为分析（RFM 模型）
- ✅ 用户分层管理（高/中/低活跃度）
- ✅ 风险评分系统
- ✅ 用户增长趋势分析

#### 2. 会话管理系统
- ✅ 实时会话监控
- ✅ 会话详情查看（IP 历史、活动时间线）
- ✅ 批量会话撤销
- ✅ 可疑会话标记
- ✅ 在线用户统计
- ✅ IP 地理位置显示
- ✅ 会话活动时间线

#### 3. API 统计分析
- ✅ 实时 API 调用监控
- ✅ 趋势分析（小时级/日级）
- ✅ API 排行榜
- ✅ 详细调用记录
- ✅ 流量统计（上传/下载）
- ✅ IP 统计分析
- ✅ 用户 API 多样性分析

#### 4. 自定义数据管理
- ✅ 灵活的数据 CRUD
- ✅ 按用户查看数据
- ✅ 批量操作支持
- ✅ 数据统计展示

#### 5. 数据可视化
- ✅ ECharts 图表集成
- ✅ 实时数据更新
- ✅ 多种图表类型（折线图、柱状图、饼图）
- ✅ 响应式图表设计
- ✅ 自定义图表主题

### 🚀 技术亮点

- ⚡ **极速开发体验** - Vite HMR 热更新，毫秒级响应
- 🎨 **现代化 UI** - Element Plus + 自定义组件库
- 📦 **模块化架构** - API 层、组件层、状态层清晰分离
- 🛡️ **安全可靠** - JWT 认证、Token 自动刷新、路由守卫
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🔧 **高度可配置** - 环境变量、主题定制、API 配置
- 📊 **数据驱动** - Pinia 状态管理，数据流清晰
- 🎯 **类型安全** - 完善的数据验证和错误处理

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

### 开发工具
- **Sass 1.97.3** - CSS 预处理器
- **@vitejs/plugin-vue 6.0.1** - Vue 3 Vite 插件

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
# 启动开发服务器（管理后台模式）
npm run dev

# 启动开发服务器（Web 模式）
npm run dev:web

# 访问地址
# 管理后台: http://localhost:5173
# Web 模式: http://localhost:5173
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 环境配置

创建 `.env.local` 文件：

```env
# API 基础地址
VITE_API_BASE_URL=https://dialects.yzup.top
VITE_ADMIN_BASE_URL=https://dialects.yzup.top/admin
```

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
│   ├── guides/                       # 使用指南
│   ├── api/                          # API 文档
│   ├── archive/                      # 归档文档
│   └── OPTIMIZATION_GUIDE.md         # 优化指南
│
├── .env.development                  # 开发环境配置
├── .env.production                   # 生产环境配置
├── .env.web                          # Web 模式配置
├── index.html                        # HTML 模板
├── vite.config.js                    # Vite 配置
├── package.json                      # 项目依赖
├── CLAUDE.md                         # Claude Code 指南
└── README.md                         # 项目文档
```

