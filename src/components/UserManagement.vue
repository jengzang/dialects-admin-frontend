
<template>
  <div>
    <h2 style="margin:0 20px 10px;">用戶管理系統</h2>

    <div class="top-controls">
      <div class="button-container0">
        <button @click="goToCreateUser">創建新用戶</button>
        <button @click="apidetail">近期api調用</button>
        <button @click="viewAllCustom">所有數據</button>
        <button @click="goToSessionManagement">會話管理</button>
        <button @click="checkServerStatus">寶塔</button>
      </div>
      <!-- 搜索框 -->
      <div class="search-container">
        <BaseSearchInput
          v-model="searchQuery"
          @update:modelValue="searchUser"
          placeholder="搜索用戶名或郵箱"
        />
      </div>
    </div>

    <table v-if="users.length">
      <thead>
      <tr>
        <th @click="sortData('username')">用戶名 <span :class="getArrowClass('username')"></span></th>
        <th @click="sortData('email')">Email <span :class="getArrowClass('email')"></span></th>
        <th @click="sortData('data_count')" style="font-size:12px;padding:0">數據總數 <span :class="getArrowClass('data_count')" ></span></th>
        <th style="justify-items: center">管理員操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="user in currentPageData" :key="user.id">
        <!-- 根據 role 判斷背景顏色，如果是 admin，就將背景色設置為暗紅色 -->
        <td>
          <span v-if="user.role === 'admin'" style="font-weight: bold;" title="管理员">🛠️</span>
          <span :style="{ fontWeight: user.role === 'admin' ? 'bold' : 'normal' }" :title="user.role === 'admin' ? '管理员' : ''">
            {{ user.username }}
          </span>
        </td>


        <td>{{ user.email }}</td>
        <td>{{ user.data_count }}條</td> <!-- 顯示用戶的數據總數 -->
        <td>
          <div class="button-container">
            <button @click="goToCustomPerUser(user)">用戶數據</button>
            <button @click="viewUserStats(user)">api統計</button>
            <button @click="viewUserSessions(user)">查看會話</button>
            <button @click="editUser(user)">編輯賬號</button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>

    <h3 v-else>🤷‍♂️<br>無用戶數據</h3>
    <!-- 分頁控制 -->
    <BasePagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-size="pageSize"
      :show-first-last="false"
      info-format="simple"
      container-class="pagination-controls"
      @page-change="handlePageChange"
    />

    <div class="logout-button-container">
      <button @click="logout">返回網站</button>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userAPI, statsAPI } from '../api/index';
import { BasePagination, BaseSearchInput } from '@/components/common';

const router = useRouter();

const users = ref([]);
const searchQuery = ref('');
const searchResultIndex = ref(-1);
const filteredUsers = ref([]);
const confirmUser = ref(null);
const newUser = ref({ username: '', email: '' });
const currentPage = ref(1);
const pageSize = ref(30);
const totalPages = ref(1);
const sortOrder = ref({
  username: 'asc',
  email: 'asc',
  data_count: 'asc',
});
const username = ref('');

const fetchUserData = async () => {
  const response = await userAPI.getAllUsers();
  const usersData = response.data;

  const dataCounts = await statsAPI.getDataCounts();

  // 将数据总数与用户列表合并
  usersData.forEach(user => {
    const userData = dataCounts.find(item => item.username === user.username);
    user.data_count = userData ? userData.data_count : 0;
  });

  users.value = usersData;
  totalPages.value = Math.ceil(users.value.length / pageSize.value);
};

const getUsers = async () => {
  try {
    await fetchUserData();
  } catch (error) {
    if (error.response && error.response.status === 401) {
      alert('Token 无效或已过期，请重新登录');

      setTimeout(async () => {
        try {
          await fetchUserData();
        } catch (retryError) {
          console.error('Retry failed', retryError);
          router.push({ name: 'Login' });
        }
      }, 500);
    }
  }
};

const getArrowClass = (field) => {
  return sortOrder.value[field] === 'asc' ? 'arrow-up' : 'arrow-down';
};

const searchUser = () => {
  const searchQueryLower = searchQuery.value.toLowerCase();

  filteredUsers.value = users.value.filter(user =>
      (user.username && user.username.toLowerCase().includes(searchQueryLower)) ||
      (user.email && user.email.toLowerCase().includes(searchQueryLower))
  );

  currentPage.value = 1;
  totalPages.value = Math.ceil(filteredUsers.value.length / pageSize.value);
};

const sortData = (field) => {
  const currentOrder = sortOrder.value[field] === 'asc' ? 'desc' : 'asc';
  sortOrder.value[field] = currentOrder;

  if (field === 'username' || field === 'email') {
    users.value.sort((a, b) => {
      const valueA = a[field] || '';
      const valueB = b[field] || '';
      return currentOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });
  } else if (field === 'data_count') {
    users.value.sort((a, b) => {
      return currentOrder === 'asc' ? a[field] - b[field] : b[field] - a[field];
    });
  }

  totalPages.value = Math.ceil(users.value.length / pageSize.value);
  currentPage.value = 1;
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

const apidetail = async (user) => {
  router.push({ name: 'ApiDetail' });
};

const goToCreateUser = () => {
  router.push({ name: 'CreateUser' });
};

const checkServerStatus = () => {
  window.open('https://47.115.57.138:40260/home', '_blank');
};

const viewUserStats = async (user) => {
  router.push({ name: 'UserStats', query: { username: user.username } });
};

const viewAllCustom = async () => {
  router.push({ name: 'Custom' });
};

const editUser = async (user) => {
  router.push({ name: 'EditUser', query: { username: user.username, email: user.email } });
};

const goToCustomPerUser = (user) => {
  router.push({ name: 'PerUser', query: { username: user.username } });
};

const goToSessionManagement = () => {
  router.push({ name: 'GlobalSessionManagement' });
};

const viewUserSessions = (user) => {
  router.push({
    name: 'UserSessionManagement',
    params: { userId: user.id },
    query: {
      username: user.username
    }
  });
};

const logout = () => {
  window.location.href = window.WEB_BASE;
};

const currentPageData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const currentData = searchQuery.value ? filteredUsers.value : users.value;
  if (!Array.isArray(currentData)) return [];
  return currentData.slice(startIndex, startIndex + pageSize.value);
});

onMounted(() => {
  getUsers();
});
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

form div {
  margin-bottom: 15px;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: $spacing-xs;
  flex-wrap: nowrap;
  overflow: hidden;
  width: 100%;
  white-space: nowrap;

  button {
    @include button-variant($color-primary, $color-primary-dark);
    padding: 8px 12px;
    font-size: $font-size-sm;
    border-radius: $radius-md;
  }
}

.button-container0 {
  display: flex;
  justify-content: center;
  gap: $spacing-sm;
  flex-wrap: wrap;
  max-width: 650px;
  width: 100%;

  button {
    @include button-variant($color-primary, $color-primary-dark);
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-md;
    border-radius: $radius-md;
    margin: 0;
  }
}

input {
  padding: $spacing-sm;
  margin-top: $spacing-xs;
  width: 100%;
  border-radius: $radius-md;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  font-size: $font-size-md;
  transition: border-color $transition-normal;

  &:focus {
    border-color: $color-primary-dark;
    outline: none;
  }
}

table {
  width: 80%;
  border-collapse: collapse;
  margin: $spacing-md auto 0;
  border-radius: $radius-md;
  overflow: hidden;
  background-color: $color-background;
  border: 1px solid $color-border;

  th, td {
    padding: 12px 18px;
    text-align: left;
    font-size: $font-size-md;
  }

  th {
    background-color: $color-primary-light;
    color: $color-text-primary;
    font-weight: 600;
    white-space: nowrap;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: rgba(187, 234, 196, 0.34);
  }
}

.arrow-up::after {
  content: '↑';
  margin-left: $spacing-xs;
  font-size: $font-size-sm;
}

.arrow-down::after {
  content: '↓';
  margin-left: $spacing-xs;
  font-size: $font-size-sm;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  margin-top: $spacing-md;

  button {
    @include button-variant($color-primary, $color-primary-dark);
    padding: 12px 24px;
    margin: 0 12px;
    border-radius: 20px;
    font-size: $font-size-md;
    max-width: 120px;

    &:disabled {
      background-color: rgba(42, 175, 53, 0.34);
    }
  }

  span {
    font-size: $font-size-md;
    color: $color-text-primary;
    align-self: center;
  }
}

.top-controls {
  display: flex;
  justify-content: center !important;
  align-items: center;
  gap: $spacing-sm;
  flex-wrap: wrap;
  width: 100%;
}

.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  max-width: 400px;
  flex-shrink: 0;
  justify-self: center;

  input {
    width: 100%;
    padding: 12px 20px;
    font-size: $font-size-md;
    border-radius: 25px;
    border: 1px solid #d1d1d1;
    background: linear-gradient(145deg, #f0f0f0, #e0e0e0);
    box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.1), -4px -4px 10px rgba(255, 255, 255, 0.1);
    transition: all $transition-normal;

    &:focus {
      outline: none;
      border-color: $color-primary;
      box-shadow: 0 0 10px $color-primary-dark;
      background: linear-gradient(145deg, #e0e0e0, #f0f0f0);
    }

    &::placeholder {
      color: #aaa;
      opacity: 1;
    }
  }
}

@include respond-to(tablet) {
  table {
    width: 100%;
    overflow-x: auto;
    display: block;
  }

  th, td {
    padding: 8px 12px;
    font-size: $font-size-sm;
  }

  .pagination-controls button {
    padding: 8px 16px;
    font-size: $font-size-sm;
  }

  .confirm-dialog {
    width: 90%;
  }

  .top-controls {
    flex-wrap: wrap;
    justify-content: center;
  }

  .search-container {
    max-width: 100%;
  }
}

@include respond-to(mobile) {
  table {
    font-size: $font-size-xs;
  }

  .pagination-controls button {
    font-size: $font-size-xs;
  }
}
</style>


