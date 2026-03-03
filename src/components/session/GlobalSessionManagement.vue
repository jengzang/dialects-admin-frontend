<template>
  <div class="global-session-management">
    <div class="page-header">
      <img :src="queryGreenIcon" class="header-icon" />
      <h2>全局會話管理系統</h2>
    </div>

    <!-- Statistics Dashboard -->
    <BaseRow :gutter="20" class="stats-dashboard">
      <BaseCol :span="3" :mobile="12" :tablet="6">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ stats.total_sessions || 0 }}</div>
            <div class="stat-label">總會話數</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="3" :mobile="12" :tablet="6">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ stats.active_sessions || 0 }}</div>
            <div class="stat-label">活躍會話</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="3" :mobile="12" :tablet="6">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ stats.revoked_sessions || 0 }}</div>
            <div class="stat-label">已撤銷</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="3" :mobile="12" :tablet="6">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ stats.expired_sessions || 0 }}</div>
            <div class="stat-label">已過期</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="3" :mobile="12" :tablet="6">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value" style="color: #f56c6c;">{{ stats.suspicious_sessions || 0 }}</div>
            <div class="stat-label">可疑會話</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="3" :mobile="12" :tablet="6">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ stats.unique_users_with_sessions || 0 }}</div>
            <div class="stat-label">在線用戶</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="3" :mobile="12" :tablet="6">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ formatHours(stats.total_online_hours) }}</div>
            <div class="stat-label">總在線時長</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="3" :mobile="12" :tablet="6">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ formatHours(stats.avg_session_duration_hours) }}</div>
            <div class="stat-label">平均會話時長</div>
          </div>
        </BaseCard>
      </BaseCol>
    </BaseRow>

    <!-- Filters -->
    <BaseCard shadow="never" class="filter-card">
      <BaseForm :inline="true">
        <BaseFormItem label="用戶名">
          <BaseInput v-model="filters.username" placeholder="模糊搜索" clearable />
        </BaseFormItem>
        <BaseFormItem label="IP地址">
          <BaseInput v-model="filters.ip_address" placeholder="IP地址" clearable />
        </BaseFormItem>
        <BaseFormItem label="可疑狀態">
          <BaseSelect v-model="filters.is_suspicious" :options="suspiciousOptions" placeholder="全部" clearable />
        </BaseFormItem>
        <BaseFormItem label="撤銷狀態">
          <BaseSelect v-model="filters.revoked" :options="revokedOptions" placeholder="全部" clearable />
        </BaseFormItem>
        <BaseFormItem label="排序">
          <BaseSelect v-model="filters.sort_by" :options="sortOptions" placeholder="排序字段" />
        </BaseFormItem>
        <BaseFormItem>
          <button class="btn btn-primary" @click="searchSessions">搜索</button>
          <button class="btn btn-secondary" @click="resetFilters">重置</button>
        </BaseFormItem>
      </BaseForm>
    </BaseCard>

    <!-- Sessions Table -->
    <BaseCard shadow="never" class="sessions-table">
      <template #header>
        <div class="table-header">
          <span>會話列表</span>
          <button
            class="btn btn-danger btn-sm"
            :disabled="selectedSessions.length === 0"
            @click="bulkRevoke">
            批量撤銷 ({{ selectedSessions.length }})
          </button>
        </div>
      </template>

      <BaseTable
        :columns="tableColumns"
        :data="sessions"
        :loading="loading"
        :selectable="true"
        @selection-change="handleSelectionChange"
      >
        <!-- 會話 ID 列 -->
        <template #cell-session_id="{ value }">
          {{ value.substring(0, 8) }}...
        </template>

        <!-- 設備列 -->
        <template #cell-device_info="{ value }">
          {{ truncate(value, 20) }}
        </template>

        <!-- 創建時間列 -->
        <template #cell-created_at="{ value }">
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
            <div>IP: {{ row.ip_change_count }} | 設備: {{ row.device_change_count }}</div>
          </div>
        </template>

        <!-- 操作列 -->
        <template #actions="{ row }">
          <div class="action-buttons">
            <button class="btn btn-sm btn-primary" @click="viewUser(row)">查看用戶</button>
            <button
              class="btn btn-sm btn-danger"
              @click="revokeSession(row)"
              :disabled="row.revoked">
              撤銷
            </button>
          </div>
        </template>
      </BaseTable>

      <!-- Pagination -->
      <BasePagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        @page-change="handlePageChange"
        container-class="pagination-container"
      />
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage, useDialog } from '@/composables';
import { BaseRow, BaseCol, BaseCard, BaseForm, BaseFormItem, BaseInput, BaseSelect, BaseTable, BaseTag, BasePagination } from '@/components/common';
import userSessionAPI from '@/api/userSession';
import queryGreenIcon from '@/assets/query_green.ico';

const router = useRouter();
const { showMessage } = useMessage();
const { confirm } = useDialog();

const stats = ref({});
const sessions = ref([]);
const selectedSessions = ref([]);
const loading = ref(false);
const filters = ref({
  username: '',
  ip_address: '',
  is_suspicious: null,
  revoked: null,
  sort_by: 'created_at',
  sort_order: 'desc'
});
const currentPage = ref(1);
const pageSize = ref(20);
const totalSessions = ref(0);

// 下拉选项
const suspiciousOptions = [
  { label: '僅可疑', value: true },
  { label: '非可疑', value: false }
];

const revokedOptions = [
  { label: '活躍', value: false },
  { label: '已撤銷', value: true }
];

const sortOptions = [
  { label: '創建時間', value: 'created_at' },
  { label: '最後活動', value: 'last_activity_at' },
  { label: '刷新次數', value: 'refresh_count' },
  { label: 'IP變更次數', value: 'ip_change_count' }
];

// 表格列定义
const tableColumns = [
  { key: 'username', label: '用戶名', sortable: false },
  { key: 'session_id', label: '會話 ID', sortable: false },
  { key: 'current_ip', label: '當前 IP', sortable: false },
  { key: 'device_info', label: '設備', sortable: false },
  { key: 'created_at', label: '創建時間', sortable: false },
  { key: 'status', label: '狀態', sortable: false },
  { key: 'stats', label: '統計', sortable: false }
];

const totalPages = computed(() => {
  return Math.ceil(totalSessions.value / pageSize.value);
});

const loadStats = async () => {
  try {
    const response = await userSessionAPI.getStats();
    stats.value = response || {};
  } catch (error) {
    console.error('Failed to load stats:', error);
    showMessage('加載統計數據失敗', 'error');
  }
};

const loadSessions = async () => {
  loading.value = true;
  try {
    const params = {
      ...filters.value,
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value
    };
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === '') {
        delete params[key];
      }
    });
    const response = await userSessionAPI.listSessions(params);
    sessions.value = response.sessions || [];
    totalSessions.value = response.total || 0;
  } catch (error) {
    console.error('Failed to load sessions:', error);
    showMessage('加載會話列表失敗', 'error');
  } finally {
    loading.value = false;
  }
};

const searchSessions = () => {
  currentPage.value = 1;
  loadSessions();
};

const resetFilters = () => {
  filters.value = {
    username: '',
    ip_address: '',
    is_suspicious: null,
    revoked: null,
    sort_by: 'created_at',
    sort_order: 'desc'
  };
  searchSessions();
};

const handlePageChange = (page) => {
  currentPage.value = page;
  loadSessions();
};

const handleSelectionChange = (selection) => {
  selectedSessions.value = selection;
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

const bulkRevoke = async () => {
  try {
    await confirm(
      `確定要撤銷選中的 ${selectedSessions.value.length} 個會話嗎？`,
      '確認'
    );
    const sessionIds = selectedSessions.value.map(s => s.session_id);
    await userSessionAPI.revokeBulk(sessionIds, 'admin_action');
    showMessage('批量撤銷成功', 'success');
    await loadSessions();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to bulk revoke:', error);
      showMessage('批量撤銷失敗', 'error');
    }
  }
};

const viewUser = (session) => {
  router.push({
    name: 'UserSessionManagement',
    params: { userId: session.user_id },
    query: { username: session.username }
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('zh-CN');
};

const formatHours = (hours) => {
  if (!hours) return '0h';
  return `${Math.round(hours)}h`;
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
  loadStats();
  loadSessions();
});
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.global-session-management {
  padding: $spacing-md;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-lg;

  h2 {
    margin: 0;
    color: $color-text-primary;
  }
}

.header-icon {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.stats-dashboard {
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

.filter-card,
.sessions-table {
  margin: $spacing-md 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  border-bottom: 1px solid $color-border-light;

  span {
    font-weight: 600;
    color: $color-text-primary;
  }
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

.pagination-container {
  margin-top: $spacing-md;
  display: flex;
  justify-content: center;
}

/* 移動端響應式 */
@include respond-to(tablet) {
  .global-session-management {
    padding: $spacing-sm;
  }

  .stats-dashboard {
    :deep(.base-col) {
      margin-bottom: $spacing-sm;
    }
  }

  .stat-value {
    font-size: 20px;
  }

  .filter-card {
    :deep(.base-form) {
      display: block;

      .base-form-item {
        margin-bottom: $spacing-sm;
      }
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
  .page-header {
    h2 {
      font-size: $font-size-lg;
    }
  }

  .header-icon {
    width: 24px;
    height: 24px;
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

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-sm;

    .btn {
      width: 100%;
    }
  }

  .stats-cell {
    font-size: 11px;
  }
}
</style>
