<template>
  <div class="session-management">
    <h1>會話管理系統</h1>

    <div class="stats-container">
      <div class="stats-card">
        <div class="number">{{ stats.active_tokens || 0 }}</div>
        <div class="label">活躍會話</div>
      </div>
      <div class="stats-card">
        <div class="number">{{ stats.active_users || 0 }}</div>
        <div class="label">在線用戶</div>
      </div>
      <div class="stats-card">
        <div class="number">{{ stats.revoked_tokens || 0 }}</div>
        <div class="label">已撤銷</div>
      </div>
    </div>

    <div class="controls">
      <button @click="fetchData" :disabled="loading">
        {{ loading ? '加載中...' : '刷新列表' }}
      </button>
      <button @click="cleanupExpired" class="warning-btn" :disabled="loading">
        清理過期Token
      </button>
      <BaseSearchInput
        v-model="searchQuery"
        placeholder="搜索用戶名、設備信息..."
        input-class="search-input"
      />
    </div>

    <div class="table-container">
      <BaseTable
        v-if="!loading && filteredSessions.length > 0"
        :columns="sessionColumns"
        :data="paginatedSessions"
        :sortable="false"
      >
        <template #cell-device_info="{ value }">
          {{ value || 'Unknown' }}
        </template>
        <template #cell-created_at="{ value }">
          {{ formatTime(value) }}
        </template>
        <template #cell-expires_at="{ value }">
          {{ formatExpireTime(value) }}
        </template>
        <template #actions="{ row }">
          <button @click="revokeSession(row.id, row.username)" class="revoke-btn">
            撤銷
          </button>
        </template>
      </BaseTable>

      <div v-else-if="loading" class="loading">
        加載中...
      </div>

      <div v-else class="no-data">
        暫無活躍會話
      </div>
    </div>

    <BasePagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-size="pageSize"
      :show-first-last="false"
      info-format="simple"
      @page-change="handlePageChange"
    />

    <div class="back-button">
      <button @click="goBack">返回首頁</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import userSessionAPI from '../../api/userSession';
import { BasePagination, BaseSearchInput, BaseTable } from '@/components/common';

const router = useRouter();
const route = useRoute();

const sessions = ref([]);
const stats = ref({});
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(30);
const loading = ref(false);
const userId = ref(null);

const sessionColumns = [
  { key: 'username', label: '用戶', sortable: false },
  { key: 'device_info', label: '設備信息', sortable: false },
  { key: 'created_at', label: '登錄時間', sortable: false },
  { key: 'expires_at', label: '過期時間', sortable: false }
];

const filteredSessions = computed(() => {
  if (!searchQuery.value) {
    return sessions.value;
  }
  const query = searchQuery.value.toLowerCase();
  return sessions.value.filter(session =>
    session.username?.toLowerCase().includes(query) ||
    session.device_info?.toLowerCase().includes(query)
  );
});

const paginatedSessions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredSessions.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredSessions.value.length / pageSize.value);
});

const fetchSessions = async () => {
  const params = {
    skip: 0,
    limit: 1000
  };

  // 如果有 user_id，添加到查詢參數中
  if (userId.value) {
    params.user_id = userId.value;
  }

  const response = await userSessionAPI.getActiveSessions(params);
  sessions.value = response.data.sessions || [];
};

const fetchStats = async () => {
  const response = await userSessionAPI.getStats();
  stats.value = response.data || {};
};

const fetchData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      fetchSessions(),
      fetchStats()
    ]);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    handleError(error);
  } finally {
    loading.value = false;
  }
};

const revokeSession = async (tokenId, username) => {
  try {
    await ElMessageBox.confirm(
      `確定要撤銷用戶 ${username} 的此會話嗎？該用戶將在此設備上被強制登出。`,
      '撤銷會話',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await userSessionAPI.revokeSession(tokenId);
    ElMessage.success('會話已撤銷');
    await fetchData();
  } catch (error) {
    if (error !== 'cancel') {
      handleError(error);
    }
  }
};

const cleanupExpired = async () => {
  try {
    await ElMessageBox.confirm(
      '確定要清理所有過期的 Token 嗎？',
      '清理過期 Token',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    const response = await userSessionAPI.cleanupExpired();
    ElMessage.success(`已清理 ${response.data.deleted_count} 個過期 Token`);
    await fetchData();
  } catch (error) {
    if (error !== 'cancel') {
      handleError(error);
    }
  }
};

const handleError = (error) => {
  if (error.response?.status === 403) {
    ElMessage.error('沒有權限執行此操作');
  } else if (error.response?.status === 404) {
    ElMessage.error('會話不存在或已被撤銷');
  } else if (error.response?.status === 401) {
    ElMessage.error('登錄已過期，請重新登錄');
    router.push('/login');
  } else {
    ElMessage.error('操作失敗，請稍後重試');
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return '-';

  // 處理不同的時間戳格式
  let date;
  if (typeof timestamp === 'string') {
    // 如果是字符串，確保正確解析 UTC 時間
    // 如果沒有時區標識（Z 或 +08:00），則當作 UTC 時間處理
    let timeStr = timestamp;
    if (!timeStr.includes('Z') && !timeStr.includes('+') && !timeStr.includes('-', 10)) {
      // 將空格替換為 T，並添加 Z 表示 UTC
      timeStr = timeStr.replace(' ', 'T') + 'Z';
    }
    date = new Date(timeStr);
  } else if (typeof timestamp === 'number') {
    // 如果是數字，判斷是秒還是毫秒
    // 如果小於 10000000000，認為是秒（2001年之前）
    if (timestamp < 10000000000) {
      date = new Date(timestamp * 1000);
    } else {
      date = new Date(timestamp);
    }
  } else {
    return '-';
  }

  // 檢查日期是否有效
  if (isNaN(date.getTime())) {
    console.error('Invalid timestamp:', timestamp);
    return 'Invalid Date';
  }

  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分鐘前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小時前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;

  return date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
};

const formatExpireTime = (timestamp) => {
  if (!timestamp) return '-';

  // 處理不同的時間戳格式
  let date;
  if (typeof timestamp === 'string') {
    // 如果是字符串，確保正確解析 UTC 時間
    let timeStr = timestamp;
    if (!timeStr.includes('Z') && !timeStr.includes('+') && !timeStr.includes('-', 10)) {
      timeStr = timeStr.replace(' ', 'T') + 'Z';
    }
    date = new Date(timeStr);
  } else if (typeof timestamp === 'number') {
    if (timestamp < 10000000000) {
      date = new Date(timestamp * 1000);
    } else {
      date = new Date(timestamp);
    }
  } else {
    return '-';
  }

  // 檢查日期是否有效
  if (isNaN(date.getTime())) {
    console.error('Invalid expire timestamp:', timestamp);
    return 'Invalid Date';
  }

  const now = new Date();
  const diff = Math.floor((date - now) / 1000);

  if (diff < 0) return '已過期';
  if (diff < 3600) return `${Math.floor(diff / 60)}分鐘後過期`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小時後過期`;

  return `${Math.floor(diff / 86400)}天後過期`;
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

const goBack = () => {
  router.push('/');
};

onMounted(() => {
  // 從路由查詢參數中獲取 user_id
  userId.value = route.query.user_id;
  fetchData();
});

onActivated(() => {
  // 從路由查詢參數中獲取 user_id
  userId.value = route.query.user_id;
  fetchData();
});
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.session-management {
  padding: $spacing-md;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #2c6e49;
  margin-bottom: 30px;
}

.stats-container {
  display: flex;
  justify-content: center;
  gap: $spacing-md;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.stats-card {
  padding: $spacing-md 30px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  text-align: center;
  min-width: 150px;
  transition: transform $transition-normal;

  &:hover {
    transform: translateY(-5px);
  }

  .number {
    font-size: 36px;
    font-weight: bold;
    color: #2c6e49;
  }

  .label {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin-top: $spacing-xs;
  }
}

.controls {
  display: flex;
  gap: 8px;
  margin-bottom: $spacing-md;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: $spacing-sm 15px;
  font-size: $font-size-md;
  border: 2px solid $color-primary;
  border-radius: $radius-md;
  outline: none;
  transition: border-color $transition-normal;

  &:focus {
    border-color: $color-primary-dark;
  }
}

button {
  @include button-variant($color-primary, $color-primary-dark);
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-md;
  border-radius: $radius-md;
}

.warning-btn {
  background-color: $color-warning;

  &:hover:not(:disabled) {
    background-color: darken($color-warning, 10%);
  }
}

.revoke-btn {
  background-color: $color-danger;
  padding: 6px 12px;
  font-size: $font-size-sm;

  &:hover {
    background-color: darken($color-danger, 10%);
  }
}

.table-container {
  overflow-x: auto;
  margin-bottom: $spacing-md;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: $color-background-white;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-md;

  thead {
    background-color: $color-primary;
    color: $color-text-white;
  }

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    font-weight: bold;
  }

  tbody {
    tr {
      @include table-row-hover(#f5f5f5);

      &:last-child td {
        border-bottom: none;
      }
    }
  }
}

.loading, .no-data {
  text-align: center;
  padding: 40px;
  color: $color-text-secondary;
  font-size: $font-size-lg;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: $spacing-md;

  span {
    font-size: $font-size-md;
    color: $color-text-secondary;
  }
}

.back-button {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@include respond-to(tablet) {
  .stats-container {
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
  }

  .controls {
    flex-direction: column;
  }

  table {
    font-size: $font-size-sm;
  }

  th, td {
    padding: 8px;
  }

  .stats-card {
    padding: $spacing-sm $spacing-md;
  }
}
</style>
