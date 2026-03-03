<template>
  <div>
    <h1 v-if="showHeader">所有用戶區域 - 共 {{ data.length }} 條</h1>
    <div class="top-controls">
      <div v-if="showHomeButton" class="logout-button-container" style="margin-top: 0">
        <button @click="goToHome" style="background:#9e9d24">返回首頁</button>
      </div>

      <!-- 搜索框 -->
      <div class="search-container">
        <input v-model="searchQuery" @input="searchUser" type="text" placeholder="搜索用戶名、區域名、說明" />
      </div>
    </div>

    <!-- 表格 -->
    <BaseTable
      :columns="regionsColumns"
      :data="currentPageData"
      :row-clickable="true"
      @row-click="goToPerUser"
      @sort="handleSort"
    >
      <template #cell-locations="{ value }">
        {{ value.join(', ') }}
      </template>
      <template #cell-description="{ value }">
        {{ value || '無' }}
      </template>
      <template #cell-created_at="{ value }">
        {{ formatTime(value) }}
      </template>
    </BaseTable>

    <!-- 分頁控制 -->
    <BasePagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-size="pageSize"
      :show-first-last="false"
      info-format="simple"
      container-class="pagination-controls"
      @page-change="handlePageChange"
    />
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { customRegionsAPI } from '@/api';
import { BasePagination, BaseTable } from '@/components/common';
import { formatTime } from '@/utils';

const props = defineProps({
  showHeader: {
    type: Boolean,
    default: true
  },
  showHomeButton: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['row-click']);

const router = useRouter();

const data = ref([]);
const currentPage = ref(1);
const searchQuery = ref('');
const pageSize = 50;

const regionsColumns = [
  { key: 'username', label: '用戶名', sortable: true },
  { key: 'region_name', label: '區域名', sortable: true },
  { key: 'locations', label: '地點列表', sortable: false },
  { key: 'location_count', label: '地點數量', sortable: true },
  { key: 'description', label: '說明', sortable: true },
  { key: 'created_at', label: '創建時間', sortable: true }
];

const totalPages = computed(() => {
  return Math.ceil(data.value.length / pageSize);
});

// 排序状态
const sortField = ref('');
const sortOrder = ref('asc');

// 获取数据
const fetchData = async () => {
  try {
    const result = await customRegionsAPI.getAll();
    data.value = result.data || result;
  } catch (error) {
    console.error('Error:', error);
  }
};

// 搜索用户
const searchUser = () => {
  currentPage.value = 1;
};

// 计算当前页面显示的数据
const currentPageData = computed(() => {
  let filteredData = data.value;

  // 过滤数据
  if (searchQuery.value) {
    filteredData = filteredData.filter(item => {
      const formattedTime = formatTime(item.created_at);
      return (
        (item.username && item.username.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        (item.region_name && item.region_name.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        formattedTime.includes(searchQuery.value)
      );
    });
  }

  // 排序数据
  let sortedData = [...filteredData];
  if (sortField.value) {
    sortedData.sort((a, b) => {
      let valA, valB;

      if (sortField.value === 'location_count') {
        valA = a[sortField.value] || 0;
        valB = b[sortField.value] || 0;
      } else {
        valA = a[sortField.value] || '';
        valB = b[sortField.value] || '';
      }

      if (sortOrder.value === 'asc') {
        return valA < valB ? -1 : valA > valB ? 1 : 0;
      } else {
        return valA > valB ? -1 : valA < valB ? 1 : 0;
      }
    });
  }

  // 根据当前页码计算当前页数据
  const startIndex = (currentPage.value - 1) * pageSize;
  return sortedData.slice(startIndex, startIndex + pageSize);
});

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page;
};

// 排序方法
const handleSort = ({ key, order }) => {
  sortField.value = key;
  sortOrder.value = order;
};

const goToPerUser = (user) => {
  if (emit) {
    emit('row-click', user);
  } else {
    // Fallback to direct navigation
    router.push({
      name: 'RegionsPerUser',
      query: { username: user.username }
    });
  }
};

const goToHome = () => {
  router.push({ name: 'Home' });
};

onMounted(() => {
  fetchData();
});
</script>


<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

h1 {
  font-size: 30px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0;
  color: #2c6e49;
}

p {
  font-size: $font-size-lg;
  text-align: center;
  margin-bottom: $spacing-md;
  color: $color-text-primary;
  font-weight: normal;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: $spacing-md;
  border-radius: $radius-md;
  overflow: hidden;

  th,
  td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: center;
    font-size: $font-size-md;
  }

  th {
    background-color: #e4f4e7;
    color: #2c6e49;
    font-weight: bold;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      background-color: #c8e7c2;
    }
  }

  td {
    background-color: #f9f9f9;
  }
}

.arrow-up::after {
  content: '↑';
  margin-left: $spacing-xs;
  font-size: $font-size-sm;
}

.arrow-down::after {
  content: '↓';
  margin-left: $spacing-xs;
  font-size: $font-size-sm;
}

.search-container input {
  width: 100%;
  padding: 12px 20px;
  font-size: $font-size-md;
  border-radius: 25px;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
  transition: all $transition-normal;
  margin-top: $spacing-sm;

  &:focus {
    @include input-focus($color-primary);
  }
}

.pagination-controls {
  margin-top: $spacing-md;
  text-align: center;

  button {
    @include button-variant($color-primary, #45a049);
    padding: 12px 24px;
    display: inline;
    margin: 0 $spacing-sm;
    border-radius: 20px;
    font-size: $font-size-md;
    max-width: 120px;

    &:disabled {
      background-color: rgba(76, 175, 80, 0.5);
    }
  }

  span {
    font-size: $font-size-md;
    color: $color-text-primary;
    align-self: center;
  }
}

.top-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: $spacing-sm;
}

tr:hover {
  background-color: #e1f5e1;
  cursor: pointer;
  transition: background-color $transition-normal;
}

@include respond-to(tablet) {
  th, td {
    padding: 8px;
  }

  .pagination-controls button {
    display: inline;
    font-size: $font-size-sm;
    min-width: 100px;
  }

  table {
    font-size: $font-size-sm;
    overflow-x: auto;
    display: block;
  }

  th, td {
    padding: 8px 12px;
  }
}

@include respond-to(mobile) {
  table {
    font-size: $font-size-sm;
  }

  .pagination-controls button {
    font-size: $font-size-xs;
    padding: 8px 16px;
  }

  td, th {
    max-height: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>

