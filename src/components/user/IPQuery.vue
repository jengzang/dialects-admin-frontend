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

<script>
import L from 'leaflet';
import { ipAPI } from '@/api/index'; // 引入 IP API 模塊

export default {
  data() {
    return {
      ip: this.$route.params.ip || "",
      ipInfo: null,
      map: null, // 存储地图实例
      selectedApi: 'ip-api', // 默认使用 ip-api
    };
  },
  async mounted() {
    await this.fetchIPInfo(); // 获取 IP 信息并初始化地图
  },
  watch: {
    // 监听 IP 路由参数变化，重新发起请求
    '$route.params.ip'(newIp) {
      this.ip = newIp;
      this.fetchIPInfo();
    }
  },
  methods: {
    // 获取 IP 信息
    async fetchIPInfo() {
      if (!this.ip) return;
      try {
        const data = await ipAPI.queryIP(this.ip, this.selectedApi);

        // 统一格式化返回数据
        this.ipInfo = {
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
        if (this.ipInfo.lat && this.ipInfo.lon) {
          this.$nextTick(() => {
            this.initMap(this.ipInfo.lat, this.ipInfo.lon);
          });
        }
      } catch (err) {
        console.error("获取 IP 信息失败:", err);
        this.ipInfo = null;
      }
    },
    // 初始化地图
    initMap(lat, lon) {
      if (this.map) {
        // 销毁现有地图实例，避免旧地图影响
        this.map.remove();
      }

      // 创建一个新的地图实例
      this.map = L.map('map').setView([lat, lon], 13);

      // 添加 OpenStreetMap 瓦片图层
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      // 添加新的标记
      L.marker([lat, lon]).addTo(this.map)
          .bindPopup(`<b>緯度:</b> ${lat}<br><b>經度:</b> ${lon}`)
          .openPopup();
    },
    // 选择API
    selectApi(apiUrl) {
      this.selectedApi = apiUrl;
      this.fetchIPInfo(); // 切换API后重新查询IP信息
    }
  }
};
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
