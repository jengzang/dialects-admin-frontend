<template>
  <div>
    <h1 v-if="showHeader">{{username}}的區域--共 {{ users.length }} 條</h1>
    <div class="top-controls">
      <button @click="goToCreateRegion(username)" style="margin:10px 10px 0 0">添加區域</button>
      <!-- 只有在 selectMode 为 false 时显示 \"選擇區域\" 按钮 -->
      <button v-if="!selectMode" @click="toggleSelectMode" style="background: #1c8dba;">
        選擇區域
      </button>

      <!-- 只有在 selectMode 为 true 时显示 \"關閉選擇\" 按钮，并显示操作按钮 -->
      <div v-if="selectMode" class="select-mode-buttons">
        <button @click="goToDeleteRegion(username)" style="background: darkred;">刪除區域</button>
        <button @click="toggleSelectMode" style="background: #9e9d24;">
          關閉選擇
        </button>
        <button @click="goToEditRegion(username)" style="background: darkblue;">編輯區域</button>
        <button @click="reverseSelect" style="background: #777;">反選</button>
      </div>

      <!-- 搜索框 -->
      <div class="search-container">
        <input v-model="searchQuery" @input="searchUser" type="text" placeholder="搜索區域名、說明" />
      </div>
    </div>

    <BaseTable
      v-if="users.length"
      :columns="regionsColumns"
      :data="currentPageData"
      :selectable="selectMode"
      :row-key="'id'"
      @sort="handleSort"
      @selection-change="handleSelectionChange"
      ref="tableRef"
    >
      <template #cell-locations="{ value }">
        {{ value.join(', ') }}
      </template>
      <template #cell-description="{ value }">
        {{ value || '無' }}
      </template>
      <template #cell-created_at="{ value }">
        {{ formatTime(value) }}
      </template>
    </BaseTable>
    <h3 v-else>🤷‍♂️<br>{{ username }} 無個人區域</h3>

    <!-- 分頁控制 -->
    <div class="pagination-controls">
      <button @click="prevPage" :disabled="currentPage === 1">上一頁</button>
      <span>頁面 {{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一頁</button>
    </div>
    <div v-if="showHomeButton" class="logout-button-container">
      <button @click="goToHome" >返回首頁</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { customRegionsAPI } from '@/api';
import { formatTime } from '@/utils';
import { useCustomRegionsStore } from '@/stores';
import { BaseTable } from '@/components/common';

const props = defineProps({
  showHeader: {
    type: Boolean,
    default: true
  },
  showHomeButton: {
    type: Boolean,
    default: true
  }
});

const router = useRouter();
const route = useRoute();
const customRegionsStore = useCustomRegionsStore();

const users = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(30);
const totalPages = ref(1);
const username = ref('');
const selectMode = ref(false);
const selectedUsers = ref([]);
const tableRef = ref(null);

const regionsColumns = [
  { key: 'region_name', label: '區域名', sortable: true },
  { key: 'locations', label: '地點列表', sortable: false },
  { key: 'location_count', label: '地點數量', sortable: true },
  { key: 'description', label: '說明', sortable: true },
  { key: 'created_at', label: '創建時間', sortable: true }
];

const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value;
  }
  return users.value.filter(user => {
    const searchTerm = searchQuery.value.toLowerCase();
    return (
        (user.region_name && user.region_name.toLowerCase().includes(searchTerm)) ||
        (user.description && user.description.toLowerCase().includes(searchTerm)) ||
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
  selectedUsers.value = selection.map(row => row.id);
};

const reverseSelect = () => {
  const allIds = users.value.map(u => u.id);
  const currentSelected = new Set(selectedUsers.value);
  const newSelection = allIds.filter(id => !currentSelected.has(id));
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
    } else if (key === 'location_count') {
      return order === 'asc' ? valueA - valueB : valueB - valueA;
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

const searchUser = () => {
  currentPage.value = 1;
};

const goToCreateRegion = (username) => {
  router.push({
    name: 'CreateRegion',
    query: { username: username }
  });
};

const goToDeleteRegion = (username) => {
  customRegionsStore.setSelectedRegions(selectedUsers.value);
  customRegionsStore.setCurrentUsername(username);

  router.push({
    name: 'DeleteRegion',
    query: { username: username }
  });
};

const goToEditRegion = (username) => {
  customRegionsStore.setSelectedRegions(selectedUsers.value);
  customRegionsStore.setCurrentUsername(username);

  router.push({
    name: 'EditRegion',
    query: { username: username }
  });
};

const goToHome = () => {
  router.push({ name: 'Home' });
};

onMounted(async () => {
  const usernameQuery = route.query.username;
  username.value = usernameQuery;
  try {
    const response = await customRegionsAPI.getUserRegions(usernameQuery);
    // API 返回格式: { username, total, regions: [...] }
    users.value = response.regions || [];
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

