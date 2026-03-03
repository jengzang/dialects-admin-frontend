<template>
  <div class="data-management-all">
    <!-- Tab switcher -->
    <div class="tabs">
      <button
        :class="{ active: activeTab === 'data' }"
        @click="activeTab = 'data'"
      >
        自定義數據 ({{ customDataCount }})
      </button>
      <button
        :class="{ active: activeTab === 'regions' }"
        @click="activeTab = 'regions'"
      >
        自定義區域 ({{ regionsCount }})
      </button>
    </div>

    <!-- Home button -->
    <div class="top-controls">
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CustomAll from './CustomAll.vue';
import RegionsAll from './RegionsAll.vue';
import { customAPI, customRegionsAPI } from '@/api';

const router = useRouter();
const activeTab = ref('data');
const customDataCount = ref(0);
const regionsCount = ref(0);

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

.tabs {
  display: flex;
  justify-content: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;

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

.top-controls {
  display: flex;
  justify-content: center;
  margin-bottom: $spacing-md;

  .home-btn {
    @include button-variant(#9e9d24, #b8b726);
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-md;
    border-radius: 25px;
  }
}

@include respond-to(mobile) {
  .tabs button {
    font-size: $font-size-sm;
    padding: $spacing-xs $spacing-sm;
  }
}
</style>

