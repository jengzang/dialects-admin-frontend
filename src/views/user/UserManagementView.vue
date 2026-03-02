<template>
  <div class="user-management-view">
    <h2 style="margin: 0 20px 10px;">用戶管理系統</h2>

    <div class="top-controls">
      <div class="button-container">
        <button class="btn btn-primary" @click="goToCreateUser">創建新用戶</button>
        <button class="btn btn-primary" @click="apidetail">近期api調用</button>
        <button class="btn btn-primary" @click="viewAllCustom">所有數據</button>
        <button class="btn btn-primary" @click="goToSessionManagement">會話管理</button>
      </div>

      <BaseSearchInput
        v-model="searchQuery"
        placeholder="搜索用戶名或郵箱"
        @update:modelValue="searchUser"
      />
    </div>

    <BaseTable
      :columns="tableColumns"
      :data="currentPageData"
      :loading="loading"
      @sort="handleSort"
    >
      <template #cell-data_count="{ value }">
        <span :style="{ color: value > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)' }">
          {{ value }}
        </span>
      </template>

      <template #actions="{ row }">
        <button class="btn btn-secondary btn-sm" @click="editUser(row)">編輯</button>
        <button class="btn btn-secondary btn-sm" @click="viewUserStats(row)">統計</button>
        <button class="btn btn-secondary btn-sm" @click="viewUserSessions(row)">會話</button>
      </template>
    </BaseTable>

    <BasePagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-size="pageSize"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script>
import { userAPI, statsAPI } from '@/api/index';
import { BasePagination, BaseSearchInput, BaseTable } from '@/components/common';

export default {
  name: 'UserManagementView',
  components: {
    BasePagination,
    BaseSearchInput,
    BaseTable
  },
  data() {
    return {
      users: [],
      searchQuery: '',
      currentPage: 1,
      pageSize: 30,
      totalPages: 1,
      loading: false,
      tableColumns: [
        { key: 'username', label: '用戶名', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'data_count', label: '數據總數', sortable: true }
      ]
    };
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery) return this.users;
      const query = this.searchQuery.toLowerCase();
      return this.users.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    },
    currentPageData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredUsers.slice(start, end);
    }
  },
  async mounted() {
    await this.fetchUserData();
  },
  methods: {
    async fetchUserData() {
      this.loading = true;
      try {
        const response = await userAPI.getAllUsers();
        const users = response.data;

        const dataCountResponse = await statsAPI.getDataCounts();
        const dataCounts = dataCountResponse.data;

        users.forEach(user => {
          const userData = dataCounts.find(item => item.username === user.username);
          user.data_count = userData ? userData.data_count : 0;
        });

        this.users = users;
        this.totalPages = Math.ceil(this.users.length / this.pageSize);
      } catch (error) {
        console.error('獲取用戶數據失敗:', error);
      } finally {
        this.loading = false;
      }
    },
    handleSort({ key, order }) {
      this.users.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (order === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    searchUser() {
      this.currentPage = 1;
      this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    },
    goToCreateUser() {
      this.$router.push({ name: 'CreateUser' });
    },
    apidetail() {
      this.$router.push({ name: 'ApiDetail' });
    },
    viewAllCustom() {
      this.$router.push({ name: 'Custom' });
    },
    goToSessionManagement() {
      this.$router.push({ name: 'SessionManagement' });
    },
    editUser(user) {
      this.$router.push({ name: 'EditUser', query: { username: user.username } });
    },
    viewUserStats(user) {
      this.$router.push({ name: 'UserStats', query: { username: user.username } });
    },
    viewUserSessions(user) {
      this.$router.push({ name: 'UserSessions', params: { userId: user.id }, query: { username: user.username } });
    }
  }
};
</script>

<style scoped>
.user-management-view {
  padding: var(--spacing-md);
}

.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-md);
}

.button-container {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  margin-right: var(--spacing-xs);
}
</style>
