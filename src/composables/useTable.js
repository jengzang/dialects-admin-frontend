/**
 * useTable Composable
 * 表格状态管理：排序、分页、过滤
 *
 * 使用方式（Options API）：
 * import { useTable } from '@/composables/useTable';
 *
 * export default {
 *   setup() {
 *     return useTable(initialData, options);
 *   }
 * }
 */

import { ref, computed, watch } from 'vue';

export function useTable(initialData = [], options = {}) {
  const {
    pageSize: initialPageSize = 30,
    sortKey: initialSortKey = '',
    sortOrder: initialSortOrder = 'asc',
    searchFields = [] // 要搜索的字段名数组
  } = options;

  // 响应式状态
  const data = ref(initialData);
  const currentPage = ref(1);
  const pageSize = ref(initialPageSize);
  const sortKey = ref(initialSortKey);
  const sortOrder = ref(initialSortOrder);
  const searchQuery = ref('');

  // 计算属性：过滤后的数据
  const filteredData = computed(() => {
    if (!searchQuery.value || searchFields.length === 0) {
      return data.value;
    }

    const query = searchQuery.value.toLowerCase();
    return data.value.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  });

  // 计算属性：排序后的数据
  const sortedData = computed(() => {
    if (!sortKey.value) return filteredData.value;

    return [...filteredData.value].sort((a, b) => {
      const aVal = a[sortKey.value];
      const bVal = b[sortKey.value];

      // 处理 null/undefined
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      // 数字比较
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // 字符串比较
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortOrder.value === 'asc' ? comparison : -comparison;
    });
  });

  // 计算属性：总页数
  const totalPages = computed(() => {
    return Math.ceil(filteredData.value.length / pageSize.value) || 1;
  });

  // 计算属性：当前页数据
  const currentPageData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return sortedData.value.slice(start, end);
  });

  // 方法：排序
  const sortData = (key) => {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey.value = key;
      sortOrder.value = 'asc';
    }
  };

  // 方法：翻页
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  // 方法：搜索
  const search = (query) => {
    searchQuery.value = query;
    currentPage.value = 1; // 搜索时重置到第一页
  };

  // 方法：更新数据
  const setData = (newData) => {
    data.value = newData;
    currentPage.value = 1; // 数据更新时重置到第一页
  };

  // 监听搜索查询变化，自动重置页码
  watch(searchQuery, () => {
    currentPage.value = 1;
  });

  return {
    // 状态
    data,
    currentPage,
    pageSize,
    sortKey,
    sortOrder,
    searchQuery,

    // 计算属性
    filteredData,
    sortedData,
    totalPages,
    currentPageData,

    // 方法
    sortData,
    nextPage,
    prevPage,
    goToPage,
    search,
    setData
  };
}
