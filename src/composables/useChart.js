/**
 * Chart utilities and configurations
 */

// Apple green theme colors
const COLORS = {
  primary: '#52c41a',
  primaryDark: '#389e0d',
  primaryLight: '#95de64',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  info: '#1890ff',
  purple: '#722ed1',
  cyan: '#13c2c2',
  orange: '#fa8c16',
  gray: '#8c8c8c'
};

// Color palette for charts
const CHART_COLORS = [
  COLORS.primary,
  COLORS.info,
  COLORS.warning,
  COLORS.purple,
  COLORS.cyan,
  COLORS.orange,
  COLORS.danger,
  COLORS.gray
];

export function useChart() {
  /**
   * Generate chart colors with optional transparency
   */
  const getChartColors = (count = 1, alpha = 1) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const color = CHART_COLORS[i % CHART_COLORS.length];
      if (alpha < 1) {
        colors.push(hexToRgba(color, alpha));
      } else {
        colors.push(color);
      }
    }
    return colors;
  };

  /**
   * Convert hex color to rgba
   */
  const hexToRgba = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  /**
   * Create line chart configuration
   */
  const createLineChartData = (labels, datasets) => {
    return {
      labels,
      datasets: datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        borderColor: dataset.borderColor || CHART_COLORS[index],
        backgroundColor: dataset.backgroundColor || hexToRgba(CHART_COLORS[index], 0.1),
        borderWidth: 2,
        tension: 0.4,
        fill: dataset.fill !== undefined ? dataset.fill : true,
        pointRadius: 3,
        pointHoverRadius: 5,
        ...dataset
      }))
    };
  };

  /**
   * Create bar chart configuration
   */
  const createBarChartData = (labels, datasets) => {
    return {
      labels,
      datasets: datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.backgroundColor || CHART_COLORS[index],
        borderColor: dataset.borderColor || CHART_COLORS[index],
        borderWidth: 1,
        ...dataset
      }))
    };
  };

  /**
   * Create pie/doughnut chart configuration
   */
  const createPieChartData = (labels, data, options = {}) => {
    const colors = getChartColors(labels.length);
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: options.backgroundColor || colors,
        borderColor: '#fff',
        borderWidth: 2,
        ...options
      }]
    };
  };

  /**
   * Format number with K/M/B suffix
   */
  const formatNumber = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  /**
   * Format bytes to human readable
   */
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Create time series chart options
   */
  const createTimeSeriesOptions = (options = {}) => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (options.formatValue) {
                label += options.formatValue(context.parsed.y);
              } else {
                label += context.parsed.y;
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: options.timeUnit || 'day',
            displayFormats: {
              hour: 'HH:mm',
              day: 'MM/dd',
              week: 'MM/dd',
              month: 'yyyy/MM'
            }
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => {
              if (options.formatValue) {
                return options.formatValue(value);
              }
              return value;
            }
          }
        }
      },
      ...options.customOptions
    };
  };

  /**
   * Aggregate data by time period
   */
  const aggregateByTime = (data, timeField, valueField, period = 'day') => {
    const grouped = {};

    data.forEach(item => {
      const date = new Date(item[timeField]);
      let key;

      if (period === 'hour') {
        key = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime();
      } else if (period === 'day') {
        key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      } else if (period === 'week') {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        key = new Date(date.getFullYear(), date.getMonth(), diff).getTime();
      } else if (period === 'month') {
        key = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      }

      if (!grouped[key]) {
        grouped[key] = 0;
      }
      grouped[key] += item[valueField] || 1;
    });

    return Object.entries(grouped)
      .map(([timestamp, value]) => ({
        x: parseInt(timestamp),
        y: value
      }))
      .sort((a, b) => a.x - b.x);
  };

  return {
    COLORS,
    CHART_COLORS,
    getChartColors,
    hexToRgba,
    createLineChartData,
    createBarChartData,
    createPieChartData,
    formatNumber,
    formatBytes,
    createTimeSeriesOptions,
    aggregateByTime
  };
}

