<template>
  <div class="data-management-all">
    <!-- Tab switcher and Home button in same row -->
    <div class="header-row">
      <div class="tabs">
        <button
          :class="{ active: activeTab === 'data' }"
          @click="switchTab('data')"
        >
          自定義數據 ({{ customDataCount }})
        </button>
        <button
          :class="{ active: activeTab === 'regions' }"
          @click="switchTab('regions')"
        >
          自定義區域 ({{ regionsCount }})
        </button>
      </div>

      <button @click="goToHome" class="home-btn">返回首頁</button>
    </div>

    <!-- Child components -->
    <CustomAll
      v-if="activeTab === 'data'"
      :show-header="true"
      :show-home-button="false"
      @row-click="handleDataRowClick"
    />

    <RegionsAll
      v-else
      :show-header="true"
      :show-home-button="false"
      @row-click="handleRegionRowClick"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import CustomAll from './CustomAll.vue';
import RegionsAll from './RegionsAll.vue';
import { customAPI, customRegionsAPI } from '@/api';

const router = useRouter();
const route = useRoute();
const activeTab = ref('data');
const customDataCount = ref(0);
const regionsCount = ref(0);

// Initialize tab from query parameter
onMounted(() => {
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  }
  fetchCounts();
});

// Fetch counts
const fetchCounts = async () => {
  try {
    const customData = await customAPI.getAll();
    customDataCount.value = customData.data?.length || 0;

    const regionsData = await customRegionsAPI.getAll();
    regionsCount.value = regionsData.total || regionsData.data?.length || regionsData.length || 0;
  } catch (error) {
    console.error('Error fetching counts:', error);
  }
};

const handleDataRowClick = (user) => {
  router.push({
    name: 'DataManagementPerUser',
    query: {
      username: user.username,
      tab: 'data'
    }
  });
};

const handleRegionRowClick = (user) => {
  router.push({
    name: 'DataManagementPerUser',
    query: {
      username: user.username,
      tab: 'regions'
    }
  });
};

const goToHome = () => {
  router.push({ name: 'Home' });
};

const switchTab = (tab) => {
  router.push({
    name: 'DataManagementAll',
    query: { tab }
  });
};

// Watch for tab changes
watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    activeTab.value = newTab;
  }
});

onMounted(() => {
  fetchCounts();
});
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.data-management-all {
  padding: $spacing-md;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
  gap: $spacing-md;

  .home-btn {
    @include button-variant(#9e9d24, #b8b726);
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-md;
    border-radius: 25px;
    white-space: nowrap;
    flex-shrink: 0;
  }
}

.tabs {
  display: flex;
  justify-content: center;
  gap: $spacing-sm;
  flex: 1;

  button {
    padding: $spacing-sm $spacing-lg;
    font-size: $font-size-md;
    border: 2px solid #2c6e49;
    border-radius: 25px 25px 0 0;
    background-color: #e4f4e7;
    color: #2c6e49;
    cursor: pointer;
    transition: all $transition-normal;

    &.active {
      background-color: #2c6e49;
      color: white;
      font-weight: bold;
    }

    &:hover:not(.active) {
      background-color: #c8e7c2;
    }
  }
}

@include respond-to(mobile) {
  .header-row {
    flex-direction: column;
    align-items: stretch;

    .home-btn {
      width: 100%;
    }
  }

  .tabs button {
    font-size: $font-size-sm;
    padding: $spacing-xs $spacing-sm;
  }
}

// Ensure pagination styles work for child components
::v-deep(.pagination-controls) {
  margin-top: $spacing-md;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: $spacing-sm;

  button {
    @include button-variant($color-primary, #45a049);
    padding: 12px 24px;
    border-radius: 20px;
    font-size: $font-size-md;

    &:disabled {
      background-color: rgba(76, 175, 80, 0.5);
      cursor: not-allowed;
    }
  }

  span {
    font-size: $font-size-md;
    color: $color-text-primary;
  }
}
</style>

