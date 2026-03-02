<template>
  <div>
    <h2>編輯用戶<strong> {{ oldname }} </strong> </h2>
    <h3> 當前郵箱:{{ oldemail }}</h3>
    <!-- 用戶更新表單 -->
    <form @submit.prevent="updateUser" class="update-form">
      <!-- 用戶名輸入框 -->
      <div class="form-group">
        <label for="username">更新用戶名:</label>
        <input
            id="username"
            v-model="updatedUser.username"
            placeholder="請輸入新用戶名"
            class="form-control"
        />
      </div>

      <div class="button-container">
        <button type="button" @click="updateUsername" class="btn btn-primary">更新用戶名</button>
      </div>

      <!-- 郵箱輸入框 -->
      <div class="form-group">
        <label for="email">更新郵箱:</label>
        <input
            id="email"
            v-model="updatedUser.email"
            placeholder="請輸入新郵箱"
            class="form-control"
        />
      </div>
      <!-- 更新按鈕 -->
      <div class="button-container">
        <button type="button" @click="updateEmail" class="btn btn-secondary">更新郵箱</button>
      </div>

      <!-- 密碼輸入框 -->
      <div class="form-group">
        <label for="email">更改密碼:</label>
        <input
            id="email"
            v-model="updatedUser.password"
            placeholder="請輸入新密碼"
            class="form-control"
        />
      </div>
      <!-- 更新按鈕 -->
      <div class="button-container">
        <button type="button" @click="updatePassword" class="btn btn-secondary">更改密碼</button>
      </div>

    </form>

    <!-- 設置為管理員按鈕 -->
    <div class="button-container">
      <button type="button" @click="showSetAdminConfirm" class="btn btn-secondary" style="background: darkblue">設置為管理員</button>
    </div>

    <!-- 刪除按鈕 -->
    <div class="button-container">
      <button type="button" @click="showDeleteConfirm(oldname)" class="btn-primary" style="background: darkred">刪除用戶</button>
    </div>

    <!-- 返回首頁按鈕 -->
    <div class="button-container">
      <button type="button" @click="goToHome" class="btn-primary" style="background: darkgoldenrod">返回首頁</button>
    </div>

    <!-- 自定義設置為管理員確認彈窗 -->
    <div v-if="showAdminConfirmDialog" class="overlay">
      <div class="confirm-dialog">
        <p>你確定要將用戶 {{ oldname }} 設置為管理員嗎？</p>
        <button @click="confirmSetAdmin" class="btn-primary" style="background: #4CAF50;">確定</button>
        <button @click="cancelSetAdmin" class="btn-secondary" style="background: darkgoldenrod">取消</button>
      </div>
    </div>

    <!-- 自定義刪除確認彈窗 -->
    <div v-if="showConfirmDialog" class="overlay">
      <div class="confirm-dialog">
        <p>你確定要刪除用戶 {{ confirmUser?.username }} 嗎？</p>
        <button @click="confirmDelete" class="btn-primary" style="background: #9a2118;">删除</button>
        <button @click="cancelDelete" class="btn-secondary" style="background: darkgoldenrod">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import api from '../../axios.js';

const router = useRouter();
const route = useRoute();

const updatedUser = ref({ username: '', email: '', password: '' });
const oldname = ref(route.query.username);
const oldemail = ref(route.query.email);
const showConfirmDialog = ref(false);
const showAdminConfirmDialog = ref(false);
const confirmUser = ref(null);

const updateUsername = async () => {
  if (updatedUser.value.username && updatedUser.value.username !== oldname.value) {
    try {
      await api.put(`/users/update?query=${oldname.value}`, { username: updatedUser.value.username });
      ElMessage.success('用戶名更新成功!');
      oldname.value = updatedUser.value.username;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        ElMessage.error(`編輯用戶名失敗: ${error.response.data.detail}`);
      } else {
        ElMessage.error('編輯用戶名失敗，請稍後再試');
      }
    }
  } else {
    ElMessage.warning('請輸入有效的用戶名');
  }
};

const updateEmail = async () => {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!updatedUser.value.email || !emailPattern.test(updatedUser.value.email)) {
    ElMessage.warning('請輸入有效的郵箱地址');
    return;
  }
  if (updatedUser.value.email && updatedUser.value.email !== oldemail.value) {
    try {
      await api.put(`/users/update?query=${oldemail.value}`, { email: updatedUser.value.email });
      ElMessage.success('郵箱更新成功!');
      oldemail.value = updatedUser.value.email;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        ElMessage.error(`編輯郵箱失敗: ${error.response.data.detail}`);
      } else {
        ElMessage.error('編輯郵箱失敗，請稍後再試');
      }
    }
  } else {
    ElMessage.warning('請輸入有效的郵箱');
  }
};

const updatePassword = async () => {
  const password = updatedUser.value.password;
  if (!password || password.length < 6) {
    ElMessage.warning('密碼至少需要6個字符');
    return;
  }
  try {
    await api.put(`/users/password`, { username: oldname.value, password: password });
    ElMessage.success('密碼更新成功!');
    updatedUser.value.password = '';
  } catch (error) {
    if (error.response && error.response.data && error.response.data.detail) {
      ElMessage.error(`更新密碼失敗: ${error.response.data.detail}`);
    } else {
      ElMessage.error('更新密碼失敗，請稍後再試');
    }
  }
};

const confirmSetAdmin = async () => {
  try {
    const response = await api.put('/users/let_admin', {
      username: oldname.value,
      role: 'admin'
    });
    ElMessage.success('用戶已成功設置為管理員！');
    showAdminConfirmDialog.value = false;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.detail) {
      ElMessage.error(`設置管理員失敗: ${error.response.data.detail}`);
      showAdminConfirmDialog.value = false;
    } else {
      ElMessage.error('設置管理員失敗！' + (error.response?.data?.detail || ''));
      showAdminConfirmDialog.value = false;
    }
  }
};

const showSetAdminConfirm = () => {
  showAdminConfirmDialog.value = true;
};

const cancelSetAdmin = () => {
  showAdminConfirmDialog.value = false;
};

const showDeleteConfirm = (user) => {
  showConfirmDialog.value = true;
  confirmUser.value = user;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/users/delete?query=${confirmUser.value}`);
    ElMessage.success('用戶刪除成功！');
    showConfirmDialog.value = false;
    router.push({ name: 'Home' });
  } catch (error) {
    showConfirmDialog.value = false;
    if (error.response && error.response.data && error.response.data.detail) {
      ElMessage.error(`刪除用戶失敗: ${error.response.data.detail}`);
    } else {
      ElMessage.error('刪除用戶失敗，請稍後再試');
    }
  }
};

const cancelDelete = () => {
  showConfirmDialog.value = false;
};

const goToHome = () => {
  router.push({ name: 'Home' });
};

onMounted(() => {
  if (oldname.value || oldemail.value) {
    api.get(`/users/single?query=${oldname.value || oldemail.value}`)
      .then(response => {
        updatedUser.value.username = response.data.username;
        updatedUser.value.email = response.data.email;
      })
      .catch(error => {
        console.error('Error fetching user data', error);
      });
  }
});
</script>


<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.user-info {
  margin-bottom: $spacing-md;

  p {
    margin: $spacing-xs 0;
  }
}

.update-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  font-size: $font-size-lg;
  margin-bottom: 15px;

  label {
    display: block;
    font-weight: bold;
    margin-bottom: $spacing-xs;
  }
}

.form-control {
  width: 100%;
  padding: 12px;
  font-size: $font-size-md;
  border: 1px solid #a8d5ba;
  border-radius: $radius-md;
  background-color: #f6fbf3;
  transition: all $transition-normal;

  &:focus {
    border-color: #60b68d;
    box-shadow: 0 0 10px rgba(96, 182, 141, 0.5);
  }
}

button {
  padding: $spacing-sm 16px;
  font-size: $font-size-md;
  border-radius: $radius-md;
  margin: $spacing-xs 0;
  cursor: pointer;
  transition: background-color $transition-normal, transform 0.2s ease;
  border: none;
  font-weight: 600;
  width: 100%;
  max-width: 150px;

  &:active {
    transform: scale(0.98);
  }
}

.button-container {
  display: flex;
  justify-content: center;
  margin: $spacing-xs 0;
}

.btn-primary {
  @include button-variant($color-primary, $color-primary-dark);

  &:active {
    background-color: #1e7e1b;
  }
}

.btn-secondary {
  @include button-variant($color-primary, $color-primary-dark);

  &:active {
    background-color: #1e7e1b;
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.confirm-dialog {
  background: $color-background-white;
  padding: $spacing-md;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;

  h3 {
    font-size: $font-size-xl;
    font-weight: 600;
    color: $color-text-primary;
  }

  button {
    @include button-variant($color-primary, $color-primary-dark);
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-md;
    border-radius: $radius-md;
    margin-top: $spacing-sm;

    &:active {
      background-color: #1e7e1b;
    }
  }
}
</style>


