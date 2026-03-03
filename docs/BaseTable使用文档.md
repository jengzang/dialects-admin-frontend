# BaseTable 使用文档

## 基本用法

```vue
<template>
  <BaseTable
    :columns="columns"
    :data="tableData"
    @sort="handleSort"
  />
</template>

<script setup>
import { BaseTable } from '@/components/common';

const columns = [
  { key: 'username', label: '用戶名', sortable: true },
  { key: 'email', label: '郵箱', sortable: true },
  { key: 'status', label: '狀態', sortable: false }
];

const tableData = [
  { username: 'user1', email: 'user1@example.com', status: '活躍' },
  { username: 'user2', email: 'user2@example.com', status: '禁用' }
];

const handleSort = ({ key, order }) => {
  console.log('排序:', key, order);
};
</script>
```

---

## 新增功能

### 1. 列宽控制

支持 `width`、`minWidth`、`maxWidth`、`flex` 四种方式控制列宽：

```javascript
const columns = [
  {
    key: 'username',
    label: '用戶名',
    width: '100px'        // 固定宽度
  },
  {
    key: 'email',
    label: '郵箱',
    minWidth: '150px'     // 最小宽度
  },
  {
    key: 'description',
    label: '說明',
    minWidth: '120px',    // 最小宽度
    maxWidth: '300px'     // 最大宽度
  },
  {
    key: 'status',
    label: '狀態',
    flex: 1.5             // flex 比例（相对于其他列）
  }
];
```

### 2. 对齐方式控制

支持列级别和表格级别的对齐控制：

```vue
<template>
  <!-- 表格级别：所有列默认居中对齐 -->
  <BaseTable
    :columns="columns"
    :data="tableData"
    table-align="center"
  />
</template>

<script setup>
const columns = [
  {
    key: 'username',
    label: '用戶名',
    align: 'left'      // 列级别：左对齐（覆盖表格默认）
  },
  {
    key: 'count',
    label: '數量',
    align: 'right'     // 列级别：右对齐
  },
  {
    key: 'status',
    label: '狀態'
    // 使用表格默认对齐方式（center）
  }
];
</script>
```

### 3. 边框控制

```vue
<template>
  <!-- 显示单元格边框（类似旧版原生表格） -->
  <BaseTable
    :columns="columns"
    :data="tableData"
    border
  />
</template>
```

### 4. 表格宽度控制

```vue
<template>
  <!-- 默认 100%（与旧版一致） -->
  <BaseTable :columns="columns" :data="tableData" />

  <!-- 自定义宽度 -->
  <BaseTable
    :columns="columns"
    :data="tableData"
    table-width="80%"
  />

  <!-- 固定宽度 -->
  <BaseTable
    :columns="columns"
    :data="tableData"
    table-width="1200px"
  />
</template>
```

### 5. 斑马纹控制

```vue
<template>
  <!-- 默认开启斑马纹 -->
  <BaseTable :columns="columns" :data="tableData" />

  <!-- 关闭斑马纹 -->
  <BaseTable
    :columns="columns"
    :data="tableData"
    :stripe="false"
  />
</template>
```

### 6. 尺寸控制

```vue
<template>
  <!-- 小尺寸 -->
  <BaseTable
    :columns="columns"
    :data="tableData"
    size="small"
  />

  <!-- 中等尺寸（默认） -->
  <BaseTable
    :columns="columns"
    :data="tableData"
    size="medium"
  />

  <!-- 大尺寸 -->
  <BaseTable
    :columns="columns"
    :data="tableData"
    size="large"
  />
</template>
```

### 7. 自定义样式

支持列级别的自定义 class 和 style：

```javascript
const columns = [
  {
    key: 'username',
    label: '用戶名',
    headerClass: 'custom-header',      // 表头自定义 class
    headerStyle: { color: 'red' },     // 表头自定义 style
    cellClass: 'custom-cell',          // 单元格自定义 class
    cellStyle: { fontWeight: 'bold' }  // 单元格自定义 style
  }
];
```

---

## 完整示例：复刻旧版原生表格样式

```vue
<template>
  <BaseTable
    :columns="columns"
    :data="tableData"
    table-width="100%"
    table-align="center"
    border
    stripe
    @sort="handleSort"
  />
</template>

<script setup>
import { BaseTable } from '@/components/common';

const columns = [
  {
    key: 'username',
    label: '用戶名',
    sortable: true,
    align: 'center'
  },
  {
    key: '簡稱',
    label: '簡稱',
    sortable: true,
    minWidth: '70px',
    align: 'center'
  },
  {
    key: '說明',
    label: '說明',
    sortable: true,
    minWidth: '120px',
    align: 'center'
  }
];
</script>
```

---

## Props 完整列表

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `columns` | Array | - | 列配置（必填） |
| `data` | Array | [] | 表格数据 |
| `sortable` | Boolean | true | 是否可排序 |
| `loading` | Boolean | false | 加载状态 |
| `selectable` | Boolean | false | 是否可选择 |
| `rowKey` | String | 'id' | 行数据的唯一标识 |
| `rowClickable` | Boolean | false | 行是否可点击 |
| `mobileScroll` | Boolean | true | 移动端横向滚动 |
| `tableWidth` | String | '100%' | 表格宽度 |
| `tableAlign` | String | 'center' | 表格默认对齐方式 |
| `border` | Boolean | false | 是否显示边框 |
| `stripe` | Boolean | true | 是否显示斑马纹 |
| `size` | String | 'medium' | 尺寸：small/medium/large |

## Column 配置

| 参数 | 类型 | 说明 |
|------|------|------|
| `key` | String | 列字段名（必填） |
| `label` | String | 列标题（必填） |
| `sortable` | Boolean | 是否可排序 |
| `formatter` | Function | 格式化函数 |
| `width` | String | 固定宽度 |
| `minWidth` | String | 最小宽度 |
| `maxWidth` | String | 最大宽度 |
| `flex` | Number | flex 比例 |
| `align` | String | 对齐方式：left/center/right |
| `headerClass` | String | 表头自定义 class |
| `headerStyle` | Object | 表头自定义 style |
| `cellClass` | String | 单元格自定义 class |
| `cellStyle` | Object | 单元格自定义 style |

---

## 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `sort` | { key, order } | 排序事件 |
| `selection-change` | selectedRows | 选择变化事件 |
| `row-click` | row | 行点击事件 |

---

## 插槽

| 插槽名 | 参数 | 说明 |
|--------|------|------|
| `header-{key}` | { column } | 自定义表头 |
| `cell-{key}` | { row, value } | 自定义单元格 |
| `actions` | { row } | 操作列 |
| `empty` | - | 空数据提示 |

---

## 方法

通过 ref 调用：

```vue
<template>
  <BaseTable ref="tableRef" :columns="columns" :data="data" />
</template>

<script setup>
import { ref } from 'vue';

const tableRef = ref(null);

// 清除选择
tableRef.value.clearSelection();

// 获取选择
const selection = tableRef.value.getSelection();
</script>
```
