import api from '../axios.js';

/**
 * 排行榜API模块
 * 提供排行榜数据查询和可用API列表获取功能
 */
export const leaderboardAPI = {
  /**
   * 获取排行榜数据
   * @param {Object} params - 查询参数
   * @param {string} params.ranking_type - 排行榜类型 (user_global, user_by_api, api, online_time)
   * @param {string} params.metric - 指标类型 (count, duration, upload, download)
   * @param {string} [params.api_path] - API路径（user_by_api类型时必需）
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.page_size=20] - 每页数量
   * @returns {Promise<Object>} 排行榜数据
   */
  getRankings(params) {
    return api.get('/leaderboard/rankings', { params }).then(res => res.data);
  },

  /**
   * 获取可用API列表
   * @returns {Promise<Object>} 可用API列表
   */
  getAvailableApis() {
    return api.get('/leaderboard/available-apis').then(res => res.data);
  }
};
