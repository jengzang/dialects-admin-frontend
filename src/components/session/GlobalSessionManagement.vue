<template>
  <div class="global-session-management">
    <div class="page-header">
      <img :src="queryGreenIcon" class="header-icon" />
      <h2>全局會話管理系統</h2>
    </div>

    <!-- Statistics Dashboard -->
    <el-row :gutter="20" class="stats-dashboard">
      <el-col :span="3">
        <el-card shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ stats.total_sessions || 0 }}</div>
            <div class="stat-label">總會話數</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ stats.active_sessions || 0 }}</div>
            <div class="stat-label">活躍會話</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ stats.revoked_sessions || 0 }}</div>
            <div class="stat-label">已撤銷</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ stats.expired_sessions || 0 }}</div>
            <div class="stat-label">已過期</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value" style="color: #f56c6c;">{{ stats.suspicious_sessions || 0 }}</div>
            <div class="stat-label">可疑會話</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ stats.unique_users_with_sessions || 0 }}</div>
            <div class="stat-label">在線用戶</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ formatHours(stats.total_online_hours) }}</div>
            <div class="stat-label">總在線時長</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover">
          <div class="stat-item">
            <img :src="queryGreenIcon" class="stat-icon" />
            <div class="stat-value">{{ formatHours(stats.avg_session_duration_hours) }}</div>
            <div class="stat-label">平均會話時長</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Filters -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filters" size="small">
        <el-form-item label="用戶名">
          <el-input v-model="filters.username" placeholder="模糊搜索" clearable />
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="filters.ip_address" placeholder="IP地址" clearable />
        </el-form-item>
        <el-form-item label="可疑狀態">
          <el-select v-model="filters.is_suspicious" placeholder="全部" clearable>
            <el-option label="僅可疑" :value="true" />
            <el-option label="非可疑" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="撤銷狀態">
          <el-select v-model="filters.revoked" placeholder="全部" clearable>
            <el-option label="活躍" :value="false" />
            <el-option label="已撤銷" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-select v-model="filters.sort_by" placeholder="排序字段">
            <el-option label="創建時間" value="created_at" />
            <el-option label="最後活動" value="last_activity_at" />
            <el-option label="刷新次數" value="refresh_count" />
            <el-option label="IP變更次數" value="ip_change_count" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchSessions">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Sessions Table -->
    <el-card shadow="never" class="sessions-table">
      <div slot="header">
        <span>會話列表</span>
        <el-button
          style="float: right;"
          type="danger"
          size="small"
          :disabled="selectedSessions.length === 0"
          @click="bulkRevoke">
          批量撤銷 ({{ selectedSessions.length }})
        </el-button>
      </div>
      <el-table
        :data="sessions"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        style="width: 100%">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="用戶名" width="120" />
        <el-table-column prop="session_id" label="會話 ID" width="120">
          <template #default="scope">
            {{ scope.row.session_id.substring(0, 8) }}...
          </template>
        </el-table-column>
        <el-table-column prop="current_ip" label="當前 IP" width="140" />
        <el-table-column prop="device_info" label="設備" width="150">
          <template #default="scope">
            {{ truncate(scope.row.device_info, 20) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="創建時間" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="狀態" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row)" size="small">
              {{ getStatusText(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="統計" width="150">
          <template #default="scope">
            <div style="font-size: 12px;">
              <div>刷新: {{ scope.row.refresh_count }}</div>
              <div>IP: {{ scope.row.ip_change_count }} | 設備: {{ scope.row.device_change_count }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="mini" @click="viewUser(scope.row)">查看用戶</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="revokeSession(scope.row)"
              :disabled="scope.row.revoked">
              撤銷
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        @current-change="handlePageChange"
        :current-page="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next"
        :total="totalSessions"
        style="margin-top: 20px; text-align: center;">
      </el-pagination>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import userSessionAPI from '@/api/userSession';
import queryGreenIcon from '@/assets/query_green.ico';

const router = useRouter();

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

const loadStats = async () => {
  try {
    const response = await userSessionAPI.getStats();
    stats.value = response.stats || {};
  } catch (error) {
    console.error('Failed to load stats:', error);
    ElMessage.error('加載統計數據失敗');
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
    ElMessage.error('加載會話列表失敗');
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
    await ElMessageBox.confirm('確定要撤銷此會話嗎？', '確認', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await userSessionAPI.revokeSession(session.session_id, 'admin_action');
    ElMessage.success('會話已撤銷');
    await loadSessions();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to revoke session:', error);
      ElMessage.error('撤銷會話失敗');
    }
  }
};

const bulkRevoke = async () => {
  try {
    await ElMessageBox.confirm(
      `確定要撤銷選中的 ${selectedSessions.value.length} 個會話嗎？`,
      '確認',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    const sessionIds = selectedSessions.value.map(s => s.session_id);
    await userSessionAPI.revokeBulk(sessionIds, 'admin_action');
    ElMessage.success('批量撤銷成功');
    await loadSessions();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to bulk revoke:', error);
      ElMessage.error('批量撤銷失敗');
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
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-md;

  h2 {
    margin: 0;
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
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-label {
  font-size: $font-size-sm;
  color: #909399;
}

.filter-card,
.sessions-table {
  margin: $spacing-md 0;
}
</style>
