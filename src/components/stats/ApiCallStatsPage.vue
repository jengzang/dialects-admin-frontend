<template>
  <div class="api-call-stats-page">
    <!-- Header -->
    <div class="page-header">
      <h2>API 調用統計</h2>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="goHome">
          返回首頁
        </button>
        <button class="btn btn-primary" @click="refreshCurrentTab" :disabled="loading">
          {{ loading ? '載入中...' : '刷新' }}
        </button>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tabs-container">
      <div class="tabs-header">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          :class="['tab-button', { active: activeTab === tab.name }]"
          @click="switchTab(tab.name)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tabs-content">
        <RealTimeMonitor
          v-show="activeTab === 'realtime'"
          ref="realtimeRef"
          @loading="handleLoading"
        />
        <TrendAnalysis
          v-show="activeTab === 'trend'"
          ref="trendRef"
          @loading="handleLoading"
        />
        <ApiRanking
          v-show="activeTab === 'ranking'"
          ref="rankingRef"
          @loading="handleLoading"
          @view-detail="handleViewDetail"
        />
        <DetailedAnalysis
          v-show="activeTab === 'detail'"
          ref="detailRef"
          :initial-api="selectedApi"
          @loading="handleLoading"
        />
      </div>
    </div>
  </div>
</template>

<script>
import RealTimeMonitor from './RealTimeMonitor.vue';
import TrendAnalysis from './TrendAnalysis.vue';
import ApiRanking from './ApiRanking.vue';
import DetailedAnalysis from './DetailedAnalysis.vue';

export default {
  name: 'ApiCallStatsPage',
  components: {
    RealTimeMonitor,
    TrendAnalysis,
    ApiRanking,
    DetailedAnalysis
  },
  data() {
    return {
      activeTab: 'realtime',
      loading: false,
      selectedApi: null,
      tabs: [
        { name: 'realtime', label: '實時監控' },
        { name: 'trend', label: '趨勢分析' },
        { name: 'ranking', label: 'API 排行榜' },
        { name: 'detail', label: '詳細分析' }
      ]
    };
  },
  methods: {
    switchTab(tabName) {
      this.activeTab = tabName;
    },
    goHome() {
      this.$router.push('/');
    },
    async refreshCurrentTab() {
      const refName = `${this.activeTab}Ref`;
      const currentRef = this.$refs[refName];
      if (currentRef && currentRef.fetchData) {
        await currentRef.fetchData();
      }
    },
    handleViewDetail(apiPath) {
      this.selectedApi = apiPath;
      this.activeTab = 'detail';
    },
    handleLoading(isLoading) {
      this.loading = isLoading;
    }
  }
};
</script>

<style scoped>
.api-call-stats-page {
  padding: var(--spacing-md);
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.page-header h2 {
  margin: 0;
  font-size: 28px;
  color: var(--color-text-primary);
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.tabs-container {
  background: var(--color-background-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 2px solid var(--color-border-light);
  background: var(--color-background-light);
}

.tab-button {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-button:hover {
  background: rgba(76, 175, 80, 0.1);
  color: var(--color-primary);
}

.tab-button.active {
  color: var(--color-primary);
  font-weight: 600;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-primary);
}

.tabs-content {
  padding: var(--spacing-lg);
  min-height: 600px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .api-call-stats-page {
    padding: var(--spacing-sm);
  }

  .page-header {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
    margin-bottom: var(--spacing-md);
  }

  .page-header h2 {
    font-size: 22px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .tabs-header {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab-button {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 14px;
    white-space: nowrap;
    min-width: 80px;
  }

  .tabs-content {
    padding: var(--spacing-md);
    min-height: auto;
  }
}

@media (max-width: 480px) {
  .api-call-stats-page {
    padding: var(--spacing-xs);
  }

  .page-header h2 {
    font-size: 20px;
  }

  .tab-button {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 13px;
    min-width: 70px;
  }

  .tabs-content {
    padding: var(--spacing-sm);
  }
}
</style>
