<template>
  <div>
    <h1>為用戶 <strong style="color: mediumblue">{{ username }}</strong> 刪除區域</h1>
    <p style="color: darkred; font-weight: bold;">
      確定要刪除以下 {{ selectedRegions.length }} 條區域數據嗎？此操作不可撤銷！
    </p>

    <el-table :data="formData" highlight-current-row border resizable>
      <el-table-column label="區域名" prop="region_name"></el-table-column>
      <el-table-column label="地點列表" prop="locations">
        <template v-slot="scope">
          {{ scope.row.locations.join(', ') }}
        </template>
      </el-table-column>
      <el-table-column label="地點數量" prop="location_count"></el-table-column>
      <el-table-column label="說明" prop="description">
        <template v-slot="scope">
          {{ scope.row.description || '無' }}
        </template>
      </el-table-column>
    </el-table>

    <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px; gap: 20px;">
      <el-button type="danger" @click="confirmDelete" size="large" round>確認刪除</el-button>
      <el-button @click="goBack" size="large" round>取消</el-button>
    </div>

    <p v-if="submissionMessage" style="margin-top: 20px; color: green;">
      {{ submissionMessage }}
    </p>

    <div class="logout-button-container">
      <button @click="goBack">返回</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { customRegionsAPI } from '@/api';
import { useCustomRegionsStore } from '@/stores';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const route = useRoute();
const customRegionsStore = useCustomRegionsStore();

const username = ref('');
const selectedRegions = ref([]);
const formData = ref([]);
const submissionMessage = ref('');

onMounted(async () => {
  username.value = route.query.username || customRegionsStore.currentUsername;
  selectedRegions.value = customRegionsStore.selectedRegions;

  if (selectedRegions.value.length === 0) {
    ElMessage.warning('未選擇任何區域');
    goBack();
    return;
  }

  // Fetch selected regions data
  try {
    const response = await customRegionsAPI.getUserRegions(username.value);
    // API 返回格式: { username, total, regions: [...] }
    const allRegions = response.regions || [];
    formData.value = allRegions.filter(region => selectedRegions.value.includes(region.id));
  } catch (error) {
    console.error('獲取區域數據失敗:', error);
    ElMessage.error('獲取區域數據失敗');
  }
});

const confirmDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `確定要刪除這 ${selectedRegions.value.length} 條區域數據嗎？`,
      '警告',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // Delete each region
    for (const region of formData.value) {
      await customRegionsAPI.delete({
        id: region.id,
        username: username.value
      });
    }

    submissionMessage.value = `成功刪除 ${selectedRegions.value.length} 條區域數據！`;
    ElMessage.success(submissionMessage.value);

    customRegionsStore.clearSelectedRegions();

    setTimeout(() => {
      router.push({
        name: 'DataManagementPerUser',
        query: { username: username.value, tab: 'regions' }
      });
    }, 1500);
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消刪除');
    } else {
      console.error('刪除失敗:', error);
      ElMessage.error('刪除失敗');
    }
  }
};

const goBack = () => {
  customRegionsStore.clearSelectedRegions();
  router.push({
    name: 'DataManagementPerUser',
    query: { username: username.value, tab: 'regions' }
  });
};
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

h1 {
  font-size: 30px;
  font-weight: bold;
  text-align: center;
  margin-bottom: $spacing-md;
  color: #2c6e49;
}

p {
  font-size: $font-size-lg;
  text-align: center;
  margin-bottom: $spacing-md;
  color: $color-text-primary;
}

.logout-button-container {
  display: flex;
  justify-content: center;
  margin-top: $spacing-lg;

  button {
    @include button-variant(#9e9d24, #b8b726);
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-md;
    border-radius: 25px;
  }
}
</style>
