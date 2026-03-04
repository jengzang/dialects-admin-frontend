<template>
  <div>
    <div class="header-container">
      <h2>近期 API 使用詳情</h2>
      <input v-model="searchQuery" @input="handleSearch" type="text" placeholder="搜索..." class="search-box" />
    </div>

<!--    <button @click="goToApiStatsPage" style="max-width: 100px;padding:3px;display: flex;justify-self: center">API統計表</button>-->

    <!-- 功能统计部分 -->
    <div class="stats">
      <button @click="showUniqueUsers" class="stat-btn">所有用户: {{ uniqueUsersCount }}</button>
      <button @click="showUniqueIPs" class="stat-btn">所有IP: {{ uniqueIPsCount }}</button>
      <button @click="showAPICalls" class="stat-btn" style="max-width: 180px">API調用數: {{ totalAPICalls }}</button>
      <button @click="goToHome" class="stat-btn" style="background: #9e9d24;">返回首頁</button>
    </div>

    <!-- 独特用户弹窗 -->
    <div v-if="showUserModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeUserModal">&times;</span>
        <h3>用户列表</h3>
        <table>
          <thead>
          <tr>
            <th>用戶名</th>
            <th>總使用時長</th>
            <th>次數</th>
            <th>上行流量</th>  <!-- 新增列 -->
            <th>下行流量</th>  <!-- 新增列 -->
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="userStat in filteredUserStats"
              :key="userStat.user"
              :class="{ 'clickable': userStat.user !== '匿名用戶' }"
              @click="userStat.user !== '匿名用戶' && viewUserStats(userStat.user)"
          >
            <td>{{ userStat.user }}</td>  <!-- 显示用户名 -->
            <td>{{ userStat.totalDuration.toFixed(3) }}s</td> <!-- 总使用时长 -->
            <td>{{ userStat.occurrenceCount }}</td> <!-- 出现次数 -->
            <td>{{ userStat.totalUploadTraffic }}KB</td>  <!-- 上行流量 -->
            <td>{{ userStat.totalDownloadTraffic }}MB</td>  <!-- 下行流量 -->
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 独特IP弹窗 -->
    <div v-if="showIPModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeIPModal">&times;</span>
        <h3>所有IP地址</h3>
        <table>
          <thead>
          <tr>
            <th>IP 地址</th>
            <th>總使用時長</th>
            <th>次數</th>
            <th>上行流量</th>  <!-- 新增列 -->
            <th>下行流量</th>  <!-- 新增列 -->
          </tr>
          </thead>
          <tbody>
          <tr v-for="ipStat in filteredIPStats" :key="ipStat.ip">
            <td class="clickable-cell" @click="handleIPClick(ipStat.ip)">
              <IPLocationDisplay
                :ip="ipStat.ip"
                :location="ipStat.location"
              />
            </td>
            <td>{{ ipStat.totalDuration.toFixed(3) }}s</td> <!-- 总使用时长 -->
            <td>{{ ipStat.occurrenceCount }}</td> <!-- 出现次数 -->
            <td>{{ ipStat.totalUploadTraffic }}KB</td>  <!-- 上行流量 -->
            <td>{{ ipStat.totalDownloadTraffic }}MB</td>  <!-- 下行流量 -->
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- API调用统计弹窗 -->
    <div v-if="showAPICallsModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeAPICallsModal">&times;</span>
        <h3>各個API調用次數</h3>
        <table>
          <thead>
          <tr>
            <th>API 路徑</th>
            <th>總時長</th>  <!-- 新增总持续时间列 -->
            <th>調用次數</th>
            <th>上行流量</th>  <!-- 新增列 -->
            <th>下行流量</th>  <!-- 新增列 -->
          </tr>
          </thead>
          <tbody>
          <tr v-for="(data, path) in filteredAPICalls" :key="path">
            <td>{{ path }}</td>
            <td>{{ data.totalDuration.toFixed(3) }}s</td>  <!-- 显示总持续时间 -->
            <td>{{ data.count }}</td>
            <td>{{ data.totalUploadTraffic.toFixed(2) }}KB</td>  <!-- 上行流量 -->
            <td>{{ data.totalDownloadTraffic.toFixed(2) }}MB</td>  <!-- 下行流量 -->
          </tr>
          </tbody>
        </table>
      </div>
    </div>


    <!--    詳細表格-->
    <table>
      <thead>
      <tr>
        <th @click="sortData('user')">用戶 <span :class="getArrowClass('user')"></span></th>
        <th @click="sortData('ip')">IP 地址 <span :class="getArrowClass('ip')"></span></th>
        <th @click="sortData('path')">API 路徑 <span :class="getArrowClass('path')"></span></th>
        <th @click="sortData('duration')">持續時長 <span :class="getArrowClass('duration')"></span></th>
        <th @click="sortData('os')">操作系統 <span :class="getArrowClass('os')"></span></th>
        <th @click="sortData('browser')">瀏覽器 <span :class="getArrowClass('browser')"></span></th>
        <th @click="sortData('called_at')">請求時間 <span :class="getArrowClass('called_at')"></span></th>
        <th @click="sortData('uploadTraffic')">上行流量 <span :class="getArrowClass('uploadTraffic')"></span></th>
        <th @click="sortData('downloadTraffic')">下行流量 <span :class="getArrowClass('downloadTraffic')"></span></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(log, index) in filteredLogs" :key="index">
        <td>{{ log.user || '' }}</td> <!-- 用户 -->
        <td>{{ log.ip }}</td>
        <td>{{ log.path }}</td>
        <td>{{ log.duration.toFixed(3) }}s</td>  <!-- 持续时长 -->
        <td>{{ log.os }}</td> <!-- 操作系统 -->
        <td>{{ log.browser }}</td> <!-- 浏览器 -->
        <td>{{ formatTime(log.called_at) }}</td> <!-- 使用时间 -->
        <td>{{ log.uploadTraffic }}KB</td>  <!-- 上行流量 -->
        <td>{{ log.downloadTraffic }}KB</td>  <!-- 下行流量 -->
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { analyticsAPI } from '../api';
import { formatTime } from "../utils.js";
import { BasePagination, IPLocationDisplay } from '@/components/common';

const router = useRouter();

// 分页相关
const currentPage = ref(1);
const pageSize = ref(50);
const totalPages = ref(1);

// 数据相关
const userName = ref('');
const apiLogs = ref([]);
const uniqueUsers = ref([]);
const uniqueIPs = ref([]);
const apiCalls = ref({});
const totalAPICalls = ref(0);
const userStats = ref([]);
const ipStats = ref([]);

// 弹窗控制
const showUserModal = ref(false);
const showIPModal = ref(false);
const showAPICallsModal = ref(false);

// 统计数据
const uniqueUsersCount = ref(0);
const uniqueIPsCount = ref(0);

// 排序相关
const currentSortBy = ref('called_at');  // 当前排序字段
const currentSortOrder = ref('desc');    // 当前排序方向
const sortOrder = ref({
  user: 'asc',
  totalDuration: 'desc',
  occurrenceCount: 'desc',
  ip: 'asc',
  path: 'asc',
  duration: 'desc',
  os: 'asc',
  browser: 'asc',
  called_at: 'desc',
  uploadTraffic: 'desc',
  downloadTraffic: 'desc',
  request_size: 'desc',
  response_size: 'desc'
});
const sortField = ref('');
const searchQuery = ref('');
let searchTimeout = null;  // 搜索防抖定时器

// 计算属性 - 直接使用 apiLogs（后端已处理搜索）
const filteredLogs = computed(() => {
  return apiLogs.value;
});

// 计算属性 - 使用后端返回的统计数据
const filteredUserStats = computed(() => {
  return userStats.value;
});

// 计算属性 - 使用后端返回的统计数据
const filteredIPStats = computed(() => {
  return ipStats.value;
});

// 计算属性 - 使用后端返回的统计数据
const filteredAPICalls = computed(() => {
  return apiCalls.value;
});

// 获取箭头的 CSS 类
const getArrowClass = (field) => {
  return sortOrder.value[field] === 'asc' ? 'arrow-up' : 'arrow-down';
};

// 排序方法 - 调用后端 API
const sortData = async (field) => {
  // 切换排序方向
  const currentOrder = sortOrder.value[field] === 'asc' ? 'desc' : 'asc';
  sortOrder.value[field] = currentOrder;

  // 映射前端字段到后端字段
  const fieldMap = {
    'uploadTraffic': 'request_size',
    'downloadTraffic': 'response_size'
  };

  currentSortBy.value = fieldMap[field] || field;
  currentSortOrder.value = currentOrder;

  // 重置到第一页并重新获取数据
  currentPage.value = 1;
  await fetchPageData(false);  // 排序时不需要重新获取统计
};

// 处理分页变化
const handlePageChange = async (page) => {
  currentPage.value = page;
  await fetchPageData(false);  // 翻页时不需要重新获取统计
};

// 搜索处理（带防抖）
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    currentPage.value = 1;  // 搜索时重置到第一页
    await fetchPageData(true);  // 搜索时需要重新获取统计
  }, 500);  // 500ms 防抖
};

// 从后端获取数据
const fetchPageData = async (includeStats = false) => {
  try {
    const params = {
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value,
      include_stats: includeStats
    };

    // 添加搜索参数
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }

    // 添加排序参数
    if (currentSortBy.value) {
      params.sort_by = currentSortBy.value;
      params.sort_order = currentSortOrder.value;
    }

    const response = await analyticsAPI.getApiUsage(params);

    console.log('API response:', response);

    // 处理返回的数据结构
    const logs = Array.isArray(response) ? response : (response.data || response.logs || []);

    // 获取总记录数用于分页
    const totalRecords = response.total || logs.length;

    // 为每个日志添加上行流量和下行流量
    apiLogs.value = logs.map(log => ({
      ...log,
      uploadTraffic: (log.request_size / 1024).toFixed(2),
      downloadTraffic: (log.response_size / 1024).toFixed(2)
    }));

    // 计算总页数
    totalPages.value = Math.ceil(totalRecords / pageSize.value);

    // 如果返回了统计数据，更新统计
    if (response.statistics) {
      updateStatsFromBackend(response.statistics);
    }

  } catch (error) {
    console.error('Error fetching API usage data', error);
    console.error('Error details:', error.response?.data || error.message);
  }
};

// 使用后端返回的统计数据
const updateStatsFromBackend = (statistics) => {
  if (!statistics) return;

  // 更新总览数据
  if (statistics.summary) {
    totalAPICalls.value = statistics.summary.total_calls || 0;
    uniqueUsersCount.value = statistics.summary.unique_users || 0;
    uniqueIPsCount.value = statistics.summary.unique_ips || 0;
  }

  // 更新用户统计
  if (statistics.user_stats) {
    userStats.value = statistics.user_stats.map(stat => ({
      user: stat.user || '匿名用户',
      totalDuration: stat.total_duration || 0,
      occurrenceCount: stat.call_count || 0,
      totalUploadTraffic: ((stat.total_upload || 0) / 1024).toFixed(2),
      totalDownloadTraffic: ((stat.total_download || 0) / (1024 * 1024)).toFixed(2)
    }));
  }

  // 更新 IP 统计
  if (statistics.ip_stats) {
    ipStats.value = statistics.ip_stats.map(stat => ({
      ip: stat.ip,
      location: stat.location,  // 添加位置字段
      totalDuration: stat.total_duration || 0,
      occurrenceCount: stat.call_count || 0,
      totalUploadTraffic: ((stat.total_upload || 0) / 1024).toFixed(2),
      totalDownloadTraffic: ((stat.total_download || 0) / (1024 * 1024)).toFixed(2)
    }));
  }

  // 更新 API 路径统计
  if (statistics.path_stats) {
    apiCalls.value = statistics.path_stats.reduce((acc, stat) => {
      acc[stat.path] = {
        count: stat.call_count || 0,
        totalDuration: stat.total_duration || 0,
        totalUploadTraffic: ((stat.total_upload || 0) / 1024) || 0,
        totalDownloadTraffic: ((stat.total_download || 0) / (1024 * 1024)) || 0
      };
      return acc;
    }, {});
  }
};

// 旧的前端统计方法（作为后备）
const updateStats = () => {
  // 独特用户统计
  uniqueUsers.value = [...new Set(apiLogs.value.map(log => log.user || ''))];
  uniqueUsersCount.value = uniqueUsers.value.length;

  userStats.value = uniqueUsers.value.map(user => {
    const userLogs = apiLogs.value.filter(log => log.user === user);
    const totalDuration = userLogs.reduce((acc, log) => acc + log.duration, 0);
    const occurrenceCount = userLogs.length;
    const totalUploadTraffic = userLogs.reduce((acc, log) => acc + (log.request_size || 0), 0);
    const totalDownloadTraffic = userLogs.reduce((acc, log) => acc + (log.response_size || 0), 0);
    return {
      user: user || '匿名用户',
      totalDuration,
      occurrenceCount,
      totalUploadTraffic: (totalUploadTraffic / 1024).toFixed(2),
      totalDownloadTraffic: (totalDownloadTraffic / (1024 * 1024)).toFixed(2)
    };
  });

  // 排序：按总使用时长从大到小
  userStats.value.sort((a, b) => b.totalDuration - a.totalDuration);

  // 独特 IP 地址统计
  uniqueIPs.value = [...new Set(apiLogs.value.map(log => log.ip))];
  uniqueIPsCount.value = uniqueIPs.value.length;

  ipStats.value = uniqueIPs.value.map(ip => {
    const ipLogs = apiLogs.value.filter(log => log.ip === ip);
    const totalDuration = ipLogs.reduce((acc, log) => acc + log.duration, 0);
    const occurrenceCount = ipLogs.length;
    const totalUploadTraffic = ipLogs.reduce((acc, log) => acc + (log.request_size || 0), 0);
    const totalDownloadTraffic = ipLogs.reduce((acc, log) => acc + (log.response_size || 0), 0);
    return {
      ip,
      totalDuration,
      occurrenceCount,
      totalUploadTraffic: (totalUploadTraffic / 1024).toFixed(2),
      totalDownloadTraffic: (totalDownloadTraffic / (1024 * 1024)).toFixed(2)
    };
  });

  // 排序：按总使用时长从大到小
  ipStats.value.sort((a, b) => b.totalDuration - a.totalDuration);

  // API 调用统计
  totalAPICalls.value = 0;
  apiCalls.value = apiLogs.value.reduce((acc, log) => {
    if (!acc[log.path]) {
      acc[log.path] = { count: 0, totalDuration: 0, totalUploadTraffic: 0, totalDownloadTraffic: 0 };
    }
    acc[log.path].count += 1;
    acc[log.path].totalDuration += log.duration;
    acc[log.path].totalUploadTraffic += ((log.request_size / 1024)) || 0;
    acc[log.path].totalDownloadTraffic += ((log.response_size / (1024 * 1024))) || 0;
    totalAPICalls.value += 1;
    return acc;
  }, {});
};

// 生命周期钩子
onMounted(async () => {
  await fetchPageData(true);  // 首次加载时获取统计数据
});

// 弹窗控制方法
const showUniqueUsers = () => {
  showUserModal.value = true;
};

const closeUserModal = () => {
  showUserModal.value = false;
};

const showUniqueIPs = () => {
  showIPModal.value = true;
};

const closeIPModal = () => {
  showIPModal.value = false;
};

const showAPICalls = () => {
  showAPICallsModal.value = true;
};

const closeAPICallsModal = () => {
  showAPICallsModal.value = false;
};

// 导航方法
const viewUserStats = async (username) => {
  router.push({ name: 'UserStats', query: { username: username } });
};

const handleIPClick = async (ip) => {
  router.push({ path: `/ip/${ip}` });
  console.log('Clicked IP:', ip);
};

const goToHome = () => {
  router.push({ name: 'Home' });
};
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: $spacing-xs;
  margin-top: $spacing-sm;
}

.stat-btn {
  @include button-variant($color-primary, #45a049);
  padding: $spacing-sm;
  margin: $spacing-xs;
  border-radius: 15px;
  font-size: 17px;
  max-width: 120px;
  width: 100%;
}

h1 {
  font-size: 30px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0;
  color: #2c6e49;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: $color-background-white;
  padding: $spacing-md;
  border-radius: $spacing-xs;
  width: 90%;
  max-height: 80%;
  overflow-y: auto;

  // 弹窗中的可点击行样式（用户列表）
  .clickable {
    cursor: pointer;
    transition: all $transition-normal;

    td:first-child {
      color: $color-primary-dark;
      font-weight: 500;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: 2px;
        left: 0;
        width: 0;
        height: 2px;
        background-color: $color-primary;
        transition: width $transition-normal;
      }
    }

    &:hover {
      background-color: $color-primary-light;
      transform: translateX(2px);

      td:first-child {
        color: $color-primary-dark;

        &::after {
          width: 100%;
        }
      }
    }
  }

  // 可点击单元格样式（IP 地址）
  .clickable-cell {
    color: $color-primary;
    font-weight: 500;
    cursor: pointer;
    position: relative;
    transition: all $transition-normal;

    &::after {
      content: '';
      position: absolute;
      bottom: 2px;
      left: 0;
      width: 0;
      height: 2px;
      background-color: $color-primary;
      transition: width $transition-normal;
    }

    &:hover {
      color: $color-primary-dark;
      transform: translateX(2px);

      &::after {
        width: 100%;
      }
    }
  }
}

.close {
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
  font-size: 60px;
  cursor: pointer;

  &:hover {
    color: $color-danger;
  }
}

.pagination-controls {
  display: flex;
  justify-content: center;
  margin-top: $spacing-md;
  flex-wrap: wrap;

  :deep(button) {
    @include button-variant($color-primary, #45a049);
    padding: $spacing-sm $spacing-md;
    margin: $spacing-xs;
    border-radius: $spacing-xs;
    font-size: $font-size-md;
    min-width: 120px;
    box-sizing: border-box;

    &:disabled {
      background-color: #ccc;
    }
  }

  :deep(span) {
    font-size: $font-size-md;
    align-self: center;
    color: $color-text-primary;
  }
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

  th, td {
    border: 1px solid $color-border;
    padding: 12px;
    text-align: left;
    font-size: $font-size-md;
  }

  th {
    background-color: $color-primary-light;
    color: #2c6e49;
    font-weight: bold;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      background-color: $color-border;
    }
  }

  td {
    background-color: $color-background;
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

.header-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-md;
  flex-wrap: nowrap;
  overflow: hidden;

  h2 {
    white-space: nowrap;
    margin: 0;
  }
}

.search-box {
  padding: 6px 12px;
  font-size: $font-size-md;
  margin-left: $spacing-md;
  border: 1px solid $color-primary;
  background-color: $color-background;
  color: #2c6e49;
  border-radius: 25px;
  transition: all $transition-normal;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  max-width: 100px;
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 50px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: $color-border;
    background-color: #e8f5e9;
    box-shadow: 0 0 10px rgba(129, 199, 132, 0.5);
  }
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

  .pagination-controls :deep(button) {
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
    font-size: $font-size-xs;
  }

  .pagination-controls :deep(button) {
    font-size: 13px;
    padding: 6px 14px;
  }

  .stat-btn {
    font-size: 15px;
    padding: 6px;
  }

  .close {
    font-size: 50px;
  }

  .modal-content {
    padding: 15px;
  }

  .search-box {
    max-width: 50px !important;
  }
}
</style>
