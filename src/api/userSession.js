import api from '../axios.js';

/**
 * User Session API Client
 * 复用项目统一的 axios 实例，包含 token 刷新和错误处理
 */
const userSessionAPI = {
  /**
   * Get active sessions (legacy endpoint from session.js)
   * @param {Object} params - Query parameters
   * @param {number} params.user_id - Optional: filter by user
   * @param {number} params.skip - Pagination offset
   * @param {number} params.limit - Page size
   * @returns {Promise} Active sessions list
   */
  getActiveSessions(params = {}) {
    return api.get('/sessions/active', { params }).then(res => res.data);
  },

  /**
   * Get user sessions (legacy endpoint from session.js)
   * @param {number} userId - User ID
   * @returns {Promise} User sessions list
   */
  getUserSessions(userId) {
    return api.get(`/sessions/user/${userId}`).then(res => res.data);
  },

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
    return api.get('/user-sessions/list', { params }).then(res => res.data);
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
    return api.post('/user-sessions/revoke-bulk', { session_ids: sessionIds, reason }).then(res => res.data);
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
    return api.post(`/user-sessions/revoke-user/${userId}`, { reason }).then(res => res.data);
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
  },

  /**
   * Clean up expired tokens (legacy endpoint from session.js)
   * @returns {Promise} Cleanup result
   */
  cleanupExpired() {
    return api.post('/sessions/cleanup-expired').then(res => res.data);
  },

  /**
   * Get online users list
   * @param {number} thresholdMinutes - Online threshold in minutes (1-60, default 30)
   * @returns {Promise} Online users data
   * @example
   * {
   *   online_count: 50,
   *   users: [
   *     {
   *       user_id: 1,
   *       username: "alice",
   *       last_seen: "2026-03-04T10:30:00Z",
   *       current_ip: "192.168.1.100",
   *       device_info: "Mozilla/5.0..."
   *     }
   *   ]
   * }
   */
  getOnlineUsers(thresholdMinutes = 30) {
    return api.get('/user-sessions/online-users', {
      params: { threshold_minutes: thresholdMinutes }
    }).then(res => res.data);
  },

  /**
   * Get session analytics data
   * @param {number} days - Number of days to analyze (1-90, default 30)
   * @returns {Promise} Analytics data
   * @example
   * {
   *   login_heatmap: {
   *     by_hour: [12, 15, 8, ...],  // 24 data points (0-23 hours)
   *     by_weekday: [100, 120, ...]  // 7 data points (0-6, Sun-Sat)
   *   },
   *   user_activity: {
   *     dau: [
   *       { date: "2026-03-01", count: 150 },
   *       { date: "2026-03-02", count: 160 }
   *     ],
   *     mau: 1200
   *   },
   *   device_distribution: {
   *     desktop: 500,
   *     mobile: 300,
   *     tablet: 50,
   *     unknown: 10
   *   },
   *   geo_distribution: [
   *     { country: "LAN", count: 500 },
   *     { country: "123.45.x.x", count: 100 }
   *   ],
   *   session_duration_distribution: {
   *     "0-5min": 100,
   *     "5-30min": 200,
   *     "30-60min": 150,
   *     "1-2h": 80,
   *     "2h+": 50
   *   }
   * }
   */
  getAnalytics(days = 30) {
    return api.get('/user-sessions/analytics', {
      params: { days }
    }).then(res => res.data);
  }
};

export default userSessionAPI;
