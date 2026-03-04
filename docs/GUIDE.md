# 开发指南

本文档提供项目开发的最佳实践和常用模式。

---

## 📋 目录

1. [架构概述](#架构概述)
2. [API 调用](#api-调用)
3. [状态管理](#状态管理)
4. [组件开发](#组件开发)
5. [样式开发](#样式开发)
6. [常用 Composables](#常用-composables)
7. [性能优化](#性能优化)
8. [最佳实践](#最佳实践)

---

## 🏗️ 架构概述

### 项目分层

```
┌─────────────────────────────────────┐
│         Components (组件层)          │
│  - 业务组件                          │
│  - 通用组件                          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Composables (逻辑复用层)        │
│  - useTable, useTimeFormat, etc.    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Stores (状态管理层)          │
│  - Pinia stores                     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│           API (服务层)               │
│  - 统一的 axios 实例                 │
│  - 自动 Token 刷新                   │
└─────────────────────────────────────┘
```

### 核心原则

1. **单一职责** - 每个模块只做一件事
2. **统一入口** - 所有 API 调用使用统一的 axios 实例
3. **状态集中** - 使用 Pinia 管理共享状态
4. **逻辑复用** - 使用 Composables 提取可复用逻辑

---

## 📡 API 调用

### 基本用法

```javascript
import { userAPI } from '@/api';

export default {
  async mounted() {
    try {
      const users = await userAPI.getAllUsers();
      this.users = users;
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }
};
```

### 创建新的 API 模块

```javascript
// src/api/myModule.js
import api from '../axios.js';

export const myModuleAPI = {
  getAll() {
    return api.get('/my-endpoint').then(res => res.data);
  },
  create(data) {
    return api.post('/my-endpoint', data).then(res => res.data);
  }
};
```

---

## 📦 状态管理

### 使用 Pinia Store

```javascript
// src/stores/myStore.js
import { defineStore } from 'pinia';

export const useMyStore = defineStore('myStore', {
  state: () => ({
    items: [],
    loading: false
  }),
  actions: {
    async fetchItems() {
      this.loading = true;
      try {
        this.items = await myModuleAPI.getAll();
      } finally {
        this.loading = false;
      }
    }
  }
});
```

---

## 🎨 组件开发

### 使用通用组件

#### BaseTable

```vue
<BaseTable
  :columns="columns"
  :data="tableData"
  :loading="loading"
  @sort="handleSort"
>
  <template #cell-username="{ value }">
    <strong>{{ value }}</strong>
  </template>
</BaseTable>
```

#### BaseChart

```vue
<BaseChart
  type="line"
  :data="chartData"
  :height="350"
  :loading="loading"
/>
```

---

## 🎨 样式开发

### 使用 CSS 变量

```css
.my-component {
  padding: var(--spacing-md);
  background: var(--color-background-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

### 使用通用样式类

```html
<button class="btn btn-primary">主要按钮</button>
<div class="text-center mt-lg mb-md">居中文本</div>
```

---

## 🔧 常用 Composables

### useTimeFormat

```javascript
import { useTimeFormat } from '@/composables';

const { formatTime, formatExpireTime, formatOnlineTime } = useTimeFormat();
```

### useTable

```javascript
import { useTable } from '@/composables';

const tableState = useTable([], { pageSize: 20 });
```

---

## ⚡ 性能优化

1. **使用 computed 缓存计算结果**
2. **使用 v-if 而不是 v-show 控制图表**
3. **防抖和节流处理频繁操作**
4. **分页加载大量数据**

---

## 💡 最佳实践

1. **组件命名**: PascalCase (UserList.vue)
2. **事件命名**: kebab-case (update-user)
3. **使用 async/await** 处理异步操作
4. **Props 定义完整的类型和验证**
5. **使用 v-if/v-else-if/v-else** 而不是多个独立 v-if

---

## 📚 相关资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [ECharts 文档](https://echarts.apache.org/)
- [项目 README](../README.md)
- [Claude Code 指南](../CLAUDE.md)

