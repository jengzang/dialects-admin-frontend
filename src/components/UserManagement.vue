<template>
  <div class="user-management">
    <h2 class="page-title">用戶管理系統</h2>

    <div class="top-controls">
      <div class="button-group">
        <button class="btn btn-primary" @click="goToCreateUser">創建新用戶</button>
        <button class="btn btn-primary" @click="apidetail">近期api調用</button>
        <button class="btn btn-primary" @click="goToAnalytics">數據分析</button>
        <button class="btn btn-primary" @click="goToUserBehavior">用戶行為</button>
        <button class="btn btn-primary" @click="viewAllCustom">所有數據</button>
        <button class="btn btn-primary" @click="goToSessionManagement">會話管理</button>
      </div>

      <div class="search-container">
        <BaseSearchInput
          v-model="searchQuery"
          @update:modelValue="searchUser"
          placeholder="搜索用戶名或郵箱"
        />
      </div>
    </div>

    <!-- 使用 BaseTable -->
    <BaseTable
      v-if="users.length"
      :columns="tableColumns"
      :data="currentPageData"
      :loading="loading"
      @sort="handleSort"
    >
      <!-- 用戶名列 -->
      <template #cell-username="{ row }">
        <span v-if="row.role === 'admin'" style="font-weight: bold;" title="管理员">🛠️</span>
        <span :style="{ fontWeight: row.role === 'admin' ? 'bold' : 'normal' }">
          {{ row.username }}
        </span>
      </template>

      <!-- 數據總數列 -->
      <template #cell-data_count="{ value }">
        {{ value }}條
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <div class="action-buttons">
          <button class="btn btn-sm btn-primary" @click="goToCustomPerUser(row)">用戶數據</button>
          <button class="btn btn-sm btn-primary" @click="viewUserStats(row)">api統計</button>
          <button class="btn btn-sm btn-primary" @click="viewUserSessions(row)">查看會話</button>
          <button class="btn btn-sm btn-secondary" @click="editUser(row)">編輯賬號</button>
        </div>
      </template>
    </BaseTable>

    <h3 v-else class="empty-state">🤷‍♂️<br>無用戶數據</h3>

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
      <button class="btn btn-secondary" @click="logout">返回網站</button>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userAPI, statsAPI } from '../api/index';
import { BasePagination, BaseSearchInput, BaseTable } from '@/components/common';
import { useMessage } from '@/composables';

const router = useRouter();
const { showMessage } = useMessage();

const users = ref([]);
const searchQuery = ref('');
const filteredUsers = ref([]);
const currentPage = ref(1);
const pageSize = ref(30);
const totalPages = ref(1);
const loading = ref(false);

// 表格列定义
const tableColumns = [
  { key: 'username', label: '用戶名', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'data_count', label: '數據總數', sortable: true }
];

const fetchUserData = async () => {
  loading.value = true;
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
    showMessage('獲取用戶數據失敗', 'error');
    console.error('Failed to fetch user data:', error);
  } finally {
    loading.value = false;
  }
};

const getUsers = async () => {
  try {
    await fetchUserData();
  } catch (error) {
    if (error.response && error.response.status === 401) {
      showMessage('Token 無效或已過期，請重新登錄', 'warning');

      setTimeout(async () => {
        try {
          await fetchUserData();
        } catch (retryError) {
          console.error('Retry failed', retryError);
          showMessage('重試失敗，請重新登錄', 'error');
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

// 处理 BaseTable 的排序事件
const handleSort = ({ key, order }) => {
  const currentData = searchQuery.value ? filteredUsers.value : users.value;

  currentData.sort((a, b) => {
    const valueA = a[key] || '';
    const valueB = b[key] || '';

    if (key === 'data_count') {
      return order === 'asc' ? valueA - valueB : valueB - valueA;
    } else {
      return order === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    }
  });

  currentPage.value = 1;
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


