<template>
  <div class="stats-container">
    <h2>用戶統計</h2>
    <div class="user-info">
      <h3>{{ username }} 的統計信息</h3>
    </div>
    <div class="stats-card">
      <div><strong>登錄次數:</strong> {{ stats.login_count }}</div>
      <div><strong>登錄失敗次數:</strong> {{ stats.failed_attempts }}</div>
      <div>
        <strong>註冊IP:</strong>
        <IPLocationDisplay
          v-if="stats.register_ip"
          :ip="stats.register_ip"
          :location="stats.register_ip_location"
        />
        <span v-else>-</span>
      </div>
      <div><strong>總在線時長:</strong> {{ formatOnlineTime(stats.total_online_seconds) }}</div>
      <div><strong>最近一次登錄:</strong> {{ formatTime(stats.last_login) }}</div>
    </div>
    <div class="logout-button-container">
      <button @click="goToHome" >返回首頁</button>
    </div>

    <h2>近期登錄</h2>
    <div class="table-wrapper">
      <table class="dynamic-table">
        <thead>
        <tr>
          <th>IP地址</th>
          <th>次數</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(count, ip) in ipCounts" :key="ip">
          <td>
            <IPLocationDisplay
              :ip="ip"
              :location="ipLocations[ip]"
            />
          </td>
          <td>{{ count }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <h2>API 使用統計</h2>
    <table>
      <thead>
      <tr>
        <th>API 路徑</th>
        <th>使用次數</th>
        <th>上次使用時間</th>
        <th>總使用時長</th>
        <th>總上行流量</th>
        <th>總下行流量</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="log in filteredApiUsage" :key="log.id">
        <td>{{ log.path }}</td>
        <td>{{ log.count }}</td>
        <td>{{ formatTime(log.last_updated) }}</td>
        <td>{{ (log.total_duration || 0).toFixed(2) }} 秒</td>
        <td>{{ (log.total_upload || 0).toFixed(2) }} KB</td>
        <td>{{ ((log.total_download || 0) / 1024).toFixed(2) }} MB</td>
      </tr>
      </tbody>
    </table>

    <h2>近期 API 使用詳情</h2>
    <table>
      <thead>
      <tr>
        <th>IP 地址</th>
        <th>API 路徑</th>
        <th>持續時長(秒)</th>
<!--        <th>設備</th>-->
        <th>操作系統</th>
        <th>瀏覽器</th>
        <th>發起時間</th>
        <th>上行流量</th>
        <th>下行流量</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="log in apiLogs" :key="log.id">
        <td>{{ log.ip }}</td>
        <td>{{ log.path }}</td>
        <td>{{ log.duration.toFixed(3) }}s</td>  <!-- 保留三位小数 -->
        <td>
          <div class="browser-cell" @mouseover="showUserAgent($event,log)" @mouseleave="hideUserAgent(log)">
            <span>{{ log.os }}</span>
            <div v-show="log.showUserAgent" class="user-agent-tooltip">
              {{ log.user_agent }}
            </div>
          </div>
        </td>   <!-- 操作系统 -->
        <td>{{ log.browser }}</td><!-- 浏览器 -->
        <td>{{ formatTime(log.called_at) }}</td>  <!-- 北京时间 -->
        <!-- 新增的上行流量 -->
        <td>{{ log.uploadTraffic }}KB</td>
        <!-- 新增的下行流量 -->
        <td>{{ log.downloadTraffic }}KB</td>
      </tr>
      </tbody>
    </table>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { statsAPI, analyticsAPI } from '../../api/index';
import { formatTime } from "../../utils.js";
import { IPLocationDisplay } from '@/components/common';

const router = useRouter();
const route = useRoute();

const stats = ref({});
const username = ref('');
const filteredApiUsage = ref([]);
const loginHistory = ref([]);
const ipCounts = ref({});
const ipLocations = ref({});
const apiLogs = ref({});
const userName = ref('');
const tooltipStyle = ref({});

const formatOnlineTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}小時 ${minutes}分鐘`;
};

const processIpCounts = () => {
  const counts = {};
  const locations = {};
  loginHistory.value.forEach(log => {
    if (counts[log.ip]) {
      counts[log.ip] += 1;
    } else {
      counts[log.ip] = 1;
    }
    // 收集IP位置信息
    if (log.ip_location && !locations[log.ip]) {
      locations[log.ip] = log.ip_location;
    }
  });
  ipCounts.value = counts;
  ipLocations.value = locations;
};

const getDeviceInfo = (userAgent) => {
  let os = "Unknown OS";
  let browser = "Unknown Browser";

  // 操作系统提取
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    os = "iOS";
  } else if (/Android/.test(userAgent)) {
    os = "Android";
  } else if (/Windows/.test(userAgent)) {
    os = "Windows";
  } else if (/Macintosh/.test(userAgent)) {
    os = "Mac OS";
  } else if (/Linux/.test(userAgent)) {
    os = "Linux";
  }

  // 浏览器提取
  if (/Chrome/.test(userAgent)) {
    browser = "Chrome";
  } else if (/Firefox/.test(userAgent)) {
    browser = "Firefox";
  } else if (/Safari/.test(userAgent)) {
    browser = "Safari";
  } else if (/Edge/.test(userAgent)) {
    browser = "Edge";
  }

  return { os, browser };
};

const showUserAgent = (event, log) => {
  log.showUserAgent = true;

  const rect = event.currentTarget.getBoundingClientRect();

  tooltipStyle.value = {
    position: 'fixed',
    top: `${event.clientY + 10}px`,
    left: `${rect.left + window.scrollX}px`,
    zIndex: 1000
  };
};

const hideUserAgent = (log) => {
  log.showUserAgent = false;
};

const goToHome = () => {
  router.push({ name: 'Home' });
};

onMounted(async () => {
  const usernameQuery = route.query.username;
  username.value = usernameQuery;
  try {
    // 獲取用戶統計數據
    stats.value = await statsAPI.getStatsQuery(usernameQuery);

    // 獲取API使用統計數據
    const apiUsage = await analyticsAPI.getApiSummary(usernameQuery);
    filteredApiUsage.value = apiUsage.filter(log => !log.path.includes('/login'));

    loginHistory.value = await statsAPI.getSuccessLoginLogs(usernameQuery);
    processIpCounts();

    const response2 = await analyticsAPI.getApiDetail(usernameQuery);
    userName.value = response2.user;

    apiLogs.value = response2.api_logs.map(log => ({
      ...log,
      ...getDeviceInfo(log.user_agent),
      showUserAgent: false,
      uploadTraffic: log.request_size ? (log.request_size / 1024).toFixed(2) : '0.00',
      downloadTraffic: log.response_size ? (log.response_size / 1024).toFixed(2) : '0.00',
    }));

  } catch (error) {
    console.error('Error fetching stats and API usage', error);
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.stats-container {
  margin: $spacing-md;
  font-family: Arial, sans-serif;
  padding: $spacing-sm;
}

.user-info {
  margin-bottom: $spacing-md;
}

h3 {
  color: $color-text-primary;
}

.stats-card {
  background: #f5f8f1;
  padding: $spacing-md;
  border-radius: $radius-sm;
  box-shadow: $shadow-md;
  font-size: $font-size-md;
  margin-bottom: $spacing-md;

  div {
    margin-bottom: $spacing-sm;
  }
}

strong {
  color: #007bff;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: $spacing-md;
  background-color: $color-background;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  overflow: hidden;

  th, td {
    padding: $spacing-sm;
    text-align: center;
    border-top: 1px solid $color-border;
    word-wrap: break-word;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  th {
    background-color: $color-primary-light;
    color: $color-text-white;
    white-space: nowrap;
  }
}

.browser-cell {
  position: relative;
}

.user-agent-tooltip {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.75);
  color: $color-text-white;
  padding: $spacing-sm;
  border-radius: $spacing-xs;
  width: 250px;
  max-height: 150px;
  overflow-y: auto;
  display: none;
  z-index: 1000;
}

.browser-cell:hover .user-agent-tooltip {
  display: block;
  position: fixed;
  top: $spacing-sm;
  left: $spacing-sm;
  z-index: 1000;
}

.table-wrapper {
  width: 100%;
  text-align: center;
  overflow-x: auto;
  border-radius: $radius-sm;
}

.dynamic-table {
  display: inline-table;
  border-collapse: collapse;
  margin: 0 auto;
  background-color: $color-background;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  text-align: center;

  th, td {
    padding: $spacing-sm;
    text-align: center;
    border-top: 1px solid $color-border;
    word-wrap: break-word;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  th {
    background-color: $color-primary-light;
    color: $color-text-white;
  }
}

@include respond-to(tablet) {
  .stats-container {
    margin: $spacing-sm;
    padding: $spacing-xs;
  }

  button {
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-sm;
    min-width: 100px;
  }

  .stats-card {
    padding: 15px;
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
  button {
    padding: 8px 16px;
    font-size: $font-size-xs;
  }

  .stats-card {
    padding: $spacing-sm;
  }

  table {
    font-size: $font-size-xs;
  }
}
</style>


