# BaseTable 增强功能总结

## 🎯 改进目标

将 BaseTable 从基础表格组件升级为功能完整的企业级表格组件，支持：
- ✅ 列宽精确控制
- ✅ 灵活的对齐方式
- ✅ 边框样式控制
- ✅ 表格宽度自定义
- ✅ 尺寸控制
- ✅ 完全兼容旧版原生表格样式

---

## 📊 旧版 vs 新版对比

### 旧版原生表格
```html
<table>
  <thead>
    <tr>
      <th @click="sortData('username')">用戶名</th>
      <th @click="sortData('簡稱')" style="min-width: 70px">簡稱</th>
      <th @click="sortData('說明')" style="min-width: 120px">說明</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="item in data" :key="item.id">
      <td>{{ item.username }}</td>
      <td>{{ item.簡稱 }}</td>
      <td>{{ item.說明 }}</td>
    </tr>
  </tbody>
</table>
```

**特点：**
- 宽度：100%
- 对齐：center
- 边框：有
- 列宽：inline style 控制

### 新版 BaseTable
```vue
<BaseTable
  :columns="columns"
  :data="data"
  table-width="100%"
  table-align="center"
  border
  @sort="handleSort"
/>
```

```javascript
const columns = [
  { key: 'username', label: '用戶名', sortable: true, align: 'center' },
  { key: '簡稱', label: '簡稱', sortable: true, minWidth: '70px', align: 'center' },
  { key: '說明', label: '說明', sortable: true, minWidth: '120px', align: 'center' }
];
```

**优势：**
- ✅ 声明式配置，更清晰
- ✅ 支持更多控制参数
- ✅ 内置选择、排序、加载等功能
- ✅ 完全兼容旧版样式

---

## 🆕 新增功能详解

### 1. 列宽控制（最重要）

支持 4 种方式：

```javascript
const columns = [
  {
    key: 'col1',
    label: '固定宽度',
    width: '100px'        // 固定宽度
  },
  {
    key: 'col2',
    label: '最小宽度',
    minWidth: '150px'     // 最小宽度（可扩展）
  },
  {
    key: 'col3',
    label: '范围宽度',
    minWidth: '120px',    // 最小宽度
    maxWidth: '300px'     // 最大宽度
  },
  {
    key: 'col4',
    label: 'Flex 比例',
    flex: 1.5             // flex 比例（相对于其他列）
  }
];
```

**使用场景：**
- `width`: 固定列（如操作列、状态列）
- `minWidth`: 内容可能较长的列（如邮箱、描述）
- `minWidth + maxWidth`: 需要限制范围的列
- `flex`: 自适应列（如标题、说明）

### 2. 对齐方式控制

支持列级别和表格级别：

```vue
<template>
  <!-- 表格级别：所有列默认居中 -->
  <BaseTable
    :columns="columns"
    :data="data"
    table-align="center"
  />
</template>

<script setup>
const columns = [
  { key: 'name', label: '姓名', align: 'left' },      // 覆盖表格默认
  { key: 'age', label: '年齡', align: 'right' },      // 覆盖表格默认
  { key: 'status', label: '狀態' }                    // 使用表格默认（center）
];
</script>
```

**对齐规则：**
- 列级别 `align` 优先于表格级别 `table-align`
- 选择列始终居中对齐
- 支持：`left`、`center`、`right`

### 3. 边框控制

```vue
<!-- 显示单元格边框（类似旧版） -->
<BaseTable :columns="columns" :data="data" border />

<!-- 无边框（默认） -->
<BaseTable :columns="columns" :data="data" />
```

### 4. 表格宽度控制

```vue
<!-- 100% 宽度（默认，与旧版一致） -->
<BaseTable :columns="columns" :data="data" />

<!-- 80% 宽度居中 -->
<BaseTable :columns="columns" :data="data" table-width="80%" />

<!-- 固定宽度 -->
<BaseTable :columns="columns" :data="data" table-width="1200px" />
```

### 5. 斑马纹控制

```vue
<!-- 开启斑马纹（默认） -->
<BaseTable :columns="columns" :data="data" />

<!-- 关闭斑马纹 -->
<BaseTable :columns="columns" :data="data" :stripe="false" />
```

### 6. 尺寸控制

```vue
<!-- 小尺寸 -->
<BaseTable :columns="columns" :data="data" size="small" />

<!-- 中等尺寸（默认） -->
<BaseTable :columns="columns" :data="data" size="medium" />

<!-- 大尺寸 -->
<BaseTable :columns="columns" :data="data" size="large" />
```

### 7. 自定义样式

```javascript
const columns = [
  {
    key: 'username',
    label: '用戶名',
    headerClass: 'custom-header',      // 表头 class
    headerStyle: { color: 'red' },     // 表头 style
    cellClass: 'custom-cell',          // 单元格 class
    cellStyle: { fontWeight: 'bold' }  // 单元格 style
  }
];
```

---

## 📝 完整 Props 列表

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
| **`tableWidth`** | String | **'100%'** | **表格宽度（新增）** |
| **`tableAlign`** | String | **'center'** | **表格默认对齐方式（新增）** |
| **`border`** | Boolean | **false** | **是否显示边框（新增）** |
| **`stripe`** | Boolean | **true** | **是否显示斑马纹（新增）** |
| **`size`** | String | **'medium'** | **尺寸：small/medium/large（新增）** |

## 📝 Column 配置

| 参数 | 类型 | 说明 |
|------|------|------|
| `key` | String | 列字段名（必填） |
| `label` | String | 列标题（必填） |
| `sortable` | Boolean | 是否可排序 |
| `formatter` | Function | 格式化函数 |
| **`width`** | **String** | **固定宽度（新增）** |
| **`minWidth`** | **String** | **最小宽度（新增）** |
| **`maxWidth`** | **String** | **最大宽度（新增）** |
| **`flex`** | **Number** | **flex 比例（新增）** |
| **`align`** | **String** | **对齐方式：left/center/right（新增）** |
| **`headerClass`** | **String** | **表头自定义 class（新增）** |
| **`headerStyle`** | **Object** | **表头自定义 style（新增）** |
| **`cellClass`** | **String** | **单元格自定义 class（新增）** |
| **`cellStyle`** | **Object** | **单元格自定义 style（新增）** |

---

## 🔄 迁移指南

### 从旧版原生表格迁移到 BaseTable

**旧版代码：**
```html
<table>
  <thead>
    <tr>
      <th @click="sortData('username')">用戶名</th>
      <th @click="sortData('簡稱')" style="min-width: 70px">簡稱</th>
      <th @click="sortData('說明')" style="min-width: 120px">說明</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="item in data" :key="item.id" @click="goToDetail(item)">
      <td>{{ item.username }}</td>
      <td>{{ item.簡稱 }}</td>
      <td>{{ item.說明 || '無' }}</td>
    </tr>
  </tbody>
</table>
```

**新版代码：**
```vue
<BaseTable
  :columns="columns"
  :data="data"
  table-width="100%"
  table-align="center"
  border
  row-clickable
  @sort="handleSort"
  @row-click="goToDetail"
>
  <template #cell-說明="{ value }">
    {{ value || '無' }}
  </template>
</BaseTable>
```

```javascript
const columns = [
  { key: 'username', label: '用戶名', sortable: true, align: 'center' },
  { key: '簡稱', label: '簡稱', sortable: true, minWidth: '70px', align: 'center' },
  { key: '說明', label: '說明', sortable: true, minWidth: '120px', align: 'center' }
];

const handleSort = ({ key, order }) => {
  // 排序逻辑
};
```

---

## ✅ 测试清单

- [x] 列宽控制（width, minWidth, maxWidth, flex）
- [x] 对齐方式（列级别 + 表格级别）
- [x] 边框显示
- [x] 表格宽度控制
- [x] 斑马纹控制
- [x] 尺寸控制
- [x] 自定义样式（class + style）
- [x] 向后兼容（旧版样式完美复刻）
- [x] 响应式（移动端适配）

---

## 📚 相关文件

- **组件文件**: `src/components/common/BaseTable.vue`
- **使用文档**: `docs/BaseTable使用文档.md`
- **演示组件**: `src/components/demo/BaseTableDemo.vue`

---

## 🎉 总结

BaseTable 现在是一个功能完整的企业级表格组件，支持：

1. **灵活的列宽控制** - 4 种方式满足各种需求
2. **精确的对齐控制** - 列级别 + 表格级别
3. **丰富的样式选项** - 边框、斑马纹、尺寸
4. **完全向后兼容** - 可以完美复刻旧版样式
5. **声明式配置** - 代码更清晰、更易维护

**默认值已优化为与旧版一致：**
- `tableWidth`: `'100%'`（旧版也是 100%）
- `tableAlign`: `'center'`（旧版也是居中）
- `border`: `false`（可选开启）
- `stripe`: `true`（默认斑马纹）
