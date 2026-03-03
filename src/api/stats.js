/**
 * 統計數據相關 API
 */
import api from '../axios.js';

export const statsAPI = {
  /**
   * 獲取用戶統計信息
   * @param {string} username - 用戶名或郵箱
   * @returns {Promise} 用戶統計數據
   */
  getUserStats(username) {
    return api.get('/stats/stats', { params: { query: username } }).then(res => res.data);
  },

  /**
   * 獲取所有用戶的數據總數
   * @returns {Promise} 數據總數列表
   */
  getDataCounts() {
    return api.get('/custom/num').then(res => res.data);
  },

  /**
   * 獲取用戶登錄歷史
   * @param {string} username - 用戶名或郵箱
   * @returns {Promise} 登錄歷史記錄
   */
  getUserLoginHistory(username) {
    return api.get('/stats/login-history', { params: { query: username } }).then(res => res.data);
  },

  /**
   * 獲取用戶統計信息（查詢參數版本）- 已廢棄，使用 getUserStats 替代
   * @param {string} username - 用戶名
   * @returns {Promise} 用戶統計數據
   * @deprecated 使用 getUserStats 替代
   */
  getStatsQuery(username) {
    return api.get('/stats/stats', { params: { query: username } }).then(res => res.data);
  },

  /**
   * 獲取成功登錄日誌
   * @param {string} username - 用戶名（可選，不傳則獲取所有用戶）
   * @returns {Promise} 登錄日誌
   */
  getSuccessLoginLogs(username = '') {
    return api.get('/login-logs/success-login-logs', { params: { query: username } }).then(res => res.data);
  }
};
