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
      <table v-if="!loading && sessions.length > 0">
        <thead>
          <tr>
            <th>設備信息</th>
            <th>登錄時間</th>
            <th>過期時間</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="session in sessions" :key="session.id">
            <td>{{ session.device_info || 'Unknown' }}</td>
            <td>{{ formatTime(session.created_at) }}</td>
            <td>{{ formatExpireTime(session.expires_at) }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(session)]">
                {{ getStatusText(session) }}
              </span>
            </td>
            <td>
              <button
                v-if="!session.is_revoked && !isExpired(session)"
                @click="revokeSession(session.id)"
                class="revoke-btn"
              >
                撤銷
              </button>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>

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

<script>
import { sessionAPI } from '../../api/session';
import { ElMessageBox, ElMessage } from 'element-plus';

export default {
  name: 'UserSessions',
  data() {
    return {
      sessions: [],
      stats: {},
      loading: false,
      userId: null,
      username: ''
    };
  },
  mounted() {
    this.userId = this.$route.query.user_id;
    this.username = this.$route.query.username || '未知用戶';
    if (this.userId) {
      this.fetchUserSessions();
    } else {
      ElMessage.error('缺少用戶ID參數');
      this.$router.push('/admin');
    }
  },
  activated() {
    if (this.userId) {
      this.fetchUserSessions();
    }
  },
  methods: {
    async fetchUserSessions() {
      this.loading = true;
      try {
        const response = await sessionAPI.getUserSessions(this.userId);
        this.sessions = response.data.sessions || [];
        this.stats = {
          total: response.data.total_sessions || 0,
          active: response.data.active_sessions || 0
        };
      } catch (error) {
        console.error('Failed to fetch user sessions:', error);
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    },
    async revokeSession(tokenId) {
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

        await sessionAPI.revokeSession(tokenId);
        ElMessage.success('會話已撤銷');
        await this.fetchUserSessions();
      } catch (error) {
        if (error !== 'cancel') {
          this.handleError(error);
        }
      }
    },
    async revokeAllSessions() {
      try {
        await ElMessageBox.confirm(
          `確定要撤銷用戶 ${this.username} 的所有會話嗎？該用戶將在所有設備上被強制登出。`,
          '撤銷所有會話',
          {
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        const response = await sessionAPI.revokeUserSessions(this.userId);
        ElMessage.success(`已撤銷 ${response.data.revoked_count} 個會話`);
        await this.fetchUserSessions();
      } catch (error) {
        if (error !== 'cancel') {
          this.handleError(error);
        }
      }
    },
    handleError(error) {
      if (error.response?.status === 403) {
        ElMessage.error('沒有權限執行此操作');
      } else if (error.response?.status === 404) {
        ElMessage.error('會話不存在或已被撤銷');
      } else if (error.response?.status === 401) {
        ElMessage.error('登錄已過期，請重新登錄');
        this.$router.push('/login');
      } else {
        ElMessage.error('操作失敗，請稍後重試');
      }
    },
    isExpired(session) {
      if (!session.expires_at) return false;

      // 處理 ISO 8601 字符串格式
      let expiryDate;
      if (typeof session.expires_at === 'string') {
        expiryDate = new Date(session.expires_at);
      } else if (typeof session.expires_at === 'number') {
        expiryDate = session.expires_at < 10000000000
          ? new Date(session.expires_at * 1000)
          : new Date(session.expires_at);
      } else {
        return false;
      }

      return expiryDate < new Date();
    },
    getStatusClass(session) {
      if (session.is_revoked) return 'status-revoked';
      if (this.isExpired(session)) return 'status-expired';
      return 'status-active';
    },
    getStatusText(session) {
      if (session.is_revoked) return '已撤銷';
      if (this.isExpired(session)) return '已過期';
      return '活躍';
    },
    formatTime(timestamp) {
      if (!timestamp) return '-';

      // 處理不同的時間戳格式
      let date;
      if (typeof timestamp === 'string') {
        date = new Date(timestamp);
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

      return date.toLocaleString('zh-CN');
    },
    formatExpireTime(timestamp) {
      if (!timestamp) return '-';

      // 處理不同的時間戳格式
      let date;
      if (typeof timestamp === 'string') {
        date = new Date(timestamp);
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
    },
    goBack() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.user-sessions {
  padding: 20px;
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
}

.stats-info span {
  font-size: 16px;
  color: #666;
  padding: 10px 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #217825;
  transform: scale(1.05);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.revoke-all-btn {
  background-color: #f44336;
}

.revoke-all-btn:hover:not(:disabled) {
  background-color: #d32f2f;
}

.revoke-btn {
  background-color: #f44336;
  padding: 6px 12px;
  font-size: 14px;
}

.revoke-btn:hover {
  background-color: #d32f2f;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

thead {
  background-color: #4CAF50;
  color: white;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  font-weight: bold;
}

tbody tr:hover {
  background-color: #f5f5f5;
}

tbody tr:last-child td {
  border-bottom: none;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  display: inline-block;
}

.status-active {
  background-color: #4CAF50;
  color: white;
}

.status-expired {
  background-color: #9e9e9e;
  color: white;
}

.status-revoked {
  background-color: #f44336;
  color: white;
}

.loading, .no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 18px;
}

.back-button {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .stats-info {
    flex-direction: column;
    align-items: center;
  }

  .controls {
    flex-direction: column;
  }

  table {
    font-size: 14px;
  }

  th, td {
    padding: 8px;
  }
}
</style>