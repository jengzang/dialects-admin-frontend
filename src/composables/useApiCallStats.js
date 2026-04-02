/**
 * API 调用统计数据处理工具
 */
export function useApiCallStats() {
  const SHANGHAI_TIME_ZONE = 'Asia/Shanghai';
  const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

  const formatShanghaiParts = (date, options) => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: SHANGHAI_TIME_ZONE,
      ...options
    });

    return formatter.formatToParts(date).reduce((acc, part) => {
      if (part.type !== 'literal') {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});
  };

  const getTodayShanghaiDate = () => {
    const parts = formatShanghaiParts(new Date(), {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    return `${parts.year}-${parts.month}-${parts.day}`;
  };

  const addDaysToDateString = (dateStr, offsetDays) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + offsetDays));

    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  };

  /**
   * 将 UTC 时间转换为北京时间（UTC+8）
   * @param {string} utcTimeStr - UTC 时间字符串（格式: "YYYY-MM-DD HH:mm:ss" 或 "YYYY-MM-DDTHH:mm:ssZ"）
   * @returns {Date} 北京时间 Date 对象
   */
  const utcToBeijing = (utcTimeStr) => {
    const parts = utcTimeStr.split(/[- :TZ]/).filter(Boolean);
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const hour = parseInt(parts[3] || 0, 10);
    const minute = parseInt(parts[4] || 0, 10);
    const second = parseInt(parts[5] || 0, 10);

    const utcDate = new Date(Date.UTC(year, month, day, hour, minute, second));
    return new Date(utcDate.getTime() + 8 * 60 * 60 * 1000);
  };

  /**
   * 格式化小时标签为 HH:mm（北京时间）
   */
  const formatHourLabel = (hourStr) => {
    const beijingDate = utcToBeijing(hourStr);
    const hours = beijingDate.getUTCHours().toString().padStart(2, '0');
    const minutes = beijingDate.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  /**
   * 格式化日期标签为 MM/dd。
   * 对已经按 Asia/Shanghai 聚合的 YYYY-MM-DD，不再做时区换算。
   */
  const formatDateLabel = (dateStr) => {
    if (DATE_ONLY_RE.test(dateStr)) {
      const [, month, day] = dateStr.split('-');
      return `${month}/${day}`;
    }

    const beijingDate = utcToBeijing(dateStr);
    return `${(beijingDate.getUTCMonth() + 1).toString().padStart(2, '0')}/${beijingDate.getUTCDate().toString().padStart(2, '0')}`;
  };

  /**
   * 格式化完整日期时间（北京时间）
   */
  const formatDateTime = (dateTimeStr) => {
    const beijingDate = utcToBeijing(dateTimeStr);
    const year = beijingDate.getUTCFullYear();
    const month = (beijingDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = beijingDate.getUTCDate().toString().padStart(2, '0');
    const hours = beijingDate.getUTCHours().toString().padStart(2, '0');
    const minutes = beijingDate.getUTCMinutes().toString().padStart(2, '0');
    const seconds = beijingDate.getUTCSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const calculateUsageRate = (uniqueApis, totalApis) => {
    if (!totalApis || totalApis === 0) return 0;
    return ((uniqueApis / totalApis) * 100).toFixed(1);
  };

  const detectAnomalies = (data, threshold = 1.5) => {
    if (!data || data.length === 0) return [];

    const values = data.map(d => d.total_calls || d.call_count);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const upperThreshold = avg * threshold;
    const lowerThreshold = avg * (1 - (threshold - 1));

    return data.map((point) => {
      const value = point.total_calls || point.call_count;
      if (value > upperThreshold) {
        return { ...point, anomaly: 'high', deviation: ((value - avg) / avg * 100).toFixed(1) };
      } else if (value < lowerThreshold) {
        return { ...point, anomaly: 'low', deviation: ((value - avg) / avg * 100).toFixed(1) };
      }
      return point;
    });
  };

  const generateDonutData = (topNCalls, totalCalls) => {
    const otherCalls = totalCalls - topNCalls;
    return {
      labels: ['Top N API', '其他 API'],
      datasets: [{
        data: [topNCalls, otherCalls],
        backgroundColor: ['#52c41a', '#d9d9d9']
      }]
    };
  };

  const fillMissingHours = (data, hours) => {
    if (!data || data.length === 0) return [];

    const nowUtc = new Date();
    const currentUtcHour = Date.UTC(
      nowUtc.getUTCFullYear(),
      nowUtc.getUTCMonth(),
      nowUtc.getUTCDate(),
      nowUtc.getUTCHours(),
      0, 0, 0
    );

    const currentBeijingHour = currentUtcHour + 8 * 60 * 60 * 1000;
    const startBeijingHour = currentBeijingHour - (hours - 1) * 60 * 60 * 1000;

    const dataMap = new Map();
    data.forEach(item => {
      dataMap.set(item.hour, item.total_calls);
    });

    const filledData = [];
    for (let i = 0; i < hours; i++) {
      const beijingTimestamp = startBeijingHour + i * 60 * 60 * 1000;
      const utcTimestamp = beijingTimestamp - 8 * 60 * 60 * 1000;
      const utcDate = new Date(utcTimestamp);

      const utcYear = utcDate.getUTCFullYear();
      const utcMonth = (utcDate.getUTCMonth() + 1).toString().padStart(2, '0');
      const utcDay = utcDate.getUTCDate().toString().padStart(2, '0');
      const utcHour = utcDate.getUTCHours().toString().padStart(2, '0');
      const utcTimeStr = `${utcYear}-${utcMonth}-${utcDay} ${utcHour}:00:00`;

      filledData.push({
        hour: utcTimeStr,
        total_calls: dataMap.get(utcTimeStr) || 0
      });
    }

    return filledData;
  };

  /**
   * 补齐缺失的日期数据。
   * 这里的 date 已经是 Asia/Shanghai 自然日，必须直接按日期字符串处理。
   */
  const fillMissingDays = (data, days) => {
    if (!data || data.length === 0) return [];

    const todayShanghai = getTodayShanghaiDate();
    const startDate = addDaysToDateString(todayShanghai, -(days - 1));

    const dataMap = new Map();
    data.forEach(item => {
      dataMap.set(item.date, item.total_calls || item.call_count);
    });

    const filledData = [];
    for (let i = 0; i < days; i++) {
      const dateStr = addDaysToDateString(startDate, i);
      const value = dataMap.get(dateStr) || 0;
      filledData.push({
        date: dateStr,
        total_calls: value,
        call_count: value
      });
    }

    return filledData;
  };

  return {
    utcToBeijing,
    formatHourLabel,
    formatDateLabel,
    formatDateTime,
    calculateUsageRate,
    detectAnomalies,
    generateDonutData,
    fillMissingHours,
    fillMissingDays
  };
}
