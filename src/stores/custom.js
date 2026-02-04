/**
 * 自定義數據狀態管理
 */
import { defineStore } from 'pinia';
import { customAPI } from '../api';

export const useCustomStore = defineStore('custom', {
  state: () => ({
    // 選中的數據（用於編輯/刪除）
    selectedUsers: [],
    // 當前用戶名
    currentUsername: null,
    // 所有自定義數據
    allData: [],
    // 加載狀態
    loading: false,
    // 錯誤信息
    error: null
  }),

  getters: {
    /**
     * 獲取選中數據的數量
     */
    selectedCount: (state) => state.selectedUsers.length,

    /**
     * 檢查是否有選中的數據
     */
    hasSelected: (state) => state.selectedUsers.length > 0
  },

  actions: {
    /**
     * 設置選中的數據
     * @param {Array} users - 選中的數據列表（created_at數組）
     */
    setSelectedUsers(users) {
      this.selectedUsers = users;
    },

    /**
     * 添加選中的數據
     * @param {string} createdAt - 數據的創建時間
     */
    addSelectedUser(createdAt) {
      if (!this.selectedUsers.includes(createdAt)) {
        this.selectedUsers.push(createdAt);
      }
    },

    /**
     * 移除選中的數據
     * @param {string} createdAt - 數據的創建時間
     */
    removeSelectedUser(createdAt) {
      const index = this.selectedUsers.indexOf(createdAt);
      if (index > -1) {
        this.selectedUsers.splice(index, 1);
      }
    },

    /**
     * 清空選中的數據
     */
    clearSelectedUsers() {
      this.selectedUsers = [];
    },

    /**
     * 設置當前用戶名
     * @param {string} username - 用戶名
     */
    setCurrentUsername(username) {
      this.currentUsername = username;
    },

    /**
     * 獲取所有自定義數據
     */
    async fetchAllData() {
      this.loading = true;
      this.error = null;
      try {
        const response = await customAPI.getAll();
        this.allData = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message || '獲取數據失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 獲取指定用戶的數據
     * @param {string} username - 用戶名
     */
    async fetchUserData(username) {
      this.loading = true;
      this.error = null;
      try {
        const response = await customAPI.getUserData(username);
        return response.data;
      } catch (error) {
        this.error = error.message || '獲取用戶數據失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 創建新數據
     * @param {Array} dataList - 數據列表
     */
    async createData(dataList) {
      this.loading = true;
      this.error = null;
      try {
        const response = await customAPI.create(dataList);
        return response.data;
      } catch (error) {
        this.error = error.message || '創建數據失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 更新數據
     * @param {Array} dataList - 數據列表
     */
    async updateData(dataList) {
      this.loading = true;
      this.error = null;
      try {
        const response = await customAPI.update(dataList);
        return response.data;
      } catch (error) {
        this.error = error.message || '更新數據失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 刪除數據
     * @param {Array} createdAtList - 創建時間列表
     */
    async deleteData(createdAtList) {
      this.loading = true;
      this.error = null;
      try {
        const response = await customAPI.delete(createdAtList);
        // 刪除成功後清空選中列表
        this.clearSelectedUsers();
        return response.data;
      } catch (error) {
        this.error = error.message || '刪除數據失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
