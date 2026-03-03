<template>
  <div class="chart-container">
    <div v-if="loading" class="chart-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>載入中...</span>
    </div>
    <div v-show="!loading" ref="chartContainer" class="chart-content"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { Loading } from '@element-plus/icons-vue';

export default {
  name: 'BaseChart',
  components: {
    Loading
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ['line', 'bar', 'pie', 'doughnut'].includes(value)
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
    data() {
      this.updateChart();
    },
    options() {
      this.updateChart();
    }
  },
  mounted() {
    this.initChart();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.chart) {
      this.chart.dispose();
    }
  },
  methods: {
    initChart() {
      if (!this.$refs.chartContainer) return;

      this.chart = echarts.init(this.$refs.chartContainer);
      this.updateChart();
    },
    updateChart() {
      if (!this.chart) return;

      const option = this.convertToEChartsOption();
      this.chart.setOption(option, true);
    },
    convertToEChartsOption() {
      const { type, data, options } = this;

      if (type === 'line') {
        return this.createLineOption(data, options);
      } else if (type === 'bar') {
        return this.createBarOption(data, options);
      } else if (type === 'pie' || type === 'doughnut') {
        return this.createPieOption(data, options, type === 'doughnut');
      }

      return {};
    },
    createLineOption(data, customOptions) {
      const series = (data.datasets || []).map(dataset => ({
        name: dataset.label,
        type: 'line',
        data: dataset.data.map(d => [d.x, d.y]),
        smooth: true,
        lineStyle: {
          width: 2
        }
      }));

      return {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: (data.datasets || []).map(d => d.label),
          top: 5,
          left: 'center'
        },
        grid: {
          left: 50,
          right: 20,
          top: 40,
          bottom: 30,
          containLabel: true
        },
        xAxis: {
          type: 'time'
        },
        yAxis: {
          type: 'value'
        },
        series,
        ...customOptions
      };
    },
    createBarOption(data, customOptions) {
      const series = (data.datasets || []).map(dataset => ({
        name: dataset.label,
        type: 'bar',
        data: dataset.data
      }));

      return {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: (data.datasets || []).map(d => d.label),
          top: 5,
          left: 'center'
        },
        grid: {
          left: 50,
          right: 20,
          top: 40,
          bottom: 30,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.labels || []
        },
        yAxis: {
          type: 'value'
        },
        series,
        ...customOptions
      };
    },
    createPieOption(data, customOptions, isDoughnut) {
      const seriesData = (data.labels || []).map((label, index) => ({
        name: label,
        value: data.datasets[0].data[index]
      }));

      return {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'middle',
          data: data.labels || [],
          textStyle: {
            fontSize: 12
          }
        },
        series: [
          {
            name: '數據',
            type: 'pie',
            radius: isDoughnut ? ['40%', '70%'] : '65%',
            center: ['35%', '50%'],
            data: seriesData,
            label: {
              fontSize: 11
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ],
        ...customOptions
      };
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize();
      }
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

.chart-content {
  width: 100%;
  height: 100%;
}
</style>
