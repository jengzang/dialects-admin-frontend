<template>
  <div class="trend-analysis">
    <!-- Loading State -->
    <BaseLoading v-if="loading && !data" message="載入中..." />

    <!-- Content -->
    <div v-else>
      <!-- Empty State -->
      <div v-if="!data || !data.data || data.data.length === 0" class="empty-state">
        <div class="empty-icon">📊</div>
        <div class="empty-text">暫無趨勢數據</div>
        <div class="empty-hint">請稍後再試或檢查數據源</div>
      </div>

      <!-- Data Content -->
      <div v-else>
        <!-- API Diversity Stats -->
        <div class="stats-grid">
        <StatsCard
          :number="uniqueApis"
          label="活躍 API 數量"
          :color="COLORS.primary"
        />
        <StatsCard
          :number="totalCalls"
          label="總調用次數"
          :color="COLORS.info"
        />
        <StatsCard
          :number="avgCallsPerDay"
          label="平均每日調用"
          :color="COLORS.warning"
        />
        <StatsCard
          :number="peakDate"
          label="峰值日期"
          :color="COLORS.purple"
        />
      </div>

      <!-- Time Range Selector -->
      <div class="control-bar">
        <div class="control-group">
          <label>時間範圍：</label>
          <BaseSelect
            v-model="selectedDays"
            :options="daysOptions"
            @change="fetchData"
          />
        </div>
      </div>

      <!-- Daily Trend Chart -->
      <BaseCard title="每日調用趨勢">
        <BaseChart
          type="line"
          :data="trendChartData"
          :options="trendChartOptions"
          :height="350"
          :loading="loading"
        />
      </BaseCard>

      <!-- Single API Trend Comparison -->
      <BaseCard title="單個 API 趨勢對比" class="mt-lg">
        <div class="api-input-group">
          <label>API 路徑：</label>
          <BaseInput
            v-model="apiPath"
            placeholder="輸入 API 路徑，例如：/api/YinWei"
          />
          <button class="btn btn-primary" @click="fetchApiTrend" :disabled="!apiPath">
            查詢
          </button>
        </div>
        <BaseChart
          v-if="apiTrendData"
          type="line"
          :data="apiTrendChartData"
          :options="apiTrendChartOptions"
          :height="300"
          :loading="loading"
        />
        <div v-else class="empty-hint">
          请输入 API 路径查询趋势
        </div>
      </BaseCard>
      </div>
    </div>
  </div>
</template>

<script>
import { BaseChart, StatsCard, BaseCard, BaseSelect, BaseInput, BaseLoading } from '@/components/common';
import { apiCallStatsAPI } from '@/api/apiCallStats';
import { useApiCallStats } from '@/composables/useApiCallStats';
import { useChart } from '@/composables/useChart';

export default {
  name: 'TrendAnalysis',
  components: {
    BaseChart,
    StatsCard,
    BaseCard,
    BaseSelect,
    BaseInput,
    BaseLoading
  },
  data() {
    return {
      loading: false,
      data: null,
      apiTrendData: null,
      selectedDays: 30,
      apiPath: '',
      daysOptions: [
        { label: '最近 7 天', value: 7 },
        { label: '最近 30 天', value: 30 },
        { label: '最近 90 天', value: 90 }
      ],
      COLORS: {
        primary: '#4CAF50',
        info: '#2196F3',
        warning: '#ff9800',
        purple: '#9c27b0'
      }
    };
  },
  computed: {
    uniqueApis() {
      if (!this.data || !this.data.summary) return 0;
      return this.data.summary.unique_apis || 0;
    },
    totalCalls() {
      if (!this.data || !this.data.summary) return 0;
      return this.data.summary.total_calls || 0;
    },
    avgCallsPerDay() {
      if (!this.data || !this.data.summary) return 0;
      return Math.round(this.data.summary.avg_calls_per_day || 0);
    },
    peakDate() {
      if (!this.data || !this.data.summary || !this.data.summary.peak_date) return '-';
      const { formatDateLabel } = useApiCallStats();
      return formatDateLabel(this.data.summary.peak_date);
    },
    trendChartData() {
      if (!this.data || !this.data.data) return { labels: [], datasets: [] };

      const { formatDateLabel, fillMissingDays } = useApiCallStats();
      const { COLORS } = useChart();

      // 填充缺失的日期数据
      const filledData = fillMissingDays(this.data.data, this.selectedDays);

      return {
        labels: filledData.map(d => formatDateLabel(d.date)),
        datasets: [{
          label: '每日調用次數',
          data: filledData.map(d => d.total_calls),
          borderColor: COLORS.primary,
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        }]
      };
    },
    trendChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
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
    },
    apiTrendChartData() {
      if (!this.apiTrendData || !this.apiTrendData.data) return { labels: [], datasets: [] };

      const { formatDateLabel, fillMissingDays } = useApiCallStats();
      const { COLORS } = useChart();

      // 填充缺失的日期数据
      const filledData = fillMissingDays(this.apiTrendData.data, this.selectedDays);

      return {
        labels: filledData.map(d => formatDateLabel(d.date)),
        datasets: [
          {
            label: `${this.apiPath} 調用次數`,
            data: filledData.map(d => d.call_count),
            borderColor: COLORS.info,
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      };
    },
    apiTrendChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
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
      this.$emit('loading', true);
      try {
        this.data = await apiCallStatsAPI.getDailyTrend(this.selectedDays);
        console.log('Daily trend data loaded:', this.data);

        // 验证数据结构
        if (!this.data) {
          console.warn('API returned null/undefined data');
        } else if (!this.data.data || this.data.data.length === 0) {
          console.warn('API returned empty data array');
        }
      } catch (error) {
        console.error('Failed to fetch daily trend:', error);
        console.error('Error details:', error.response || error.message);
        this.$message?.error?.(`載入趨勢數據失敗: ${error.message || '未知錯誤'}`);
      } finally {
        this.loading = false;
        this.$emit('loading', false);
      }
    },
    async fetchApiTrend() {
      if (!this.apiPath) return;

      this.loading = true;
      this.$emit('loading', true);
      try {
        this.apiTrendData = await apiCallStatsAPI.getApiHistory(this.apiPath, this.selectedDays);
      } catch (error) {
        console.error('Failed to fetch API trend:', error);
        this.apiTrendData = null;
      } finally {
        this.loading = false;
        this.$emit('loading', false);
      }
    }
  }
};
</script>

<style scoped>
.trend-analysis {
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

.api-input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.api-input-group label {
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.empty-hint {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xxl) var(--spacing-xl);
  background: var(--color-background-light);
  border-radius: var(--radius-lg);
  margin: var(--spacing-lg) 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.empty-hint {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.mt-lg {
  margin-top: var(--spacing-lg);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .trend-analysis {
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

  .api-input-group {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-xs);
  }

  .api-input-group label {
    white-space: normal;
  }

  .mt-lg {
    margin-top: var(--spacing-md);
  }
}

</style>
