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
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索用戶名、設備信息..."
        class="search-input"
      />
    </div>

    <div class="table-container">
      <table v-if="!loading && filteredSessions.length > 0">
        <thead>
          <tr>
            <th>用戶</th>
            <th>設備信息</th>
            <th>登錄時間</th>
            <th>過期時間</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="session in paginatedSessions" :key="session.id">
            <td>{{ session.username }}</td>
            <td>{{ session.device_info || 'Unknown' }}</td>
            <td>{{ formatTime(session.created_at) }}</td>
            <td>{{ formatExpireTime(session.expires_at) }}</td>
            <td>
              <button @click="revokeSession(session.id, session.username)" class="revoke-btn">
                撤銷
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else-if="loading" class="loading">
        加載中...
      </div>

      <div v-else class="no-data">
        暫無活躍會話
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button @click="prevPage" :disabled="currentPage === 1">上一頁</button>
      <span>頁面 {{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一頁</button>
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
  name: 'SessionManagement',
  data() {
    return {
      sessions: [],
      stats: {},
      searchQuery: '',
      currentPage: 1,
      pageSize: 30,
      loading: false,
      userId: null
    };
  },
  computed: {
    filteredSessions() {
      if (!this.searchQuery) {
        return this.sessions;
      }
      const query = this.searchQuery.toLowerCase();
      return this.sessions.filter(session =>
        session.username?.toLowerCase().includes(query) ||
        session.device_info?.toLowerCase().includes(query)
      );
    },
    paginatedSessions() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredSessions.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredSessions.length / this.pageSize);
    }
  },
  mounted() {
    // 從路由查詢參數中獲取 user_id
    this.userId = this.$route.query.user_id;
    this.fetchData();
  },
  activated() {
    // 從路由查詢參數中獲取 user_id
    this.userId = this.$route.query.user_id;
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchSessions(),
          this.fetchStats()
        ]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    },
    async fetchSessions() {
      const params = {
        skip: 0,
        limit: 1000
      };

      // 如果有 user_id，添加到查詢參數中
      if (this.userId) {
        params.user_id = this.userId;
      }

      const response = await sessionAPI.getActiveSessions(params);
      this.sessions = response.data.sessions || [];
    },
    async fetchStats() {
      const response = await sessionAPI.getStats();
      this.stats = response.data || {};
    },
    async revokeSession(tokenId, username) {
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

        await sessionAPI.revokeSession(tokenId);
        ElMessage.success('會話已撤銷');
        await this.fetchData();
      } catch (error) {
        if (error !== 'cancel') {
          this.handleError(error);
        }
      }
    },
    async cleanupExpired() {
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

        const response = await sessionAPI.cleanupExpired();
        ElMessage.success(`已清理 ${response.data.deleted_count} 個過期 Token`);
        await this.fetchData();
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
    formatTime(timestamp) {
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
    },
    formatExpireTime(timestamp) {
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
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    goBack() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.session-management {
  padding: 20px;
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
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.stats-card {
  padding: 20px 30px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
  min-width: 150px;
  transition: transform 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
}

.stats-card .number {
  font-size: 36px;
  font-weight: bold;
  color: #2c6e49;
}

.stats-card .label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.controls {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: 10px 15px;
  font-size: 16px;
  border: 2px solid #4CAF50;
  border-radius: 12px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: #217825;
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

.warning-btn {
  background-color: #ff9800;
}

.warning-btn:hover:not(:disabled) {
  background-color: #f57c00;
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

.loading, .no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 18px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.pagination span {
  font-size: 16px;
  color: #666;
}

.back-button {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .stats-container {
    flex-direction: column;
    align-items: center;
    gap:10px
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
  .stats-card{
    padding: 10px 20px;
  }
}
</style>
