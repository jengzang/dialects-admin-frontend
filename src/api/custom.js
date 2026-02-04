/**
 * 自定義數據管理相關 API
 */
import api from '../axios';

export const customAPI = {
  /**
   * 獲取所有自定義數據
   * @returns {Promise} 所有數據
   */
  getAll() {
    return api.get('/custom/all');
  },

  /**
   * 獲取指定用戶的自定義數據
   * @param {string} username - 用戶名
   * @returns {Promise} 用戶數據
   */
  getUserData(username) {
    return api.get('/custom/user', { params: { query: username } });
  },

  /**
   * 創建新的自定義數據（批量）
   * @param {Array} dataList - 數據列表
   * @returns {Promise} 創建結果
   */
  create(dataList) {
    return api.post('/custom/create', dataList);
  },

  /**
   * 更新自定義數據
   * @param {Array} dataList - 要更新的數據列表
   * @returns {Promise} 更新結果
   */
  update(dataList) {
    return api.put('/custom/update', dataList);
  },

  /**
   * 刪除自定義數據（批量）
   * @param {Array} createdAtList - 創建時間列表
   * @returns {Promise} 刪除結果
   */
  delete(createdAtList) {
    return api.delete('/custom/delete', { data: createdAtList });
  }
};
