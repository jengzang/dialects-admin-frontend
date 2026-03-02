/**
 * API 使用分析相關 API
 */
import api from '../axios.js';

export const analyticsAPI = {
  /**
   * 獲取 API 使用記錄
   * @param {Object} params - 查詢參數
   * @param {number} params.skip - 分頁偏移量
   * @param {number} params.limit - 每頁數量
   * @returns {Promise} API 使用記錄列表
   */
  getApiUsage(params = {}) {
    return api.get('/api-usage/api-usage', { params }).then(res => res.data);
  },

  /**
   * 獲取用戶 API 使用圖表數據
   * @param {string} username - 用戶名
   * @returns {Promise} 圖表數據
   */
  getApiChart(username) {
    return api.get(`/api-usage/chart/${username}`).then(res => res.data);
  },

  /**
   * 獲取用戶 API 統計信息
   * @param {string} username - 用戶名
   * @returns {Promise} 統計數據
   */
  getUserApiStats(username) {
    return api.get(`/api-usage/stats/${username}`).then(res => res.data);
  },

  /**
   * 獲取 API 使用摘要
   * @param {string} username - 用戶名
   * @returns {Promise} API 使用摘要
   */
  getApiSummary(username) {
    return api.get('/api-usage/api-summary', { params: { query: username } }).then(res => res.data);
  },

  /**
   * 獲取 API 使用詳情
   * @param {string} username - 用戶名
   * @returns {Promise} API 使用詳情
   */
  getApiDetail(username) {
    return api.get('/api-usage/api-detail', { params: { query: username } }).then(res => res.data);
  }
};
