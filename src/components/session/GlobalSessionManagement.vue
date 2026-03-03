<template>
  <div class="global-session-management">
    <div class="page-header">
      <img :src="queryGreenIcon" class="header-icon" />
      <h2>全局會話管理系統</h2>
    </div>

    <!-- Statistics Dashboard -->
    <BaseRow :gutter="20" class="stats-dashboard">
      <BaseCol :span="3" :mobile="6" :tablet="6">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ stats.total_sessions || 0 }}</div>
            <div class="stat-label">總會話數</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="3" :mobile="6" :tablet="6">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ stats.active_sessions || 0 }}</div>
            <div class="stat-label">活躍會話</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="3" :mobile="6" :tablet="6">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ stats.revoked_sessions || 0 }}</div>
            <div class="stat-label">已撤銷</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="3" :mobile="6" :tablet="6">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ stats.expired_sessions || 0 }}</div>
            <div class="stat-label">已過期</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="3" :mobile="6" :tablet="6">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value" style="color: #f56c6c;">{{ stats.suspicious_sessions || 0 }}</div>
            <div class="stat-label">可疑會話</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="3" :mobile="6" :tablet="6">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ stats.unique_users_with_sessions || 0 }}</div>
            <div class="stat-label">在線用戶</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="3" :mobile="6" :tablet="6">
        <BaseCard shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ formatHours(stats.total_online_hours) }}</div>
            <div class="stat-label">總在線時長</div>
          </div>
        </BaseCard>
      </BaseCol>
      <BaseCol :span="3" :mobile="6" :tablet="6">
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
      <!-- 第一行：基础筛选条件 -->
      <BaseForm :inline="true" class="filter-form-main">
        <BaseFormItem label="用戶名">
          <BaseInput v-model="filters.username" placeholder="模糊搜索" clearable style="width: 180px;" />
        </BaseFormItem>
        <BaseFormItem label="IP地址">
          <BaseInput v-model="filters.ip_address" placeholder="IP地址" clearable style="width: 180px;" />
        </BaseFormItem>
        <BaseFormItem label="可疑狀態">
          <BaseSelect v-model="filters.is_suspicious" :options="suspiciousOptions" placeholder="全部" clearable style="width: 120px;" />
        </BaseFormItem>
        <BaseFormItem label="撤銷狀態">
          <BaseSelect v-model="filters.revoked" :options="revokedOptions" placeholder="全部" clearable style="width: 120px;" />
        </BaseFormItem>
        <BaseFormItem label="排序">
          <BaseSelect v-model="filters.sort_by" :options="sortOptions" placeholder="排序字段" style="width: 140px;" />
        </BaseFormItem>
      </BaseForm>

      <!-- 第二行：时间范围筛选 -->
      <div class="filter-form-time">
        <BaseFormItem label="時間範圍">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            value-format="YYYY-MM-DD"
            clearable
            style="width: 320px;"
          />
        </BaseFormItem>

        <!-- 快捷时间选项 -->
        <div class="date-shortcuts">
          <button class="btn btn-sm" @click="setDateRange('today')">今天</button>
          <button class="btn btn-sm" @click="setDateRange('week')">最近7天</button>
          <button class="btn btn-sm" @click="setDateRange('month')">最近30天</button>
          <button class="btn btn-sm" @click="setDateRange('all')">全部</button>
        </div>
      </div>

      <!-- 第三行：操作按钮 -->
      <div class="filter-actions">
        <button class="btn btn-primary" @click="searchSessions">
          <i class="el-icon-search"></i> 搜索
        </button>
        <button class="btn btn-secondary" @click="resetFilters">
          <i class="el-icon-refresh"></i> 重置
        </button>
      </div>
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
            <button class="btn btn-sm btn-primary" @click="showSessionDetail(row)">詳情</button>
            <button class="btn btn-sm btn-primary" @click="viewUser(row)">查看用戶</button>
            <button
              v-if="!row.is_suspicious"
              class="btn btn-sm btn-warning"
              @click="flagAsSuspicious(row)"
            >
              標記可疑
            </button>
            <button
              v-else
              class="btn btn-sm btn-success"
              @click="unflagSuspicious(row)"
            >
              取消標記
            </button>
            <button
              class="btn btn-sm btn-danger"
              @click="revokeSession(row)"
              :disabled="row.revoked"
            >
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

    <!-- Session Detail Modal -->
    <SessionDetailModal
      v-model="showDetailModal"
      :session-id="selectedSessionId"
      @refresh="handleRefresh"
    />

    <!-- Flag Suspicious Dialog -->
    <BaseModal
      v-model="showFlagDialog"
      title="標記可疑會話"
      width="500px"
      @confirm="confirmFlag"
    >
      <div class="flag-form">
        <div class="form-group">
          <label class="form-label">可疑原因</label>
          <select v-model="flagForm.reason" class="form-select">
            <option value="">請選擇原因</option>
            <option value="rapid_ip_change">快速換 IP</option>
            <option value="unusual_location">異常地點</option>
            <option value="device_mismatch">設備不匹配</option>
            <option value="unusual_activity">異常活動模式</option>
            <option value="other">其他</option>
          </select>
        </div>
        <div v-if="flagForm.reason === 'other'" class="form-group">
          <label class="form-label">詳細說明</label>
          <textarea
            v-model="flagForm.customReason"
            class="form-textarea"
            rows="3"
            placeholder="請輸入詳細說明"
          ></textarea>
        </div>
      </div>

      <template #footer>
        <button class="btn btn-secondary" @click="showFlagDialog = false">取消</button>
        <button class="btn btn-primary" @click="confirmFlag">確認</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage, useDialog } from '@/composables';
import { BaseRow, BaseCol, BaseCard, BaseForm, BaseFormItem, BaseInput, BaseSelect, BaseTable, BaseTag, BasePagination, BaseModal } from '@/components/common';
import SessionDetailModal from './SessionDetailModal.vue';
import userSessionAPI from '@/api/userSession';
import queryGreenIcon from '@/assets/query_green.ico';
import { ElMessage, ElMessageBox } from 'element-plus';

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
const dateRange = ref(null);

// Modal state
const showDetailModal = ref(false);
const selectedSessionId = ref('');
const showFlagDialog = ref(false);
const currentFlagSession = ref(null);
const flagForm = ref({
  reason: '',
  customReason: ''
});

// 下拉选项
const suspiciousOptions = [
  { label: '僅可疑', value: 1 },
  { label: '非可疑', value: 0 }
];

const revokedOptions = [
  { label: '活躍', value: 0 },
  { label: '已撤銷', value: 1 }
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
  { key: 'stats', label: '統計', sortable: false, minWidth: '180px' }
];

const totalPages = computed(() => {
  return Math.ceil(totalSessions.value / pageSize.value);
});

const loadStats = async () => {
  try {
    const params = {};
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0];
      params.end_date = dateRange.value[1];
    }
    const response = await userSessionAPI.getStats(params.start_date, params.end_date);
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
  dateRange.value = null;
  searchSessions();
};

const setDateRange = (range) => {
  const today = new Date();
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  switch (range) {
    case 'today':
      dateRange.value = [formatDate(today), formatDate(today)];
      break;
    case 'week':
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      dateRange.value = [formatDate(weekAgo), formatDate(today)];
      break;
    case 'month':
      const monthAgo = new Date(today);
      monthAgo.setDate(today.getDate() - 30);
      dateRange.value = [formatDate(monthAgo), formatDate(today)];
      break;
    case 'all':
      dateRange.value = null;
      break;
  }
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

const bulkRevoke = async () => {
  try {
    await confirm(
      `確定要撤銷選中的 ${selectedSessions.value.length} 個會話嗎？`,
      '確認'
    );
    const sessionIds = selectedSessions.value.map(s => s.id); // 使用 id
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

const showSessionDetail = (session) => {
  selectedSessionId.value = session.id; // 使用整数 id 而不是 UUID session_id
  showDetailModal.value = true;
};

const flagAsSuspicious = (session) => {
  currentFlagSession.value = session;
  showFlagDialog.value = true;
};

const unflagSuspicious = async (session) => {
  try {
    await ElMessageBox.confirm('確定要取消可疑標記嗎？', '確認', {
      type: 'warning',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    });

    await userSessionAPI.flagSession(session.id, false, '');
    ElMessage.success('已取消可疑標記');
    await loadSessions();
    await loadStats();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to unflag session:', error);
      ElMessage.error('操作失敗');
    }
  }
};

const confirmFlag = async () => {
  try {
    if (!flagForm.value.reason) {
      ElMessage.warning('請選擇可疑原因');
      return;
    }

    const reason = flagForm.value.reason === 'other'
      ? flagForm.value.customReason
      : flagForm.value.reason;

    if (flagForm.value.reason === 'other' && !reason) {
      ElMessage.warning('請輸入詳細說明');
      return;
    }

    await userSessionAPI.flagSession(
      currentFlagSession.value.id,
      true,
      reason
    );

    ElMessage.success('已標記為可疑會話');
    showFlagDialog.value = false;
    flagForm.value = { reason: '', customReason: '' };
    currentFlagSession.value = null;
    await loadSessions();
    await loadStats();
  } catch (error) {
    console.error('Failed to flag session:', error);
    ElMessage.error('操作失敗');
  }
};

const handleRefresh = async () => {
  await loadSessions();
  await loadStats();
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

.filter-card {
  .filter-form-main {
    margin-bottom: $spacing-md;
  }

  .filter-form-time {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-md;
    flex-wrap: wrap;

    .base-form-item {
      margin-bottom: 0;
    }
  }

  .date-shortcuts {
    display: flex;
    gap: $spacing-xs;
    flex-wrap: wrap;
  }

  .filter-actions {
    display: flex;
    gap: $spacing-sm;
    padding-top: $spacing-sm;
    border-top: 1px solid $color-border-light;
  }
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
  justify-content: center;

  .btn {
    white-space: nowrap;
    font-size: $font-size-xs;
    padding: 4px 8px;
  }
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
    .filter-form-main {
      :deep(.base-form) {
        display: block;
      }

      :deep(.base-form-item) {
        margin-bottom: $spacing-sm;

        .base-input,
        .base-select {
          width: 100% !important;
        }
      }
    }

    .filter-form-time {
      flex-direction: column;
      align-items: flex-start;

      .base-form-item {
        width: 100%;

        :deep(.el-date-editor) {
          width: 100% !important;
        }
      }

      .date-shortcuts {
        width: 100%;

        .btn {
          flex: 1;
        }
      }
    }

    .filter-actions {
      .btn {
        flex: 1;
      }
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

  .stats-dashboard {
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

// Flag form styles
.flag-form {
  .form-group {
    margin-bottom: $spacing-md;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .form-label {
    display: block;
    margin-bottom: $spacing-xs;
    font-size: $font-size-sm;
    font-weight: 500;
    color: $color-text-primary;
  }

  .form-select,
  .form-textarea {
    width: 100%;
    padding: $spacing-sm;
    border: 1px solid $color-border-light;
    border-radius: $radius-sm;
    font-size: $font-size-sm;
    transition: border-color $transition-fast;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }

  .form-textarea {
    resize: vertical;
    font-family: inherit;
  }
}
</style>
