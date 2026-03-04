/**
 * API 调用统计接口
 * Base URL: https://dialects.yzup.top (不使用 /admin 前缀)
 *
 * 注意：这些接口是公开访问的统计接口，不需要 /admin 前缀
 */
import axios from 'axios';

// 创建专门用于统计接口的 axios 实例（使用 WEB_BASE 而不是 ADMIN_BASE）
const statsApi = axios.create({
  baseURL: window.WEB_BASE || 'https://dialects.yzup.top',
  timeout: 20000
});

export const apiCallStatsAPI = {
  /**
   * 获取小时级调用趋势
   * @param {number} hours - 查询最近 N 小时（1-168）
   * @returns {Promise} { period, data: [{ hour, total_calls }], summary }
   */
  getHourlyTrend(hours = 24) {
    return statsApi.get('/logs/stats/hourly', {
      params: { hours }
    }).then(res => res.data);
  },

  /**
   * 获取每日调用趋势
   * @param {number} days - 查询最近 N 天（1-365）
   * @param {string} path - 可选，指定 API 路径
   * @returns {Promise} { period, path, data: [{ date, total_calls }], summary }
   */
  getDailyTrend(days = 30, path = null) {
    const params = { days };
    if (path) params.path = path;
    return statsApi.get('/logs/stats/daily', { params }).then(res => res.data);
  },

  /**
   * 获取 API 排行榜（支持 3 种查询模式）
   * @param {Object} options - 查询选项
   * @param {number} options.limit - 返回前 N 个 API（1-100）
   * @param {string} options.date - 模式 3：查询指定日期 (YYYY-MM-DD)
   * @param {number} options.days - 模式 2：查询最近 N 天
   * @returns {Promise} { period, ranking: [{ rank, path, call_count, percentage }], total_calls, unique_apis, top_n_calls, top_n_percentage }
   *
   * 模式 1：全时段排行榜 - 不传 date 和 days
   * 模式 2：日期范围排行榜 - 传 days 参数（例如 days=7 表示最近 7 天）
   * 模式 3：指定日期排行榜 - 传 date 参数（例如 date=2026-03-01）
   *
   * 注意：date 和 days 参数互斥，不能同时传递
   */
  getRanking(options = {}) {
    const { limit = 10, date = null, days = null } = options;
    const params = { limit };

    // date 和 days 互斥，优先使用 date
    if (date) {
      params.date = date;
    } else if (days) {
      params.days = days;
    }
    // 如果都不传，则为全时段查询（模式 1）

    return statsApi.get('/logs/stats/ranking', { params }).then(res => res.data);
  },

  /**
   * 获取单个 API 的历史趋势
   * @param {string} path - API 路径（必填）
   * @param {number} days - 查询最近 N 天（1-365）
   * @returns {Promise} { path, period, data: [{ date, call_count }], summary }
   */
  getApiHistory(path, days = 30) {
    return statsApi.get('/logs/stats/api-history', {
      params: { path, days }
    }).then(res => res.data);
  }
};
