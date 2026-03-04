<template>
  <div class="leaderboard-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <img :src="queryGreenIcon" class="header-icon" alt="Leaderboard" />
        <h1>排行榜</h1>
      </div>
      <el-button @click="goToHome" class="back-button">
        返回首頁
      </el-button>
    </div>

    <!-- 统计卡片区 -->
    <div class="stats-section">
      <BaseRow :gutter="16">
        <BaseCol :span="6" :tablet="12" :mobile="12">
          <StatsCard
            :number="stats.totalRankings"
            label="總排名數"
            color="var(--color-primary)"
          />
        </BaseCol>
        <BaseCol :span="6" :tablet="12" :mobile="12">
          <StatsCard
            :number="formatValue(stats.firstPlaceValue, filters.metric)"
            label="第一名數據"
            color="var(--color-success)"
          />
        </BaseCol>
        <BaseCol :span="6" :tablet="12" :mobile="12">
          <StatsCard
            :number="stats.firstPlaceUser"
            label="第一名"
            color="var(--color-warning)"
          />
        </BaseCol>
        <BaseCol :span="6" :tablet="12" :mobile="12">
          <StatsCard
            :number="formatValue(stats.totalValue, filters.metric)"
            label="累計總量"
            color="var(--color-info)"
          />
        </BaseCol>
      </BaseRow>
    </div>

    <!-- 筛选器区 -->
    <BaseCard class="filter-card">
      <BaseForm :inline="true">
        <BaseFormItem label="排行榜類型">
          <BaseSelect
            v-model="filters.ranking_type"
            :options="rankingTypeOptions"
            style="width: 200px"
          />
        </BaseFormItem>

        <BaseFormItem label="指標類型">
          <BaseSelect
            v-model="filters.metric"
            :options="metricOptions"
            style="width: 180px"
          />
        </BaseFormItem>

        <BaseFormItem v-if="showApiSelector" label="選擇API">
          <BaseSelect
            v-model="filters.api_path"
            :options="availableApis"
            placeholder="請選擇API"
            style="width: 300px"
          />
        </BaseFormItem>

        <div class="filter-actions">
          <el-button type="primary" @click="handleSearch" :loading="loading">
            刷新
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </BaseForm>
    </BaseCard>

    <!-- 排名表格 -->
    <BaseCard class="table-card">
      <BaseTable
        :columns="tableColumns"
        :data="rankings"
        :loading="loading"
      >
        <!-- 排名列 -->
        <template #cell-rank="{ value }">
          <span :class="getRankClass(value)">
            {{ formatRank(value) }}
          </span>
        </template>

        <!-- 用户名列 -->
        <template #cell-username="{ value, row }">
          <router-link
            :to="{ name: 'UserProfileDetail', params: { username: row.username } }"
            class="username-link"
          >
            {{ value }}
          </router-link>
        </template>

        <!-- API路径列 -->
        <template #cell-path="{ value }">
          <code class="api-path">{{ value }}</code>
        </template>

        <!-- 数值列 -->
        <template #cell-value="{ value }">
          <span class="value-cell">
            {{ formatValue(value, filters.metric) }}
          </span>
        </template>

        <!-- 百分比列 -->
        <template #cell-percentage="{ value }">
          <div class="percentage-cell">
            <div class="percentage-bar">
              <div
                class="percentage-fill"
                :style="{ width: getPercentageWidth(value) }"
              ></div>
            </div>
            <span class="percentage-text">{{ formatPercentage(value) }}</span>
          </div>
        </template>

        <!-- 差距列 -->
        <template #cell-gap_to_prev="{ value }">
          <span v-if="value !== null && value !== undefined" class="gap-cell">
            {{ formatValue(value, filters.metric) }}
          </span>
          <span v-else class="gap-cell-empty">-</span>
        </template>
      </BaseTable>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <BasePagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-size="pageSize"
          @page-change="handlePageChange"
        />
      </div>
    </BaseCard>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { leaderboardAPI } from '@/api/index';
import {
  BaseRow,
  BaseCol,
  BaseCard,
  BaseForm,
  BaseFormItem,
  BaseSelect,
  BaseTable,
  BasePagination,
  StatsCard
} from '@/components/common';
import queryGreenIcon from '@/assets/query_green.ico';

export default {
  name: 'LeaderboardView',
  components: {
    BaseRow,
    BaseCol,
    BaseCard,
    BaseForm,
    BaseFormItem,
    BaseSelect,
    BaseTable,
    BasePagination,
    StatsCard
  },
  setup() {
    const router = useRouter();

    // 响应式状态
    const loading = ref(false);
    const rankings = ref([]);
    const availableApis = ref([]);

    // 筛选器状态
    const filters = ref({
      ranking_type: 'user_global',
      metric: 'count',
      api_path: ''
    });

    // 分页状态
    const currentPage = ref(1);
    const pageSize = ref(20);
    const totalCount = ref(0);
    const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

    // 统计数据
    const stats = ref({
      totalRankings: 0,
      firstPlaceValue: 0,
      firstPlaceUser: '',
      totalValue: 0
    });

    // 排行榜类型选项
    const rankingTypeOptions = [
      { label: '用戶全局排行', value: 'user_global' },
      { label: '特定API用戶排行', value: 'user_by_api' },
      { label: 'API熱度排行', value: 'api' },
      { label: '在線時長排行', value: 'online_time' }
    ];

    // 动态指标选项
    const metricOptions = computed(() => {
      // online_time 类型只支持在线时长指标
      if (filters.value.ranking_type === 'online_time') {
        return [{ label: '在線時長', value: 'duration' }];
      }
      // 其他类型（user_global, user_by_api, api）都支持所有指标
      return [
        { label: '調用次數', value: 'count' },
        { label: '使用時長', value: 'duration' },
        { label: '上傳量', value: 'upload' },
        { label: '下載量', value: 'download' }
      ];
    });

    // 是否显示API选择器
    const showApiSelector = computed(() => {
      return filters.value.ranking_type === 'user_by_api';
    });

    // 获取指标标签
    const getMetricLabel = () => {
      const metricLabels = {
        count: '調用次數',
        duration: '使用時長',
        upload: '上傳量',
        download: '下載量'
      };
      return metricLabels[filters.value.metric] || '數值';
    };

    // 动态表格列
    const tableColumns = computed(() => {
      const columns = [
        { key: 'rank', label: '排名', sortable: false, width: '80px', align: 'center' }
      ];

      // 根据排行榜类型显示不同的主体列
      if (filters.value.ranking_type === 'api') {
        columns.push({ key: 'path', label: 'API路徑', sortable: false, minWidth: '200px' });
      } else {
        columns.push({ key: 'username', label: '用戶名', sortable: false, minWidth: '150px' });
      }

      columns.push(
        { key: 'value', label: getMetricLabel(), sortable: false, width: '150px', align: 'right' },
        { key: 'percentage', label: '百分比', sortable: false, width: '180px', align: 'center' },
        { key: 'gap_to_prev', label: '與前一名差距', sortable: false, width: '150px', align: 'right' }
      );

      return columns;
    });

    // 数据格式化方法
    const formatValue = (value, metric) => {
      if (typeof value !== 'number' || isNaN(value)) return 'N/A';

      switch (metric) {
        case 'count':
          return value.toLocaleString();
        case 'duration':
          return formatDuration(value);
        case 'upload':
        case 'download':
          return formatKB(value);
        default:
          return value;
      }
    };

    const formatDuration = (seconds) => {
      if (typeof seconds !== 'number' || isNaN(seconds)) return 'N/A';
      if (seconds < 60) return `${seconds}秒`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}分鐘`;
      if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}小時`;
      return `${(seconds / 86400).toFixed(1)}天`;
    };

    // 格式化 KB 单位的数据（后端返回的上传/下载量单位是 KB）
    const formatKB = (kb) => {
      if (typeof kb !== 'number' || isNaN(kb)) return 'N/A';
      if (kb === 0) return '0 KB';

      if (kb < 1024) {
        return `${kb.toFixed(2)} KB`;
      } else if (kb < 1024 * 1024) {
        return `${(kb / 1024).toFixed(2)} MB`;
      } else if (kb < 1024 * 1024 * 1024) {
        return `${(kb / 1024 / 1024).toFixed(2)} GB`;
      } else {
        return `${(kb / 1024 / 1024 / 1024).toFixed(2)} TB`;
      }
    };

    const formatPercentage = (percentage) => {
      // 处理 null/undefined
      if (percentage === null || percentage === undefined) {
        return 'N/A';
      }

      // 转换为数字（处理字符串类型）
      const numValue = typeof percentage === 'string' ? parseFloat(percentage) : percentage;

      // 检查是否为有效数字
      if (typeof numValue !== 'number' || isNaN(numValue)) {
        return 'N/A';
      }

      return `${numValue.toFixed(1)}%`;
    };

    const getPercentageWidth = (percentage) => {
      // 处理 null/undefined
      if (percentage === null || percentage === undefined) {
        return '0%';
      }

      // 转换为数字（处理字符串类型）
      const numValue = typeof percentage === 'string' ? parseFloat(percentage) : percentage;

      // 检查是否为有效数字
      if (typeof numValue !== 'number' || isNaN(numValue)) {
        return '0%';
      }

      // 确保百分比在 0-100 之间
      const clampedPercentage = Math.max(0, Math.min(100, numValue));
      return `${clampedPercentage}%`;
    };

    const formatRank = (rank) => {
      const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
      return medals[rank] || rank;
    };

    const getRankClass = (rank) => {
      const classes = ['rank-cell'];
      if (rank === 1) classes.push('rank-gold');
      else if (rank === 2) classes.push('rank-silver');
      else if (rank === 3) classes.push('rank-bronze');
      return classes.join(' ');
    };

    // 数据加载
    const loadRankings = async () => {
      loading.value = true;
      try {
        const params = {
          ranking_type: filters.value.ranking_type,
          page: currentPage.value,
          page_size: pageSize.value
        };

        // online_time 类型不需要 metric 参数
        if (filters.value.ranking_type !== 'online_time') {
          params.metric = filters.value.metric;
        }

        // user_by_api 类型需要 api_path 参数
        if (filters.value.ranking_type === 'user_by_api' && filters.value.api_path) {
          params.api_path = filters.value.api_path;
        }

        const response = await leaderboardAPI.getRankings(params);

        rankings.value = response.rankings || [];
        totalCount.value = response.total_count || 0;

        updateStats(response);

      } catch (error) {
        console.error('Failed to load rankings:', error);
        ElMessage.error('加載排行榜失敗');
      } finally {
        loading.value = false;
      }
    };

    const loadAvailableApis = async () => {
      try {
        const response = await leaderboardAPI.getAvailableApis();
        availableApis.value = (response.apis || []).map(api => ({
          label: api,
          value: api
        }));
      } catch (error) {
        console.error('Failed to load available APIs:', error);
      }
    };

    const updateStats = (response) => {
      const firstPlace = response.rankings[0];
      stats.value = {
        totalRankings: response.total_count || 0,
        firstPlaceValue: firstPlace?.value || 0,
        firstPlaceUser: firstPlace?.username || firstPlace?.path || 'N/A',
        // 使用后端返回的全局累计总量，如果没有则计算当前页总和作为后备
        totalValue: response.total_value ?? calculateTotal(response.rankings)
      };
    };

    const calculateTotal = (rankings) => {
      if (!rankings || rankings.length === 0) return 0;
      return rankings.reduce((acc, item) => acc + (item.value || 0), 0);
    };

    // 事件处理
    const handleSearch = () => {
      // 验证：user_by_api类型必须选择API
      if (filters.value.ranking_type === 'user_by_api' && !filters.value.api_path) {
        ElMessage.warning('請選擇API');
        return;
      }

      // 手动刷新数据
      loadRankings();
    };

    const handleReset = () => {
      filters.value = {
        ranking_type: 'user_global',
        metric: 'count',
        api_path: ''
      };
      currentPage.value = 1;
      loadRankings();
    };

    const goToHome = () => {
      router.push({ name: 'Home' });
    };

    const handlePageChange = (page) => {
      currentPage.value = page;
      loadRankings();
    };

    // 监听排行榜类型变化
    watch(() => filters.value.ranking_type, (newType) => {
      // online_time 类型自动切换到 duration 指标
      if (newType === 'online_time') {
        filters.value.metric = 'duration';
      }

      // 非 user_by_api 类型时清空 API 选择
      if (newType !== 'user_by_api') {
        filters.value.api_path = '';
      }

      currentPage.value = 1;
      loadRankings(); // 自动查询
    });

    // 监听指标类型变化
    watch(() => filters.value.metric, () => {
      currentPage.value = 1;
      loadRankings(); // 自动查询
    });

    // 监听 API 选择变化
    watch(() => filters.value.api_path, (newPath) => {
      // 只有在 user_by_api 模式下且选择了 API 时才自动查询
      if (filters.value.ranking_type === 'user_by_api' && newPath) {
        currentPage.value = 1;
        loadRankings();
      }
    });

    // 生命周期
    onMounted(async () => {
      await loadAvailableApis();
      await loadRankings();
    });

    return {
      queryGreenIcon,
      loading,
      rankings,
      availableApis,
      filters,
      currentPage,
      pageSize,
      totalPages,
      stats,
      rankingTypeOptions,
      metricOptions,
      showApiSelector,
      tableColumns,
      formatValue,
      formatPercentage,
      getPercentageWidth,
      formatRank,
      getRankClass,
      handleSearch,
      handleReset,
      handlePageChange,
      goToHome
    };
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.leaderboard-view {
  padding: $spacing-md;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-sm;
  margin-bottom: $spacing-lg;

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .header-icon {
    width: 32px;
    height: 32px;
  }

  h1 {
    margin: 0;
    font-size: 24px;
    color: $color-text-primary;
  }

  .back-button {
    flex-shrink: 0;
  }
}

.stats-section {
  margin: $spacing-md 0;
}

.filter-card {
  margin: $spacing-md 0;

  :deep(.base-form) {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: $spacing-sm;
  }

  .filter-actions {
    display: flex;
    gap: $spacing-sm;
    margin-top: $spacing-xs;
  }
}

.table-card {
  margin: $spacing-md 0;
}

.rank-cell {
  font-weight: bold;
  font-size: $font-size-lg;

  &.rank-gold {
    color: #FFD700;
  }

  &.rank-silver {
    color: #C0C0C0;
  }

  &.rank-bronze {
    color: #CD7F32;
  }
}

.username-link {
  color: $color-primary;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

.api-path {
  font-family: 'Courier New', monospace;
  font-size: $font-size-sm;
  background: $color-background-light;
  padding: 2px 6px;
  border-radius: $radius-sm;
}

.value-cell {
  font-weight: 500;
  color: $color-text-primary;
}

.percentage-cell {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.percentage-bar {
  flex: 1;
  height: 8px;
  background: $color-background-light;
  border-radius: $radius-sm;
  overflow: hidden;
}

.percentage-fill {
  height: 100%;
  background: linear-gradient(90deg, $color-primary-light, $color-primary);
  transition: width $transition-normal;
}

.percentage-text {
  min-width: 50px;
  text-align: right;
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.gap-cell {
  color: $color-text-secondary;
}

.gap-cell-empty {
  color: $color-text-light;
}

.pagination-wrapper {
  margin-top: $spacing-md;
  display: flex;
  justify-content: center;

  :deep(.pagination) {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: $spacing-sm;
  }

  :deep(button),
  :deep(.pagination-btn) {
    @include button-variant($color-primary, $color-primary-dark);
    padding: 12px 24px;
    margin: 0 12px;
    border-radius: 20px;
    font-size: $font-size-md;
    max-width: 120px;

    &:disabled {
      background-color: rgba(42, 175, 53, 0.34);
      cursor: not-allowed;
    }
  }

  :deep(.pagination-info),
  :deep(span) {
    padding: 0 $spacing-sm;
    color: $color-text-secondary;
    font-size: $font-size-sm;
    align-self: center;
  }
}

@include respond-to(mobile) {
  .leaderboard-view {
    padding: $spacing-sm;
  }

  .stats-section {
    :deep(.base-col) {
      margin-bottom: $spacing-sm;
    }
  }

  .filter-card {
    :deep(.base-form) {
      flex-direction: column;
      align-items: stretch;
    }

    :deep(.base-form-item) {
      width: 100%;

      .base-select {
        width: 100% !important;
      }
    }

    .filter-actions {
      width: 100%;

      button {
        flex: 1;
      }
    }
  }

  .percentage-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .percentage-bar {
    width: 100%;
  }

  .percentage-text {
    width: 100%;
    text-align: left;
  }
}
</style>
