<template>
  <div class="analytics-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h2>API 使用分析</h2>
      <div class="header-actions">
        <div class="time-range-selector">
          <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
            <el-radio-button label="today">今天</el-radio-button>
            <el-radio-button label="week">本週</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="custom">自定義</el-radio-button>
          </el-radio-group>
          <el-date-picker
            v-if="timeRange === 'custom'"
            v-model="customDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            @change="handleCustomDateChange"
            style="margin-left: 10px;"
          />
        </div>
        <div class="action-buttons">
          <el-button
            :icon="RefreshIcon"
            @click="fetchData"
            :loading="loading"
            size="small"
          >
            刷新
          </el-button>
          <el-button
            :icon="DownloadIcon"
            @click="exportData"
            size="small"
          >
            導出
          </el-button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && apiLogs.length === 0" class="empty-state">
      <el-empty description="暫無數據">
        <el-button type="primary" @click="fetchData">重新載入</el-button>
      </el-empty>
    </div>

    <!-- Stats Cards -->
    <div v-if="apiLogs.length > 0" class="stats-grid">
      <StatsCard
        :number="stats.totalCalls"
        label="總 API 調用"
        :color="COLORS.primary"
      />
      <StatsCard
        :number="formatBytes(stats.totalUpload)"
        label="總上行流量"
        :color="COLORS.info"
      />
      <StatsCard
        :number="formatBytes(stats.totalDownload)"
        label="總下行流量"
        :color="COLORS.warning"
      />
      <StatsCard
        :number="stats.uniqueUsers"
        label="活躍用戶"
        :color="COLORS.purple"
      />
    </div>

    <!-- Charts Row 1: Time Series -->
    <div v-if="apiLogs.length > 0" class="charts-row">
      <div class="chart-card">
        <div class="chart-header">
          <h3>API 調用趨勢</h3>
          <el-select v-model="callsTrendPeriod" size="small" style="width: 100px;">
            <el-option label="小時" value="hour" />
            <el-option label="天" value="day" />
            <el-option label="週" value="week" />
            <el-option label="月" value="month" />
          </el-select>
        </div>
        <BaseChart
          type="line"
          :data="callsTrendData"
          :options="callsTrendOptions"
          :loading="loading"
          :height="300"
        />
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>流量趨勢</h3>
          <el-select v-model="trafficTrendPeriod" size="small" style="width: 100px;">
            <el-option label="小時" value="hour" />
            <el-option label="天" value="day" />
            <el-option label="週" value="week" />
            <el-option label="月" value="month" />
          </el-select>
        </div>
        <BaseChart
          type="line"
          :data="trafficTrendData"
          :options="trafficTrendOptions"
          :loading="loading"
          :height="300"
        />
      </div>
    </div>

    <!-- Charts Row 2: Distribution -->
    <div v-if="apiLogs.length > 0" class="charts-row">
      <div class="chart-card">
        <div class="chart-header">
          <h3>用戶 API 使用分布</h3>
        </div>
        <BaseChart
          type="doughnut"
          :data="userDistributionData"
          :options="userDistributionOptions"
          :loading="loading"
          :height="300"
        />
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>API 調用頻率排行</h3>
        </div>
        <BaseChart
          type="bar"
          :data="apiFrequencyData"
          :options="apiFrequencyOptions"
          :loading="loading"
          :height="300"
        />
      </div>
    </div>

    <!-- Charts Row 3: Performance -->
    <div v-if="apiLogs.length > 0" class="charts-row">
      <div class="chart-card full-width">
        <div class="chart-header">
          <h3>API 性能分析</h3>
          <span class="chart-subtitle">響應時間分布（毫秒）</span>
        </div>
        <BaseChart
          type="bar"
          :data="performanceData"
          :options="performanceOptions"
          :loading="loading"
          :height="300"
        />
      </div>
    </div>

    <!-- Top Users Table -->
    <div v-if="apiLogs.length > 0" class="table-card">
      <div class="table-header">
        <h3>用戶流量消耗排名</h3>
      </div>
      <BaseTable
        :columns="topUsersColumns"
        :data="topUsers"
        :loading="loading"
        @sort="handleTopUsersSort"
      >
        <template #cell-upload="{ value }">
          {{ formatBytes(value) }}
        </template>
        <template #cell-download="{ value }">
          {{ formatBytes(value) }}
        </template>
        <template #cell-totalTraffic="{ row }">
          {{ formatBytes(row.upload + row.download) }}
        </template>
        <template #actions="{ row }">
          <button class="btn btn-primary btn-sm" @click="viewUserDetail(row)">
            詳情
          </button>
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script>
import { BaseChart, StatsCard, BaseTable } from '@/components/common';
import { analyticsAPI } from '@/api/index';
import { useChart, useApiStats } from '@/composables';
import { ElMessage } from 'element-plus';
import { Refresh as RefreshIcon, Download as DownloadIcon } from '@element-plus/icons-vue';

export default {
  name: 'AnalyticsDashboard',
  components: {
    BaseChart,
    StatsCard,
    BaseTable,
    RefreshIcon,
    DownloadIcon
  },
  setup() {
    const {
      COLORS,
      createLineChartData,
      createBarChartData,
      createPieChartData,
      formatBytes,
      formatNumber,
      createTimeSeriesOptions,
      aggregateByTime
    } = useChart();

    const { calculateAllStats } = useApiStats();

    return {
      COLORS,
      createLineChartData,
      createBarChartData,
      createPieChartData,
      formatBytes,
      formatNumber,
      createTimeSeriesOptions,
      aggregateByTime,
      calculateAllStats,
      RefreshIcon,
      DownloadIcon
    };
  },
  data() {
    return {
      loading: false,
      timeRange: 'week',
      customDateRange: null,
      callsTrendPeriod: 'day',
      trafficTrendPeriod: 'day',
      apiLogs: [],
      stats: {
        totalCalls: 0,
        totalUpload: 0,
        totalDownload: 0,
        uniqueUsers: 0
      },
      topUsers: [],
      topUsersColumns: [
        { key: 'username', label: '用戶名', sortable: true },
        { key: 'apiCalls', label: 'API 調用', sortable: true },
        { key: 'upload', label: '上行流量', sortable: true },
        { key: 'download', label: '下行流量', sortable: true },
        { key: 'totalTraffic', label: '總流量', sortable: true }
      ]
    };
  },
  computed: {
    filteredLogs() {
      if (!this.apiLogs.length) return [];

      const now = new Date();
      let startDate;

      if (this.timeRange === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (this.timeRange === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (this.timeRange === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (this.timeRange === 'custom' && this.customDateRange) {
        startDate = this.customDateRange[0];
      } else {
        return this.apiLogs;
      }

      return this.apiLogs.filter(log => {
        const logDate = new Date(log.called_at);
        return logDate >= startDate;
      });
    },
    callsTrendData() {
      const aggregated = this.aggregateByTime(
        this.filteredLogs,
        'called_at',
        null,
        this.callsTrendPeriod
      );

      return this.createLineChartData(
        aggregated.map(d => d.x),
        [{
          label: 'API 調用次數',
          data: aggregated.map(d => ({ x: d.x, y: d.y }))
        }]
      );
    },
    callsTrendOptions() {
      return this.createTimeSeriesOptions({
        timeUnit: this.callsTrendPeriod,
        formatValue: this.formatNumber
      });
    },
    trafficTrendData() {
      const uploadData = {};
      const downloadData = {};

      this.filteredLogs.forEach(log => {
        const date = new Date(log.called_at);
        let key;

        if (this.trafficTrendPeriod === 'hour') {
          key = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime();
        } else if (this.trafficTrendPeriod === 'day') {
          key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        } else if (this.trafficTrendPeriod === 'week') {
          const day = date.getDay();
          const diff = date.getDate() - day + (day === 0 ? -6 : 1);
          key = new Date(date.getFullYear(), date.getMonth(), diff).getTime();
        } else if (this.trafficTrendPeriod === 'month') {
          key = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
        }

        if (!uploadData[key]) {
          uploadData[key] = 0;
          downloadData[key] = 0;
        }
        uploadData[key] += log.request_size || 0;
        downloadData[key] += log.response_size || 0;
      });

      const timestamps = [...new Set([...Object.keys(uploadData), ...Object.keys(downloadData)])].sort();

      return this.createLineChartData(
        timestamps.map(t => parseInt(t)),
        [
          {
            label: '上行流量',
            data: timestamps.map(t => ({ x: parseInt(t), y: uploadData[t] || 0 }))
          },
          {
            label: '下行流量',
            data: timestamps.map(t => ({ x: parseInt(t), y: downloadData[t] || 0 }))
          }
        ]
      );
    },
    trafficTrendOptions() {
      return this.createTimeSeriesOptions({
        timeUnit: this.trafficTrendPeriod,
        formatValue: this.formatBytes
      });
    },
    userDistributionData() {
      const userCalls = {};
      this.filteredLogs.forEach(log => {
        const username = log.user || 'Unknown';
        userCalls[username] = (userCalls[username] || 0) + 1;
      });

      const sorted = Object.entries(userCalls)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      return this.createPieChartData(
        sorted.map(([username]) => username),
        sorted.map(([, calls]) => calls)
      );
    },
    userDistributionOptions() {
      return {
        plugins: {
          legend: {
            position: 'right'
          }
        }
      };
    },
    apiFrequencyData() {
      const apiCalls = {};
      this.filteredLogs.forEach(log => {
        const path = log.path || 'Unknown';
        apiCalls[path] = (apiCalls[path] || 0) + 1;
      });

      const sorted = Object.entries(apiCalls)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      return this.createBarChartData(
        sorted.map(([path]) => path),
        [{
          label: '調用次數',
          data: sorted.map(([, calls]) => calls)
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
    performanceData() {
      const apiPerformance = {};
      this.filteredLogs.forEach(log => {
        const path = log.path || 'Unknown';
        if (!apiPerformance[path]) {
          apiPerformance[path] = [];
        }
        if (log.duration) {
          apiPerformance[path].push(log.duration);
        }
      });

      const avgPerformance = Object.entries(apiPerformance)
        .map(([path, durations]) => ({
          path,
          avg: durations.reduce((a, b) => a + b, 0) / durations.length,
          p95: this.calculatePercentile(durations, 95),
          p99: this.calculatePercentile(durations, 99)
        }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 10);

      return this.createBarChartData(
        avgPerformance.map(d => d.path),
        [
          {
            label: '平均響應時間',
            data: avgPerformance.map(d => d.avg)
          },
          {
            label: 'P95',
            data: avgPerformance.map(d => d.p95)
          },
          {
            label: 'P99',
            data: avgPerformance.map(d => d.p99)
          }
        ]
      );
    },
    performanceOptions() {
      return {
        indexAxis: 'y',
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: '響應時間 (ms)'
            }
          }
        }
      };
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const response = await analyticsAPI.getApiUsage();
        // 数据验证和清洗
        this.apiLogs = (response.logs || []).filter(log => {
          return log &&
                 log.called_at &&
                 !isNaN(new Date(log.called_at).getTime());
        }).map(log => ({
          ...log,
          request_size: Math.max(0, log.request_size || 0),
          response_size: Math.max(0, log.response_size || 0),
          duration: Math.max(0, log.duration || 0)
        }));
        this.calculateStats();
        if (this.apiLogs.length > 0) {
          ElMessage.success(`成功載入 ${this.apiLogs.length} 條記錄`);
        }
      } catch (error) {
        console.error('Failed to fetch API usage data:', error);
        ElMessage.error('載入數據失敗');
      } finally {
        this.loading = false;
      }
    },
    calculateStats() {
      const allStats = this.calculateAllStats(this.filteredLogs);
      this.stats = {
        totalCalls: allStats.totalAPICalls,
        totalUpload: allStats.totalUpload,
        totalDownload: allStats.totalDownload,
        uniqueUsers: allStats.uniqueUsers
      };

      this.topUsers = Object.entries(allStats.userStats)
        .map(([username, stats]) => ({
          username,
          apiCalls: stats.apiCalls,
          upload: stats.upload,
          download: stats.download
        }))
        .sort((a, b) => (b.upload + b.download) - (a.upload + a.download))
        .slice(0, 10);
    },
    calculatePercentile(arr, percentile) {
      if (arr.length === 0) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const index = Math.ceil((percentile / 100) * sorted.length) - 1;
      return sorted[index];
    },
    handleTimeRangeChange() {
      this.calculateStats();
    },
    handleCustomDateChange() {
      this.calculateStats();
    },
    viewUserDetail(user) {
      this.$router.push({
        name: 'UserStats',
        params: { username: user.username }
      });
    },
    exportData() {
      try {
        // 准备导出数据
        const exportData = this.topUsers.map(user => ({
          '用戶名': user.username,
          'API 調用': user.apiCalls,
          '上行流量': this.formatBytes(user.upload),
          '下行流量': this.formatBytes(user.download),
          '總流量': this.formatBytes(user.upload + user.download)
        }));

        // 转换为 CSV
        const headers = Object.keys(exportData[0]);
        const csvContent = [
          headers.join(','),
          ...exportData.map(row => headers.map(h => row[h]).join(','))
        ].join('\n');

        // 添加 BOM 以支持中文
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `API使用分析_${new Date().toLocaleDateString('zh-CN')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        ElMessage.success('導出成功');
      } catch (error) {
        console.error('Export failed:', error);
        ElMessage.error('導出失敗');
      }
    },
    handleTopUsersSort({ key, order }) {
      this.topUsers.sort((a, b) => {
        let valueA = a[key];
        let valueB = b[key];

        // 处理总流量的特殊情况
        if (key === 'totalTraffic') {
          valueA = a.upload + a.download;
          valueB = b.upload + b.download;
        }

        if (order === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    }
  }
};
</script>

<style scoped>
.analytics-dashboard {
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.dashboard-header h2 {
  margin: 0;
  font-size: 24px;
  color: var(--color-text-primary, #333);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.time-range-selector {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
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

.table-card {
  background: white;
  border-radius: var(--radius-lg, 8px);
  padding: 20px;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.1));
}

.table-header {
  margin-bottom: 15px;
}

.table-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--color-text-primary, #333);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .time-range-selector {
    width: 100%;
  }

  .charts-row {
    grid-template-columns: 1fr;
  }
}
</style>
