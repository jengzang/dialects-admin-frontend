<template>
  <div>
    <h2 style="margin:0 20px 10px;">用戶管理系統</h2>

    <div class="top-controls">
      <div class="button-container0">
        <button @click="goToCreateUser">創建新用戶</button>
        <button @click="apidetail">近期api調用</button>
        <button @click="goToAnalytics">數據分析</button>
        <button @click="goToUserBehavior">用戶行為</button>
        <button @click="goToAnomalyDetection">異常檢測</button>
        <button @click="viewAllCustom">所有數據</button>
        <button @click="goToSessionManagement">會話管理</button>
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
  try {
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
  } catch (error) {
    console.error('Failed to fetch user data:', error);
  }
};

const getUsers = async () => {
  try {
    await fetchUserData();
  } catch (error) {
    if (error.response && error.response.status === 401) {
      alert('Token 無效或已過期，請重新登錄');

      setTimeout(async () => {
        try {
          await fetchUserData();
        } catch (retryError) {
          console.error('Retry failed', retryError);
          alert('重試失敗，請重新登錄');
          router.push({ name: 'Login' });
        }
      }, 500);
    }
  }
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

const getArrowClass = (field) => {
  return sortOrder.value[field] === 'asc' ? 'arrow-up' : 'arrow-down';
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

const apidetail = () => {
  router.push({ name: 'ApiDetail' });
};

const goToAnalytics = () => {
  router.push({ name: 'AnalyticsDashboard' });
};

const goToUserBehavior = () => {
  router.push({ name: 'UserBehaviorDashboard' });
};

const goToAnomalyDetection = () => {
  router.push({ name: 'AnomalyDetectionPanel' });
};

const goToCreateUser = () => {
  router.push({ name: 'CreateUser' });
};

const viewUserStats = (user) => {
  router.push({ name: 'UserStats', query: { username: user.username } });
};

const viewAllCustom = () => {
  router.push({ name: 'Custom' });
};

const editUser = (user) => {
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
    query: { username: user.username }
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

.user-management {
  padding: $spacing-md;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 $spacing-md 0;
  text-align: center;
  color: $color-text-primary;
}

.top-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: $spacing-md;
  flex-wrap: wrap;
  margin-bottom: $spacing-lg;
}

.button-group {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
  justify-content: center;
}

.search-container {
  flex: 1;
  max-width: 400px;
  min-width: 250px;
}

.action-buttons {
  display: flex;
  gap: $spacing-xs;
  flex-wrap: wrap;
  justify-content: center;
}

.empty-state {
  text-align: center;
  color: $color-text-secondary;
  margin: $spacing-xl 0;
}

.pagination-controls {
  margin-top: $spacing-lg;
}

.logout-button-container {
  display: flex;
  justify-content: center;
  margin-top: $spacing-xl;
}

/* 移動端響應式 */
@include respond-to(tablet) {
  .top-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .button-group {
    width: 100%;
  }

  .search-container {
    max-width: 100%;
  }

  .action-buttons {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }
}

@include respond-to(mobile) {
  .user-management {
    padding: $spacing-sm;
  }

  .page-title {
    font-size: $font-size-lg;
  }

  .button-group {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }

  .action-buttons {
    gap: $spacing-xs;

    .btn-sm {
      font-size: $font-size-xs;
      padding: 6px 8px;
    }
  }
}
</style>


