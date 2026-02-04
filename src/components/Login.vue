<template>
  <div class="login-container">
    <h2>登錄</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用戶名</label>
        <input
          type="text"
          id="username"
          v-model="username"
          :disabled="loading"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">密碼</label>
        <input
          type="password"
          id="password"
          v-model="password"
          :disabled="loading"
          required
        />
      </div>
      <div class="button-container">
        <button type="submit" :disabled="loading">
          {{ loading ? '登錄中...' : '登錄' }}
        </button>
      </div>
    </form>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { useUserStore } from '../stores';
import { setToken } from '../utils/auth';
import { ElMessage } from 'element-plus';
import { resetUserInfoCache } from '../router';

export default {
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
      loading: false
    };
  },
  methods: {
    async handleLogin() {
      // 清空之前的錯誤信息
      this.errorMessage = '';
      this.loading = true;

      try {
        // 準備請求數據
        const form = new URLSearchParams();
        form.append('username', this.username);
        form.append('password', this.password);

        // 使用原來的 API（因為後端可能還是使用 /auth/login）
        const WEB_BASE = window.WEB_BASE;
        const res = await fetch(WEB_BASE + '/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form,
        });

        if (!res.ok) {
          throw new Error('登錄失敗');
        }

        const data = await res.json();

        // 兼容新舊版本的 token 格式
        const accessToken = data.access_token;
        const refreshToken = data.refresh_token || null;
        const expiresIn = data.expires_in || 1800;

        // 保存 Token（支持雙 token 機制）
        setToken(accessToken, refreshToken, expiresIn);

        // 重置用戶信息緩存，強制重新獲取
        resetUserInfoCache();

        // 顯示成功消息
        ElMessage.success('登錄成功');

        // 登錄成功後跳轉
        this.redirectAfterLogin();

      } catch (error) {
        console.error('Login failed:', error);
        this.errorMessage = '登錄失敗，用戶名或密碼錯誤';
        ElMessage.error(this.errorMessage);
      } finally {
        this.loading = false;
      }
    },

    // 統一跳轉邏輯
    redirectAfterLogin() {
      setTimeout(() => {
        // 檢查是否有重定向目標
        const redirect = this.$route.query.redirect || '/';
        this.$router.replace(redirect);
      }, 500);
    }
  },
};
</script>

<style scoped>
/* 使用绿色苹果风格的样式 */

.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 15px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  font-size: 24px;
  color: #2c6e49;  /* 苹果风格绿色 */
  font-weight: bold;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-size: 16px;
  color: #333;
}

input {
  width: 90%;
  padding: 12px;
  font-size: 16px;
  border-radius: 25px;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
  margin-top: 5px;
  transition: all 0.3s ease-in-out;
}

input:focus {
  outline: none;
  border-color: #4CAF50;  /* 聚焦时的绿色边框 */
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);  /* 聚焦时的绿色阴影 */
  background-color: #eafaf0;  /* 聚焦时背景色变化 */
}

input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

button {
  padding: 12px 30px;
  font-size: 18px;
  color: white;
  background-color: #4CAF50; /* 苹果绿色 */
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  width: auto;
}

button:hover:not(:disabled) {
  background-color: #45a049;  /* 深绿色 */
  transform: scale(1.05); /* 鼠标悬停时按钮稍微放大 */
}

button:disabled {
  background-color: rgba(76, 175, 80, 0.5);
  cursor: not-allowed;
  transform: none;
}

.error-message {
  text-align: center;
  color: red;
  font-size: 14px;
  margin-top: 15px;
}
</style>
