/**
 * 用戶狀態管理
 */
import { defineStore } from 'pinia';
import { userAPI } from '../api';
import { setToken, removeToken } from '../utils/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    // 用戶信息
    userInfo: null,
    // 用戶列表
    userList: [],
    // 加載狀態
    loading: false,
    // 錯誤信息
    error: null
  }),

  getters: {
    /**
     * 檢查是否已登錄
     */
    isLoggedIn: (state) => !!state.userInfo,

    /**
     * 獲取用戶名
     */
    username: (state) => state.userInfo?.username || null
  },

  actions: {
    /**
     * 用戶登錄
     * @param {Object} credentials - 登錄憑證
     */
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const response = await userAPI.login(credentials);
        const { token, user } = response.data;

        // 保存 token
        if (token) {
          setToken(token);
        }

        // 保存用戶信息
        this.userInfo = user;

        return response.data;
      } catch (error) {
        this.error = error.message || '登錄失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 用戶登出
     */
    logout() {
      // 清除 token
      removeToken();
      // 清除用戶信息
      this.userInfo = null;
      // 清除用戶列表
      this.userList = [];
    },

    /**
     * 獲取所有用戶列表
     */
    async fetchUserList() {
      this.loading = true;
      this.error = null;
      try {
        const response = await userAPI.getAll();
        this.userList = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message || '獲取用戶列表失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 創建新用戶
     * @param {Object} userData - 用戶數據
     */
    async createUser(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await userAPI.create(userData);
        // 創建成功後刷新用戶列表
        await this.fetchUserList();
        return response.data;
      } catch (error) {
        this.error = error.message || '創建用戶失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 更新用戶信息
     * @param {Object} userData - 用戶數據
     */
    async updateUser(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await userAPI.update(userData);
        // 更新成功後刷新用戶列表
        await this.fetchUserList();
        return response.data;
      } catch (error) {
        this.error = error.message || '更新用戶失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 刪除用戶
     * @param {string} username - 用戶名
     */
    async deleteUser(username) {
      this.loading = true;
      this.error = null;
      try {
        const response = await userAPI.delete(username);
        // 刪除成功後刷新用戶列表
        await this.fetchUserList();
        return response.data;
      } catch (error) {
        this.error = error.message || '刪除用戶失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
