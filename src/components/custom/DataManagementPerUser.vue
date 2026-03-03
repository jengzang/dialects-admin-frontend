<template>
  <div class="data-management-per-user">
    <!-- Tab switcher and buttons in same row -->
    <div class="header-row">
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

      <div class="action-buttons">
        <button @click="goToDataManagementAll" class="back-btn">返回所有數據</button>
        <button @click="goToHome" class="home-btn">返回首頁</button>
      </div>
    </div>

    <!-- Child components -->
    <CustomPerUser
      v-if="activeTab === 'data'"
      :show-header="true"
      :show-home-button="false"
      :data-type="'data'"
    />

    <RegionsPerUser
      v-else
      :show-header="true"
      :show-home-button="false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import CustomPerUser from './CustomPerUser.vue';
import RegionsPerUser from './RegionsPerUser.vue';
import { customAPI, customRegionsAPI } from '@/api';

const router = useRouter();
const route = useRoute();
const activeTab = ref('data');
const customDataCount = ref(0);
const regionsCount = ref(0);
const username = ref('');

// Initialize tab from query parameter
onMounted(() => {
  username.value = route.query.username || '';
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  }
  fetchCounts();
});

// Fetch counts
const fetchCounts = async () => {
  if (!username.value) return;

  try {
    const customData = await customAPI.getUserData(username.value);
    customDataCount.value = customData.data?.length || 0;

    const regionsData = await customRegionsAPI.getUserRegions(username.value);
    regionsCount.value = regionsData.data?.length || regionsData.length || 0;
  } catch (error) {
    console.error('Error fetching counts:', error);
  }
};

const goToHome = () => {
  router.push({ name: 'Home' });
};

const goToDataManagementAll = () => {
  router.push({ name: 'DataManagementAll' });
};

// Watch for username changes
watch(() => route.query.username, (newUsername) => {
  if (newUsername) {
    username.value = newUsername;
    fetchCounts();
  }
});

// Watch for tab changes
watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    activeTab.value = newTab;
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.data-management-per-user {
  padding: $spacing-md;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
  gap: $spacing-md;

  .action-buttons {
    display: flex;
    gap: $spacing-sm;
    flex-shrink: 0;
  }

  .home-btn {
    @include button-variant(#9e9d24, #b8b726);
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-md;
    border-radius: 25px;
    white-space: nowrap;
  }

  .back-btn {
    @include button-variant(#1c8dba, #1a7ba8);
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-md;
    border-radius: 25px;
    white-space: nowrap;
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

    .action-buttons {
      flex-direction: column;
      width: 100%;

      .home-btn,
      .back-btn {
        width: 100%;
      }
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

