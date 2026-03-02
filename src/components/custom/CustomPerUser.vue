<template>
  <div>
    <h1>{{username}}的數據--共 {{ users.length }} 條</h1>
    <div class="top-controls">
      <button @click="goToCreateCustom(username)" style="margin:10px 10px 0 0">添加數據</button><!-- 需要排布為 2x2 的按鈕 -->
      <!-- 只有在 selectMode 为 false 时显示 "選擇數據" 按钮 -->
      <button v-if="!selectMode" @click="toggleSelectMode" style="background: #1c8dba;">
        選擇數據
      </button>

      <!-- 只有在 selectMode 为 true 时显示 "關閉選擇" 按钮，并显示操作按钮 -->
      <div v-if="selectMode" class="select-mode-buttons">
        <button @click="goToDeleteCustom(username)" style="background: darkred;">刪除數據</button>
        <button @click="toggleSelectMode" style="background: #9e9d24;">
          關閉選擇
        </button>
        <button @click="goToEditCustom(username)" style="background: darkblue;">編輯數據</button>
        <button @click="reverseSelect" style="background: #777;">反選</button>
      </div>

      <!-- 搜索框 -->
      <div class="search-container">
        <input v-model="searchQuery" @input="searchUser" type="text" placeholder="搜索用戶名、簡稱、音典分區、特徵、聲韻調、值、說明" />
      </div>
    </div>

    <table v-if="users.length" border="1">
      <thead>
      <tr>
        <th v-if="selectMode">
          <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
        </th>
        <th @click="sortData('簡稱')">簡稱 🌏<span :class="getArrowClass('簡稱')"></span></th>
        <th @click="sortData('音典分區')">音典分區 <span :class="getArrowClass('音典分區')"></span></th>
        <th @click="sortData('經緯度')">經緯度 <span :class="getArrowClass('經緯度')"></span></th>
        <th @click="sortData('特徵')">特徵 <span :class="getArrowClass('特徵')"></span></th>
        <th @click="sortData('聲韻調')">聲韻調 <span :class="getArrowClass('聲韻調')"></span></th>
        <th @click="sortData('值')"> 值 ✔️<span :class="getArrowClass('值')"></span></th>
        <th @click="sortData('說明')" style="min-width: 120px">說明 🔔<span :class="getArrowClass('說明')"></span></th>
        <th @click="sortData('created_at')">創建時間 <span :class="getArrowClass('created_at')"></span></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="user in currentPageData" :key="user.id">
        <td v-if="selectMode">
          <input type="checkbox" :checked="isSelected(user.created_at)" @change="toggleSelection(user.created_at)" />
        </td>
        <td>{{ user.簡稱 }}</td>
        <td>{{ user.音典分區 }}</td>
        <td>{{ user.經緯度 }}</td>
        <td>{{ user.特徵 }}</td>
        <td>{{ user.聲韻調 }}</td>
        <td>{{ user.值 }}</td>
        <td>{{ user.說明 || '無' }}</td> <!-- 如果說明為 null 或 undefined，顯示 '無' -->
        <td>{{ formatTime(user.created_at) }}</td>
      </tr>
      </tbody>
    </table>
    <h3 v-else>🤷‍♂️<br>{{ username }} 無個人數據</h3>

    <!-- 分頁控制 -->
    <div class="pagination-controls">
      <button @click="prevPage" :disabled="currentPage === 1">上一頁</button>
      <span>頁面 {{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一頁</button>
    </div>
    <div class="logout-button-container">
      <button @click="goToHome" >返回首頁</button>
    </div>
  </div>
</template>

<script>
import api from "../../axios.js";
import { formatTime } from "../../utils.js";
import { useCustomStore } from "../../stores";

export default {
  setup() {
    const customStore = useCustomStore();
    return { customStore };
  },
  data() {
    return {
      users: [],  // 用於存儲從 API 獲取的用戶數據
      searchQuery: '',  // 用於存儲搜索框的內容
      currentPage: 1,  // 当前页码
      pageSize: 30,  // 每页显示的记录数
      totalPages: 1,  // 总页数
      sortOrder: {  // 控制排序的对象
        簡稱: 'asc',
        音典分區: 'asc',
        經緯度: 'asc',
        特徵: 'asc',
        聲韻調: 'asc',
        值: 'asc',
        說明: 'asc',
        created_at: 'asc',
      },
      sortField: '',  // 当前排序字段
      username: '',  // 当前的用户名
      selectMode: false, // 控制是否处于选择模式
      selectedUsers: [],  // 存储被选中的用户id
      // selectAll: false, // 用于全选/反选
    };
  },
  async mounted() {
    // console.log(this.selectedUsers.length > 0 && this.selectedUsers.length === this.users.length)
    const { username } = this.$route.query;  // 从路由参数中获取用户名
    const { created_at } = this.$route.query;  // 从路由查询参数中获取创建时间
    if (created_at) {
      this.searchQuery = created_at;  // 将创建时间填入搜索框
    }
    this.username = username;  // 设置当前的用户名
    try {
      const response = await api.get(`/custom/user?query=${username}`);
      this.users = response.data;
      this.totalPages = Math.ceil(this.users.length / this.pageSize);  // 计算总页数
    } catch (error) {
      console.error("API 请求错误:", error);
    }
  },
  computed: {
    currentPageData() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      return this.filteredUsers.slice(startIndex, startIndex + this.pageSize);  // 根据当前页码和每页显示的数据数量筛选
    },
    filteredUsers() {
      if (!this.searchQuery) {
        return this.users;
      }
      return this.users.filter(user => {
        const searchTerm = this.searchQuery.toLowerCase();
        return (
            (user.簡稱 && user.簡稱.toLowerCase().includes(searchTerm)) ||
            (user.音典分區 && user.音典分區.toLowerCase().includes(searchTerm)) ||
            (user.特徵 && user.特徵.toLowerCase().includes(searchTerm)) ||
            (user.聲韻調 && user.聲韻調.toLowerCase().includes(searchTerm)) ||
            (user.值 && user.值.toLowerCase().includes(searchTerm)) ||
            (user.說明 && user.說明.toLowerCase().includes(searchTerm)) ||
            formatTime(user.created_at).toLowerCase().includes(searchTerm)
        );
      });
    },
    isAllSelected() {
      // console.log(this.selectedUsers.length > 0 && this.selectedUsers.length === this.users.length)
      return this.selectedUsers.length > 0 && this.selectedUsers.length === this.users.length;
    },
  },
  methods: {
    formatTime,
    toggleSelectMode() {
      this.selectMode = !this.selectMode;
      this.selectedUsers = []; // 重置选中的数据
    },
    reverseSelect() {
      const selectedSet = new Set(this.selectedUsers);
      this.selectedUsers = this.users
          .map(user => user.created_at)
          .filter(created_at => !selectedSet.has(created_at)); // 反选未选中的数据
    },

    isSelected(createdAt) {
      return this.selectedUsers.includes(createdAt);
    },
    // 切换选中状态
    toggleSelection(createdAt) {
      const index = this.selectedUsers.indexOf(createdAt);
      if (index === -1) {
        this.selectedUsers.push(createdAt);
      } else {
        this.selectedUsers.splice(index, 1);
      }
    },
    toggleSelectAll() {

      if (this.selectedUsers.length === this.users.length) {
        // 如果当前已全选，则取消全选
        this.selectedUsers = [];
        // console.log(this.selectedUsers.length > 0 && this.selectedUsers.length === this.users.length)
      } else {
        // 否则全选
        this.selectedUsers = this.users.map(user => user.created_at);
        // console.log(this.selectedUsers.length > 0 && this.selectedUsers.length === this.users.length)
      }
    },

    getArrowClass(field) {
      return this.sortOrder[field] === 'asc' ? 'arrow-up' : 'arrow-down';
    },
    sortData(field) {
      const currentOrder = this.sortOrder[field] === 'asc' ? 'desc' : 'asc';
      this.sortOrder[field] = currentOrder;

      if (field === 'created_at') {
        this.users.sort((a, b) => {
          const timeA = new Date(a.created_at).getTime();
          const timeB = new Date(b.created_at).getTime();
          return currentOrder === 'asc' ? timeA - timeB : timeB - timeA;
        });
      } else {
        this.users.sort((a, b) => {
          const valueA = a[field] || '';
          const valueB = b[field] || '';
          return currentOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });
      }

      this.totalPages = Math.ceil(this.users.length / this.pageSize);
      this.currentPage = 1;
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    goToCreateCustom(username) {
      this.$router.push({
        name: 'CreateCustom',
        query: {username: username}
      });
    },
    goToDeleteCustom(username) {
      // 使用 customStore 存儲選中的數據
      this.customStore.setSelectedUsers(this.selectedUsers);
      this.customStore.setCurrentUsername(username);

      // 跳转到删除页面
      this.$router.push({
        name: 'DeleteCustom',
        query: {username: username}
      });
    },

    goToEditCustom(username) {
      // 使用 customStore 存儲選中的數據
      this.customStore.setSelectedUsers(this.selectedUsers);
      this.customStore.setCurrentUsername(username);

      // 跳转到编辑页面
      this.$router.push({
        name: 'EditCustom',
        query: {username: username}
      });
    },
    goToHome(){
      this.$router.push({name: 'Home'});
    },
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

h1 {
  font-size: 30px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0;
  color: #2c6e49;
}

p {
  font-size: $font-size-lg;
  text-align: center;
  margin-bottom: $spacing-md;
  color: $color-text-primary;
  font-weight: normal;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: $spacing-md;
  border-radius: $radius-md;
  overflow: hidden;

  th,
  td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: center;
    font-size: $font-size-md;
  }

  th {
    background-color: #e4f4e7;
    color: #2c6e49;
    font-weight: bold;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      background-color: #c8e7c2;
    }
  }

  td {
    background-color: #f9f9f9;
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

tr:hover {
  background-color: #e1f5e1;
}

.select-mode-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: $spacing-xs;
  margin-top: $spacing-sm;

  button {
    @include button-variant($color-primary, #45a049);
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-md;
    border-radius: 25px;
    max-width: 110px;
    min-width: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;

    button {
      margin: 0;
    }
  }
}

.top-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: $spacing-sm;

  button {
    @include button-variant($color-primary, #45a049);
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-md;
    border-radius: 25px;
    max-width: 110px;
    min-width: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

button[v-if="false"] {
  display: none;
}

.search-container input {
  width: 100%;
  padding: 12px 20px;
  font-size: $font-size-md;
  border-radius: 25px;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
  transition: all $transition-normal;
  margin-top: $spacing-sm;

  &:focus {
    @include input-focus($color-primary);
  }
}

.pagination-controls {
  margin-top: $spacing-md;
  text-align: center;

  button {
    @include button-variant($color-primary, #45a049);
    padding: 12px 24px;
    display: inline;
    margin: 0 $spacing-sm;
    border-radius: 20px;
    font-size: $font-size-md;

    &:disabled {
      background-color: rgba(76, 175, 80, 0.5);
    }
  }

  span {
    font-size: $font-size-md;
    color: $color-text-primary;
    align-self: center;
  }
}

@include respond-to(tablet) {
  th, td {
    padding: 8px;
  }

  .pagination-controls button {
    font-size: $font-size-sm;
    min-width: 100px;
  }

  table {
    font-size: $font-size-sm;
    overflow-x: auto;
    display: block;
  }

  th, td {
    padding: 8px 12px;
  }
}

@include respond-to(mobile) {
  table {
    font-size: $font-size-sm;
  }

  .pagination-controls button {
    font-size: $font-size-xs;
    padding: 8px 16px;
  }

  table {
    font-size: $font-size-xs;
  }
}
</style>

