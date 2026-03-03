<template>
  <div class="chart-container">
    <div v-if="loading" class="chart-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>載入中...</span>
    </div>
    <canvas v-show="!loading" ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { zhCN } from 'date-fns/locale';

Chart.register(...registerables);

export default {
  name: 'BaseChart',
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ['line', 'bar', 'pie', 'doughnut', 'radar', 'polarArea'].includes(value)
    },
    data: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    },
    height: {
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      chart: null
    };
  },
  watch: {
    data: {
      handler() {
        this.updateChart();
      },
      deep: true
    },
    options: {
      handler() {
        this.updateChart();
      },
      deep: true
    }
  },
  mounted() {
    this.initChart();
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  methods: {
    initChart() {
      if (!this.$refs.chartCanvas) return;

      const ctx = this.$refs.chartCanvas.getContext('2d');
      const defaultOptions = this.getDefaultOptions();
      const mergedOptions = this.mergeOptions(defaultOptions, this.options);

      this.chart = new Chart(ctx, {
        type: this.type,
        data: this.data,
        options: mergedOptions
      });
    },
    updateChart() {
      if (!this.chart) return;

      this.chart.data = this.data;
      const defaultOptions = this.getDefaultOptions();
      const mergedOptions = this.mergeOptions(defaultOptions, this.options);
      this.chart.options = mergedOptions;
      this.chart.update();
    },
    getDefaultOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                size: 12
              },
              padding: 15,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            cornerRadius: 4
          }
        },
        scales: this.getDefaultScales()
      };
    },
    getDefaultScales() {
      if (['pie', 'doughnut', 'radar', 'polarArea'].includes(this.type)) {
        return undefined;
      }

      return {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              size: 11
            }
          }
        }
      };
    },
    mergeOptions(defaults, custom) {
      return {
        ...defaults,
        ...custom,
        plugins: {
          ...defaults.plugins,
          ...custom.plugins
        },
        scales: custom.scales || defaults.scales
      };
    }
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: v-bind('height + "px"');
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary, #666);
  gap: 8px;
}

.chart-loading .el-icon {
  font-size: 24px;
}

canvas {
  max-width: 100%;
  max-height: 100%;
}
</style>
