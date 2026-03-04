<template>
  <div class="api-ranking">
    <!-- Loading State -->
    <BaseLoading v-if="loading && !data" message="載入中..." />

    <!-- Content -->
    <div v-else>
      <!-- Control Bar -->
      <div class="control-bar">
        <!-- Query Mode Selector -->
        <div class="control-group mode-selector">
          <label>查詢模式：</label>
          <div class="radio-group">
            <label class="radio-label">
              <input
                type="radio"
                value="all"
                v-model="queryMode"
                @change="handleModeChange"
              />
              <span>全時段</span>
            </label>
            <label class="radio-label">
              <input
                type="radio"
                value="range"
                v-model="queryMode"
                @change="handleModeChange"
              />
              <span>日期範圍</span>
            </label>
            <label class="radio-label">
              <input
                type="radio"
                value="date"
                v-model="queryMode"
                @change="handleModeChange"
              />
              <span>指定日期</span>
            </label>
          </div>
        </div>

        <!-- Days Range Selector (Mode 2) -->
        <div class="control-group" v-if="queryMode === 'range'">
          <label>日期範圍：</label>
          <BaseSelect
            v-model="selectedDays"
            :options="daysOptions"
            @change="fetchData"
          />
        </div>

        <!-- Date Selector (Mode 3) -->
        <div class="control-group" v-if="queryMode === 'date'">
          <label>查詢日期：</label>
          <input
            type="date"
            v-model="selectedDate"
            @change="fetchData"
            class="date-input"
          />
        </div>

        <!-- Top N Selector -->
        <div class="control-group">
          <label>Top N：</label>
          <BaseSelect
            v-model="selectedLimit"
            :options="limitOptions"
            @change="fetchData"
          />
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <StatsCard
          :number="totalCalls"
          label="總調用次數"
          :color="COLORS.primary"
        />
        <StatsCard
          :number="uniqueApis"
          label="活躍 API 數量"
          :color="COLORS.info"
        />
        <StatsCard
          :number="topNCalls"
          :label="`Top ${selectedLimit} 調用次數`"
          :color="COLORS.warning"
        />
        <StatsCard
          :number="`${topNPercentage}%`"
          :label="`Top ${selectedLimit} 占比`"
          :color="COLORS.purple"
        />
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <!-- Donut Chart -->
        <BaseCard title="流量集中度分析" class="chart-card">
          <BaseChart
            type="doughnut"
            :data="donutChartData"
            :options="donutChartOptions"
            :height="300"
          />
          <div class="chart-hint">
            Top {{ selectedLimit }} API 占據了 {{ topNPercentage }}% 的流量
          </div>
        </BaseCard>

        <!-- Ranking Table -->
        <BaseCard title="API 排行榜" class="chart-card">
          <BaseTable
            :columns="tableColumns"
            :data="rankingData"
          >
            <template #cell-rank="{ value }">
              <span class="rank-badge" :class="`rank-${value}`">
                {{ value }}
              </span>
            </template>
            <template #cell-percentage="{ value }">
              <span class="percentage">{{ value }}%</span>
            </template>
            <template #actions="{ row }">
              <button class="btn btn-sm" @click="viewDetail(row.path)">
                查看詳情
              </button>
            </template>
          </BaseTable>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script>
import { BaseChart, StatsCard, BaseCard, BaseTable, BaseSelect, BaseLoading } from '@/components/common';
import { apiCallStatsAPI } from '@/api/apiCallStats';
import { useApiCallStats } from '@/composables/useApiCallStats';
import { useChart } from '@/composables/useChart';

export default {
  name: 'ApiRanking',
  components: {
    BaseChart,
    StatsCard,
    BaseCard,
    BaseTable,
    BaseSelect,
    BaseLoading
  },
  data() {
    return {
      loading: false,
      data: null,
      queryMode: 'all', // 'all' | 'range' | 'date'
      selectedDate: this.getTodayDate(),
      selectedDays: 7,
      selectedLimit: 10,
      daysOptions: [
        { label: '最近 7 天', value: 7 },
        { label: '最近 14 天', value: 14 },
        { label: '最近 30 天', value: 30 },
        { label: '最近 90 天', value: 90 }
      ],
      limitOptions: [
        { label: 'Top 10', value: 10 },
        { label: 'Top 20', value: 20 },
        { label: 'Top 50', value: 50 }
      ],
      tableColumns: [
        { key: 'rank', label: '排名', sortable: false },
        { key: 'path', label: 'API 路徑', sortable: false },
        { key: 'call_count', label: '調用次數', sortable: true },
        { key: 'percentage', label: '占比', sortable: true }
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
      if (!this.data) return 0;
      return this.data.total_calls || 0;
    },
    uniqueApis() {
      if (!this.data) return 0;
      return this.data.unique_apis || 0;
    },
    topNCalls() {
      if (!this.data) return 0;
      return this.data.top_n_calls || 0;
    },
    topNPercentage() {
      if (!this.data) return 0;
      return (this.data.top_n_percentage || 0).toFixed(1);
    },
    rankingData() {
      if (!this.data || !this.data.ranking) return [];
      return this.data.ranking;
    },
    donutChartData() {
      if (!this.data) return { labels: [], datasets: [] };

      const { generateDonutData } = useApiCallStats();
      const donutData = generateDonutData(this.topNCalls, this.totalCalls);

      return {
        labels: [`Top ${this.selectedLimit} API`, '其他 API'],
        datasets: [{
          data: donutData.datasets[0].data,
          backgroundColor: [this.COLORS.primary, '#e0e0e0'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      };
    },
    donutChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const percentage = ((value / this.totalCalls) * 100).toFixed(1);
                return `${label}: ${value.toLocaleString()} (${percentage}%)`;
              }
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
    getTodayDate() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    },
    handleModeChange() {
      // 切换模式时立即重新加载数据
      this.fetchData();
    },
    async fetchData() {
      this.loading = true;
      this.$emit('loading', true);
      try {
        const options = { limit: this.selectedLimit };

        // 根据查询模式设置参数
        if (this.queryMode === 'date') {
          // 模式 3：指定日期
          options.date = this.selectedDate;
        } else if (this.queryMode === 'range') {
          // 模式 2：日期范围
          options.days = this.selectedDays;
        }
        // 模式 1：全时段（不传 date 和 days）

        this.data = await apiCallStatsAPI.getRanking(options);
      } catch (error) {
        console.error('Failed to fetch ranking:', error);
      } finally {
        this.loading = false;
        this.$emit('loading', false);
      }
    },
    viewDetail(apiPath) {
      this.$emit('view-detail', apiPath);
    }
  }
};
</script>

<style scoped>
.api-ranking {
  min-height: 500px;
}

.control-bar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-background-light);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.control-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.control-group label {
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.mode-selector {
  flex: 1;
  min-width: 300px;
}

.radio-group {
  display: flex;
  gap: var(--spacing-md);
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: normal;
}

.radio-label input[type="radio"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.radio-label span {
  color: var(--color-text-secondary);
  transition: color 0.2s;
}

.radio-label input[type="radio"]:checked + span {
  color: var(--color-primary);
  font-weight: 500;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-lg);
}

.chart-card {
  min-height: 400px;
}

.chart-hint {
  text-align: center;
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--color-background-light);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: 14px;
}

.rank-badge {
  display: inline-block;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border-radius: 50%;
  font-weight: bold;
  color: white;
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #C0C0C0, #A9A9A9);
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #CD7F32, #8B4513);
}

.rank-badge:not(.rank-1):not(.rank-2):not(.rank-3) {
  background: var(--color-primary);
}

.percentage {
  color: var(--color-primary);
  font-weight: 500;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .api-ranking {
    min-height: auto;
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

  .mode-selector {
    min-width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }

  .radio-group {
    width: 100%;
    justify-content: space-between;
    gap: var(--spacing-sm);
  }

  .radio-label {
    flex: 1;
    justify-content: center;
    padding: 8px;
    background: var(--color-background);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border-light);
  }

  .radio-label input[type="radio"]:checked {
    accent-color: var(--color-primary);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .charts-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .chart-card {
    min-height: 300px;
  }

  .rank-badge {
    width: 24px;
    height: 24px;
    line-height: 24px;
    font-size: 12px;
  }
}

</style>
