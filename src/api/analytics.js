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
  },

  /**
   * 獲取系統概覽儀表板數據
   * @returns {Promise} 儀表板數據
   */
  getDashboard() {
    return api.get('/analytics/dashboard').then(res => res.data);
  },

  /**
   * 獲取用戶活躍度分層數據
   * @param {boolean} includeUsers - 是否包含用戶列表
   * @returns {Promise} 用戶分層數據
   */
  getUserSegments(includeUsers = false) {
    return api.get('/analytics/user-segments', {
      params: { include_users: includeUsers }
    }).then(res => res.data);
  },

  /**
   * 獲取 RFM 用戶價值分析數據
   * @param {boolean} includeUsers - 是否包含用戶列表
   * @returns {Promise} RFM 分析數據
   */
  getRFMAnalysis(includeUsers = false) {
    return api.get('/analytics/rfm-analysis', {
      params: { include_users: includeUsers }
    }).then(res => res.data);
  },

  /**
   * 檢測異常用戶
   * @param {string} detectionType - 檢測類型 (all/high_frequency/high_traffic/single_api/new_user_spike)
   * @returns {Promise} 異常用戶列表
   */
  detectAnomalies(detectionType = 'all') {
    return api.get('/analytics/anomaly-detection', {
      params: { detection_type: detectionType }
    }).then(res => res.data);
  },

  /**
   * 獲取 API 多樣性分析數據
   * @param {string} sortBy - 排序方式 (diversity/call_count)
   * @returns {Promise} API 多樣性數據
   */
  getApiDiversity(sortBy = 'diversity') {
    return api.get('/analytics/api-diversity', {
      params: { sort_by: sortBy }
    }).then(res => res.data);
  },

  /**
   * 獲取用戶偏好分析數據
   * @param {string|null} userIds - 用戶 ID（逗號分隔）
   * @returns {Promise} 用戶偏好數據
   */
  getUserPreferences(userIds = null) {
    const params = userIds ? { user_ids: userIds } : {};
    return api.get('/analytics/user-preferences', { params }).then(res => res.data);
  },

  /**
   * 獲取用戶增長統計數據
   * @param {number} months - 統計月數
   * @returns {Promise} 用戶增長數據
   */
  getUserGrowth(months = 12) {
    return api.get('/analytics/user-growth', {
      params: { months }
    }).then(res => res.data);
  },

  /**
   * 獲取最近趨勢分析數據
   * @param {string} granularity - 時間粒度 (hour/day)
   * @param {number} days - 統計天數
   * @returns {Promise} 趨勢數據
   */
  getRecentTrends(granularity = 'day', days = 7) {
    return api.get('/analytics/recent-trends', {
      params: { granularity, days }
    }).then(res => res.data);
  },

  /**
   * 獲取 API 性能分析數據
   * @param {string|null} apiPath - API 路徑（可選）
   * @returns {Promise} 性能數據
   */
  getApiPerformance(apiPath = null) {
    const params = apiPath ? { api_path: apiPath } : {};
    return api.get('/analytics/api-performance', { params }).then(res => res.data);
  },

  /**
   * 獲取地理分布數據
   * @param {string} level - 統計級別 (country/city)
   * @returns {Promise} 地理分布數據
   */
  getGeoDistribution(level = 'country') {
    return api.get('/analytics/geo-distribution', {
      params: { level }
    }).then(res => res.data);
  },

  /**
   * 獲取設備分布數據
   * @returns {Promise} 設備分布數據
   */
  getDeviceDistribution() {
    return api.get('/analytics/device-distribution').then(res => res.data);
  }
};
