<template>
  <div>
    <h1>為用戶 <strong style="color: mediumblue">{{ username }}</strong> 編輯區域</h1>
    <p>已選擇 {{ selectedRegions.length }} 條區域數據</p>

    <el-table :data="formData" highlight-current-row border resizable>
      <el-table-column label="區域名" prop="region_name">
        <template v-slot="scope">
          <el-input v-model="scope.row.region_name" size="small" placeholder="請輸入區域名"></el-input>
        </template>
      </el-table-column>

      <el-table-column label="地點列表 (逗號分隔)" prop="locations">
        <template v-slot="scope">
          <el-input v-model="scope.row.locations" size="small" placeholder="請輸入地點，用逗號分隔"></el-input>
        </template>
      </el-table-column>

      <el-table-column label="說明" prop="description">
        <template v-slot="scope">
          <el-input v-model="scope.row.description" size="small" placeholder="請輸入說明"></el-input>
        </template>
      </el-table-column>
    </el-table>

    <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px;">
      <el-button type="success" @click="submitData" size="large" round>批量更新</el-button>
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
import { ElMessage } from 'element-plus';

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
    // selectedRegions now contains created_at values
    formData.value = allRegions
      .filter(region => selectedRegions.value.includes(region.created_at))
      .map(region => ({
        id: region.id,
        region_name: region.region_name,
        locations: region.locations.join(', '),
        description: region.description || '',
        created_at: region.created_at
      }));
        region_name: region.region_name,
        locations: region.locations.join(', '),
        description: region.description || ''
      }));
  } catch (error) {
    console.error('獲取區域數據失敗:', error);
    ElMessage.error('獲取區域數據失敗');
  }
});

const submitData = async () => {
  try {
    const dataToSubmit = formData.value.map(row => ({
      username: username.value,
      created_at: row.created_at,  // Use created_at to identify the record
      region_name: row.region_name,
      locations: row.locations.split(',').map(loc => loc.trim()).filter(loc => loc),
      description: row.description
    }));

    for (const data of dataToSubmit) {
      await customRegionsAPI.update(data);
    }

    submissionMessage.value = `成功更新 ${dataToSubmit.length} 條區域數據！`;
    ElMessage.success(submissionMessage.value);

    customRegionsStore.clearSelectedRegions();

    setTimeout(() => {
      router.push({
        name: 'DataManagementPerUser',
        query: { username: username.value, tab: 'regions' }
      });
    }, 1500);
  } catch (error) {
    console.error('更新失敗:', error);
    ElMessage.error('更新失敗，請檢查數據格式');
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
