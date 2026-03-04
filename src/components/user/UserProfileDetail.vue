<template>
  <div class="user-profile-detail">
    <!-- Header -->
    <div class="profile-header">
      <el-page-header @back="goBack">
        <template #content>
          <div class="header-content">
            <h2>{{ username }} 的用戶畫像</h2>
            <el-tag :type="riskTagType" size="large">
              {{ riskLevel.label }} ({{ riskScore }})
            </el-tag>
          </div>
        </template>
      </el-page-header>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>載入中...</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Basic Info Cards -->
      <div class="info-section">
        <h3>基本信息</h3>
        <div class="stats-grid">
          <StatsCard
            :number="userStats.login_count || 0"
            label="登錄次數"
            :color="COLORS.primary"
          />
          <StatsCard
            :number="userStats.failed_attempts || 0"
            label="登錄失敗次數"
            :color="COLORS.danger"
          />
          <StatsCard
            :number="formatOnlineTime(userStats.total_online_seconds || 0)"
            label="總在線時長"
            :color="COLORS.info"
          />
          <StatsCard
            :number="dataCount"
            label="數據貢獻量"
            :color="COLORS.warning"
          />
        </div>

        <div class="info-cards">
          <BaseCard shadow="hover">
            <div class="info-item">
              <span class="label">用戶名：</span>
              <span class="value">{{ username }}</span>
            </div>
            <div class="info-item">
              <span class="label">郵箱：</span>
              <span class="value">{{ userStats.email || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">角色：</span>
              <el-tag :type="userStats.role === 'admin' ? 'danger' : 'info'" size="small">
                {{ userStats.role === 'admin' ? '管理員' : '普通用戶' }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="label">註冊 IP：</span>
              <span class="value">
                <IPLocationDisplay
                  v-if="userStats.register_ip"
                  :ip="userStats.register_ip"
                  :location="userStats.register_ip_location"
                />
                <span v-else>N/A</span>
              </span>
            </div>
            <div class="info-item">
              <span class="label">最後登錄：</span>
              <span class="value">{{ formatTime(userStats.last_login) }}</span>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Risk Analysis -->
      <div class="risk-section">
        <h3>風險分析</h3>
        <div class="charts-row">
          <div class="chart-card">
            <div class="chart-header">
              <h4>風險評分雷達圖</h4>
            </div>
            <BaseChart
              type="radar"
              :data="riskRadarData"
              :options="riskRadarOptions"
              :height="300"
            />
          </div>

          <div class="risk-details">
            <BaseCard shadow="hover">
              <h4>風險詳情</h4>
              <div class="risk-item">
                <span class="risk-label">登錄失敗率：</span>
                <el-progress
                  :percentage="failureRate"
                  :color="getProgressColor(failureRate)"
                  :stroke-width="12"
                />
              </div>
              <div class="risk-item">
                <span class="risk-label">IP 變更頻率：</span>
                <el-progress
                  :percentage="ipChangeRate"
                  :color="getProgressColor(ipChangeRate)"
                  :stroke-width="12"
                />
              </div>
              <div class="risk-item">
                <span class="risk-label">設備變更頻率：</span>
                <el-progress
                  :percentage="deviceChangeRate"
                  :color="getProgressColor(deviceChangeRate)"
                  :stroke-width="12"
                />
              </div>
              <div class="risk-item">
                <span class="risk-label">可疑會話比例：</span>
                <el-progress
                  :percentage="suspiciousRate"
                  :color="getProgressColor(suspiciousRate)"
                  :stroke-width="12"
                />
              </div>
            </BaseCard>
          </div>
        </div>
      </div>

      <!-- API Usage Preference -->
      <div class="api-section">
        <h3>API 使用偏好</h3>
        <div class="charts-row">
          <!-- API Category Radar Chart (Backend Data) -->
          <div v-if="apiCategoryRadarData" class="chart-card">
            <div class="chart-header">
              <h4>API 類別分布</h4>
            </div>
            <BaseChart
              type="radar"
              :data="apiCategoryRadarData"
              :options="riskRadarOptions"
              :height="300"
            />
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h4>最常用 API (Top 5)</h4>
            </div>
            <BaseChart
              type="pie"
              :data="apiPreferenceData"
              :options="apiPreferenceOptions"
              :height="300"
            />
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h4>API 調用頻率</h4>
            </div>
            <BaseChart
              type="bar"
              :data="apiFrequencyData"
              :options="apiFrequencyOptions"
              :height="300"
            />
          </div>
        </div>

        <!-- Traffic Pattern (Backend Data) -->
        <div v-if="userPreferences?.traffic_pattern" class="traffic-section">
          <BaseCard shadow="hover">
            <h4>流量模式</h4>
            <div class="traffic-stats">
              <div class="traffic-item">
                <span class="traffic-label">上傳流量：</span>
                <el-progress
                  :percentage="uploadPercentage"
                  :color="COLORS.primary"
                  :stroke-width="20"
                >
                  <span class="progress-text">{{ formatBytes(userPreferences.traffic_pattern.upload) }}</span>
                </el-progress>
              </div>
              <div class="traffic-item">
                <span class="traffic-label">下載流量：</span>
                <el-progress
                  :percentage="downloadPercentage"
                  :color="COLORS.info"
                  :stroke-width="20"
                >
                  <span class="progress-text">{{ formatBytes(userPreferences.traffic_pattern.download) }}</span>
                </el-progress>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Top APIs Table (Backend Data) -->
        <div v-if="userPreferences?.top_apis" class="top-apis-section">
          <BaseCard shadow="hover">
            <h4>最常用 API 詳情</h4>
            <BaseTable
              :columns="topApiColumns"
              :data="userPreferences.top_apis.slice(0, 5)"
              :sortable="false"
            >
              <template #cell-avg_duration="{ value }">
                {{ value ? value.toFixed(2) + 'ms' : 'N/A' }}
              </template>
            </BaseTable>
          </BaseCard>
        </div>
      </div>

      <!-- Device & Browser Distribution -->
      <div class="device-section">
        <h3>設備與瀏覽器分布</h3>
        <div class="charts-row">
          <!-- Device Types -->
          <div v-if="deviceTypeChartData" class="chart-card">
            <div class="chart-header">
              <h4>設備類型分布</h4>
            </div>
            <BaseChart
              type="doughnut"
              :data="deviceTypeChartData"
              :options="distributionOptions"
              :height="250"
            />
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h4>操作系統分布</h4>
            </div>
            <BaseChart
              type="doughnut"
              :data="osDistributionData"
              :options="distributionOptions"
              :height="250"
            />
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h4>瀏覽器分布</h4>
            </div>
            <BaseChart
              type="doughnut"
              :data="browserDistributionData"
              :options="distributionOptions"
              :height="250"
            />
          </div>
        </div>
      </div>

      <!-- Session Quality -->
      <div class="session-section">
        <h3>會話質量分析</h3>
        <div class="stats-grid">
          <StatsCard
            :number="sessions.length"
            label="總會話數"
            :color="COLORS.primary"
          />
          <StatsCard
            :number="avgSessionDuration"
            label="平均會話時長"
            :color="COLORS.info"
          />
          <StatsCard
            :number="totalIpChanges"
            label="IP 變更次數"
            :color="COLORS.warning"
          />
          <StatsCard
            :number="suspiciousSessionCount"
            label="可疑會話數"
            :color="COLORS.danger"
          />
        </div>

        <BaseCard shadow="hover" class="session-table">
          <h4>最近會話</h4>
          <BaseTable
            :columns="sessionColumns"
            :data="recentSessions"
            :sortable="false"
          >
            <template #cell-session_id="{ value }">
              {{ value.substring(0, 8) }}...
            </template>
            <template #cell-created_at="{ value }">
              {{ formatTime(value) }}
            </template>
            <template #cell-last_activity_at="{ value }">
              {{ formatTime(value) }}
            </template>
            <template #cell-status="{ row }">
              <BaseTag v-if="row.revoked" type="danger" size="small">已撤銷</BaseTag>
              <BaseTag v-else-if="row.is_suspicious" type="warning" size="small">可疑</BaseTag>
              <BaseTag v-else type="success" size="small">正常</BaseTag>
            </template>
            <template #cell-ip_change_count="{ value }">
              {{ value || 0 }}
            </template>
            <template #cell-device_change_count="{ value }">
              {{ value || 0 }}
            </template>
          </BaseTable>
        </BaseCard>
      </div>

      <!-- Geographic Distribution -->
      <div class="geo-section">
        <h3>地理位置分布</h3>
        <BaseCard shadow="hover">
          <!-- Backend Data: City-level distribution -->
          <div v-if="geoDistribution?.locations && geoDistribution.locations.length > 0" class="geo-stats">
            <h4>城市分布 (Top 10)</h4>
            <BaseTable
              :columns="geoColumns"
              :data="geoDistribution.locations.slice(0, 10)"
              :sortable="false"
            >
              <template #cell-percentage="{ value }">
                {{ value.toFixed(2) }}%
              </template>
            </BaseTable>
          </div>

          <!-- Fallback: IP-based distribution -->
          <div v-else class="geo-stats">
            <h4>登錄 IP 統計</h4>
            <div class="geo-item" v-for="(count, ip) in topIPs" :key="ip">
              <span class="ip">{{ ip }}</span>
              <span class="count">{{ count }} 次登錄</span>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script>
import { BaseChart, StatsCard, BaseTable, BaseTag, BaseCard, IPLocationDisplay } from '@/components/common';
import { userAPI, statsAPI, sessionAPI, analyticsAPI } from '@/api/index';
import { useChart, useUserBehavior, useTimeFormat } from '@/composables';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';

export default {
  name: 'UserProfileDetail',
  components: {
    BaseChart,
    StatsCard,
    BaseTable,
    BaseTag,
    BaseCard,
    IPLocationDisplay,
    Loading
  },
  setup() {
    const {
      COLORS,
      createPieChartData,
      createBarChartData,
      formatBytes
    } = useChart();

    const {
      calculateRiskScore,
      getRiskLevel
    } = useUserBehavior();

    const { formatTime, formatOnlineTime } = useTimeFormat();

    return {
      COLORS,
      createPieChartData,
      createBarChartData,
      formatBytes,
      calculateRiskScore,
      getRiskLevel,
      formatTime,
      formatOnlineTime
    };
  },
  data() {
    return {
      loading: false,
      username: '',
      userStats: {},
      sessions: [],
      apiLogs: [],
      loginLogs: [],
      dataCount: 0,
      riskScore: 0,
      riskLevel: { level: 'low', color: '#52c41a', label: '低風險' },
      userPreferences: null,
      geoDistribution: null,
      deviceDistribution: null,
      sessionColumns: [
        { key: 'session_id', label: '會話 ID', sortable: false },
        { key: 'current_ip', label: 'IP 地址', sortable: false },
        { key: 'created_at', label: '創建時間', sortable: false },
        { key: 'last_activity_at', label: '最後活動', sortable: false },
        { key: 'status', label: '狀態', sortable: false },
        { key: 'ip_change_count', label: 'IP 變更', sortable: false },
        { key: 'device_change_count', label: '設備變更', sortable: false }
      ],
      topApiColumns: [
        { key: 'path', label: 'API 路徑', sortable: false },
        { key: 'count', label: '調用次數', sortable: false },
        { key: 'avg_duration', label: '平均耗時', sortable: false }
      ],
      geoColumns: [
        { key: 'country', label: '國家', sortable: false },
        { key: 'city', label: '城市', sortable: false },
        { key: 'count', label: '次數', sortable: false },
        { key: 'percentage', label: '佔比', sortable: false }
      ]
    };
  },
  computed: {
    riskTagType() {
      const types = {
        high: 'danger',
        medium: 'warning',
        low: 'success'
      };
      return types[this.riskLevel.level] || 'info';
    },
    failureRate() {
      const total = Math.max(this.userStats.login_count || 0, 1);
      return Math.round(((this.userStats.failed_attempts || 0) / total) * 100);
    },
    ipChangeRate() {
      if (this.sessions.length === 0) return 0;
      const total = this.sessions.reduce((sum, s) => sum + (s.ip_change_count || 0), 0);
      return Math.min(Math.round((total / this.sessions.length) * 10), 100);
    },
    deviceChangeRate() {
      if (this.sessions.length === 0) return 0;
      const total = this.sessions.reduce((sum, s) => sum + (s.device_change_count || 0), 0);
      return Math.min(Math.round((total / this.sessions.length) * 10), 100);
    },
    suspiciousRate() {
      if (this.sessions.length === 0) return 0;
      const count = this.sessions.filter(s => s.is_suspicious).length;
      return Math.round((count / this.sessions.length) * 100);
    },
    riskRadarData() {
      return {
        labels: ['登錄失敗率', 'IP 變更', '設備變更', '可疑會話', '流量異常'],
        datasets: [{
          label: '風險指標',
          data: [
            this.failureRate,
            this.ipChangeRate,
            this.deviceChangeRate,
            this.suspiciousRate,
            0 // 流量异常暂时为0
          ],
          backgroundColor: 'rgba(255, 77, 79, 0.2)',
          borderColor: '#ff4d4f',
          borderWidth: 2
        }]
      };
    },
    riskRadarOptions() {
      return {
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      };
    },
    apiCategoryRadarData() {
      if (!this.userPreferences?.api_categories) return null;

      const categories = this.userPreferences.api_categories;
      const labels = Object.keys(categories);
      const data = Object.values(categories);

      return {
        labels,
        datasets: [{
          label: 'API 類別使用',
          data,
          backgroundColor: 'rgba(82, 196, 26, 0.2)',
          borderColor: '#52c41a',
          borderWidth: 2
        }]
      };
    },
    deviceTypeChartData() {
      if (!this.deviceDistribution?.devices) return null;

      const devices = this.deviceDistribution.devices;
      return this.createPieChartData(
        devices.map(d => d.type),
        devices.map(d => d.count)
      );
    },
    browserChartData() {
      if (!this.deviceDistribution?.browsers) return null;

      const browsers = this.deviceDistribution.browsers;
      return this.createPieChartData(
        browsers.map(b => b.name),
        browsers.map(b => b.count)
      );
    },
    osChartData() {
      if (!this.deviceDistribution?.os) return null;

      const os = this.deviceDistribution.os;
      return this.createPieChartData(
        os.map(o => o.name),
        os.map(o => o.count)
      );
    },
    apiPreferenceData() {
      // Use backend data if available
      if (this.userPreferences?.top_apis) {
        const topApis = this.userPreferences.top_apis.slice(0, 5);
        return this.createPieChartData(
          topApis.map(api => api.path),
          topApis.map(api => api.count)
        );
      }

      // Fallback to frontend calculation
      const apiCounts = {};
      this.apiLogs.forEach(log => {
        const path = log.path || 'Unknown';
        apiCounts[path] = (apiCounts[path] || 0) + 1;
      });

      const sorted = Object.entries(apiCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      return this.createPieChartData(
        sorted.map(([path]) => path),
        sorted.map(([, count]) => count)
      );
    },
    apiPreferenceOptions() {
      return {
        plugins: {
          legend: {
            position: 'right'
          }
        }
      };
    },
    apiFrequencyData() {
      const apiCounts = {};
      this.apiLogs.forEach(log => {
        const path = log.path || 'Unknown';
        apiCounts[path] = (apiCounts[path] || 0) + 1;
      });

      const sorted = Object.entries(apiCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      return this.createBarChartData(
        sorted.map(([path]) => path),
        [{
          label: '調用次數',
          data: sorted.map(([, count]) => count)
        }]
      );
    },
    apiFrequencyOptions() {
      return {
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          }
        }
      };
    },
    osDistributionData() {
      // Use backend data if available
      if (this.osChartData) {
        return this.osChartData;
      }

      // Fallback to frontend calculation
      const osCounts = {};
      this.apiLogs.forEach(log => {
        const os = log.os || 'Unknown';
        osCounts[os] = (osCounts[os] || 0) + 1;
      });

      const sorted = Object.entries(osCounts).sort((a, b) => b[1] - a[1]);

      return this.createPieChartData(
        sorted.map(([os]) => os),
        sorted.map(([, count]) => count)
      );
    },
    browserDistributionData() {
      // Use backend data if available
      if (this.browserChartData) {
        return this.browserChartData;
      }

      // Fallback to frontend calculation
      const browserCounts = {};
      this.apiLogs.forEach(log => {
        const browser = log.browser || 'Unknown';
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      });

      const sorted = Object.entries(browserCounts).sort((a, b) => b[1] - a[1]);

      return this.createPieChartData(
        sorted.map(([browser]) => browser),
        sorted.map(([, count]) => count)
      );
    },
    distributionOptions() {
      return {
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      };
    },
    avgSessionDuration() {
      if (this.sessions.length === 0) return '0分鐘';
      const totalSeconds = this.sessions.reduce((sum, s) => {
        const created = new Date(s.created_at);
        const lastActivity = new Date(s.last_activity_at);
        return sum + (lastActivity - created) / 1000;
      }, 0);
      const avgSeconds = totalSeconds / this.sessions.length;
      const minutes = Math.round(avgSeconds / 60);
      return `${minutes}分鐘`;
    },
    totalIpChanges() {
      return this.sessions.reduce((sum, s) => sum + (s.ip_change_count || 0), 0);
    },
    suspiciousSessionCount() {
      return this.sessions.filter(s => s.is_suspicious).length;
    },
    recentSessions() {
      return this.sessions.slice(0, 10);
    },
    topIPs() {
      const ipCounts = {};
      this.loginLogs.forEach(log => {
        const ip = log.ip || log.login_ip || 'Unknown';
        ipCounts[ip] = (ipCounts[ip] || 0) + 1;
      });

      const sorted = Object.entries(ipCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      return Object.fromEntries(sorted);
    },
    uploadPercentage() {
      if (!this.userPreferences?.traffic_pattern) return 0;
      const { upload, download } = this.userPreferences.traffic_pattern;
      const total = upload + download;
      return total > 0 ? Math.round((upload / total) * 100) : 0;
    },
    downloadPercentage() {
      if (!this.userPreferences?.traffic_pattern) return 0;
      const { upload, download } = this.userPreferences.traffic_pattern;
      const total = upload + download;
      return total > 0 ? Math.round((download / total) * 100) : 0;
    }
  },
  mounted() {
    this.username = this.$route.params.username;
    if (this.username) {
      this.fetchData();
    } else {
      ElMessage.error('缺少用戶名參數');
      this.goBack();
    }
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        // 1. 获取用户基本统计信息（参考 UserStats.vue）
        this.userStats = await statsAPI.getStatsQuery(this.username);

        // 2. 获取用户完整信息（用于获取 user.id 和 data_count）
        const usersRes = await userAPI.getAllUsersComplete();
        const users = usersRes.data || usersRes || [];
        const user = users.find(u => u.username === this.username);

        if (!user) {
          ElMessage.error('未找到用戶信息');
          this.goBack();
          return;
        }

        this.dataCount = user.data_count || 0;

        // 3. 并行加载所有数据
        const [sessionsRes, apiRes, loginRes, preferencesRes, geoRes, deviceRes] = await Promise.allSettled([
          // 会话数据
          sessionAPI.getUserHistory(user.id, true),
          // API 日志
          analyticsAPI.getApiDetail(this.username),
          // 登录日志
          statsAPI.getSuccessLoginLogs(this.username),
          // 用户偏好（新增）
          analyticsAPI.getUserPreferences(user.id.toString()),
          // 地理分布（新增）
          analyticsAPI.getGeoDistribution('city'),
          // 设备分布（新增）
          analyticsAPI.getDeviceDistribution()
        ]);

        // 处理会话数据
        if (sessionsRes.status === 'fulfilled') {
          this.sessions = sessionsRes.value.sessions || [];
          // 计算风险评分
          this.riskScore = this.calculateRiskScore(this.userStats, this.sessions);
          this.riskLevel = this.getRiskLevel(this.riskScore);
        } else {
          console.error('Failed to load sessions:', sessionsRes.reason);
          this.sessions = [];
        }

        // 处理 API 日志
        if (apiRes.status === 'fulfilled') {
          this.apiLogs = apiRes.value.api_logs || [];
        } else {
          console.error('Failed to load API logs:', apiRes.reason);
          this.apiLogs = [];
        }

        // 处理登录日志
        if (loginRes.status === 'fulfilled') {
          this.loginLogs = loginRes.value || [];
        } else {
          console.error('Failed to load login logs:', loginRes.reason);
          this.loginLogs = [];
        }

        // 处理用户偏好（新增）
        if (preferencesRes.status === 'fulfilled') {
          const data = preferencesRes.value;
          // 查找当前用户的偏好数据
          if (data.user_preferences && Array.isArray(data.user_preferences)) {
            const userPref = data.user_preferences.find(p => p.user_id === user.id);
            this.userPreferences = userPref || null;
          }
        } else {
          console.error('Failed to load user preferences:', preferencesRes.reason);
          this.userPreferences = null;
        }

        // 处理地理分布（新增）
        if (geoRes.status === 'fulfilled') {
          this.geoDistribution = geoRes.value;
        } else {
          console.error('Failed to load geo distribution:', geoRes.reason);
          this.geoDistribution = null;
        }

        // 处理设备分布（新增）
        if (deviceRes.status === 'fulfilled') {
          this.deviceDistribution = deviceRes.value;
        } else {
          console.error('Failed to load device distribution:', deviceRes.reason);
          this.deviceDistribution = null;
        }

        ElMessage.success('數據載入成功');
      } catch (error) {
        console.error('Failed to fetch user profile data:', error);
        ElMessage.error(`載入數據失敗: ${error.message || '未知錯誤'}`);
      } finally {
        this.loading = false;
      }
    },
    getProgressColor(percentage) {
      if (percentage >= 60) return '#ff4d4f';
      if (percentage >= 30) return '#faad14';
      return '#52c41a';
    },
    goBack() {
      this.$router.back();
    }
  }
};
</script>

<style scoped>
.user-profile-detail {
  padding: 20px;
}

.profile-header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-content h2 {
  margin: 0;
  font-size: 24px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--color-text-secondary, #666);
}

.loading-state p {
  margin-top: 10px;
}

.info-section,
.risk-section,
.api-section,
.device-section,
.session-section,
.geo-section {
  margin-bottom: 40px;
}

.info-section h3,
.risk-section h3,
.api-section h3,
.device-section h3,
.session-section h3,
.geo-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: var(--color-text-primary, #333);
  border-bottom: 2px solid var(--color-primary, #52c41a);
  padding-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.info-cards {
  margin-top: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-weight: bold;
  color: var(--color-text-secondary, #666);
  min-width: 120px;
}

.info-item .value {
  color: var(--color-text-primary, #333);
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: var(--radius-lg, 8px);
  padding: 20px;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.1));
}

.chart-header {
  margin-bottom: 15px;
}

.chart-header h4 {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-primary, #333);
}

.risk-details {
  background: white;
  border-radius: var(--radius-lg, 8px);
  padding: 20px;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.1));
}

.risk-details h4 {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: var(--color-text-primary, #333);
}

.risk-item {
  margin-bottom: 20px;
}

.risk-item:last-child {
  margin-bottom: 0;
}

.risk-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--color-text-secondary, #666);
}

.session-table {
  margin-top: 20px;
}

.session-table h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: var(--color-text-primary, #333);
}

.geo-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.geo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.geo-item .ip {
  font-weight: bold;
  color: var(--color-text-primary, #333);
}

.geo-item .count {
  color: var(--color-text-secondary, #666);
}

.traffic-section {
  margin-top: 20px;
}

.traffic-section h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: var(--color-text-primary, #333);
}

.traffic-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.traffic-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.traffic-label {
  font-size: 13px;
  color: var(--color-text-secondary, #666);
  font-weight: 500;
}

.progress-text {
  font-size: 12px;
  font-weight: bold;
}

.top-apis-section {
  margin-top: 20px;
}

.top-apis-section h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: var(--color-text-primary, #333);
}

.geo-stats h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: var(--color-text-primary, #333);
}

@media (max-width: 768px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}
</style>
