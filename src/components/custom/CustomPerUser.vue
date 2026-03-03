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

    <BaseTable
      v-if="users.length"
      :columns="customColumns"
      :data="currentPageData"
      :selectable="selectMode"
      :row-key="'created_at'"
      @sort="handleSort"
      @selection-change="handleSelectionChange"
      ref="tableRef"
    >
      <template #cell-說明="{ value }">
        {{ value || '無' }}
      </template>
      <template #cell-created_at="{ value }">
        {{ formatTime(value) }}
      </template>
    </BaseTable>
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

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from "../../axios.js";
import { formatTime } from "../../utils.js";
import { useCustomStore } from "../../stores";
import { BaseTable } from '@/components/common';

const router = useRouter();
const route = useRoute();
const customStore = useCustomStore();

const users = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(30);
const totalPages = ref(1);
const username = ref('');
const selectMode = ref(false);
const selectedUsers = ref([]);
const tableRef = ref(null);

const customColumns = [
  { key: '簡稱', label: '簡稱 🌏', sortable: true },
  { key: '音典分區', label: '音典分區', sortable: true },
  { key: '經緯度', label: '經緯度', sortable: true },
  { key: '特徵', label: '特徵', sortable: true },
  { key: '聲韻調', label: '聲韻調', sortable: true },
  { key: '值', label: '值 ✔️', sortable: true },
  { key: '說明', label: '說明 🔔', sortable: true },
  { key: 'created_at', label: '創建時間', sortable: true }
];

const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value;
  }
  return users.value.filter(user => {
    const searchTerm = searchQuery.value.toLowerCase();
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
});

const currentPageData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return filteredUsers.value.slice(startIndex, startIndex + pageSize.value);
});

const isAllSelected = computed(() => {
  return selectedUsers.value.length > 0 && selectedUsers.value.length === users.value.length;
});

const toggleSelectMode = () => {
  selectMode.value = !selectMode.value;
  if (!selectMode.value && tableRef.value) {
    tableRef.value.clearSelection();
  }
  selectedUsers.value = [];
};

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection.map(row => row.created_at);
};

const reverseSelect = () => {
  // BaseTable doesn't support reverse selection directly
  // We need to manually select/deselect rows
  const allCreatedAts = users.value.map(u => u.created_at);
  const currentSelected = new Set(selectedUsers.value);
  const newSelection = allCreatedAts.filter(ca => !currentSelected.has(ca));

  // Update selectedUsers which will trigger selection change
  selectedUsers.value = newSelection;
};

const handleSort = ({ key, order }) => {
  const currentData = searchQuery.value ? filteredUsers.value : users.value;

  currentData.sort((a, b) => {
    const valueA = a[key] || '';
    const valueB = b[key] || '';

    if (key === 'created_at') {
      const timeA = new Date(valueA).getTime();
      const timeB = new Date(valueB).getTime();
      return order === 'asc' ? timeA - timeB : timeB - timeA;
    } else {
      return order === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    }
  });

  currentPage.value = 1;
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const goToCreateCustom = (username) => {
  router.push({
    name: 'CreateCustom',
    query: { username: username }
  });
};

const goToDeleteCustom = (username) => {
  customStore.setSelectedUsers(selectedUsers.value);
  customStore.setCurrentUsername(username);

  router.push({
    name: 'DeleteCustom',
    query: { username: username }
  });
};

const goToEditCustom = (username) => {
  customStore.setSelectedUsers(selectedUsers.value);
  customStore.setCurrentUsername(username);

  router.push({
    name: 'EditCustom',
    query: { username: username }
  });
};

const goToHome = () => {
  router.push({ name: 'Home' });
};

onMounted(async () => {
  const usernameQuery = route.query.username;
  const created_at = route.query.created_at;
  if (created_at) {
    searchQuery.value = created_at;
  }
  username.value = usernameQuery;
  try {
    const response = await api.get(`/custom/user?query=${usernameQuery}`);
    users.value = response.data;
    totalPages.value = Math.ceil(users.value.length / pageSize.value);
  } catch (error) {
    console.error("API 请求错误:", error);
  }
});
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

