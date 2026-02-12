<template>
  <div class="user-session-management">
    <el-page-header @back="goBack" :content="`用戶 ${username} 的會話管理`" />

    <!-- Statistics Cards -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ userStats.login_count || 0 }}</div>
            <div class="stat-label">登錄次數</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ userStats.failed_attempts || 0 }}</div>
            <div class="stat-label">登錄失敗次數</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ userStats.register_ip || 'N/A' }}</div>
            <div class="stat-label">註冊 IP</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ formatDuration(userStats.total_online_seconds) }}</div>
            <div class="stat-label">總在線時長</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ formatDate(userStats.last_login) }}</div>
            <div class="stat-label">最近一次登錄</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Action Buttons -->
    <el-row :gutter="20" class="action-bar">
      <el-col :span="24">
        <el-button type="primary" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        <el-button type="danger" icon="el-icon-delete" @click="revokeAllSessions">撤銷所有會話</el-button>
        <el-button icon="el-icon-back" @click="goBack">返回首頁</el-button>
        <el-checkbox v-model="showRevoked" @change="loadSessions" style="margin-left: 20px;">顯示已撤銷</el-checkbox>
        <el-checkbox v-model="onlySuspicious" @change="loadSessions">僅顯示可疑會話</el-checkbox>
      </el-col>
    </el-row>

    <!-- Sessions Table -->
    <el-card shadow="never" class="sessions-table">
      <div slot="header">
        <span>會話列表</span>
      </div>
      <el-table
        :data="sessions"
        v-loading="loading"
        style="width: 100%"
        @row-click="showSessionDetail">
        <el-table-column prop="session_id" label="會話 ID" width="120">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.session_id" placement="top">
              <span>{{ scope.row.session_id.substring(0, 8) }}...</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="device_info" label="設備信息" width="200">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.device_info" placement="top">
              <span>{{ truncate(scope.row.device_info, 30) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="current_ip" label="當前 IP" width="140" />
        <el-table-column prop="created_at" label="創建時間" width="160">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="last_activity_at" label="最後活動" width="160">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.last_activity_at) }}
          </template>
        </el-table-column>
        <el-table-column label="狀態" width="120">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row)" size="small">
              {{ getStatusText(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="統計" width="180">
          <template slot-scope="scope">
            <div style="font-size: 12px;">
              <div>刷新: {{ scope.row.refresh_count }}</div>
              <div>IP變更: {{ scope.row.ip_change_count }}</div>
              <div>設備變更: {{ scope.row.device_change_count }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click.stop="showSessionDetail(scope.row)">詳情</el-button>
            <el-button
              size="mini"
              type="danger"
              @click.stop="revokeSession(scope.row)"
              :disabled="scope.row.revoked">
              撤銷
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Recent Login IPs -->
    <el-card shadow="never" class="ip-stats" v-if="recentIPs.length > 0">
      <div slot="header">
        <span>近期登錄 IP 統計</span>
      </div>
      <el-table :data="recentIPs" style="width: 100%">
        <el-table-column prop="ip" label="IP 地址" />
        <el-table-column prop="count" label="登錄次數" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import userSessionAPI from '@/api/userSession';
import axios from 'axios';

export default {
  name: 'UserSessionManagement',
  data() {
    return {
      userId: null,
      username: '',
      userStats: {},
      sessions: [],
      recentIPs: [],
      loading: false,
      showRevoked: true,
      onlySuspicious: false
    };
  },
  mounted() {
    this.userId = this.$route.query.user_id || this.$route.params.userId;
    this.username = this.$route.query.username || 'Unknown';
    if (this.userId) {
      this.loadData();
    }
  },
  methods: {
    async loadData() {
      await Promise.all([
        this.loadUserStats(),
        this.loadSessions(),
        this.loadRecentIPs()
      ]);
    },
    async loadUserStats() {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000'}/admin/users/${this.userId}/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.userStats = response.data.stats || {};
      } catch (error) {
        console.error('Failed to load user stats:', error);
        this.$message.error('加載用戶統計失敗');
      }
    },
    async loadSessions() {
      this.loading = true;
      try {
        const response = await userSessionAPI.getUserHistory(
          this.userId,
          this.showRevoked
        );
        let sessions = response.sessions || [];

        if (this.onlySuspicious) {
          sessions = sessions.filter(s => s.is_suspicious);
        }

        this.sessions = sessions;
      } catch (error) {
        console.error('Failed to load sessions:', error);
        this.$message.error('加載會話列表失敗');
      } finally {
        this.loading = false;
      }
    },
    async loadRecentIPs() {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000'}/login-logs/success-login-logs`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { user_id: this.userId, limit: 100 }
          }
        );
        const logs = response.data.logs || [];
        const ipCount = {};
        logs.forEach(log => {
          ipCount[log.ip_address] = (ipCount[log.ip_address] || 0) + 1;
        });
        this.recentIPs = Object.entries(ipCount)
          .map(([ip, count]) => ({ ip, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      } catch (error) {
        console.error('Failed to load recent IPs:', error);
      }
    },
    async refreshData() {
      await this.loadData();
      this.$message.success('數據已刷新');
    },
    async revokeSession(session) {
      try {
        await this.$confirm('確定要撤銷此會話嗎？', '確認', {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        await userSessionAPI.revokeSession(session.session_id, 'admin_action');
        this.$message.success('會話已撤銷');
        await this.loadSessions();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to revoke session:', error);
          this.$message.error('撤銷會話失敗');
        }
      }
    },
    async revokeAllSessions() {
      try {
        await this.$confirm(
          `確定要撤銷用戶 ${this.username} 的所有會話嗎？此操作將強制用戶下線。`,
          '警告',
          {
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        await userSessionAPI.revokeUserSessions(this.userId, 'admin_action');
        this.$message.success('所有會話已撤銷');
        await this.loadSessions();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to revoke all sessions:', error);
          this.$message.error('撤銷所有會話失敗');
        }
      }
    },
    showSessionDetail(session) {
      this.$router.push({
        name: 'SessionDetail',
        params: { sessionId: session.session_id }
      });
    },
    goBack() {
      this.$router.push('/');
    },
    formatDateTime(dateStr) {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleString('zh-CN');
    },
    formatDate(dateStr) {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString('zh-CN');
    },
    formatDuration(seconds) {
      if (!seconds) return '0小時';
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}小時${minutes}分鐘`;
      }
      return `${minutes}分鐘`;
    },
    truncate(str, length) {
      if (!str) return '';
      return str.length > length ? str.substring(0, length) + '...' : str;
    },
    getStatusType(session) {
      if (session.revoked) return 'info';
      if (session.is_suspicious) return 'danger';
      if (new Date(session.expires_at) < new Date()) return 'warning';
      return 'success';
    },
    getStatusText(session) {
      if (session.revoked) return '已撤銷';
      if (session.is_suspicious) return '可疑';
      if (new Date(session.expires_at) < new Date()) return '已過期';
      return '活躍';
    }
  }
};
</script>

<style scoped>
.user-session-management {
  padding: 20px;
}

.stats-cards {
  margin: 20px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.action-bar {
  margin: 20px 0;
}

.sessions-table,
.ip-stats {
  margin: 20px 0;
}
</style>
