/**
 * 用戶管理相關 API
 */
import api from '../axios';

export const userAPI = {
  /**
   * 用戶登錄
   * @param {Object} credentials - 登錄憑證
   * @param {string} credentials.username - 用戶名
   * @param {string} credentials.password - 密碼
   * @returns {Promise} 登錄響應
   */
  login(credentials) {
    return api.post('/login', credentials);
  },

  /**
   * 獲取所有用戶列表
   * @returns {Promise} 用戶列表
   */
  getAll() {
    return api.get('/users');
  },

  /**
   * 獲取所有用戶列表（包含詳細信息）
   * @returns {Promise} 用戶列表
   */
  getAllUsers() {
    return api.get('/users/list');
  },

  /**
   * 創建新用戶
   * @param {Object} userData - 用戶數據
   * @returns {Promise} 創建結果
   */
  create(userData) {
    return api.post('/users/create', userData);
  },

  /**
   * 更新用戶信息
   * @param {Object} userData - 用戶數據
   * @returns {Promise} 更新結果
   */
  update(userData) {
    return api.put('/users/update', userData);
  },

  /**
   * 刪除用戶
   * @param {string} username - 用戶名
   * @returns {Promise} 刪除結果
   */
  delete(username) {
    return api.delete(`/users/delete/${username}`);
  },

  /**
   * 獲取用戶統計信息
   * @returns {Promise} 用戶統計
   */
  getStats() {
    return api.get('/users/stats');
  }
};
