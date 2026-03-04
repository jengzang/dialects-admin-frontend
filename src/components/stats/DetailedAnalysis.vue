<template>
  <div class="detailed-analysis">
    <!-- API Selector -->
    <BaseCard title="API 選擇器">
      <div class="api-selector">
        <div class="input-group">
          <label>API 路徑：</label>
          <BaseInput
            v-model="apiPath"
            placeholder="輸入 API 路徑，例如：/api/YinWei"
          />
          <button class="btn btn-primary" @click="fetchData" :disabled="!apiPath || loading">
            {{ loading ? '查詢中...' : '查詢' }}
          </button>
        </div>
        <div class="search-history" v-if="searchHistory.length > 0">
          <label>最近查詢：</label>
          <div class="history-tags">
            <span
              v-for="(path, index) in searchHistory"
              :key="index"
              class="history-tag"
              @click="selectFromHistory(path)"
            >
              {{ path }}
            </span>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Loading State -->
    <BaseLoading v-if="loading && !data" message="載入中..." />

    <!-- Empty State -->
    <div v-else-if="!data" class="empty-state">
      <p>請輸入 API 路徑開始查詢</p>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Stats Cards -->
      <div class="stats-grid">
        <StatsCard
          :number="totalCalls"
          label="總調用次數"
          :color="COLORS.primary"
        />
        <StatsCard
          :number="avgCallsPerDay"
          label="平均每日調用"
          :color="COLORS.info"
        />
        <StatsCard
          :number="peakDate"
          label="峰值日期"
          :color="COLORS.warning"
        />
        <StatsCard
          :number="peakCalls"
          label="峰值調用次數"
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

      <!-- History Trend Chart -->
      <BaseCard :title="`${apiPath} 歷史趨勢`">
        <BaseChart
          type="line"
          :data="chartData"
          :options="chartOptions"
          :height="400"
        />
      </BaseCard>

      <!-- Multi-API Comparison (Optional) -->
      <BaseCard title="多 API 對比" class="mt-lg">
        <div class="comparison-controls">
          <p class="hint">添加其他 API 進行對比（最多 5 個）</p>
          <div class="input-group">
            <BaseInput
              v-model="comparisonApiPath"
              placeholder="輸入要對比的 API 路徑"
            />
            <button
              class="btn btn-primary"
              @click="addComparisonApi"
              :disabled="!comparisonApiPath || comparisonApis.length >= 5"
            >
              添加
            </button>
          </div>
          <div class="comparison-list" v-if="comparisonApis.length > 0">
            <span
              v-for="(path, index) in comparisonApis"
              :key="index"
              class="comparison-tag"
            >
              {{ path }}
              <button class="remove-btn" @click="removeComparisonApi(index)">×</button>
            </span>
          </div>
        </div>
        <BaseChart
          v-if="comparisonChartData"
          type="line"
          :data="comparisonChartData"
          :options="comparisonChartOptions"
          :height="350"
        />
      </BaseCard>
    </div>
  </div>
</template>

<script>
import { BaseChart, StatsCard, BaseCard, BaseInput, BaseSelect, BaseLoading } from '@/components/common';
import { apiCallStatsAPI } from '@/api/apiCallStats';
import { useApiCallStats } from '@/composables/useApiCallStats';
import { useChart } from '@/composables/useChart';

export default {
  name: 'DetailedAnalysis',
  components: {
    BaseChart,
    StatsCard,
    BaseCard,
    BaseInput,
    BaseSelect,
    BaseLoading
  },
  props: {
    initialApi: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      data: null,
      apiPath: this.initialApi || '',
      comparisonApiPath: '',
      comparisonApis: [],
      comparisonData: {},
      selectedDays: 30,
      searchHistory: this.loadSearchHistory(),
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
    peakCalls() {
      if (!this.data || !this.data.summary) return 0;
      return this.data.summary.peak_calls || 0;
    },
    chartData() {
      if (!this.data || !this.data.data) return { labels: [], datasets: [] };

      const { formatDateLabel, fillMissingDays } = useApiCallStats();
      const { COLORS } = useChart();

      // 填充缺失的日期数据
      const filledData = fillMissingDays(this.data.data, this.selectedDays);

      return {
        labels: filledData.map(d => formatDateLabel(d.date)),
        datasets: [{
          label: this.apiPath,
          data: filledData.map(d => d.call_count),
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
    },
    comparisonChartData() {
      if (this.comparisonApis.length === 0) return null;

      const { formatDateLabel } = useApiCallStats();
      const { COLORS } = useChart();
      const colors = [COLORS.primary, COLORS.info, COLORS.warning, COLORS.danger, COLORS.purple];

      const labels = this.data ? this.data.data.map(d => formatDateLabel(d.date)) : [];
      const datasets = [];

      // Main API
      if (this.data) {
        datasets.push({
          label: this.apiPath,
          data: this.data.data.map(d => d.call_count),
          borderColor: colors[0],
          backgroundColor: 'transparent',
          tension: 0.4
        });
      }

      // Comparison APIs
      this.comparisonApis.forEach((path, index) => {
        const data = this.comparisonData[path];
        if (data && data.data) {
          datasets.push({
            label: path,
            data: data.data.map(d => d.call_count),
            borderColor: colors[(index + 1) % colors.length],
            backgroundColor: 'transparent',
            tension: 0.4
          });
        }
      });

      return { labels, datasets };
    },
    comparisonChartOptions() {
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
  watch: {
    initialApi(newVal) {
      if (newVal && newVal !== this.apiPath) {
        this.apiPath = newVal;
        this.fetchData();
      }
    }
  },
  mounted() {
    if (this.apiPath) {
      this.fetchData();
    }
  },
  methods: {
    async fetchData() {
      if (!this.apiPath) return;

      this.loading = true;
      this.$emit('loading', true);
      try {
        this.data = await apiCallStatsAPI.getApiHistory(this.apiPath, this.selectedDays);
        this.addToSearchHistory(this.apiPath);
      } catch (error) {
        console.error('Failed to fetch API history:', error);
        this.data = null;
      } finally {
        this.loading = false;
        this.$emit('loading', false);
      }
    },
    async addComparisonApi() {
      if (!this.comparisonApiPath || this.comparisonApis.includes(this.comparisonApiPath)) {
        return;
      }

      try {
        const data = await apiCallStatsAPI.getApiHistory(this.comparisonApiPath, this.selectedDays);
        this.comparisonData[this.comparisonApiPath] = data;
        this.comparisonApis.push(this.comparisonApiPath);
        this.comparisonApiPath = '';
      } catch (error) {
        console.error('Failed to fetch comparison API:', error);
      }
    },
    removeComparisonApi(index) {
      const path = this.comparisonApis[index];
      this.comparisonApis.splice(index, 1);
      delete this.comparisonData[path];
    },
    selectFromHistory(path) {
      this.apiPath = path;
      this.fetchData();
    },
    loadSearchHistory() {
      try {
        const history = localStorage.getItem('api_search_history');
        return history ? JSON.parse(history) : [];
      } catch {
        return [];
      }
    },
    addToSearchHistory(path) {
      if (!this.searchHistory.includes(path)) {
        this.searchHistory.unshift(path);
        if (this.searchHistory.length > 5) {
          this.searchHistory.pop();
        }
        localStorage.setItem('api_search_history', JSON.stringify(this.searchHistory));
      }
    }
  }
};
</script>

<style scoped>
.detailed-analysis {
  min-height: 500px;
}

.api-selector {
  padding: var(--spacing-md);
}

.input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.input-group label {
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.search-history {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.search-history label {
  font-size: 14px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.history-tag {
  padding: 4px 12px;
  background: var(--color-background-light);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.history-tag:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary-dark);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
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

.mt-lg {
  margin-top: var(--spacing-lg);
}

.comparison-controls {
  padding: var(--spacing-md);
  background: var(--color-background-light);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.hint {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.comparison-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
}

.comparison-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 6px 12px;
  background: var(--color-primary-light);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-primary-dark);
}

.remove-btn {
  background: none;
  border: none;
  color: var(--color-danger);
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  line-height: 1;
}

.remove-btn:hover {
  color: var(--color-danger);
  transform: scale(1.2);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .detailed-analysis {
    min-height: auto;
  }

  .api-selector {
    padding: var(--spacing-sm);
  }

  .input-group {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-xs);
  }

  .input-group label {
    white-space: normal;
  }

  .search-history {
    flex-direction: column;
    align-items: flex-start;
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

  .mt-lg {
    margin-top: var(--spacing-md);
  }

  .comparison-controls {
    padding: var(--spacing-sm);
  }
}

</style>
