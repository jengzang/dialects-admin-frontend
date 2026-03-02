<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
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
        <tr v-for="(row, index) in data" :key="row.id || index">
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
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="text-center">
            加載中...
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="text-center">
            暫無數據
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'BaseTable',
  props: {
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
    }
  },
  data() {
    return {
      sortKey: '',
      sortOrder: 'asc'
    };
  },
  emits: ['sort'],
  methods: {
    handleSort(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
      this.$emit('sort', { key: this.sortKey, order: this.sortOrder });
    },
    formatCell(value, column) {
      if (column.formatter && typeof column.formatter === 'function') {
        return column.formatter(value);
      }
      return value;
    }
  }
};
</script>

<style scoped>
.sort-arrow {
  margin-left: 5px;
  font-size: 12px;
}

.sort-placeholder {
  opacity: 0.3;
}
</style>
