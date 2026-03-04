/**
 * API 调用统计数据处理工具
 */
export function useApiCallStats() {
  /**
   * 将 UTC 时间转换为北京时间（UTC+8）
   * @param {string} utcTimeStr - UTC 时间字符串（格式: "YYYY-MM-DD HH:mm:ss" 或 "YYYY-MM-DD"）
   * @returns {Date} 北京时间 Date 对象
   */
  const utcToBeijing = (utcTimeStr) => {
    // 解析 UTC 时间字符串
    const parts = utcTimeStr.split(/[- :]/);
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // 月份从 0 开始
    const day = parseInt(parts[2]);
    const hour = parseInt(parts[3] || 0);
    const minute = parseInt(parts[4] || 0);
    const second = parseInt(parts[5] || 0);

    // 创建 UTC 时间
    const utcDate = new Date(Date.UTC(year, month, day, hour, minute, second));

    // 加 8 小时得到北京时间
    const beijingDate = new Date(utcDate.getTime() + 8 * 60 * 60 * 1000);
    return beijingDate;
  };

  /**
   * 格式化小时时间戳为 HH:mm（北京时间）
   * @param {string} hourStr - UTC 时间字符串
   * @returns {string} 格式化后的时间（HH:mm）
   */
  const formatHourLabel = (hourStr) => {
    const beijingDate = utcToBeijing(hourStr);
    const hours = beijingDate.getUTCHours().toString().padStart(2, '0');
    const minutes = beijingDate.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  /**
   * 格式化日期为 MM/dd（北京时间）
   * @param {string} dateStr - UTC 日期字符串
   * @returns {string} 格式化后的日期（MM/dd）
   */
  const formatDateLabel = (dateStr) => {
    const beijingDate = utcToBeijing(dateStr);
    // 使用 getUTC* 方法因为我们已经加了 8 小时
    return `${(beijingDate.getUTCMonth() + 1).toString().padStart(2, '0')}/${beijingDate.getUTCDate().toString().padStart(2, '0')}`;
  };

  /**
   * 格式化完整日期时间（北京时间）
   * @param {string} dateTimeStr - UTC 时间字符串
   * @returns {string} 格式化后的日期时间（YYYY-MM-DD HH:mm:ss）
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

  /**
   * 计算 API 使用率
   */
  const calculateUsageRate = (uniqueApis, totalApis) => {
    if (!totalApis || totalApis === 0) return 0;
    return ((uniqueApis / totalApis) * 100).toFixed(1);
  };

  /**
   * 检测异常波动
   * @param {Array} data - 时序数据
   * @param {number} threshold - 阈值倍数（默认 1.5）
   */
  const detectAnomalies = (data, threshold = 1.5) => {
    if (!data || data.length === 0) return [];

    const values = data.map(d => d.total_calls || d.call_count);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const upperThreshold = avg * threshold;
    const lowerThreshold = avg * (1 - (threshold - 1));

    return data.map((point, index) => {
      const value = point.total_calls || point.call_count;
      if (value > upperThreshold) {
        return { ...point, anomaly: 'high', deviation: ((value - avg) / avg * 100).toFixed(1) };
      } else if (value < lowerThreshold) {
        return { ...point, anomaly: 'low', deviation: ((value - avg) / avg * 100).toFixed(1) };
      }
      return point;
    });
  };

  /**
   * 生成环形图数据（Top N vs 其他）
   */
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

  /**
   * 填充缺失的小时数据（将缺失的小时设为 0）
   * @param {Array} data - 原始数据数组 [{ hour: "2026-03-03 19:00:00", total_calls: 332 }]
   * @param {number} hours - 时间范围（小时数）
   * @returns {Array} 填充后的完整数据数组
   */
  const fillMissingHours = (data, hours) => {
    if (!data || data.length === 0) return [];

    // 获取当前 UTC 时间
    const nowUtc = new Date();
    const currentUtcHour = Date.UTC(
      nowUtc.getUTCFullYear(),
      nowUtc.getUTCMonth(),
      nowUtc.getUTCDate(),
      nowUtc.getUTCHours(),
      0, 0, 0
    );

    // 转换为北京时间（UTC+8）
    const currentBeijingHour = currentUtcHour + 8 * 60 * 60 * 1000;

    // 计算起始时间（北京时间）
    const startBeijingHour = currentBeijingHour - (hours - 1) * 60 * 60 * 1000;

    // 创建一个 Map 存储现有数据（使用 UTC 时间字符串作为 key）
    const dataMap = new Map();
    data.forEach(item => {
      dataMap.set(item.hour, item.total_calls);
    });

    // 生成完整的小时序列（北京时间）
    const filledData = [];
    for (let i = 0; i < hours; i++) {
      const beijingTimestamp = startBeijingHour + i * 60 * 60 * 1000;
      const beijingDate = new Date(beijingTimestamp);

      // 转换回 UTC 时间（减去 8 小时）
      const utcTimestamp = beijingTimestamp - 8 * 60 * 60 * 1000;
      const utcDate = new Date(utcTimestamp);

      // 生成 UTC 时间字符串
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
   * 填充缺失的日期数据（将缺失的日期设为 0）
   * @param {Array} data - 原始数据数组 [{ date: "2026-03-03", total_calls: 457 }]
   * @param {number} days - 时间范围（天数）
   * @returns {Array} 填充后的完整数据数组
   */
  const fillMissingDays = (data, days) => {
    if (!data || data.length === 0) return [];

    // 获取当前 UTC 日期
    const nowUtc = new Date();
    const currentUtcDay = Date.UTC(
      nowUtc.getUTCFullYear(),
      nowUtc.getUTCMonth(),
      nowUtc.getUTCDate(),
      0, 0, 0, 0
    );

    // 转换为北京时间（UTC+8）
    const currentBeijingDay = currentUtcDay + 8 * 60 * 60 * 1000;

    // 计算起始日期（北京时间）
    const startBeijingDay = currentBeijingDay - (days - 1) * 24 * 60 * 60 * 1000;

    // 创建一个 Map 存储现有数据（使用 UTC 日期字符串作为 key）
    const dataMap = new Map();
    data.forEach(item => {
      dataMap.set(item.date, item.total_calls || item.call_count);
    });

    // 生成完整的日期序列（北京时间）
    const filledData = [];
    for (let i = 0; i < days; i++) {
      const beijingTimestamp = startBeijingDay + i * 24 * 60 * 60 * 1000;

      // 转换回 UTC 日期（减去 8 小时）
      const utcTimestamp = beijingTimestamp - 8 * 60 * 60 * 1000;
      const utcDate = new Date(utcTimestamp);

      // 生成 UTC 日期字符串
      const utcYear = utcDate.getUTCFullYear();
      const utcMonth = (utcDate.getUTCMonth() + 1).toString().padStart(2, '0');
      const utcDay = utcDate.getUTCDate().toString().padStart(2, '0');
      const utcDateStr = `${utcYear}-${utcMonth}-${utcDay}`;

      filledData.push({
        date: utcDateStr,
        total_calls: dataMap.get(utcDateStr) || 0,
        call_count: dataMap.get(utcDateStr) || 0
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
