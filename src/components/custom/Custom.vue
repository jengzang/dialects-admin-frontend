<template>
  <div>
    <h1>所有用戶數據 - 共 {{ data.length }} 條</h1>
    <div class="top-controls">
<!--      <p>當前共有 {{ data.length }} 條數據</p>-->
      <div class="logout-button-container" style="margin-top: 0">
        <button @click="goToHome" style="background:#9e9d24">返回首頁</button>
      </div>

      <!-- 搜索框 -->
      <div class="search-container">
        <input v-model="searchQuery" @input="searchUser" type="text" placeholder="搜索用戶名、簡稱、音典分區、特徵、聲韻調、值、說明" />
      </div>
    </div>
    <!-- 表格 -->
    <table>
      <thead>
      <tr>
        <th @click="sortData('username')">用戶名 <span :class="getArrowClass('username')"></span></th>
        <th @click="sortData('簡稱')" style="min-width: 70px">簡稱 <span :class="getArrowClass('簡稱')"></span></th>
        <th @click="sortData('音典分區')">音典分區 <span :class="getArrowClass('音典分區')"></span></th>
        <th @click="sortData('經緯度')">經緯度 <span :class="getArrowClass('經緯度')"></span></th>
        <th @click="sortData('特徵')">特徵 <span :class="getArrowClass('特徵')"></span></th>
        <th @click="sortData('聲韻調')">聲韻調 <span :class="getArrowClass('聲韻調')"></span></th>
        <th @click="sortData('值')">值 <span :class="getArrowClass('值')"></span></th>
        <th @click="sortData('說明')" style="min-width: 120px">說明 <span :class="getArrowClass('說明')"></span></th>
        <th @click="sortData('time')">創建時間 <span :class="getArrowClass('time')"></span></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in currentPageData" :key="item.id" @click="goToPerUser(item)">
        <td>{{ item.username }}</td>
        <td>{{ item.簡稱 }}</td>
        <td>{{ item.音典分區 }}</td>
        <td>{{ item.經緯度 }}</td>
        <td>{{ item.特徵 }}</td>
        <td>{{ item.聲韻調 }}</td>
        <td>{{ item.值 }}</td>
        <td>{{ item.說明 }}</td>
        <td>{{ formatTime(item.created_at) }}</td>
      </tr>
      </tbody>
    </table>

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
import api from '../../axios.js';
import { BasePagination } from '@/components/common';
import { formatTime } from "../../utils.js";

const router = useRouter();

const data = ref([]);
const currentPage = ref(1);
const searchQuery = ref('');
const pageSize = 50;

const totalPages = computed(() => {
  return Math.ceil(data.value.length / pageSize);
});

// 排序状态
const sortField = ref('');
const sortOrder = ref('asc');

// 获取数据
const fetchData = async () => {
  try {
    const result = await api.get('/custom/all');
    data.value = result.data;
  } catch (error) {
    console.error('Error:', error);
  }
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
          (item.簡稱 && item.簡稱.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
          (item.音典分區 && item.音典分區.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
          (item.特徵 && item.特徵.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
          (item.聲韻調 && item.聲韻調.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
          (item.值 && item.值.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
          (item.說明 && item.說明.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
          formattedTime.includes(searchQuery.value)
      );
    });
  }

  // 排序数据
  let sortedData = [...filteredData];
  if (sortField.value) {
    sortedData.sort((a, b) => {
      const valA = a[sortField.value] || '';
      const valB = b[sortField.value] || '';

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
const sortData = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }
};

// 获取排序的箭头图标
const getArrowClass = (field) => {
  return sortField.value === field ? (sortOrder.value === 'asc' ? 'arrow-up' : 'arrow-down') : '';
};

const goToPerUser = (user) => {
  const formattedTime = formatTime(user.created_at);
  router.push({
    name: 'PerUser',
    query: {
      username: user.username,
      created_at: formattedTime,
    }
  });
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

  .stat-btn {
    font-size: $font-size-sm;
    padding: 12px;
  }

  .modal-content {
    width: 95%;
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

  .stat-btn {
    font-size: $font-size-xs;
    padding: $spacing-sm;
  }

  .close {
    font-size: 50px;
  }

  .modal-content {
    padding: 15px;
  }

  td, th {
    max-height: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  td:nth-child(1) {
    max-width: 90px;
  }

  td:nth-child(4) {
    max-width: 100px;
  }

  td:nth-child(6) {
    max-width: 50px;
  }

  td:nth-child(7) {
    max-width: 100px;
  }

  td:not(:nth-child(1)):not(:nth-child(4)):not(:nth-child(6)):not(:nth-child(7)) {
    max-width: 120px;
  }

  td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

</style>


