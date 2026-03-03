<template>
  <div class="anomaly-detection-panel">
    <!-- Header -->
    <div class="panel-header">
      <h2>異常行為檢測</h2>
      <div class="header-actions">
        <el-select v-model="detectionType" placeholder="檢測類型" size="small" style="width: 180px; margin-right: 10px;" @change="fetchData">
          <el-option label="全部異常" value="all" />
          <el-option label="超高頻調用" value="high_frequency" />
          <el-option label="超大流量" value="high_traffic" />
          <el-option label="單一API依賴" value="single_api" />
          <el-option label="新用戶異常活躍" value="new_user_spike" />
        </el-select>
        <el-button
          :icon="RefreshIcon"
          @click="fetchData"
          :loading="loading"
          size="small"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && anomalousUsers.length === 0" class="loading-state">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>載入中...</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Stats Cards -->
      <div class="stats-grid">
        <StatsCard
          :number="highRiskCount"
          label="高風險用戶"
          :color="COLORS.danger"
        />
        <StatsCard
          :number="suspiciousSessionCount"
          label="可疑會話"
          :color="COLORS.warning"
        />
        <StatsCard
          :number="todayFailedLogins"
          label="今日登錄失敗"
          :color="COLORS.orange"
        />
        <StatsCard
          :number="abnormalIPCount"
          label="異常 IP 數量"
          :color="COLORS.purple"
        />
      </div>

      <!-- Anomaly Trend Chart -->
      <div class="chart-section">
        <BaseCard shadow="hover">
          <div class="chart-header">
            <h3>異常事件趨勢（過去 7 天）</h3>
          </div>
          <BaseChart
            type="line"
            :data="anomalyTrendData"
            :options="anomalyTrendOptions"
            :height="250"
          />
        </BaseCard>
      </div>

      <!-- Anomalous Users Table -->
      <div class="table-section">
        <BaseCard shadow="hover">
          <div class="table-header">
            <h3>異常用戶列表</h3>
            <div class="table-filters">
              <el-select v-model="filterRiskLevel" placeholder="篩選風險等級" size="small" style="width: 150px;">
                <el-option label="全部" value="all" />
                <el-option label="高風險" value="high" />
                <el-option label="中風險" value="medium" />
              </el-select>
              <el-select v-model="filterAnomalyType" placeholder="篩選異常類型" size="small" style="width: 180px; margin-left: 10px;">
                <el-option label="全部" value="all" />
                <el-option label="超高頻調用" value="high_frequency" />
                <el-option label="超大流量" value="high_traffic" />
                <el-option label="單一API依賴" value="single_api" />
                <el-option label="新用戶異常活躍" value="new_user_spike" />
              </el-select>
            </div>
          </div>

          <BaseTable
            :columns="anomalyColumns"
            :data="filteredAnomalousUsers"
            :loading="loading"
            @sort="handleAnomalySort"
          >
            <template #cell-riskScore="{ row }">
              <span :style="{ color: row.riskLevel.color, fontWeight: 'bold' }">
                {{ row.riskScore }}
              </span>
            </template>
            <template #cell-zScore="{ row }">
              <span style="font-weight: bold; color: var(--color-primary);">
                {{ row.zScore ? row.zScore.toFixed(2) : 'N/A' }}
              </span>
            </template>
            <template #cell-severity="{ row }">
              <BaseTag :type="row.severity === 'high' ? 'danger' : 'warning'" size="small">
                {{ row.severity === 'high' ? '高' : '中' }}
              </BaseTag>
            </template>
            <template #cell-riskLevel="{ row }">
              <BaseTag :type="getRiskTagType(row.riskLevel.level)" size="small">
                {{ row.riskLevel.label }}
              </BaseTag>
            </template>
            <template #cell-anomalies="{ row }">
              <BaseTag
                v-for="anomaly in row.anomalies"
                :key="anomaly.type"
                size="small"
                style="margin-right: 5px;"
              >
                {{ anomaly.icon }} {{ anomaly.label }}
              </BaseTag>
            </template>
            <template #cell-last_login="{ value }">
              {{ formatTime(value) }}
            </template>
            <template #actions="{ row }">
              <button class="btn btn-primary btn-sm" @click="viewUserProfile(row)">
                查看詳情
              </button>
              <button class="btn btn-danger btn-sm" style="margin-left: 5px;" @click="revokeUserSessions(row)">
                撤銷會話
              </button>
            </template>
          </BaseTable>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script>
import { BaseChart, StatsCard, BaseTable, BaseTag, BaseCard } from '@/components/common';
import { userAPI, sessionAPI, statsAPI, analyticsAPI } from '@/api/index';
import { useChart, useUserBehavior, useTimeFormat } from '@/composables';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh as RefreshIcon, Loading } from '@element-plus/icons-vue';

export default {
  name: 'AnomalyDetectionPanel',
  components: {
    BaseChart,
    StatsCard,
    BaseTable,
    BaseTag,
    BaseCard,
    RefreshIcon,
    Loading
  },
  setup() {
    const {
      COLORS,
      createLineChartData,
      formatNumber,
      createTimeSeriesOptions
    } = useChart();

    const {
      identifyAnomalousUsers,
      calculateRiskScore,
      getRiskLevel
    } = useUserBehavior();

    const { formatTime } = useTimeFormat();

    return {
      COLORS,
      createLineChartData,
      formatNumber,
      createTimeSeriesOptions,
      identifyAnomalousUsers,
      calculateRiskScore,
      getRiskLevel,
      formatTime,
      RefreshIcon
    };
  },
  data() {
    return {
      loading: false,
      users: [],
      sessionsMap: {},
      anomalousUsers: [],
      suspiciousSessionCount: 0,
      todayFailedLogins: 0,
      abnormalIPCount: 0,
      filterRiskLevel: 'all',
      filterAnomalyType: 'all',
      anomalyData: null,
      trendData: null,
      detectionType: 'all',
      anomalyColumns: [
        { key: 'username', label: '用戶名', sortable: false },
        { key: 'riskScore', label: '風險評分', sortable: true },
        { key: 'zScore', label: 'Z 分數', sortable: true },
        { key: 'severity', label: '嚴重程度', sortable: false },
        { key: 'riskLevel', label: '風險等級', sortable: false },
        { key: 'anomalies', label: '異常類型', sortable: false },
        { key: 'last_login', label: '最後活動', sortable: false }
      ]
    };
  },
  computed: {
    highRiskCount() {
      return this.anomalousUsers.filter(u => u.riskLevel.level === 'high').length;
    },
    filteredAnomalousUsers() {
      return this.anomalousUsers.filter(user => {
        if (this.filterRiskLevel !== 'all' && user.riskLevel.level !== this.filterRiskLevel) {
          return false;
        }
        if (this.filterAnomalyType !== 'all') {
          const hasType = user.anomalies.some(a => a.type === this.filterAnomalyType);
          if (!hasType) return false;
        }
        return true;
      });
    },
    anomalyTrendData() {
      // 如果有後端真實趨勢數據，使用真實數據
      if (this.trendData && this.trendData.daily_active_users) {
        const trend = this.trendData.daily_active_users.map(item => ({
          x: new Date(item.date).getTime(),
          y: item.count
        }));

        return this.createLineChartData(
          trend.map(d => d.x),
          [{
            label: '活躍用戶數',
            data: trend
          }]
        );
      }

      // 否則使用模擬數據（向後兼容）
      const trend = [];
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const count = Math.max(0, this.anomalousUsers.length - Math.floor(Math.random() * 5));

        trend.push({
          x: date.getTime(),
          y: count
        });
      }

      return this.createLineChartData(
        trend.map(d => d.x),
        [{
          label: '異常用戶數',
          data: trend
        }]
      );
    },
    anomalyTrendOptions() {
      return this.createTimeSeriesOptions({
        timeUnit: 'day',
        formatValue: this.formatNumber
      });
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        // 並行加載異常檢測數據和趨勢數據
        const [anomalyRes, trendRes] = await Promise.all([
          analyticsAPI.detectAnomalies(this.detectionType),
          analyticsAPI.getRecentTrends('day', 7)
        ]);

        // 存儲後端數據
        this.anomalyData = anomalyRes;
        this.trendData = trendRes;

        // 處理後端異常數據，轉換為前端格式
        this.anomalousUsers = this.processBackendAnomalies(anomalyRes.anomalies || []);

        // 加載用戶數據（用於補充信息）
        const usersRes = await userAPI.getAllUsers();
        this.users = usersRes.users || [];

        // 加載會話數據
        await this.loadSessionsData();

        // 計算統計數據
        this.calculateStats();

        ElMessage.success(`檢測到 ${this.anomalousUsers.length} 個異常用戶`);
      } catch (error) {
        console.error('Failed to fetch anomaly data:', error);
        ElMessage.error('載入數據失敗');
      } finally {
        this.loading = false;
      }
    },
    processBackendAnomalies(anomalies) {
      // 異常類型映射
      const anomalyTypeMap = {
        high_frequency: { label: '超高頻調用', icon: '🔥' },
        high_traffic: { label: '超大流量', icon: '📊' },
        single_api: { label: '單一API依賴', icon: '⚠️' },
        new_user_spike: { label: '新用戶異常活躍', icon: '🚀' }
      };

      return anomalies.map(anomaly => {
        // 計算風險評分（基於 z_score）
        const riskScore = Math.min(100, Math.round((anomaly.z_score || 0) * 10));
        const riskLevel = this.getRiskLevel(riskScore);

        // 轉換異常類型
        const anomalyTypes = [];
        if (anomaly.anomaly_type && anomalyTypeMap[anomaly.anomaly_type]) {
          anomalyTypes.push({
            type: anomaly.anomaly_type,
            ...anomalyTypeMap[anomaly.anomaly_type]
          });
        }

        return {
          user_id: anomaly.user_id,
          username: anomaly.username,
          riskScore,
          riskLevel,
          zScore: anomaly.z_score || 0,
          severity: anomaly.severity || 'medium',
          anomalies: anomalyTypes,
          details: anomaly.details || {},
          last_login: anomaly.last_login || new Date().toISOString()
        };
      });
    },
    async loadSessionsData() {
      try {
        // 加载所有可疑会话（limit 最大 500）
        const suspiciousRes = await sessionAPI.listSessions({ is_suspicious: 1, limit: 500 });
        this.suspiciousSessionCount = (suspiciousRes.sessions || []).length;

        // 为每个用户加载会话数据
        const sessionPromises = this.users.slice(0, 100).map(user =>
          sessionAPI.getUserHistory(user.id, false)
            .then(res => ({ userId: user.id, sessions: res.sessions || [] }))
            .catch(() => ({ userId: user.id, sessions: [] }))
        );

        const results = await Promise.all(sessionPromises);
        this.sessionsMap = results.reduce((map, { userId, sessions }) => {
          map[userId] = sessions;
          return map;
        }, {});
      } catch (error) {
        console.error('Failed to load sessions data:', error);
      }
    },
    calculateStats() {
      // 计算今日登录失败次数
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      this.todayFailedLogins = this.users.reduce((sum, user) => {
        // 简化：使用 failed_attempts 作为今日失败次数（实际应该从登录日志计算）
        return sum + (user.failed_attempts || 0);
      }, 0);

      // 计算异常 IP 数量（简化：使用会话中的 IP 变更次数）
      const abnormalIPs = new Set();
      Object.values(this.sessionsMap).forEach(sessions => {
        sessions.forEach(session => {
          if (session.ip_change_count > 2) {
            abnormalIPs.add(session.current_ip);
          }
        });
      });
      this.abnormalIPCount = abnormalIPs.size;
    },
    getRiskTagType(level) {
      const types = {
        high: 'danger',
        medium: 'warning',
        low: 'success'
      };
      return types[level] || 'info';
    },
    viewUserProfile(user) {
      this.$router.push({
        name: 'UserProfileDetail',
        params: { username: user.username }
      });
    },
    handleAnomalySort({ key, order }) {
      this.anomalousUsers.sort((a, b) => {
        const valueA = a[key];
        const valueB = b[key];

        if (order === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    },
    async revokeUserSessions(user) {
      try {
        await ElMessageBox.confirm(
          `確定要撤銷用戶 ${user.username} 的所有會話嗎？`,
          '警告',
          {
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        await sessionAPI.revokeUserSessions(user.id, 'admin_security_action');
        ElMessage.success('會話已撤銷');
        this.fetchData();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to revoke sessions:', error);
          ElMessage.error('撤銷會話失敗');
        }
      }
    }
  }
};
</script>

<style scoped>
.anomaly-detection-panel {
  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h2 {
  margin: 0;
  font-size: 24px;
  color: var(--color-text-primary, #333);
}

.header-actions {
  display: flex;
  gap: 10px;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-section {
  margin-bottom: 30px;
}

.chart-header {
  margin-bottom: 15px;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--color-text-primary, #333);
}

.table-section {
  margin-bottom: 30px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--color-text-primary, #333);
}

.table-filters {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .table-filters {
    flex-direction: column;
  }
}
</style>
