
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
<script>
import { userAPI, statsAPI } from '../api/index'; // 引入 API 模塊
import { BasePagination, BaseSearchInput } from '@/components/common';

export default {
  name: 'UserManagement',
  components: {
    BasePagination,
    BaseSearchInput
  },
  data() {
    return {
      users: [],
      searchQuery: '',  // 用于存储搜索框的内容
      searchResultIndex: -1,  // 存储匹配的行索引
      filteredUsers: [],  // 新增的字段，确保 Vue 可以访问它
      confirmUser: null,  // 儲存選中的用戶
      newUser: { username: '', email: '' }, // 新用戶的數據
      currentPage: 1,  // 当前页码
      pageSize: 30,  // 每页显示的记录数
      totalPages: 1,  // 总页数
      sortOrder: {  // 控制排序的对象
        username: 'asc',
        email: 'asc',
        data_count: 'asc',
      },
      username: '',  // 当前的用户名
    };
  },
  methods: {
    async getUsers() {
      try {
        // 调用获取用户数据的函数
        await this.fetchUserData();
      } catch (error) {
        // console.error('Error fetching users', error);
        if (error.response && error.response.status === 401) {
          alert('Token 无效或已过期，请重新登录');

          // 延迟 0.5 秒后重试
          setTimeout(async () => {
            try {
              await this.fetchUserData();  // 重新调用获取数据函数
            } catch (retryError) {
              console.error('Retry failed', retryError);
              this.$router.push({ name: 'Login' });  // 如果重试失败，跳转到登录页面
            }
          }, 500);  // 延迟 0.5 秒（500 毫秒）
        }
      }
    },

// 封装获取用户数据的函数
    async fetchUserData() {
      const response = await userAPI.getAllUsers();
      const users = response.data;

      const dataCountResponse = await statsAPI.getDataCounts();
      const dataCounts = dataCountResponse.data;

      // 将数据总数与用户列表合并
      users.forEach(user => {
        const userData = dataCounts.find(item => item.username === user.username);
        user.data_count = userData ? userData.data_count : 0;
      });

      this.users = users;
      this.totalPages = Math.ceil(this.users.length / this.pageSize);  // 计算总页数
    },

    // 获取箭头的 CSS 类
    getArrowClass(field) {
      return this.sortOrder[field] === 'asc' ? 'arrow-up' : 'arrow-down';
    },

    searchUser() {
      // console.log("Search Query:", this.searchQuery);  // 调试：打印搜索框输入的内容
      const searchQueryLower = this.searchQuery.toLowerCase();

      // 过滤符合条件的用户
      this.filteredUsers = this.users.filter(user =>
          (user.username && user.username.toLowerCase().includes(searchQueryLower)) ||
          (user.email && user.email.toLowerCase().includes(searchQueryLower))
      );

      // console.log("Filtered Users:", this.filteredUsers);  // 调试：打印过滤后的用户

      this.currentPage = 1;
      this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    },


    // 排序方法
    sortData(field) {
      const currentOrder = this.sortOrder[field] === 'asc' ? 'desc' : 'asc';
      this.sortOrder[field] = currentOrder;

      if (field === 'username' || field === 'email') {
        // 字符串字段排序
        this.users.sort((a, b) => {
          const valueA = a[field] || '';
          const valueB = b[field] || '';
          return currentOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });
      } else if (field === 'data_count') {
        // 数字字段排序
        this.users.sort((a, b) => {
          return currentOrder === 'asc' ? a[field] - b[field] : b[field] - a[field];
        });
      }

      // 排序之后重新计算分页
      this.totalPages = Math.ceil(this.users.length / this.pageSize);
      this.currentPage = 1;  // 重置当前页为第一页
    },

    // 处理分页变化
    handlePageChange(page) {
      this.currentPage = page;
    },

    // 詳細api
    async apidetail(user) {
      this.$router.push({name: 'ApiDetail'});
    },

    // 跳轉到創建用戶頁面
    goToCreateUser() {
      this.$router.push({ name: 'CreateUser' });  // 跳轉到創建用戶頁面
    },
    checkServerStatus() {
      // 新分頁打開阿里雲服務器控制台
      // window.open('https://ecs.console.aliyun.com/server/region/cn-shenzhen#/', '_blank');
      window.open('https://47.115.57.138:40260/home', '_blank')
    },

    // 查看用戶統計
    async viewUserStats(user) {
      this.$router.push({name: 'UserStats', query: {username: user.username}});
    },
    async viewAllCustom() {
      this.$router.push({name: 'Custom'});
    },
    // 編輯用戶
    async editUser(user) {
      this.$router.push({name: 'EditUser', query: {username: user.username, email: user.email}});
    },
    // 查看用戶個人界面
    goToCustomPerUser(user) {
      this.$router.push({ name: 'PerUser' ,query: {username: user.username}});  // 跳轉到創建用戶頁面
    },
    // 跳轉到會話管理頁面
    goToSessionManagement() {
      this.$router.push({ name: 'GlobalSessionManagement' });
    },
    // 查看用戶會話
    viewUserSessions(user) {
      this.$router.push({
        name: 'UserSessionManagement',
        params: { userId: user.id },
        query: {
          username: user.username
        }
      });
    },
    logout() {
      // 退出後跳轉到 WEB_BASE
      window.location.href = window.WEB_BASE;
    },

  },
  computed: {
    // 当前页面的数据
    currentPageData() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const currentData = this.searchQuery ? this.filteredUsers : this.users; // 如果有搜索，使用 filteredUsers 否则使用原始 users
      if (!Array.isArray(currentData)) return [];
      return currentData.slice(startIndex, startIndex + this.pageSize);  // 根据当前页码和每页显示的数据数量筛选
    },
  },
  mounted() {
    this.getUsers();  // 加載用戶列表
  },
};
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


