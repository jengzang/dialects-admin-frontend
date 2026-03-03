<template>
  <div class="user-sessions">
    <h1>用戶 {{ username }} 的會話管理</h1>

    <div class="stats-info">
      <span>總會話數: {{ stats.total || 0 }}</span>
      <span>活躍會話: {{ stats.active || 0 }}</span>
      <span>已撤銷: {{ (stats.total || 0) - (stats.active || 0) }}</span>
    </div>

    <div class="controls">
      <button @click="fetchUserSessions" :disabled="loading">
        {{ loading ? '加載中...' : '刷新列表' }}
      </button>
      <button @click="revokeAllSessions" class="revoke-all-btn" :disabled="loading">
        撤銷所有會話
      </button>
    </div>

    <div class="table-container">
      <BaseTable
        v-if="!loading && sessions.length > 0"
        :columns="sessionColumns"
        :data="sessions"
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
        <template #cell-status="{ row }">
          <span :class="['status-badge', getStatusClass(row)]">
            {{ getStatusText(row) }}
          </span>
        </template>
        <template #actions="{ row }">
          <button
            v-if="!row.is_revoked && !isExpired(row)"
            @click="revokeSession(row.id)"
            class="revoke-btn"
          >
            撤銷
          </button>
          <span v-else>-</span>
        </template>
      </BaseTable>

      <div v-else-if="loading" class="loading">
        加載中...
      </div>

      <div v-else class="no-data">
        該用戶暫無會話記錄
      </div>
    </div>

    <div class="back-button">
      <button @click="goBack">返回首頁</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import userSessionAPI from '../../api/userSession';
import { BaseTable } from '@/components/common';

const router = useRouter();
const route = useRoute();

const sessions = ref([]);
const stats = ref({});
const loading = ref(false);
const userId = ref(null);
const username = ref('');

const sessionColumns = [
  { key: 'device_info', label: '設備信息', sortable: false },
  { key: 'created_at', label: '登錄時間', sortable: false },
  { key: 'expires_at', label: '過期時間', sortable: false },
  { key: 'status', label: '狀態', sortable: false }
];

const fetchUserSessions = async () => {
  loading.value = true;
  try {
    console.log(userId.value);
    const response = await userSessionAPI.getUserSessions(userId.value);
    sessions.value = response.data.sessions || [];
    stats.value = {
      total: response.data.total_sessions || 0,
      active: response.data.active_sessions || 0
    };
  } catch (error) {
    console.error('Failed to fetch user sessions:', error);
    handleError(error);
  } finally {
    loading.value = false;
  }
};

const revokeSession = async (tokenId) => {
  try {
    await ElMessageBox.confirm(
      `確定要撤銷此會話嗎？用戶將在此設備上被強制登出。`,
      '撤銷會話',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await userSessionAPI.revokeSession(tokenId);
    ElMessage.success('會話已撤銷');
    await fetchUserSessions();
  } catch (error) {
    if (error !== 'cancel') {
      handleError(error);
    }
  }
};

const revokeAllSessions = async () => {
  try {
    await ElMessageBox.confirm(
      `確定要撤銷用戶 ${username.value} 的所有會話嗎？該用戶將在所有設備上被強制登出。`,
      '撤銷所有會話',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    const response = await userSessionAPI.revokeUserSessions(userId.value);
    ElMessage.success(`已撤銷 ${response.data.revoked_count} 個會話`);
    await fetchUserSessions();
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

const isExpired = (session) => {
  if (!session.expires_at) return false;

  // 處理 ISO 8601 字符串格式
  let expiryDate;
  if (typeof session.expires_at === 'string') {
    // 確保正確解析 UTC 時間
    let timeStr = session.expires_at;
    if (!timeStr.includes('Z') && !timeStr.includes('+') && !timeStr.includes('-', 10)) {
      timeStr = timeStr.replace(' ', 'T') + 'Z';
    }
    expiryDate = new Date(timeStr);
  } else if (typeof session.expires_at === 'number') {
    expiryDate = session.expires_at < 10000000000
      ? new Date(session.expires_at * 1000)
      : new Date(session.expires_at);
  } else {
    return false;
  }

  return expiryDate < new Date();
};

const getStatusClass = (session) => {
  if (session.revoked) return 'status-revoked';
  if (isExpired(session)) return 'status-expired';
  return 'status-active';
};

const getStatusText = (session) => {
  if (session.revoked) return '已撤銷';
  if (isExpired(session)) return '已過期';
  return '活躍';
};

const formatTime = (timestamp) => {
  if (!timestamp) return '-';

  // 處理不同的時間戳格式
  let date;
  if (typeof timestamp === 'string') {
    // 如果是字符串，確保正確解析 UTC 時間
    let timeStr = timestamp;
    if (!timeStr.includes('Z') && !timeStr.includes('+') && !timeStr.includes('-', 10)) {
      // 將空格替換為 T，並添加 Z 表示 UTC
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

const goBack = () => {
  router.push('/');
};

onMounted(() => {
  userId.value = route.query.user_id;
  username.value = route.query.username || '未知用戶';
  if (userId.value) {
    fetchUserSessions();
  } else {
    ElMessage.error('缺少用戶ID參數');
    router.push('/admin');
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.user-sessions {
  padding: $spacing-md;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #2c6e49;
  margin-bottom: 30px;
}

.stats-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;

  span {
    font-size: $font-size-md;
    color: $color-text-secondary;
    padding: $spacing-sm $spacing-md;
    background-color: $color-background-light;
    border-radius: $radius-sm;
  }
}

.controls {
  display: flex;
  gap: 8px;
  margin-bottom: $spacing-md;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

button {
  @include button-variant($color-primary, $color-primary-dark);
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-md;
  border-radius: $radius-md;
}

.revoke-all-btn {
  background-color: $color-danger;

  &:hover:not(:disabled) {
    background-color: darken($color-danger, 10%);
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
      @include table-row-hover($color-background-light);

      &:last-child td {
        border-bottom: none;
      }
    }
  }
}

.status-badge {
  padding: 4px 12px;
  border-radius: $radius-md;
  font-size: $font-size-xs;
  font-weight: bold;
  display: inline-block;
  white-space: nowrap;
}

.status-active {
  background-color: $color-primary;
  color: $color-text-white;
}

.status-expired {
  background-color: #9e9e9e;
  color: $color-text-white;
}

.status-revoked {
  background-color: #683733;
  color: $color-text-white;
}

.loading, .no-data {
  text-align: center;
  padding: 40px;
  color: $color-text-secondary;
  font-size: $font-size-lg;
}

.back-button {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@include respond-to(tablet) {
  .stats-info {
    flex-direction: column;
    gap: $spacing-sm;
    align-items: center;
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
}
</style>