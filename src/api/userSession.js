import api from '../axios.js';

/**
 * User Session API Client
 * 复用项目统一的 axios 实例，包含 token 刷新和错误处理
 */
const userSessionAPI = {
  /**
   * List sessions with advanced filtering
   * @param {Object} params - Filter parameters
   * @param {number} params.user_id - Filter by user ID
   * @param {string} params.username - Filter by username (fuzzy)
   * @param {boolean} params.is_suspicious - Filter by suspicious status
   * @param {boolean} params.revoked - Filter by revoked status
   * @param {string} params.ip_address - Filter by IP address
   * @param {string} params.created_after - Filter by creation date (ISO format)
   * @param {string} params.created_before - Filter by creation date (ISO format)
   * @param {string} params.sort_by - Sort field (created_at, last_activity_at, etc.)
   * @param {string} params.sort_order - Sort order (asc/desc)
   * @param {number} params.skip - Pagination offset
   * @param {number} params.limit - Pagination limit
   * @returns {Promise} List of sessions
   */
  listSessions(params = {}) {
    return api.get('/user-sessions/', { params }).then(res => res.data);
  },

  /**
   * Get session detail
   * @param {string} sessionId - Session ID
   * @returns {Promise} Session detail
   */
  getSessionDetail(sessionId) {
    if (!sessionId) {
      return Promise.reject(new Error('Session ID is required'));
    }
    return api.get(`/user-sessions/${sessionId}`).then(res => res.data);
  },

  /**
   * Get session activity timeline
   * @param {string} sessionId - Session ID
   * @returns {Promise} Activity timeline
   */
  getSessionActivity(sessionId) {
    if (!sessionId) {
      return Promise.reject(new Error('Session ID is required'));
    }
    return api.get(`/user-sessions/${sessionId}/activity`).then(res => res.data);
  },

  /**
   * Revoke a single session
   * @param {string} sessionId - Session ID
   * @param {string} reason - Revoke reason
   * @returns {Promise} Revoke result
   */
  revokeSession(sessionId, reason = 'admin_action') {
    if (!sessionId) {
      return Promise.reject(new Error('Session ID is required'));
    }
    return api.post(`/user-sessions/${sessionId}/revoke`, { reason }).then(res => res.data);
  },

  /**
   * Bulk revoke sessions
   * @param {Array<string>} sessionIds - Array of session IDs
   * @param {string} reason - Revoke reason
   * @returns {Promise} Bulk revoke result
   */
  revokeBulk(sessionIds, reason = 'admin_action') {
    if (!sessionIds || sessionIds.length === 0) {
      return Promise.reject(new Error('Session IDs are required'));
    }
    return api.post('/user-sessions/bulk-revoke', { session_ids: sessionIds, reason }).then(res => res.data);
  },

  /**
   * Revoke all sessions for a user
   * @param {number} userId - User ID
   * @param {string} reason - Revoke reason
   * @returns {Promise} Revoke result
   */
  revokeUserSessions(userId, reason = 'admin_action') {
    if (!userId) {
      return Promise.reject(new Error('User ID is required'));
    }
    return api.post(`/user-sessions/user/${userId}/revoke-all`, { reason }).then(res => res.data);
  },

  /**
   * Flag or unflag a session as suspicious
   * @param {string} sessionId - Session ID
   * @param {boolean} isSuspicious - Whether to flag as suspicious
   * @param {string} reason - Reason for flagging
   * @returns {Promise} Flag result
   */
  flagSession(sessionId, isSuspicious, reason = '') {
    if (!sessionId) {
      return Promise.reject(new Error('Session ID is required'));
    }
    return api.post(`/user-sessions/${sessionId}/flag`, {
      is_suspicious: isSuspicious,
      reason
    }).then(res => res.data);
  },

  /**
   * Get session statistics
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @returns {Promise} Statistics data
   */
  getStats(startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return api.get('/user-sessions/stats', { params }).then(res => res.data);
  },

  /**
   * Get user session history
   * @param {number} userId - User ID
   * @param {boolean} includeRevoked - Include revoked sessions
   * @returns {Promise} User session history
   */
  getUserHistory(userId, includeRevoked = true) {
    if (!userId) {
      return Promise.reject(new Error('User ID is required'));
    }
    return api.get(`/user-sessions/user/${userId}/history`, {
      params: { include_revoked: includeRevoked }
    }).then(res => res.data);
  }
};

export default userSessionAPI;
