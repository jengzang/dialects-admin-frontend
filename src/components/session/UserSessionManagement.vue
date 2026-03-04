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

    <!-- Session Statistics Cards -->
    <BaseRow :gutter="20" class="session-stats-cards">
      <BaseCol :span="4" :mobile="6" :tablet="8">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ sessionStats.total || 0 }}</div>
            <div class="stat-label">總會話數</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="4" :mobile="6" :tablet="8">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value" style="color: #67c23a;">{{ sessionStats.active || 0 }}</div>
            <div class="stat-label">活躍會話</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="4" :mobile="6" :tablet="8">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value" style="color: #f56c6c;">{{ sessionStats.suspicious || 0 }}</div>
            <div class="stat-label">可疑會話</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="4" :mobile="6" :tablet="8">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value" style="color: #909399;">{{ sessionStats.revoked || 0 }}</div>
            <div class="stat-label">已撤銷</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="4" :mobile="6" :tablet="8">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ sessionStats.unique_ips || 0 }}</div>
            <div class="stat-label">使用 IP 數</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="4" :mobile="6" :tablet="8">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ sessionStats.unique_devices || 0 }}</div>
            <div class="stat-label">使用設備數</div>
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

        <!-- 當前 IP 列 -->
        <template #cell-current_ip="{ row }">
          <IPLocationDisplay
            v-if="row.current_ip"
            :ip="row.current_ip"
            :location="row.current_ip_location"
          />
          <span v-else>-</span>
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
            <button
              class="btn btn-sm btn-primary"
              @click.stop="showSessionDetail(row)">
              詳情
            </button>
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
      >
        <!-- IP 地址列 -->
        <template #cell-ip="{ row }">
          <IPLocationDisplay
            :ip="row.ip"
            :location="row.ip_location"
          />
        </template>
      </BaseTable>
    </BaseCard>

    <!-- Session Detail Modal -->
    <SessionDetailModal
      v-model="showDetailModal"
      :session-id="selectedSessionId"
      @refresh="loadData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
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
  BaseTooltip,
  IPLocationDisplay
} from '@/components/common';
import SessionDetailModal from './SessionDetailModal.vue';
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

// Modal state
const showDetailModal = ref(false);
const selectedSessionId = ref('');

// Session statistics computed
const sessionStats = computed(() => {
  const allSessions = sessions.value;
  const total = allSessions.length;
  const active = allSessions.filter(s => !s.revoked && new Date(s.expires_at) > new Date()).length;
  const suspicious = allSessions.filter(s => s.is_suspicious).length;
  const revoked = allSessions.filter(s => s.revoked).length;

  // 统计唯一IP数
  const uniqueIPs = new Set(allSessions.map(s => s.current_ip)).size;

  // 统计唯一设备数（基于device_fingerprint）
  const uniqueDevices = new Set(
    allSessions
      .filter(s => s.device_fingerprint)
      .map(s => s.device_fingerprint)
  ).size;

  return {
    total,
    active,
    suspicious,
    revoked,
    unique_ips: uniqueIPs,
    unique_devices: uniqueDevices || allSessions.filter(s => s.device_info).length // fallback to device_info count
  };
});

// 表格列定义
const tableColumns = [
  { key: 'session_id', label: '會話 ID', sortable: false },
  { key: 'device_info', label: '設備信息', sortable: false },
  { key: 'current_ip', label: '當前 IP', sortable: false },
  { key: 'created_at', label: '創建時間', sortable: false },
  { key: 'last_activity_at', label: '最後活動', sortable: false },
  { key: 'status', label: '狀態', sortable: false },
  { key: 'stats', label: '統計', sortable: false, minWidth: '180px' }
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
    await userSessionAPI.revokeSession(session.id, 'admin_action'); // 使用 id
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

const goBack = () => {
  router.push('/');
};

const showSessionDetail = (session) => {
  selectedSessionId.value = session.id; // 使用整数 id
  showDetailModal.value = true;
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

.session-stats-cards {
  margin: $spacing-md 0;
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
  width: 28px;
  height: 28px;
  opacity: 0.15;
  position: absolute;
  top: 8px;
  right: 8px;
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

// Mobile optimizations
@include respond-to(mobile) {
  .session-stats-cards {
    :deep(.base-col) {
      margin-bottom: $spacing-sm;
    }
  }

  .stat-item {
    min-height: 60px;
    padding: $spacing-xs;
  }

  .stat-icon {
    width: 20px;
    height: 20px;
    top: 4px;
    right: 4px;
  }

  .stat-value {
    font-size: 18px;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: $font-size-xs;
  }
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

    .btn,
    .base-checkbox {
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
