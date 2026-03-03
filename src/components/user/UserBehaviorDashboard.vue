<template>
  <div class="user-behavior-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h2>用戶行為分析</h2>
      <div class="header-actions">
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
    <div v-if="loading && users.length === 0" class="loading-state">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>載入中...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && users.length === 0" class="empty-state">
      <el-empty description="暫無用戶數據">
        <el-button type="primary" @click="fetchData">重新載入</el-button>
      </el-empty>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Stats Cards -->
      <div class="stats-grid">
        <StatsCard
          :number="dau"
          label="日活躍用戶 (DAU)"
          :color="COLORS.primary"
        />
        <StatsCard
          :number="wau"
          label="週活躍用戶 (WAU)"
          :color="COLORS.info"
        />
        <StatsCard
          :number="mau"
          label="月活躍用戶 (MAU)"
          :color="COLORS.warning"
        />
        <StatsCard
          :number="formatOnlineTime(avgOnlineTime)"
          label="平均在線時長"
          :color="COLORS.purple"
        />
      </div>

      <!-- Charts Row 1: Activity Trend & User Segmentation -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-header">
            <h3>活躍度趨勢（過去 30 天）</h3>
          </div>
          <BaseChart
            type="line"
            :data="activityTrendData"
            :options="activityTrendOptions"
            :loading="loading"
            :height="300"
          />
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3>用戶分群</h3>
          </div>
          <BaseChart
            type="doughnut"
            :data="segmentationData"
            :options="segmentationOptions"
            :loading="loading"
            :height="300"
          />
        </div>
      </div>

      <!-- Charts Row 2: Activity Heatmap -->
      <div class="charts-row">
        <div class="chart-card full-width">
          <div class="chart-header">
            <h3>活躍時段熱力圖</h3>
            <span class="chart-subtitle">顏色越深表示登錄次數越多</span>
          </div>
          <div class="heatmap-container">
            <div class="heatmap-grid">
              <div class="heatmap-y-axis">
                <div v-for="day in weekDays" :key="day" class="y-label">{{ day }}</div>
              </div>
              <div class="heatmap-content">
                <div class="heatmap-x-axis">
                  <div v-for="hour in 24" :key="hour" class="x-label">{{ hour - 1 }}</div>
                </div>
                <div class="heatmap-cells">
                  <div v-for="(dayData, dayIndex) in heatmapData" :key="dayIndex" class="heatmap-row">
                    <div
                      v-for="(count, hourIndex) in dayData"
                      :key="hourIndex"
                      class="heatmap-cell"
                      :style="{ backgroundColor: getHeatmapColor(count) }"
                      :title="`${weekDays[dayIndex]} ${hourIndex}:00 - ${count} 次登錄`"
                    >
                      <span v-if="count > 0" class="cell-count">{{ count }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User List Table -->
      <div class="table-card">
        <div class="table-header">
          <h3>用戶列表</h3>
          <div class="table-filters">
            <el-select v-model="filterSegment" placeholder="篩選分群" size="small" style="width: 150px;">
              <el-option label="全部" value="all" />
              <el-option label="高活躍" value="high" />
              <el-option label="中等活躍" value="medium" />
              <el-option label="低活躍" value="low" />
              <el-option label="休眠" value="dormant" />
            </el-select>
            <el-select v-model="filterRisk" placeholder="篩選風險" size="small" style="width: 150px; margin-left: 10px;">
              <el-option label="全部" value="all" />
              <el-option label="高風險" value="high" />
              <el-option label="中風險" value="medium" />
              <el-option label="低風險" value="low" />
            </el-select>
          </div>
        </div>
        <el-table :data="filteredUsers" stripe style="width: 100%">
          <el-table-column prop="username" label="用戶名" width="150" />
          <el-table-column prop="role" label="角色" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.role === 'admin'" type="danger" size="small">管理員</el-tag>
              <el-tag v-else type="info" size="small">普通用戶</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="login_count" label="登錄次數" width="120" sortable />
          <el-table-column label="最後登錄" width="180" sortable>
            <template #default="{ row }">
              {{ formatTime(row.last_login) }}
            </template>
          </el-table-column>
          <el-table-column label="活躍度" width="120">
            <template #default="{ row }">
              <el-tag :type="getSegmentTagType(row.segment)" size="small">
                {{ getSegmentLabel(row.segment) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="風險評分" width="120" sortable>
            <template #default="{ row }">
              <span :style="{ color: row.riskLevel.color, fontWeight: 'bold' }">
                {{ row.riskScore }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="風險等級" width="120">
            <template #default="{ row }">
              <el-tag :type="getRiskTagType(row.riskLevel.level)" size="small">
                {{ row.riskLevel.label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="viewUserProfile(row)">
                查看詳情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { BaseChart, StatsCard } from '@/components/common';
import { userAPI, statsAPI, sessionAPI } from '@/api/index';
import { useChart, useUserBehavior, useTimeFormat } from '@/composables';
import { ElMessage } from 'element-plus';
import { Refresh as RefreshIcon, Loading } from '@element-plus/icons-vue';

export default {
  name: 'UserBehaviorDashboard',
  components: {
    BaseChart,
    StatsCard,
    RefreshIcon,
    Loading
  },
  setup() {
    const {
      COLORS,
      createLineChartData,
      createPieChartData,
      formatNumber,
      createTimeSeriesOptions
    } = useChart();

    const {
      calculateActiveUsers,
      segmentUsers,
      generateHeatmapData,
      calculateRiskScore,
      getRiskLevel,
      calculateActivityTrend
    } = useUserBehavior();

    const { formatTime, formatOnlineTime } = useTimeFormat();

    return {
      COLORS,
      createLineChartData,
      createPieChartData,
      formatNumber,
      createTimeSeriesOptions,
      calculateActiveUsers,
      segmentUsers,
      generateHeatmapData,
      calculateRiskScore,
      getRiskLevel,
      calculateActivityTrend,
      formatTime,
      formatOnlineTime,
      RefreshIcon
    };
  },
  data() {
    return {
      loading: false,
      users: [],
      loginLogs: [],
      sessionsMap: {},
      dau: 0,
      wau: 0,
      mau: 0,
      avgOnlineTime: 0,
      heatmapData: [],
      weekDays: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
      filterSegment: 'all',
      filterRisk: 'all'
    };
  },
  computed: {
    activityTrendData() {
      const trend = this.calculateActivityTrend(this.loginLogs, 30);
      return this.createLineChartData(
        trend.map(d => d.date),
        [{
          label: '日活躍用戶',
          data: trend.map(d => ({ x: d.date, y: d.count }))
        }]
      );
    },
    activityTrendOptions() {
      return this.createTimeSeriesOptions({
        timeUnit: 'day',
        formatValue: this.formatNumber
      });
    },
    segmentationData() {
      const segments = this.segmentUsers(this.users);
      return this.createPieChartData(
        ['高活躍', '中等活躍', '低活躍', '休眠'],
        [
          segments.high.length,
          segments.medium.length,
          segments.low.length,
          segments.dormant.length
        ]
      );
    },
    segmentationOptions() {
      return {
        plugins: {
          legend: {
            position: 'right'
          }
        }
      };
    },
    enrichedUsers() {
      const segments = this.segmentUsers(this.users);

      return this.users.map(user => {
        let segment = 'dormant';
        if (segments.high.find(u => u.id === user.id)) segment = 'high';
        else if (segments.medium.find(u => u.id === user.id)) segment = 'medium';
        else if (segments.low.find(u => u.id === user.id)) segment = 'low';

        const sessions = this.sessionsMap[user.id] || [];
        const riskScore = this.calculateRiskScore(user, sessions);
        const riskLevel = this.getRiskLevel(riskScore);

        return {
          ...user,
          segment,
          riskScore,
          riskLevel
        };
      });
    },
    filteredUsers() {
      return this.enrichedUsers.filter(user => {
        if (this.filterSegment !== 'all' && user.segment !== this.filterSegment) {
          return false;
        }
        if (this.filterRisk !== 'all' && user.riskLevel.level !== this.filterRisk) {
          return false;
        }
        return true;
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
        // 并行加载数据
        const [usersRes, logsRes] = await Promise.all([
          userAPI.getAllUsers(),
          statsAPI.getSuccessLoginLogs()
        ]);

        this.users = usersRes.users || [];
        this.loginLogs = logsRes.logs || [];

        // 计算活跃用户数
        this.dau = this.calculateActiveUsers(this.loginLogs, 1);
        this.wau = this.calculateActiveUsers(this.loginLogs, 7);
        this.mau = this.calculateActiveUsers(this.loginLogs, 30);

        // 计算平均在线时长
        const totalOnlineSeconds = this.users.reduce((sum, u) => sum + (u.total_online_seconds || 0), 0);
        this.avgOnlineTime = this.users.length > 0 ? totalOnlineSeconds / this.users.length : 0;

        // 生成热力图数据
        this.heatmapData = this.generateHeatmapData(this.loginLogs);

        // 加载会话数据（用于风险评分）
        await this.loadSessionsData();

        ElMessage.success(`成功載入 ${this.users.length} 個用戶數據`);
      } catch (error) {
        console.error('Failed to fetch user behavior data:', error);
        ElMessage.error('載入數據失敗');
      } finally {
        this.loading = false;
      }
    },
    async loadSessionsData() {
      try {
        // 为每个用户加载会话数据
        const sessionPromises = this.users.slice(0, 50).map(user =>
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
    getHeatmapColor(count) {
      if (count === 0) return '#f5f5f5';
      const maxCount = Math.max(...this.heatmapData.flat());
      const intensity = count / maxCount;

      // 使用绿色渐变
      const r = Math.round(82 + (255 - 82) * (1 - intensity));
      const g = Math.round(196 + (255 - 196) * (1 - intensity));
      const b = Math.round(26 + (255 - 26) * (1 - intensity));

      return `rgb(${r}, ${g}, ${b})`;
    },
    getSegmentLabel(segment) {
      const labels = {
        high: '高活躍',
        medium: '中等活躍',
        low: '低活躍',
        dormant: '休眠'
      };
      return labels[segment] || '未知';
    },
    getSegmentTagType(segment) {
      const types = {
        high: 'success',
        medium: 'warning',
        low: 'info',
        dormant: 'danger'
      };
      return types[segment] || 'info';
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
    }
  }
};
</script>

<style scoped>
.user-behavior-dashboard {
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-header h2 {
  margin: 0;
  font-size: 24px;
  color: var(--color-text-primary, #333);
}

.header-actions {
  display: flex;
  gap: 10px;
}

.loading-state,
.empty-state {
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

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  border-radius: var(--radius-lg, 8px);
  padding: 20px;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.1));
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--color-text-primary, #333);
}

.chart-subtitle {
  font-size: 12px;
  color: var(--color-text-secondary, #666);
}

.heatmap-container {
  padding: 10px 0;
}

.heatmap-grid {
  display: flex;
  gap: 10px;
}

.heatmap-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding-top: 30px;
}

.y-label {
  font-size: 12px;
  color: var(--color-text-secondary, #666);
  text-align: right;
  padding-right: 10px;
  height: 30px;
  display: flex;
  align-items: center;
}

.heatmap-content {
  flex: 1;
}

.heatmap-x-axis {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 2px;
  margin-bottom: 5px;
}

.x-label {
  font-size: 10px;
  color: var(--color-text-secondary, #666);
  text-align: center;
}

.heatmap-cells {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.heatmap-row {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 2px;
}

.heatmap-cell {
  aspect-ratio: 1;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.heatmap-cell:hover {
  transform: scale(1.1);
  z-index: 1;
}

.cell-count {
  font-size: 10px;
  color: #333;
  font-weight: bold;
}

.table-card {
  background: white;
  border-radius: var(--radius-lg, 8px);
  padding: 20px;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.1));
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
  .charts-row {
    grid-template-columns: 1fr;
  }

  .heatmap-grid {
    overflow-x: auto;
  }
}
</style>
