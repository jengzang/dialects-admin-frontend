<template>
  <div class="user-session-management">
    <BasePageHeader @back="goBack">
      <template #icon>
        <img :src="queryGreenIcon" class="header-icon" />
      </template>
      <template #title>
        用戶 {{ username }} 的會話管理
      </template>
    </BasePageHeader>

    <!-- Statistics Cards -->
    <BaseRow :gutter="20" class="stats-cards">
      <BaseCol :span="4" :mobile="12" :tablet="8">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ userStats.login_count || 0 }}</div>
            <div class="stat-label">登錄次數</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="4" :mobile="12" :tablet="8">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ userStats.failed_attempts || 0 }}</div>
            <div class="stat-label">登錄失敗次數</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="4" :mobile="12" :tablet="8">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ userStats.register_ip || 'N/A' }}</div>
            <div class="stat-label">註冊 IP</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="4" :mobile="12" :tablet="8">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ formatDuration(userStats.total_online_seconds) }}</div>
            <div class="stat-label">總在線時長</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="4" :mobile="12" :tablet="8">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ formatDate(userStats.last_login) }}</div>
            <div class="stat-label">最近一次登錄</div>
          </div>
        </BaseCard>
      </BaseCol>
    </BaseRow>

    <!-- Action Buttons -->
    <div class="action-bar">
      <div class="button-group">
        <button class="btn btn-primary" @click="refreshData">刷新</button>
        <button class="btn btn-danger" @click="revokeAllSessions">撤銷所有會話</button>
        <button class="btn btn-secondary" @click="goBack">返回首頁</button>
      </div>
      <div class="filter-group">
        <BaseCheckbox v-model="showRevoked" @change="loadSessions">顯示已撤銷</BaseCheckbox>
        <BaseCheckbox v-model="onlySuspicious" @change="loadSessions">僅顯示可疑會話</BaseCheckbox>
      </div>
    </div>

    <!-- Sessions Table -->
    <BaseCard shadow="never" class="sessions-table">
      <template #header>
        <span>會話列表</span>
      </template>

      <BaseTable
        :columns="tableColumns"
        :data="sessions"
        :loading="loading"
        :row-clickable="true"
        @row-click="showSessionDetail"
      >
        <!-- 會話 ID 列 -->
        <template #cell-session_id="{ value }">
          <BaseTooltip :content="value">
            <span>{{ value.substring(0, 8) }}...</span>
          </BaseTooltip>
        </template>

        <!-- 設備信息列 -->
        <template #cell-device_info="{ value }">
          <BaseTooltip :content="value">
            <span>{{ truncate(value, 30) }}</span>
          </BaseTooltip>
        </template>

        <!-- 創建時間列 -->
        <template #cell-created_at="{ value }">
          {{ formatDateTime(value) }}
        </template>

        <!-- 最後活動列 -->
        <template #cell-last_activity_at="{ value }">
          {{ formatDateTime(value) }}
        </template>

        <!-- 狀態列 -->
        <template #cell-status="{ row }">
          <BaseTag :type="getStatusType(row)">
            {{ getStatusText(row) }}
          </BaseTag>
        </template>

        <!-- 統計列 -->
        <template #cell-stats="{ row }">
          <div class="stats-cell">
            <div>刷新: {{ row.refresh_count }}</div>
            <div>IP變更: {{ row.ip_change_count }}</div>
            <div>設備變更: {{ row.device_change_count }}</div>
          </div>
        </template>

        <!-- 操作列 -->
        <template #actions="{ row }">
          <div class="action-buttons">
            <button class="btn btn-sm btn-primary" @click.stop="showSessionDetail(row)">詳情</button>
            <button
              class="btn btn-sm btn-danger"
              @click.stop="revokeSession(row)"
              :disabled="row.revoked">
              撤銷
            </button>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <!-- Recent Login IPs -->
    <BaseCard shadow="never" class="ip-stats" v-if="recentIPs.length > 0">
      <template #header>
        <span>近期登錄 IP 統計</span>
      </template>

      <BaseTable
        :columns="ipColumns"
        :data="recentIPs"
        :sortable="false"
      />
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMessage, useDialog } from '@/composables';
import {
  BasePageHeader,
  BaseRow,
  BaseCol,
  BaseCard,
  BaseCheckbox,
  BaseTable,
  BaseTag,
  BaseTooltip
} from '@/components/common';
import userSessionAPI from '@/api/userSession';
import { statsAPI } from '@/api/index';
import queryGreenIcon from '@/assets/query_green.ico';

const router = useRouter();
const route = useRoute();
const { showMessage } = useMessage();
const { confirm } = useDialog();

const userId = ref(null);
const username = ref('');
const userStats = ref({});
const sessions = ref([]);
const recentIPs = ref([]);
const loading = ref(false);
const showRevoked = ref(true);
const onlySuspicious = ref(false);

// 表格列定义
const tableColumns = [
  { key: 'session_id', label: '會話 ID', sortable: false },
  { key: 'device_info', label: '設備信息', sortable: false },
  { key: 'current_ip', label: '當前 IP', sortable: false },
  { key: 'created_at', label: '創建時間', sortable: false },
  { key: 'last_activity_at', label: '最後活動', sortable: false },
  { key: 'status', label: '狀態', sortable: false },
  { key: 'stats', label: '統計', sortable: false }
];

const ipColumns = [
  { key: 'ip', label: 'IP 地址', sortable: false },
  { key: 'count', label: '登錄次數', sortable: false }
];

const loadUserStats = async () => {
  try {
    const response = await statsAPI.getUserStats(username.value);
    userStats.value = response || {};
  } catch (error) {
    console.error('Failed to load user stats:', error);
    showMessage('加載用戶統計失敗', 'error');
  }
};

const loadSessions = async () => {
  loading.value = true;
  try {
    const response = await userSessionAPI.getUserHistory(
      userId.value,
      showRevoked.value
    );
    let sessionsData = response.sessions || [];

    if (onlySuspicious.value) {
      sessionsData = sessionsData.filter(s => s.is_suspicious);
    }

    sessions.value = sessionsData;
  } catch (error) {
    console.error('Failed to load sessions:', error);
    showMessage('加載會話列表失敗', 'error');
  } finally {
    loading.value = false;
  }
};

const loadRecentIPs = async () => {
  try {
    const response = await statsAPI.getSuccessLoginLogs(username.value);
    const logs = response || [];
    const ipCount = {};
    logs.forEach(log => {
      const ip = log.ip_address || log.ip;
      if (ip) {
        ipCount[ip] = (ipCount[ip] || 0) + 1;
      }
    });
    recentIPs.value = Object.entries(ipCount)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  } catch (error) {
    console.error('Failed to load recent IPs:', error);
    showMessage('加載最近登錄 IP 失敗', 'error');
  }
};

const loadData = async () => {
  await Promise.all([
    loadUserStats(),
    loadSessions(),
    loadRecentIPs()
  ]);
};

const refreshData = async () => {
  await loadData();
  showMessage('數據已刷新', 'success');
};

const revokeSession = async (session) => {
  try {
    await confirm('確定要撤銷此會話嗎？', '確認');
    await userSessionAPI.revokeSession(session.session_id, 'admin_action');
    showMessage('會話已撤銷', 'success');
    await loadSessions();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to revoke session:', error);
      showMessage('撤銷會話失敗', 'error');
    }
  }
};

const revokeAllSessions = async () => {
  try {
    await confirm(
      `確定要撤銷用戶 ${username.value} 的所有會話嗎？此操作將強制用戶下線。`,
      '警告'
    );
    await userSessionAPI.revokeUserSessions(userId.value, 'admin_action');
    showMessage('所有會話已撤銷', 'success');
    await loadSessions();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to revoke all sessions:', error);
      showMessage('撤銷所有會話失敗', 'error');
    }
  }
};

const showSessionDetail = (session) => {
  router.push({
    name: 'SessionDetail',
    params: { sessionId: session.session_id }
  });
};

const goBack = () => {
  router.push('/');
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('zh-CN');
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};

const formatDuration = (seconds) => {
  if (!seconds) return '0小時';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}小時${minutes}分鐘`;
  }
  return `${minutes}分鐘`;
};

const truncate = (str, length) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};

const getStatusType = (session) => {
  if (session.revoked) return 'info';
  if (session.is_suspicious) return 'danger';
  if (new Date(session.expires_at) < new Date()) return 'warning';
  return 'success';
};

const getStatusText = (session) => {
  if (session.revoked) return '已撤銷';
  if (session.is_suspicious) return '可疑';
  if (new Date(session.expires_at) < new Date()) return '已過期';
  return '活躍';
};

onMounted(() => {
  userId.value = route.query.user_id || route.params.userId;
  username.value = route.query.username || 'Unknown';
  if (userId.value) {
    loadData();
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.user-session-management {
  padding: $spacing-md;
  max-width: 1600px;
  margin: 0 auto;
}

.header-icon {
  width: 24px;
  height: 24px;
  vertical-align: middle;
  margin-right: 8px;
}

.stats-cards {
  margin: $spacing-lg 0;
}

.stat-item {
  text-align: center;
  position: relative;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-icon {
  width: 32px;
  height: 32px;
  opacity: 0.15;
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: $color-primary;
  margin-bottom: 8px;
}

.stat-label {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $spacing-md;
  margin: $spacing-md 0;
  padding: $spacing-md;
  background-color: $color-background;
  border-radius: $radius-md;
}

.button-group {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: $spacing-md;
  align-items: center;
}

.sessions-table,
.ip-stats {
  margin: $spacing-md 0;
}

.stats-cell {
  font-size: 12px;

  div {
    margin: 2px 0;
  }
}

.action-buttons {
  display: flex;
  gap: $spacing-xs;
  flex-wrap: wrap;
}

/* 移動端響應式 */
@include respond-to(tablet) {
  .user-session-management {
    padding: $spacing-sm;
  }

  .stats-cards {
    :deep(.base-col) {
      margin-bottom: $spacing-sm;
    }
  }

  .stat-value {
    font-size: 20px;
  }

  .action-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .button-group,
  .filter-group {
    width: 100%;
    flex-direction: column;

    .btn,
    .base-checkbox {
      width: 100%;
    }
  }

  .action-buttons {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }
}

@include respond-to(mobile) {
  .header-icon {
    width: 20px;
    height: 20px;
  }

  .stat-item {
    min-height: 60px;
  }

  .stat-value {
    font-size: 18px;
  }

  .stat-label {
    font-size: $font-size-xs;
  }

  .stats-cell {
    font-size: 11px;
  }

  .button-group {
    .btn {
      font-size: $font-size-xs;
      padding: 8px 12px;
    }
  }
}
</style>
