/**
 * 用户行为分析工具
 */

export function useUserBehavior() {
  /**
   * 计算活跃用户数（DAU/WAU/MAU）
   * @param {Array} logs - 登录日志数组
   * @param {number} days - 天数（1=DAU, 7=WAU, 30=MAU）
   * @returns {number} 活跃用户数
   */
  const calculateActiveUsers = (logs, days) => {
    if (!logs || logs.length === 0) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const activeUsernames = new Set(
      logs
        .filter(log => {
          const logDate = new Date(log.timestamp || log.login_time || log.created_at);
          return logDate >= cutoffDate;
        })
        .map(log => log.username || log.user)
    );

    return activeUsernames.size;
  };

  /**
   * 用户分群
   * @param {Array} users - 用户列表
   * @returns {Object} 分群结果 { high, medium, low, dormant }
   */
  const segmentUsers = (users) => {
    if (!users || users.length === 0) {
      return { high: [], medium: [], low: [], dormant: [] };
    }

    const now = new Date();
    const segments = {
      high: [],      // 高活跃：7天内登录≥5次
      medium: [],    // 中等活跃：7天内登录2-4次
      low: [],       // 低活跃：7天内登录1次
      dormant: []    // 休眠：7天未登录
    };

    users.forEach(user => {
      if (!user.last_login) {
        segments.dormant.push(user);
        return;
      }

      const lastLoginDate = new Date(user.last_login);
      const daysSinceLogin = (now - lastLoginDate) / (1000 * 60 * 60 * 24);

      if (daysSinceLogin > 7) {
        segments.dormant.push(user);
      } else {
        // 根据登录次数判断活跃度
        const loginCount = user.login_count || 0;
        const loginFrequency = loginCount / Math.max(daysSinceLogin, 1);

        if (loginFrequency >= 0.7 || loginCount >= 5) {
          segments.high.push(user);
        } else if (loginFrequency >= 0.3 || loginCount >= 2) {
          segments.medium.push(user);
        } else {
          segments.low.push(user);
        }
      }
    });

    return segments;
  };

  /**
   * 生成活跃时段热力图数据
   * @param {Array} logs - 登录日志数组
   * @returns {Array} 7x24 的二维数组，[day][hour] = count
   */
  const generateHeatmapData = (logs) => {
    // 初始化 7天 x 24小时 的矩阵
    const heatmap = Array(7).fill(0).map(() => Array(24).fill(0));

    if (!logs || logs.length === 0) return heatmap;

    logs.forEach(log => {
      const date = new Date(log.timestamp || log.login_time || log.created_at);
      if (isNaN(date.getTime())) return;

      const day = date.getDay(); // 0-6 (Sunday-Saturday)
      const hour = date.getHours(); // 0-23
      heatmap[day][hour]++;
    });

    return heatmap;
  };

  /**
   * 计算用户风险评分
   * @param {Object} userStats - 用户统计数据
   * @param {Array} sessions - 用户会话列表
   * @returns {number} 风险评分 (0-100)
   */
  const calculateRiskScore = (userStats, sessions) => {
    if (!userStats) return 0;
    if (!sessions || sessions.length === 0) return 0;

    // 1. 登录失败率 (0-30分)
    const loginCount = Math.max(userStats.login_count || 0, 1);
    const failedAttempts = userStats.failed_attempts || 0;
    const failureRate = failedAttempts / loginCount;
    const failureScore = Math.min(failureRate * 100, 30);

    // 2. IP 变更频率 (0-25分)
    const avgIpChanges = sessions.reduce((sum, s) => sum + (s.ip_change_count || 0), 0) / sessions.length;
    const ipChangeScore = Math.min(avgIpChanges * 10, 25);

    // 3. 设备变更频率 (0-20分)
    const avgDeviceChanges = sessions.reduce((sum, s) => sum + (s.device_change_count || 0), 0) / sessions.length;
    const deviceChangeScore = Math.min(avgDeviceChanges * 10, 20);

    // 4. 可疑会话比例 (0-25分)
    const suspiciousCount = sessions.filter(s => s.is_suspicious).length;
    const suspiciousRate = suspiciousCount / sessions.length;
    const suspiciousScore = suspiciousRate * 25;

    // 总分
    const totalScore = failureScore + ipChangeScore + deviceChangeScore + suspiciousScore;

    return Math.min(Math.round(totalScore), 100);
  };

  /**
   * 获取风险等级
   * @param {number} score - 风险评分
   * @returns {Object} { level, color, label }
   */
  const getRiskLevel = (score) => {
    if (score >= 61) {
      return { level: 'high', color: '#ff4d4f', label: '高風險' };
    } else if (score >= 31) {
      return { level: 'medium', color: '#faad14', label: '中風險' };
    } else {
      return { level: 'low', color: '#52c41a', label: '低風險' };
    }
  };

  /**
   * 计算留存率
   * @param {Array} users - 用户列表
   * @param {Array} logs - 登录日志
   * @param {number} days - 天数（1/7/30）
   * @returns {number} 留存率百分比
   */
  const calculateRetention = (users, logs, days) => {
    if (!users || users.length === 0) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // 获取 N 天前注册的用户
    const cohortUsers = users.filter(u => {
      const registerDate = new Date(u.created_at || u.last_login);
      return registerDate <= cutoffDate && !isNaN(registerDate.getTime());
    });

    if (cohortUsers.length === 0) return 0;

    // 计算这些用户中有多少在最近登录过
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 1);

    const activeUsers = cohortUsers.filter(u => {
      const lastLogin = new Date(u.last_login);
      return lastLogin >= recentDate && !isNaN(lastLogin.getTime());
    });

    return Math.round((activeUsers.length / cohortUsers.length) * 100);
  };

  /**
   * 识别流失用户
   * @param {Array} users - 用户列表
   * @param {number} days - 流失天数阈值（默认7天）
   * @returns {Array} 流失用户列表
   */
  const identifyChurnedUsers = (users, days = 7) => {
    if (!users || users.length === 0) return [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return users.filter(u => {
      if (!u.last_login) return true;
      const lastLogin = new Date(u.last_login);
      return lastLogin < cutoffDate && !isNaN(lastLogin.getTime());
    }).map(u => ({
      ...u,
      churnDays: Math.floor((new Date() - new Date(u.last_login)) / (1000 * 60 * 60 * 24))
    }));
  };

  /**
   * 识别异常用户
   * @param {Array} users - 用户列表
   * @param {Object} sessionsMap - 用户会话映射 { userId: sessions[] }
   * @returns {Array} 异常用户列表
   */
  const identifyAnomalousUsers = (users, sessionsMap) => {
    if (!users || users.length === 0) return [];

    const anomalousUsers = [];

    users.forEach(user => {
      const sessions = sessionsMap[user.id] || [];
      const riskScore = calculateRiskScore(user, sessions);
      const anomalies = [];

      // 检测异常类型
      if (user.failed_attempts > 5) {
        anomalies.push({ type: 'login_failure', label: '多次登錄失敗', icon: '🔴' });
      }

      if (sessions.length > 0) {
        const avgIpChanges = sessions.reduce((sum, s) => sum + (s.ip_change_count || 0), 0) / sessions.length;
        if (avgIpChanges > 2) {
          anomalies.push({ type: 'ip_change', label: '頻繁 IP 變更', icon: '🟠' });
        }

        const avgDeviceChanges = sessions.reduce((sum, s) => sum + (s.device_change_count || 0), 0) / sessions.length;
        if (avgDeviceChanges > 2) {
          anomalies.push({ type: 'device_change', label: '頻繁設備變更', icon: '🟡' });
        }

        const suspiciousCount = sessions.filter(s => s.is_suspicious).length;
        if (suspiciousCount > 0) {
          anomalies.push({ type: 'suspicious_session', label: '可疑會話', icon: '🟣' });
        }
      }

      if (riskScore >= 31 || anomalies.length > 0) {
        anomalousUsers.push({
          ...user,
          riskScore,
          riskLevel: getRiskLevel(riskScore),
          anomalies
        });
      }
    });

    return anomalousUsers.sort((a, b) => b.riskScore - a.riskScore);
  };

  /**
   * 计算活跃度趋势
   * @param {Array} logs - 登录日志
   * @param {number} days - 天数
   * @returns {Array} 每日活跃用户数 [{ date, count }]
   */
  const calculateActivityTrend = (logs, days = 30) => {
    if (!logs || logs.length === 0) return [];

    const trend = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const activeUsers = new Set(
        logs
          .filter(log => {
            const logDate = new Date(log.timestamp || log.login_time || log.created_at);
            return logDate >= date && logDate < nextDate;
          })
          .map(log => log.username || log.user)
      );

      trend.push({
        date: date.getTime(),
        count: activeUsers.size
      });
    }

    return trend;
  };

  return {
    calculateActiveUsers,
    segmentUsers,
    generateHeatmapData,
    calculateRiskScore,
    getRiskLevel,
    calculateRetention,
    identifyChurnedUsers,
    identifyAnomalousUsers,
    calculateActivityTrend
  };
}

