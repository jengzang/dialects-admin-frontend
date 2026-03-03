<template>
  <div class="table-container" :class="tableContainerClass">
    <table :style="tableStyle">
      <thead>
        <tr>
          <!-- Selection column -->
          <th v-if="selectable" class="selection-column">
            <input
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate.prop="isIndeterminate"
              @change="handleSelectAll"
              class="table-checkbox"
            />
          </th>
          <th
            v-for="column in columns"
            :key="column.key"
            @click="sortable && column.sortable !== false ? handleSort(column.key) : null"
            :style="getColumnStyle(column, 'header')"
            :class="[column.headerClass, getAlignClass(column.align || tableAlign)]"
          >
            <slot :name="`header-${column.key}`" :column="column">
              {{ column.label }}
              <span v-if="sortable && column.sortable !== false" class="sort-arrow">
                <span v-if="sortKey === column.key">
                  {{ sortOrder === 'asc' ? '▲' : '▼' }}
                </span>
                <span v-else class="sort-placeholder">⬍</span>
              </span>
            </slot>
          </th>
          <th v-if="$slots.actions">操作</th>
        </tr>
      </thead>
      <tbody v-if="!loading && data.length > 0">
        <tr
          v-for="(row, index) in data"
          :key="row.id || index"
          @click="handleRowClick(row)"
          :class="{ 'clickable-row': rowClickable }"
        >
          <!-- Selection column -->
          <td v-if="selectable" class="selection-column">
            <input
              type="checkbox"
              :checked="isRowSelected(row)"
              @change="handleSelectRow(row, $event)"
              @click.stop
              class="table-checkbox"
            />
          </td>
          <td v-for="column in columns" :key="column.key"
              :style="getColumnStyle(column, 'cell')"
              :class="[column.cellClass, getAlignClass(column.align || tableAlign)]">
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ formatCell(row[column.key], column) }}
            </slot>
          </td>
          <td v-if="$slots.actions">
            <slot name="actions" :row="row"></slot>
          </td>
        </tr>
      </tbody>
      <tbody v-else-if="loading">
        <tr>
          <td :colspan="columnCount" class="text-center">
            加載中...
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td :colspan="columnCount" class="text-center">
            <slot name="empty">暫無數據</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineOptions({
  name: 'BaseTable'
})

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    // columns: [{
    //   key: 'username',
    //   label: '用戶名',
    //   sortable: true,
    //   formatter: (val) => val,
    //   width: '100px',      // 固定宽度
    //   minWidth: '70px',    // 最小宽度
    //   maxWidth: '200px',   // 最大宽度
    //   flex: 1.5,           // flex 比例
    //   align: 'center',     // 对齐方式: 'left' | 'center' | 'right'
    //   headerClass: '',     // 表头自定义 class
    //   headerStyle: {},     // 表头自定义 style
    //   cellClass: '',       // 单元格自定义 class
    //   cellStyle: {}        // 单元格自定义 style
    // }]
  },
  data: {
    type: Array,
    default: () => []
  },
  sortable: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectable: {
    type: Boolean,
    default: false
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  rowClickable: {
    type: Boolean,
    default: false
  },
  mobileScroll: {
    type: Boolean,
    default: true
  },
  // 新增：表格样式控制
  tableWidth: {
    type: String,
    default: '100%'  // 改为 100%，与旧版一致
  },
  tableAlign: {
    type: String,
    default: 'center',  // 'left' | 'center' | 'right'
    validator: (value) => ['left', 'center', 'right'].includes(value)
  },
  border: {
    type: Boolean,
    default: false  // 是否显示单元格边框
  },
  stripe: {
    type: Boolean,
    default: true  // 是否显示斑马纹
  },
  headerBgColor: {
    type: String,
    default: ''  // 表头背景色，为空则使用默认
  },
  size: {
    type: String,
    default: 'medium',  // 'small' | 'medium' | 'large'
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

const emit = defineEmits(['sort', 'selection-change', 'row-click'])

const sortKey = ref('')
const sortOrder = ref('asc')
const selectedRows = ref([])

const columnCount = computed(() => {
  let count = props.columns.length
  if (props.selectable) count++
  if (props.$slots?.actions) count++
  return count
})

const isAllSelected = computed(() => {
  return props.data.length > 0 && selectedRows.value.length === props.data.length
})

const isIndeterminate = computed(() => {
  return selectedRows.value.length > 0 && selectedRows.value.length < props.data.length
})

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  emit('sort', { key: sortKey.value, order: sortOrder.value })
}

const formatCell = (value, column) => {
  if (column.formatter && typeof column.formatter === 'function') {
    return column.formatter(value)
  }
  return value
}

const getRowKey = (row) => {
  return row[props.rowKey]
}

const isRowSelected = (row) => {
  const rowKey = getRowKey(row)
  return selectedRows.value.some(r => getRowKey(r) === rowKey)
}

const handleSelectAll = (event) => {
  if (event.target.checked) {
    selectedRows.value = [...props.data]
  } else {
    selectedRows.value = []
  }
  emit('selection-change', selectedRows.value)
}

const handleSelectRow = (row, event) => {
  const rowKey = getRowKey(row)
  if (event.target.checked) {
    if (!isRowSelected(row)) {
      selectedRows.value.push(row)
    }
  } else {
    selectedRows.value = selectedRows.value.filter(r => getRowKey(r) !== rowKey)
  }
  emit('selection-change', selectedRows.value)
}

const handleRowClick = (row) => {
  if (props.rowClickable) {
    emit('row-click', row)
  }
}

// 获取列样式
const getColumnStyle = (column, type = 'cell') => {
  const style = {
    cursor: type === 'header' && props.sortable && column.sortable !== false ? 'pointer' : 'default'
  }

  // 宽度控制
  if (column.width) {
    style.width = column.width
  }
  if (column.minWidth) {
    style.minWidth = column.minWidth
  }
  if (column.maxWidth) {
    style.maxWidth = column.maxWidth
  }
  if (column.flex) {
    style.flex = column.flex
  }

  // 自定义样式
  if (type === 'header' && column.headerStyle) {
    Object.assign(style, column.headerStyle)
  }
  if (type === 'cell' && column.cellStyle) {
    Object.assign(style, column.cellStyle)
  }

  return style
}

// 获取对齐 class
const getAlignClass = (align) => {
  if (!align) return ''
  return `text-${align}`
}

// 获取表格容器样式
const tableContainerClass = computed(() => {
  const classes = []
  if (props.mobileScroll) classes.push('mobile-scroll')
  if (props.border) classes.push('table-border')
  if (props.stripe) classes.push('table-stripe')
  if (props.size) classes.push(`table-${props.size}`)
  return classes
})

// 获取表格样式
const tableStyle = computed(() => {
  const style = {
    width: props.tableWidth
  }
  if (props.tableWidth !== '100%') {
    style.margin = `${props.tableWidth === '80%' ? '0 auto' : '0'}`
  }
  return style
})

// Expose methods for parent component
defineExpose({
  clearSelection: () => {
    selectedRows.value = []
  },
  getSelection: () => {
    return selectedRows.value
  }
})
</script>

<style lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  table {
    border-collapse: collapse;
    margin-top: $spacing-md;
    border-radius: $radius-md;
    overflow: hidden;
    background-color: $color-background;

    th {
      padding: 12px 18px;
      font-weight: 600;
      color: $color-text-primary;
      user-select: none;
      white-space: nowrap;
      background-color: $color-primary-light;
    }

    td {
      padding: 12px 18px;
      font-size: $font-size-md;
    }

    tbody {
      tr {
        background-color: $color-background;

        &:hover {
          background-color: rgba(187, 234, 196, 0.34);
        }

        &:last-child td {
          border-bottom: none;
        }
      }
    }
  }
}

// 边框样式
.table-container.table-border {
  table {
    border: 1px solid #ddd;

    th, td {
      border: 1px solid #ddd;
    }
  }
}

// 斑马纹样式
.table-container.table-stripe {
  table tbody tr:nth-child(even) {
    background-color: #f9f9f9;
  }
}

// 尺寸控制
.table-container.table-small {
  table {
    th, td {
      padding: 8px 12px;
      font-size: $font-size-sm;
    }
  }
}

.table-container.table-large {
  table {
    th, td {
      padding: 16px 24px;
      font-size: $font-size-lg;
    }
  }
}

// 对齐方式
.text-left {
  text-align: left !important;
}

.text-center {
  text-align: center !important;
}

.text-right {
  text-align: right !important;
}

.table-container.mobile-scroll {
  @include respond-to(mobile) {
    table {
      min-width: 600px;
      font-size: $font-size-xs;
    }
  }
}

.selection-column {
  width: 50px;
  text-align: center !important;
}

.table-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.clickable-row {
  cursor: pointer;
}

.sort-arrow {
  margin-left: $spacing-xs;
  font-size: $font-size-xs;
}

.sort-placeholder {
  opacity: 0.3;
}

/* Mobile responsive */
@include respond-to(tablet) {
  .table-container table {
    th, td {
      padding: 8px 12px;
      font-size: $font-size-sm;
    }
  }
}

@include respond-to(mobile) {
  .table-container {
    margin: 0 -12px;
    padding: 0 12px;

    table {
      font-size: $font-size-xs;

      th, td {
        padding: 6px;
        font-size: $font-size-xs;
      }
    }
  }

  .table-checkbox {
    width: 20px;
    height: 20px;
  }
}
</style>
