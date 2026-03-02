<template>
  <div>
    <h2>創建新用戶</h2>

    <form @submit.prevent="createUser">
      <div class="form-group">
        <label for="username">用戶名:</label>
        <input
            id="username"
            v-model="newUser.username"
            placeholder="請輸入用戶名"
            required
        />
      </div>

      <div class="form-group">
        <label for="email">郵箱:</label>
        <input
            id="email"
            v-model="newUser.email"
            type="email"
            placeholder="請輸入郵箱"
            required
        />
      </div>

      <div class="form-group">
        <label for="password">密碼:</label>
        <input
            id="password"
            v-model="newUser.password"
            type="password"
            placeholder="請輸入密碼"
            required
        />
      </div>

      <div class="form-group">
        <label for="role">角色:</label>
        <select v-model="newUser.role" required>
          <option value="user">普通用戶</option>
          <option value="admin">管理員</option>
        </select>
      </div>

      <div class="button-container">
        <button type="submit" class="create-btn">創建用戶</button>
      </div>
    </form>

    <div class="logout-button-container">
      <button @click="goToHome">返回首頁</button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import api from '../../axios.js';

const router = useRouter();

const newUser = ref({
  username: '',
  email: '',
  password: '',
  role: 'user'
});

const createUser = async () => {
  try {
    const response = await api.post('/users/create', newUser.value);
    ElMessage.success('用戶創建成功!');
    router.push({ name: 'Home' });
  } catch (error) {
    if (error.response && error.response.data && error.response.data.detail) {
      ElMessage.error(`創建用戶失敗: ${error.response.data.detail}`);
    } else {
      ElMessage.error('創建用戶失敗，請稍後再試');
    }
    console.error('Error creating user', error);
  }
};

const goToHome = () => {
  router.push({ name: 'Home' });
};
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

h2 {
  text-align: center;
  color: $color-text-primary;
  margin-bottom: $spacing-md;
}

.form-group {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;

  label {
    font-weight: bold;
    color: $color-text-primary;
  }

  input, select {
    font-family: 'Arial', sans-serif;
  }
}

input, select {
  width: 100%;
  padding: 12px;
  font-size: $font-size-md;
  border-radius: $radius-md;
  margin-top: $spacing-sm;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  transition: all $transition-normal;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;

  &:focus {
    border-color: #28a745;
    outline: none;
    box-shadow: 0 0 8px rgba(40, 167, 69, 0.3);
  }
}

.button-container {
  width: 100%;
  max-width: 600px;
  margin: $spacing-md auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

button {
  @include button-variant(#28a745, #218838);
  padding: 12px $spacing-md;
  font-size: $font-size-md;
  border-radius: $radius-md;
  width: auto;
  margin-top: $spacing-sm;
  display: inline-flex;
  justify-content: center;
  align-items: center;

  &:active {
    transform: scale(0.98);
    background-color: #1e7e34;
  }

  &:disabled {
    background-color: #d6e9d7;
  }
}

.logout-button-container {
  width: 100%;
  max-width: 600px;
  margin: $spacing-md auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>


