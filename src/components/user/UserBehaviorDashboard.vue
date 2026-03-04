<template>
  <div class="user-behavior-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h2>用戶行為分析</h2>
      <div class="header-actions">
        <el-button
          @click="goHome"
          size="small"
        >
          返回首頁
        </el-button>
        <el-button
          :icon="RefreshIcon"
          @click="fetchData"
          :loading="loading"
          size="small"
          type="primary"
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
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- Tab 1: Overview -->
        <el-tab-pane label="概覽" name="overview">
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
                <!-- 加载风险评分按钮 -->
                <button
                  v-if="!riskScoresLoaded"
                  @click="loadRiskScores"
                  :disabled="loadingRiskScores"
                  class="btn btn-primary btn-sm"
                  style="margin-right: 10px;"
                >
                  <span v-if="loadingRiskScores">載入中...</span>
                  <span v-else>📊 載入風險評分</span>
                </button>

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
            <BaseTable
              :columns="userListColumns"
              :data="filteredUsers"
              :loading="loading"
              @sort="handleUserListSort"
            >
              <template #cell-role="{ row }">
                <BaseTag v-if="row.role === 'admin'" type="danger" size="small">管理員</BaseTag>
                <BaseTag v-else type="info" size="small">普通用戶</BaseTag>
              </template>
              <template #cell-last_login="{ value }">
                {{ formatTime(value) }}
              </template>
              <template #cell-segment="{ row }">
                <BaseTag :type="getSegmentTagType(row.segment)" size="small">
                  {{ getSegmentLabel(row.segment) }}
                </BaseTag>
              </template>
              <template #cell-riskScore="{ row }">
                <span v-if="riskScoresLoaded" :style="{ color: row.riskLevel.color, fontWeight: 'bold' }">
                  {{ row.riskScore }}
                </span>
                <span v-else style="color: #999; font-size: 12px;">-</span>
              </template>
              <template #cell-riskLevel="{ row }">
                <BaseTag v-if="riskScoresLoaded" :type="getRiskTagType(row.riskLevel.level)" size="small">
                  {{ row.riskLevel.label }}
                </BaseTag>
                <BaseTag v-else type="info" size="small">未計算</BaseTag>
              </template>
              <template #actions="{ row }">
                <button class="btn btn-primary btn-sm" @click="viewUserProfile(row)">
                  查看詳情
                </button>
              </template>
            </BaseTable>
          </div>
        </el-tab-pane>

        <!-- Tab 2: User Segments -->
        <el-tab-pane label="用戶分層" name="segments">
          <div v-if="!userSegments" class="loading-state">
            <el-icon class="is-loading" :size="40"><Loading /></el-icon>
            <p>載入用戶分層數據中...</p>
          </div>
          <div v-else class="segments-content">
            <!-- Segment Stats Cards -->
            <div class="stats-grid">
              <StatsCard
                v-for="segment in userSegments.segments"
                :key="segment.level"
                :number="segment.user_count"
                :label="getSegmentLevelLabel(segment.level)"
                :color="getSegmentLevelColor(segment.level)"
              />
            </div>

            <!-- Segment Distribution Chart -->
            <div class="charts-row">
              <div class="chart-card">
                <div class="chart-header">
                  <h3>用戶分層分布</h3>
                </div>
                <BaseChart
                  type="doughnut"
                  :data="segmentDistributionData"
                  :options="segmentationOptions"
                  :loading="loading"
                  :height="300"
                />
              </div>

              <!-- Segment Details Table -->
              <div class="chart-card">
                <div class="chart-header">
                  <h3>分層詳情</h3>
                </div>
                <BaseTable
                  :columns="segmentTableColumns"
                  :data="userSegments.segments"
                  :loading="loading"
                >
                  <template #cell-level="{ row }">
                    <BaseTag :type="getSegmentLevelTagType(row.level)" size="small">
                      {{ getSegmentLevelLabel(row.level) }}
                    </BaseTag>
                  </template>
                  <template #cell-avg_call_count="{ value }">
                    {{ Math.round(value) }}
                  </template>
                  <template #cell-avg_online_seconds="{ value }">
                    {{ formatOnlineTime(value) }}
                  </template>
                </BaseTable>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 3: RFM Analysis -->
        <el-tab-pane label="RFM 分析" name="rfm">
          <div v-if="!rfmAnalysis" class="loading-state">
            <el-icon class="is-loading" :size="40"><Loading /></el-icon>
            <p>載入 RFM 分析數據中...</p>
          </div>
          <div v-else class="rfm-content">
            <!-- RFM Category Cards -->
            <div class="stats-grid">
              <StatsCard
                v-for="category in rfmAnalysis.categories"
                :key="category.category"
                :number="category.user_count"
                :label="getRFMCategoryLabel(category.category)"
                :color="getRFMCategoryColor(category.category)"
              />
            </div>

            <!-- RFM Distribution Chart -->
            <div class="charts-row">
              <div class="chart-card">
                <div class="chart-header">
                  <h3>RFM 用戶分類</h3>
                </div>
                <BaseChart
                  type="pie"
                  :data="rfmDistributionData"
                  :options="segmentationOptions"
                  :loading="loading"
                  :height="300"
                />
              </div>

              <!-- RFM Details Table -->
              <div class="chart-card">
                <div class="chart-header">
                  <h3>分類詳情</h3>
                </div>
                <BaseTable
                  :columns="rfmTableColumns"
                  :data="rfmAnalysis.categories"
                  :loading="loading"
                >
                  <template #cell-category="{ row }">
                    <BaseTag :type="getRFMCategoryTagType(row.category)" size="small">
                      {{ getRFMCategoryLabel(row.category) }}
                    </BaseTag>
                  </template>
                  <template #cell-avg_r_score="{ value }">
                    {{ value.toFixed(1) }}
                  </template>
                  <template #cell-avg_f_score="{ value }">
                    {{ value.toFixed(1) }}
                  </template>
                  <template #cell-avg_m_score="{ value }">
                    {{ value.toFixed(1) }}
                  </template>
                </BaseTable>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 4: API Diversity -->
        <el-tab-pane label="API 多樣性" name="diversity">
          <div v-if="!apiDiversity" class="loading-state">
            <el-icon class="is-loading" :size="40"><Loading /></el-icon>
            <p>載入 API 多樣性數據中...</p>
          </div>
          <div v-else class="diversity-content">
            <!-- Diversity Stats -->
            <div class="stats-grid">
              <StatsCard
                :number="apiDiversity.explorer_count"
                label="探索型用戶"
                :color="COLORS.primary"
              />
              <StatsCard
                :number="apiDiversity.focused_count"
                label="專注型用戶"
                :color="COLORS.info"
              />
              <StatsCard
                :number="apiDiversity.avg_diversity.toFixed(2)"
                label="平均多樣性指數"
                :color="COLORS.warning"
              />
            </div>

            <!-- Diversity Distribution Chart -->
            <div class="charts-row">
              <div class="chart-card">
                <div class="chart-header">
                  <h3>用戶類型分布</h3>
                </div>
                <BaseChart
                  type="pie"
                  :data="diversityDistributionData"
                  :options="segmentationOptions"
                  :loading="loading"
                  :height="300"
                />
              </div>

              <!-- Top Users Table -->
              <div class="chart-card">
                <div class="chart-header">
                  <h3>Top 10 用戶（按多樣性）</h3>
                </div>
                <BaseTable
                  :columns="diversityTableColumns"
                  :data="apiDiversity.users.slice(0, 10)"
                  :loading="loading"
                >
                  <template #cell-user_type="{ row }">
                    <BaseTag :type="row.user_type === 'explorer' ? 'success' : 'info'" size="small">
                      {{ row.user_type === 'explorer' ? '探索型' : '專注型' }}
                    </BaseTag>
                  </template>
                  <template #cell-diversity_index="{ value }">
                    {{ value.toFixed(2) }}
                  </template>
                </BaseTable>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 5: User Growth -->
        <el-tab-pane label="用戶增長" name="growth">
          <div v-if="!userGrowth" class="loading-state">
            <el-icon class="is-loading" :size="40"><Loading /></el-icon>
            <p>載入用戶增長數據中...</p>
          </div>
          <div v-else class="growth-content">
            <!-- Growth Stats -->
            <div class="stats-grid">
              <StatsCard
                :number="userGrowth.total_users"
                label="總用戶數"
                :color="COLORS.primary"
              />
              <StatsCard
                :number="userGrowth.avg_monthly_growth.toFixed(1)"
                label="平均月增長率"
                :color="COLORS.success"
              />
              <StatsCard
                :number="userGrowth.monthly_data[userGrowth.monthly_data.length - 1]?.new_users || 0"
                label="本月新增用戶"
                :color="COLORS.warning"
              />
            </div>

            <!-- Growth Trend Chart -->
            <div class="charts-row">
              <div class="chart-card full-width">
                <div class="chart-header">
                  <h3>月度新增用戶趨勢</h3>
                </div>
                <BaseChart
                  type="line"
                  :data="growthTrendData"
                  :options="growthTrendOptions"
                  :loading="loading"
                  :height="300"
                />
              </div>
            </div>

            <!-- Cumulative Growth Chart -->
            <div class="charts-row">
              <div class="chart-card full-width">
                <div class="chart-header">
                  <h3>累計用戶增長</h3>
                </div>
                <BaseChart
                  type="line"
                  :data="cumulativeGrowthData"
                  :options="cumulativeGrowthOptions"
                  :loading="loading"
                  :height="300"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { BaseChart, StatsCard, BaseTable, BaseTag } from '@/components/common';
import { userAPI, statsAPI, sessionAPI, analyticsAPI } from '@/api/index';
import { useChart, useUserBehavior, useTimeFormat } from '@/composables';
import { ElMessage, ElTabs, ElTabPane } from 'element-plus';
import { Refresh as RefreshIcon, Loading } from '@element-plus/icons-vue';

export default {
  name: 'UserBehaviorDashboard',
  components: {
    BaseChart,
    StatsCard,
    BaseTable,
    BaseTag,
    ElTabs,
    ElTabPane,
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
      activeTab: 'overview',
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
      filterRisk: 'all',
      riskScoresLoaded: false,
      loadingRiskScores: false,
      userSegments: null,
      rfmAnalysis: null,
      apiDiversity: null,
      userGrowth: null,
      userListColumns: [
        { key: 'username', label: '用戶名', sortable: false, minWidth: '120px' },
        { key: 'role', label: '角色', sortable: false, width: '100px' },
        { key: 'login_count', label: '登錄次數', sortable: true, width: '120px' },
        { key: 'last_login', label: '最後登錄', sortable: true, minWidth: '180px' },
        { key: 'segment', label: '活躍度', sortable: false, width: '120px' },
        { key: 'riskScore', label: '風險評分', sortable: true, width: '120px' },
        { key: 'riskLevel', label: '風險等級', sortable: false, width: '120px' }
      ],
      segmentTableColumns: [
        { key: 'level', label: '分層', sortable: false, width: '150px' },
        { key: 'user_count', label: '用戶數', sortable: false, width: '120px' },
        { key: 'avg_call_count', label: '平均調用次數', sortable: false, width: '150px' },
        { key: 'avg_online_seconds', label: '平均在線時長', sortable: false, width: '150px' }
      ],
      rfmTableColumns: [
        { key: 'category', label: '分類', sortable: false, width: '150px' },
        { key: 'user_count', label: '用戶數', sortable: false, width: '120px' },
        { key: 'avg_r_score', label: '平均 R 分數', sortable: false, width: '140px' },
        { key: 'avg_f_score', label: '平均 F 分數', sortable: false, width: '140px' },
        { key: 'avg_m_score', label: '平均 M 分數', sortable: false, width: '140px' }
      ],
      diversityTableColumns: [
        { key: 'username', label: '用戶名', sortable: false, minWidth: '120px' },
        { key: 'user_type', label: '類型', sortable: false, width: '120px' },
        { key: 'diversity_index', label: '多樣性指數', sortable: false, width: '140px' },
        { key: 'total_calls', label: '調用次數', sortable: false, width: '120px' }
      ]
    };
  },
  computed: {
    activityTrendData() {
      // 直接使用后端提供的 DAU 数据
      if (!this.loginLogs || this.loginLogs.length === 0) {
        return this.createLineChartData([], [{ label: '日活躍用戶', data: [] }]);
      }

      // BaseChart (ECharts) 期望的格式：
      // labels: 日期字符串数组
      // data: 简单数值数组（不是 {x, y} 对象）
      return this.createLineChartData(
        this.loginLogs.map(d => d.date),
        [{
          label: '日活躍用戶',
          data: this.loginLogs.map(d => d.count)
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

        // 如果风险评分未加载，返回默认值
        if (!this.riskScoresLoaded) {
          return {
            ...user,
            segment,
            riskScore: 0,
            riskLevel: { level: 'low', label: '未計算', color: '#999' }
          };
        }

        // 已加载风险评分，正常计算
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
    },
    segmentDistributionData() {
      if (!this.userSegments || !this.userSegments.segments) return null;

      const segments = this.userSegments.segments;
      const labels = segments.map(s => this.getSegmentLevelLabel(s.level));
      const data = segments.map(s => s.count);
      const colors = segments.map(s => this.getSegmentLevelColor(s.level));

      return this.createPieChartData(labels, data, colors);
    },
    rfmDistributionData() {
      if (!this.rfmAnalysis || !this.rfmAnalysis.categories) return null;

      const categories = this.rfmAnalysis.categories;
      const labels = categories.map(c => this.getRFMCategoryLabel(c.category));
      const data = categories.map(c => c.count);
      const colors = categories.map(c => this.getRFMCategoryColor(c.category));

      return this.createPieChartData(labels, data, colors);
    },
    diversityDistributionData() {
      if (!this.apiDiversity || !this.apiDiversity.distribution) return null;

      const dist = this.apiDiversity.distribution;
      const labels = Object.keys(dist).map(key => `${key} 個 API`);
      const data = Object.values(dist);

      return this.createPieChartData(labels, data);
    },
    growthTrendData() {
      if (!this.userGrowth || !this.userGrowth.monthly_growth) return null;

      const growth = this.userGrowth.monthly_growth;
      return this.createLineChartData(
        growth.map(g => g.month),
        [{
          label: '新增用戶',
          data: growth.map(g => g.new_users)
        }]
      );
    },
    cumulativeGrowthData() {
      if (!this.userGrowth || !this.userGrowth.monthly_growth) return null;

      const growth = this.userGrowth.monthly_growth;
      return this.createLineChartData(
        growth.map(g => g.month),
        [{
          label: '累計用戶',
          data: growth.map(g => g.cumulative_users)
        }]
      );
    },
    growthTrendOptions() {
      return this.createTimeSeriesOptions({
        timeUnit: 'month',
        formatValue: this.formatNumber
      });
    },
    cumulativeGrowthOptions() {
      return this.createTimeSeriesOptions({
        timeUnit: 'month',
        formatValue: this.formatNumber
      });
    }
  },
  mounted() {
    // 从路由参数读取初始 tab
    const tabFromRoute = this.$route.query.tab;
    if (tabFromRoute && ['overview', 'segments', 'rfm', 'diversity', 'growth'].includes(tabFromRoute)) {
      this.activeTab = tabFromRoute;
    }

    this.fetchData();
  },
  watch: {
    // 监听路由变化，同步 tab 状态
    '$route.query.tab'(newTab) {
      if (newTab && ['overview', 'segments', 'rfm', 'diversity', 'growth'].includes(newTab)) {
        this.activeTab = newTab;
      }
    }
  },
  methods: {
    goHome() {
      this.$router.push('/');
    },
    async fetchData() {
      this.loading = true;
      this.riskScoresLoaded = false;
      this.sessionsMap = {};
      try {
        // 1. 获取用户完整信息
        const usersRes = await userAPI.getAllUsersComplete();
        const rawUsers = usersRes.data || usersRes || [];

        // 深拷贝用户数据，避免循环引用
        this.users = JSON.parse(JSON.stringify(rawUsers));

        console.log(`Loaded ${this.users.length} users with complete info`);

        if (this.users.length === 0) {
          ElMessage.warning('沒有用戶數據');
          return;
        }

        // 2. 获取分析数据（新增的 analytics API）
        try {
          const analyticsRes = await sessionAPI.getAnalytics(30);

          // 使用后端提供的 DAU 数据
          if (analyticsRes.user_activity && analyticsRes.user_activity.dau) {
            const dauData = analyticsRes.user_activity.dau;
            // 获取最近一天的 DAU
            if (dauData.length > 0) {
              this.dau = dauData[dauData.length - 1].count;
            }
            // 使用后端提供的 WAU（如果有的话）
            this.wau = analyticsRes.user_activity.wau || 0;
            // 使用后端提供的 MAU
            this.mau = analyticsRes.user_activity.mau || 0;

            // 保存 DAU 数据用于趋势图
            this.loginLogs = dauData.map(d => ({ date: d.date, count: d.count }));
          }

          // 使用后端提供的热力图数据（已优化为 7x24 二维数组）
          if (analyticsRes.login_heatmap && Array.isArray(analyticsRes.login_heatmap)) {
            // 后端现在直接返回 7x24 的二维数组
            // heatmap[0] = 周日 0-23点
            // heatmap[1] = 周一 0-23点
            // ...
            // heatmap[6] = 周六 0-23点
            this.heatmapData = analyticsRes.login_heatmap.map(row => [...row]);
          }

          console.log('Analytics data loaded:', {
            dau: this.dau,
            wau: this.wau,
            mau: this.mau,
            loginLogsCount: this.loginLogs.length,
            heatmapSize: this.heatmapData.length
          });
        } catch (error) {
          console.error('Failed to load analytics data:', error);
          console.error('Error response:', error.response?.data);

          // 如果 analytics API 失败，回退到使用 last_login 计算
          const now = new Date();
          this.dau = this.users.filter(u => {
            if (!u.last_login) return false;
            const lastLogin = new Date(u.last_login);
            const daysDiff = (now - lastLogin) / (1000 * 60 * 60 * 24);
            return daysDiff < 1;
          }).length;

          this.wau = this.users.filter(u => {
            if (!u.last_login) return false;
            const lastLogin = new Date(u.last_login);
            const daysDiff = (now - lastLogin) / (1000 * 60 * 60 * 24);
            return daysDiff < 7;
          }).length;

          this.mau = this.users.filter(u => {
            if (!u.last_login) return false;
            const lastLogin = new Date(u.last_login);
            const daysDiff = (now - lastLogin) / (1000 * 60 * 60 * 24);
            return daysDiff < 30;
          }).length;

          this.heatmapData = Array(7).fill(0).map(() => Array(24).fill(0));
          this.loginLogs = [];
        }

        console.log(`DAU: ${this.dau}, WAU: ${this.wau}, MAU: ${this.mau}`);

        // 计算平均在线时长
        const totalOnlineSeconds = this.users.reduce((sum, u) => sum + (u.total_online_seconds || 0), 0);
        this.avgOnlineTime = this.users.length > 0 ? totalOnlineSeconds / this.users.length : 0;

        ElMessage.success(`成功載入 ${this.users.length} 個用戶數據`);
      } catch (error) {
        console.error('Failed to fetch user behavior data:', error);
        ElMessage.error(`載入數據失敗: ${error.message || '未知錯誤'}`);
      } finally {
        this.loading = false;
      }
    },
    async loadSessionsData() {
      try {
        const BATCH_SIZE = 5; // 每批处理 5 个用户
        const DELAY_MS = 200; // 批次间延迟 200ms

        this.sessionsMap = {};
        const totalUsers = this.users.length;

        // 分批处理
        for (let i = 0; i < totalUsers; i += BATCH_SIZE) {
          const batch = this.users.slice(i, i + BATCH_SIZE);

          // 并发处理当前批次
          const batchPromises = batch.map(user =>
            sessionAPI.getUserHistory(user.id, false)
              .then(res => ({ userId: user.id, sessions: res.sessions || [] }))
              .catch(() => ({ userId: user.id, sessions: [] }))
          );

          const batchResults = await Promise.all(batchPromises);

          // 合并结果
          batchResults.forEach(({ userId, sessions }) => {
            this.sessionsMap[userId] = sessions;
          });

          // 批次间延迟（最后一批不需要延迟）
          if (i + BATCH_SIZE < totalUsers) {
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
          }
        }

        console.log(`Loaded session data for ${totalUsers} users in batches`);
      } catch (error) {
        console.error('Failed to load sessions data:', error);
        throw error;
      }
    },
    async loadRiskScores() {
      if (this.riskScoresLoaded) {
        ElMessage.info('風險評分已載入');
        return;
      }

      if (this.users.length === 0) {
        ElMessage.warning('沒有用戶數據');
        return;
      }

      this.loadingRiskScores = true;
      try {
        await this.loadSessionsData();
        this.riskScoresLoaded = true;
        ElMessage.success(`成功載入 ${this.users.length} 個用戶的風險評分`);
      } catch (error) {
        console.error('Failed to load risk scores:', error);
        ElMessage.error('載入風險評分失敗');
      } finally {
        this.loadingRiskScores = false;
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
    },
    handleUserListSort({ key, order }) {
      this.users.sort((a, b) => {
        let valueA = a[key];
        let valueB = b[key];

        // 处理日期字段
        if (key === 'last_login') {
          valueA = new Date(valueA).getTime();
          valueB = new Date(valueB).getTime();
        }

        if (order === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    },
    async handleTabChange(tabName) {
      // 更新路由查询参数
      if (this.$route.query.tab !== tabName) {
        this.$router.push({
          query: { ...this.$route.query, tab: tabName }
        }).catch(err => {
          // 忽略导航重复错误
          if (err.name !== 'NavigationDuplicated') {
            console.error('Route navigation error:', err);
          }
        });
      }

      // 等待 DOM 更新后触发图表 resize
      // 使用 setTimeout 增加延迟，确保 tab 切换动画完成
      this.$nextTick(() => {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);
      });

      if (tabName === 'overview') {
        return; // Overview data already loaded
      }

      try {
        if (tabName === 'segments' && !this.userSegments) {
          this.loading = true;
          const response = await analyticsAPI.getUserSegments(false);
          // Transform backend response to match frontend expectations
          this.userSegments = {
            total_users: response.total_users,
            segments: response.segments.map(seg => ({
              level: seg.level,
              user_count: seg.count,
              avg_call_count: seg.avg_calls,
              avg_online_seconds: seg.avg_duration,
              percentage: seg.percentage,
              count: seg.count // 保留原始字段供图表使用
            }))
          };
        } else if (tabName === 'rfm' && !this.rfmAnalysis) {
          this.loading = true;
          const response = await analyticsAPI.getRFMAnalysis(false);

          // 映射后端返回的 segment 值到前端期望的格式
          const segmentMapping = {
            'VIP': 'vip',
            'Potential': 'potential',
            'New': 'new',
            'Dormant High Value': 'sleeping_high_value',
            'Low Value': 'low_value',
            'Others': 'other'
          };

          // Transform backend response to match frontend expectations
          this.rfmAnalysis = {
            categories: response.segments.map(seg => ({
              category: segmentMapping[seg.segment] || seg.segment.toLowerCase().replace(/ /g, '_'),
              user_count: seg.count,
              count: seg.count, // 保留原始字段供图表使用
              avg_r_score: seg.avg_recency_days,
              avg_f_score: seg.avg_frequency,
              avg_m_score: seg.avg_monetary
            }))
          };
        } else if (tabName === 'diversity' && !this.apiDiversity) {
          this.loading = true;
          const response = await analyticsAPI.getApiDiversity();
          // Transform backend response to match frontend expectations
          this.apiDiversity = {
            explorer_count: response.summary.explorer_count,
            focused_count: response.summary.focused_count,
            avg_diversity: response.summary.avg_diversity,
            distribution: {
              '探索型': response.summary.explorer_count,
              '專注型': response.summary.focused_count
            },
            users: response.users.map(user => ({
              username: user.username,
              user_type: user.user_type === '探索型' ? 'explorer' : 'focused',
              diversity_index: user.diversity_score,
              total_calls: user.total_calls,
              api_count: user.api_count
            }))
          };
        } else if (tabName === 'growth' && !this.userGrowth) {
          this.loading = true;
          const response = await analyticsAPI.getUserGrowth(12);
          // Transform backend response to match frontend expectations
          this.userGrowth = {
            total_users: response.summary.total_users,
            avg_monthly_growth: response.summary.avg_monthly_growth,
            months_analyzed: response.summary.months_analyzed,
            monthly_growth: response.monthly_growth,
            monthly_data: response.monthly_growth // Alias for template compatibility
          };
        }
      } catch (error) {
        console.error(`Failed to load ${tabName} data:`, error);
        ElMessage.error(`載入${tabName}數據失敗`);
      } finally {
        this.loading = false;
        // 数据加载完成后，再次触发 resize 确保图表正确显示
        this.$nextTick(() => {
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 100);
        });
      }
    },
    getSegmentLevelLabel(level) {
      const labels = {
        super_active: '超級活躍',
        active: '活躍',
        regular: '普通',
        normal: '普通',
        low_active: '低活躍',
        dormant: '休眠'
      };
      return labels[level] || level;
    },
    getSegmentLevelColor(level) {
      const colors = {
        super_active: '#52c41a',
        active: '#73d13d',
        regular: '#faad14',
        normal: '#faad14',
        low_active: '#ff7a45',
        dormant: '#f5222d'
      };
      return colors[level] || '#d9d9d9';
    },
    getSegmentLevelTagType(level) {
      const types = {
        super_active: 'success',
        active: 'success',
        regular: 'warning',
        normal: 'warning',
        low_active: 'info',
        dormant: 'danger'
      };
      return types[level] || 'info';
    },
    getRFMCategoryLabel(category) {
      const labels = {
        vip: 'VIP 用戶',
        potential: '潛力用戶',
        new: '新用戶',
        sleeping_high_value: '沉睡高價值',
        low_value: '低價值',
        other: '其他'
      };
      return labels[category] || category;
    },
    getRFMCategoryColor(category) {
      const colors = {
        vip: '#722ed1',
        potential: '#1890ff',
        new: '#52c41a',
        sleeping_high_value: '#faad14',
        low_value: '#ff7a45',
        other: '#d9d9d9'
      };
      return colors[category] || '#d9d9d9';
    },
    getRFMCategoryTagType(category) {
      const types = {
        vip: 'danger',
        potential: 'primary',
        new: 'success',
        sleeping_high_value: 'warning',
        low_value: 'info',
        other: 'info'
      };
      return types[category] || 'info';
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
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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
  overflow-x: auto;
  min-width: 0;
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
