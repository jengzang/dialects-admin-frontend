/**
 * 會話管理相關 API
 */
import api from '../axios';

export const sessionAPI = {
  /**
   * 獲取所有活躍會話
   * @param {Object} params - 查詢參數
   * @param {number} params.user_id - 可選：篩選特定用戶
   * @param {number} params.skip - 分頁偏移量
   * @param {number} params.limit - 每頁數量
   * @returns {Promise} 會話列表
   */
  getActiveSessions(params = {}) {
    return api.get('/sessions/active', { params });
  },

  /**
   * 獲取特定用戶的所有會話
   * @param {number} userId - 用戶 ID
   * @returns {Promise} 用戶會話列表
   */
  getUserSessions(userId) {
    return api.get(`/sessions/user/${userId}`);
  },

  /**
   * 撤銷特定會話
   * @param {number} tokenId - Token ID
   * @returns {Promise} 撤銷結果
   */
  revokeSession(tokenId) {
    return api.post(`/sessions/revoke/${tokenId}`);
  },

  /**
   * 撤銷用戶的所有會話
   * @param {number} userId - 用戶 ID
   * @returns {Promise} 撤銷結果
   */
  revokeUserSessions(userId) {
    return api.post(`/sessions/revoke-user/${userId}`);
  },

  /**
   * 清理過期 Token
   * @returns {Promise} 清理結果
   */
  cleanupExpired() {
    return api.post('/sessions/cleanup-expired');
  },

  /**
   * 獲取會話統計信息
   * @returns {Promise} 統計數據
   */
  getStats() {
    return api.get('/sessions/stats');
  }
};
