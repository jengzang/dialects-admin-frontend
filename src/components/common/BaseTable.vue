<template>
  <div class="table-container" :class="{ 'mobile-scroll': mobileScroll }">
    <table>
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
            :style="{ cursor: sortable && column.sortable !== false ? 'pointer' : 'default' }"
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
          <td v-for="column in columns" :key="column.key">
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
    // columns: [{ key: 'username', label: '用戶名', sortable: true, formatter: (val) => val }]
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

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
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
  text-align: center;
}

.table-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background-color: var(--color-background);
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
  table {
    th, td {
      padding: 8px;
    }
  }
}

@include respond-to(mobile) {
  .table-container {
    margin: 0 -12px;
    padding: 0 12px;
  }

  table {
    th, td {
      padding: 6px;
      font-size: $font-size-xs;
    }
  }

  .table-checkbox {
    width: 20px;
    height: 20px;
  }
}
</style>
