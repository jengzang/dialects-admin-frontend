/**
 * useApiStats Composable
 * API 统计计算工具
 *
 * 使用方式：
 * import { useApiStats } from '@/composables/useApiStats';
 *
 * const { calculateUserStats, calculateIPStats, calculateApiCalls } = useApiStats();
 */

export function useApiStats() {
  /**
   * 计算用户统计信息
   * @param {Array} apiLogs - API 日志数组
   * @returns {Object} 用户统计结果
   */
  const calculateUserStats = (apiLogs) => {
    if (!apiLogs || apiLogs.length === 0) {
      return {
        uniqueUsers: [],
        uniqueUsersCount: 0,
        userStats: []
      };
    }

    // 获取唯一用户列表
    const uniqueUsers = [...new Set(apiLogs.map(log => log.user || ''))];
    const uniqueUsersCount = uniqueUsers.length;

    // 计算每个用户的统计信息
    const userStats = uniqueUsers.map(user => {
      const userLogs = apiLogs.filter(log => log.user === user);
      const totalDuration = userLogs.reduce((acc, log) => acc + (log.duration || 0), 0);
      const occurrenceCount = userLogs.length;
      const totalUploadTraffic = userLogs.reduce((acc, log) => acc + (log.request_size || 0), 0);
      const totalDownloadTraffic = userLogs.reduce((acc, log) => acc + (log.response_size || 0), 0);

      return {
        user: user || '匿名用戶',
        totalDuration: totalDuration.toFixed(3),
        occurrenceCount,
        totalUploadTraffic: (totalUploadTraffic / 1024).toFixed(2), // KB
        totalDownloadTraffic: (totalDownloadTraffic / (1024 * 1024)).toFixed(2) // MB
      };
    });

    // 按总使用时长排序
    userStats.sort((a, b) => parseFloat(b.totalDuration) - parseFloat(a.totalDuration));

    return {
      uniqueUsers,
      uniqueUsersCount,
      userStats
    };
  };

  /**
   * 计算 IP 统计信息
   * @param {Array} apiLogs - API 日志数组
   * @returns {Object} IP 统计结果
   */
  const calculateIPStats = (apiLogs) => {
    if (!apiLogs || apiLogs.length === 0) {
      return {
        uniqueIPs: [],
        uniqueIPsCount: 0,
        ipStats: []
      };
    }

    // 获取唯一 IP 列表
    const uniqueIPs = [...new Set(apiLogs.map(log => log.ip))];
    const uniqueIPsCount = uniqueIPs.length;

    // 计算每个 IP 的统计信息
    const ipStats = uniqueIPs.map(ip => {
      const ipLogs = apiLogs.filter(log => log.ip === ip);
      const totalDuration = ipLogs.reduce((acc, log) => acc + (log.duration || 0), 0);
      const occurrenceCount = ipLogs.length;
      const totalUploadTraffic = ipLogs.reduce((acc, log) => acc + (log.request_size || 0), 0);
      const totalDownloadTraffic = ipLogs.reduce((acc, log) => acc + (log.response_size || 0), 0);

      return {
        ip,
        totalDuration: totalDuration.toFixed(3),
        occurrenceCount,
        totalUploadTraffic: (totalUploadTraffic / 1024).toFixed(2), // KB
        totalDownloadTraffic: (totalDownloadTraffic / (1024 * 1024)).toFixed(2) // MB
      };
    });

    // 按总使用时长排序
    ipStats.sort((a, b) => parseFloat(b.totalDuration) - parseFloat(a.totalDuration));

    return {
      uniqueIPs,
      uniqueIPsCount,
      ipStats
    };
  };

  /**
   * 计算 API 调用统计
   * @param {Array} apiLogs - API 日志数组
   * @returns {Object} API 调用统计结果
   */
  const calculateApiCalls = (apiLogs) => {
    if (!apiLogs || apiLogs.length === 0) {
      return {
        apiCalls: {},
        totalAPICalls: 0
      };
    }

    let totalAPICalls = 0;

    const apiCalls = apiLogs.reduce((acc, log) => {
      const path = log.path || 'unknown';

      if (!acc[path]) {
        acc[path] = {
          count: 0,
          totalDuration: 0,
          totalUploadTraffic: 0,
          totalDownloadTraffic: 0
        };
      }

      acc[path].count += 1;
      acc[path].totalDuration += log.duration || 0;
      acc[path].totalUploadTraffic += (log.request_size / 1024) || 0; // KB
      acc[path].totalDownloadTraffic += (log.response_size / (1024 * 1024)) || 0; // MB

      totalAPICalls += 1;

      return acc;
    }, {});

    // 格式化数值
    Object.keys(apiCalls).forEach(path => {
      apiCalls[path].totalDuration = apiCalls[path].totalDuration.toFixed(3);
      apiCalls[path].totalUploadTraffic = apiCalls[path].totalUploadTraffic.toFixed(2);
      apiCalls[path].totalDownloadTraffic = apiCalls[path].totalDownloadTraffic.toFixed(2);
    });

    return {
      apiCalls,
      totalAPICalls
    };
  };

  /**
   * 处理 API 日志，添加流量字段
   * @param {Array} apiLogs - API 日志数组
   * @returns {Array} 处理后的日志数组
   */
  const processApiLogs = (apiLogs) => {
    if (!apiLogs || apiLogs.length === 0) return [];

    return apiLogs.map(log => ({
      ...log,
      uploadTraffic: ((log.request_size || 0) / 1024).toFixed(2), // KB
      downloadTraffic: ((log.response_size || 0) / 1024).toFixed(2) // KB
    }));
  };

  /**
   * 计算总流量
   * @param {Array} apiLogs - API 日志数组
   * @returns {Object} 总流量统计
   */
  const calculateTotalTraffic = (apiLogs) => {
    if (!apiLogs || apiLogs.length === 0) {
      return {
        totalUpload: '0.00',
        totalDownload: '0.00'
      };
    }

    const totalUpload = apiLogs.reduce((acc, log) => acc + (log.request_size || 0), 0);
    const totalDownload = apiLogs.reduce((acc, log) => acc + (log.response_size || 0), 0);

    return {
      totalUpload: (totalUpload / (1024 * 1024)).toFixed(2), // MB
      totalDownload: (totalDownload / (1024 * 1024)).toFixed(2) // MB
    };
  };

  /**
   * 计算所有统计信息
   * @param {Array} apiLogs - API 日志数组
   * @returns {Object} 完整的统计结果
   */
  const calculateAllStats = (apiLogs) => {
    const processedLogs = processApiLogs(apiLogs);
    const userStats = calculateUserStats(processedLogs);
    const ipStats = calculateIPStats(processedLogs);
    const apiCallStats = calculateApiCalls(processedLogs);
    const trafficStats = calculateTotalTraffic(processedLogs);

    return {
      processedLogs,
      ...userStats,
      ...ipStats,
      ...apiCallStats,
      ...trafficStats
    };
  };

  return {
    calculateUserStats,
    calculateIPStats,
    calculateApiCalls,
    processApiLogs,
    calculateTotalTraffic,
    calculateAllStats
  };
}
