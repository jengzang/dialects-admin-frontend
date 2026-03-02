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
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import L from 'leaflet';
import { ipAPI } from '@/api/index';

const route = useRoute();

const ip = ref(route.params.ip || '');
const ipInfo = ref(null);
const map = ref(null);
const selectedApi = ref('ip-api');

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

// 监听 IP 路由参数变化，重新发起请求
watch(() => route.params.ip, (newIp) => {
  ip.value = newIp;
  fetchIPInfo();
});

onMounted(async () => {
  await fetchIPInfo();
});
</script>


<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.ip-page {
  padding: $spacing-md;
  font-family: 'Arial', sans-serif;
  background: #eafaf1;
  max-width: 800px;
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

@include respond-to(tablet) {
  .info-content {
    grid-template-columns: 1fr;
  }

  .map-container {
    height: 220px;
  }
}
</style>
