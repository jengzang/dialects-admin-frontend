<template>
  <div class="ip-page">
    <div v-if="ipInfo" class="info-box">
      <h1>IP查詢 - {{ ipInfo.query }}</h1>
      <div class="info-content">
        <div><strong>國家:</strong> {{ ipInfo.country }}</div>
        <div><strong>地區:</strong> {{ ipInfo.region }}</div>
        <div><strong>城市:</strong> {{ ipInfo.city }}</div>
        <div><strong>ISP:</strong> {{ ipInfo.isp }}</div>
        <div><strong>運營商:</strong> {{ ipInfo.org }}</div>
        <div><strong>詳細信息:</strong> {{ ipInfo.as }}</div>
      </div>

      <!-- 地圖區域 -->
      <div id="map" class="map-container">
        <p>地圖顯示區域</p>
      </div>
    </div>
    <p v-else class="error-message">正在查詢中或無法取得 IP 資訊。</p>

    <!-- 按钮切换 API -->
    <div class="api-selector">
      <button @click="selectApi('ip-api')">ip-api</button>
      <button @click="selectApi('ip-sb')">ip.sb API</button>
      <button @click="selectApi('nordvpn')">NordVPN API</button>
    </div>

    <!-- API 調用情況 -->
    <div class="api-usage-section">
      <h2>該 IP 的 API 調用情況 - {{ ip }}</h2>

      <!-- 統計信息 -->
      <div class="stats-summary">
        <div class="stat-card">
          <div class="stat-number">{{ totalCalls }}</div>
          <div class="stat-label">總調用次數</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ uniqueUsers }}</div>
          <div class="stat-label">不同用戶數</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalUpload }}</div>
          <div class="stat-label">總上行流量 (KB)</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalDownload }}</div>
          <div class="stat-label">總下行流量 (MB)</div>
        </div>
      </div>

      <!-- API 調用詳情表格 -->
      <div v-if="apiLogs.length > 0" class="api-table-container">
        <table class="api-table">
          <thead>
            <tr>
              <th @click="sortData('user')">用戶 <span :class="getArrowClass('user')"></span></th>
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
            <tr v-for="(log, index) in apiLogs" :key="index">
              <td>{{ log.user || '匿名' }}</td>
              <td>{{ log.path }}</td>
              <td>{{ log.duration.toFixed(3) }}s</td>
              <td>{{ log.os }}</td>
              <td>{{ log.browser }}</td>
              <td>{{ formatTime(log.called_at) }}</td>
              <td>{{ log.uploadTraffic }}KB</td>
              <td>{{ log.downloadTraffic }}KB</td>
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
      <p v-else class="no-data">該 IP 暫無 API 調用記錄</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { useRoute } from 'vue-router';
import L from 'leaflet';
import { ipAPI, analyticsAPI } from '@/api/index';
import { formatTime } from '@/utils.js';
import { BasePagination } from '@/components/common';

const route = useRoute();

const ip = ref(route.params.ip || '');
const ipInfo = ref(null);
const map = ref(null);
const selectedApi = ref('ip-api');

// API 調用相關數據
const apiLogs = ref([]);
const currentPage = ref(1);
const pageSize = ref(50);
const totalPages = ref(1);
const totalCalls = ref(0);
const uniqueUsers = ref(0);
const totalUpload = ref('0');
const totalDownload = ref('0');

// 排序相關
const currentSortBy = ref('called_at');
const currentSortOrder = ref('desc');
const sortOrder = ref({
  user: 'asc',
  path: 'asc',
  duration: 'desc',
  os: 'asc',
  browser: 'asc',
  called_at: 'desc',
  uploadTraffic: 'desc',
  downloadTraffic: 'desc'
});

const fetchIPInfo = async () => {
  if (!ip.value) return;
  try {
    const data = await ipAPI.queryIP(ip.value, selectedApi.value);

    // 统一格式化返回数据
    ipInfo.value = {
      query: data.query,
      country: data.country,
      region: data.region,
      city: data.city,
      isp: data.isp,
      org: data.org,
      as: data.as,
      lat: data.lat,
      lon: data.lon
    };

    // 更新地图
    if (ipInfo.value.lat && ipInfo.value.lon) {
      nextTick(() => {
        initMap(ipInfo.value.lat, ipInfo.value.lon);
      });
    }
  } catch (err) {
    console.error("获取 IP 信息失败:", err);
    ipInfo.value = null;
  }
};

const fetchApiUsage = async () => {
  if (!ip.value) return;

  try {
    const params = {
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value,
      include_stats: true,
      search: ip.value,
      sort_by: currentSortBy.value,
      sort_order: currentSortOrder.value
    };

    const response = await analyticsAPI.getApiUsage(params);

    // 处理返回的数据结构
    const logs = Array.isArray(response) ? response : (response.data || response.logs || []);
    const totalRecords = response.total || logs.length;

    // 为每个日志添加上行流量和下行流量
    apiLogs.value = logs.map(log => ({
      ...log,
      uploadTraffic: (log.request_size / 1024).toFixed(2),
      downloadTraffic: (log.response_size / 1024).toFixed(2)
    }));

    // 计算总页数
    totalPages.value = Math.ceil(totalRecords / pageSize.value);

    // 更新统计数据
    if (response.statistics) {
      updateStats(response.statistics);
    }
  } catch (err) {
    console.error("获取 API 使用数据失败:", err);
    apiLogs.value = [];
  }
};

const updateStats = (statistics) => {
  if (!statistics) return;

  if (statistics.summary) {
    totalCalls.value = statistics.summary.total_calls || 0;
    uniqueUsers.value = statistics.summary.unique_users || 0;
  }

  // 计算总流量
  if (statistics.ip_stats && statistics.ip_stats.length > 0) {
    const ipStat = statistics.ip_stats[0];
    totalUpload.value = ((ipStat.total_upload || 0) / 1024).toFixed(2);
    totalDownload.value = ((ipStat.total_download || 0) / (1024 * 1024)).toFixed(2);
  }
};

const initMap = (lat, lon) => {
  if (map.value) {
    // 销毁现有地图实例，避免旧地图影响
    map.value.remove();
  }

  // 创建一个新的地图实例
  map.value = L.map('map').setView([lat, lon], 13);

  // 添加 OpenStreetMap 瓦片图层
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value);

  // 添加新的标记
  L.marker([lat, lon]).addTo(map.value)
      .bindPopup(`<b>緯度:</b> ${lat}<br><b>經度:</b> ${lon}`)
      .openPopup();
};

const selectApi = (apiUrl) => {
  selectedApi.value = apiUrl;
  fetchIPInfo();
};

// 排序方法
const sortData = async (field) => {
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
  await fetchApiUsage();
};

// 获取箭头的 CSS 类
const getArrowClass = (field) => {
  return sortOrder.value[field] === 'asc' ? 'arrow-up' : 'arrow-down';
};

// 处理分页变化
const handlePageChange = async (page) => {
  currentPage.value = page;
  await fetchApiUsage();
};

// 监听 IP 路由参数变化，重新发起请求
watch(() => route.params.ip, (newIp) => {
  ip.value = newIp;
  currentPage.value = 1; // 重置页码
  // 先获取API调用数据，再获取IP地理位置信息
  fetchApiUsage().then(() => {
    fetchIPInfo();
  });
});

onMounted(async () => {
  // 先获取API调用数据（优先显示），再获取IP地理位置信息
  await fetchApiUsage();
  fetchIPInfo();
});
</script>


<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.ip-page {
  padding: $spacing-md;
  font-family: 'Arial', sans-serif;
  background: #eafaf1;
  max-width: 1400px;
  margin: 0 auto;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
}

.info-box {
  @include card($spacing-md, $radius-md);
  margin-bottom: $spacing-md;
  border-left: 8px solid $color-primary;
}

h1 {
  font-size: 26px;
  font-weight: bold;
  color: #388E3C;
  margin-bottom: 15px;
}

h2 {
  font-size: 24px;
  font-weight: bold;
  color: #2c6e49;
  margin-bottom: $spacing-md;
  text-align: center;
}

.info-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  color: #444;
  background-color: #e0f7e0;
  border-radius: $radius-md;

  div {
    font-size: $font-size-md;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-sm;

    &:hover {
      background-color: #c8e6c9;
    }
  }
}

.error-message {
  color: #ff4d4f;
  text-align: center;
  font-size: $font-size-lg;
}

.map-container {
  height: 300px;
  background: #b2dfdb;
  border-radius: $radius-md;
  margin-top: $spacing-md;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  border: 2px solid $color-primary;
}

.api-selector {
  margin-top: $spacing-md;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: $spacing-sm;
  justify-items: center;
}

// API 調用情況樣式
.api-usage-section {
  margin-top: $spacing-xl;
  padding: $spacing-md;
  background: white;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.stat-card {
  @include card($spacing-md, $radius-md);
  text-align: center;
  background: linear-gradient(135deg, #e4f4e7 0%, #c8e7c2 100%);
  border-left: 4px solid $color-primary;
  transition: transform $transition-normal;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
  }

  .stat-number {
    font-size: 32px;
    font-weight: bold;
    color: $color-primary-dark;
    margin-bottom: $spacing-xs;
  }

  .stat-label {
    font-size: $font-size-md;
    color: #555;
  }
}

.api-table-container {
  margin-top: $spacing-md;
}

.api-table {
  width: 100%;
  border-collapse: collapse;
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

  tbody tr:hover {
    background-color: #e1f5e1;
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

.no-data {
  text-align: center;
  color: #888;
  font-size: $font-size-lg;
  padding: $spacing-lg;
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

    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }

  :deep(span) {
    font-size: $font-size-md;
    align-self: center;
    color: $color-text-primary;
  }
}

@include respond-to(tablet) {
  .info-content {
    grid-template-columns: 1fr;
  }

  .map-container {
    height: 220px;
  }

  .stats-summary {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .stat-card .stat-number {
    font-size: 24px;
  }

  .api-table {
    font-size: $font-size-sm;
    overflow-x: auto;
    display: block;

    th, td {
      padding: 8px 12px;
    }
  }
}

@include respond-to(mobile) {
  .stats-summary {
    grid-template-columns: 1fr;
  }

  .api-table {
    font-size: $font-size-xs;
  }

  .pagination-controls :deep(button) {
    font-size: $font-size-sm;
    min-width: 100px;
  }
}
</style>
