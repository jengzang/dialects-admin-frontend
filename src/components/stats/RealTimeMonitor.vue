<template>
  <div class="realtime-monitor">
    <!-- Loading State -->
    <BaseLoading v-if="loading && !data" message="載入中..." />

    <!-- Content -->
    <div v-else>
      <!-- Stats Cards -->
      <div class="stats-grid">
        <StatsCard
          :number="currentHourCalls"
          label="當前小時調用量"
          :color="COLORS.primary"
        />
        <StatsCard
          :number="todayTotalCalls"
          label="今日總調用量"
          :color="COLORS.info"
        />
        <StatsCard
          :number="peakHour"
          label="峰值時段"
          :color="COLORS.warning"
        />
        <StatsCard
          :number="avgCallsPerHour"
          label="平均每小時"
          :color="COLORS.purple"
        />
      </div>

      <!-- Time Range Selector -->
      <div class="control-bar">
        <div class="control-group">
          <label>時間範圍：</label>
          <BaseSelect
            v-model="selectedHours"
            :options="hoursOptions"
            @change="fetchData"
          />
        </div>
        <div class="last-update">
          最後更新：{{ lastUpdateTime }}
        </div>
      </div>

      <!-- Trend Chart -->
      <BaseCard title="24 小時趨勢">
        <BaseChart
          type="line"
          :data="chartData"
          :options="chartOptions"
          :height="350"
        />
      </BaseCard>
    </div>
  </div>
</template>

<script>
import { BaseChart, StatsCard, BaseCard, BaseSelect, BaseLoading } from '@/components/common';
import { apiCallStatsAPI } from '@/api/apiCallStats';
import { useApiCallStats } from '@/composables/useApiCallStats';
import { useChart } from '@/composables/useChart';

export default {
  name: 'RealTimeMonitor',
  components: {
    BaseChart,
    StatsCard,
    BaseCard,
    BaseSelect,
    BaseLoading
  },
  data() {
    return {
      loading: false,
      data: null,
      selectedHours: 24,
      hoursOptions: [
        { label: '最近 24 小時', value: 24 },
        { label: '最近 48 小時', value: 48 },
        { label: '最近 7 天', value: 168 }
      ],
      lastUpdateTime: '',
      autoRefreshTimer: null,
      COLORS: {
        primary: '#4CAF50',
        info: '#2196F3',
        warning: '#ff9800',
        purple: '#9c27b0'
      }
    };
  },
  computed: {
    currentHourCalls() {
      if (!this.data || !this.data.data || this.data.data.length === 0) return 0;
      return this.data.data[this.data.data.length - 1].total_calls || 0;
    },
    todayTotalCalls() {
      if (!this.data || !this.data.summary) return 0;
      return this.data.summary.total_calls || 0;
    },
    peakHour() {
      if (!this.data || !this.data.summary || !this.data.summary.peak_hour) return '-';
      const { formatHourLabel } = useApiCallStats();
      return formatHourLabel(this.data.summary.peak_hour);
    },
    avgCallsPerHour() {
      if (!this.data || !this.data.summary) return 0;
      return Math.round(this.data.summary.avg_calls_per_hour || 0);
    },
    chartData() {
      if (!this.data || !this.data.data) return { labels: [], datasets: [] };

      const { formatHourLabel, fillMissingHours } = useApiCallStats();
      const { COLORS } = useChart();

      // 填充缺失的小时数据
      const filledData = fillMissingHours(this.data.data, this.selectedHours);

      return {
        labels: filledData.map(d => formatHourLabel(d.hour)),
        datasets: [{
          label: '調用次數',
          data: filledData.map(d => d.total_calls),
          borderColor: COLORS.primary,
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        }]
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => value.toLocaleString()
            }
          }
        }
      };
    }
  },
  mounted() {
    this.fetchData();
    this.startAutoRefresh();
  },
  beforeUnmount() {
    this.stopAutoRefresh();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.$emit('loading', true);
      try {
        this.data = await apiCallStatsAPI.getHourlyTrend(this.selectedHours);
        this.lastUpdateTime = new Date().toLocaleTimeString('zh-TW');
      } catch (error) {
        console.error('Failed to fetch hourly trend:', error);
      } finally {
        this.loading = false;
        this.$emit('loading', false);
      }
    },
    startAutoRefresh() {
      // 每 5 分鐘自動刷新
      this.autoRefreshTimer = setInterval(() => {
        this.fetchData();
      }, 5 * 60 * 1000);
    },
    stopAutoRefresh() {
      if (this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer);
      }
    }
  }
};
</script>

<style scoped>
.realtime-monitor {
  min-height: 500px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-background-light);
  border-radius: var(--radius-md);
}

.control-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.control-group label {
  font-weight: 500;
  color: var(--color-text-primary);
}

.last-update {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .realtime-monitor {
    min-height: auto;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .control-bar {
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .control-group {
    width: 100%;
    justify-content: space-between;
  }

  .last-update {
    font-size: 12px;
  }
}

</style>
