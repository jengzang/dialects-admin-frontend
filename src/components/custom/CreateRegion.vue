<template>
  <div>
    <h1>為用戶 <strong style="color: mediumblue">{{ username }}</strong> 批量創建區域</h1>

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

      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button @click="deleteRow(scope.$index)" type="danger" size="small">刪除行</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px;">
      <el-button type="primary" @click="addRow">添加行</el-button>
      <el-checkbox v-model="copyPreviousRow">默認複製上一行的數據</el-checkbox>
    </div>

    <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px;">
      <el-button type="success" @click="submitData" size="large" round
                 style="display: flex; justify-content: center; align-items: center;">批量提交</el-button>
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
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();

const username = ref('');
const formData = ref([
  { region_name: '', locations: '', description: '' }
]);
const copyPreviousRow = ref(false);
const submissionMessage = ref('');

onMounted(() => {
  username.value = route.query.username || '';
});

const addRow = () => {
  if (copyPreviousRow.value && formData.value.length > 0) {
    const lastRow = formData.value[formData.value.length - 1];
    formData.value.push({ ...lastRow });
  } else {
    formData.value.push({ region_name: '', locations: '', description: '' });
  }
};

const deleteRow = (index) => {
  if (formData.value.length > 1) {
    formData.value.splice(index, 1);
  } else {
    ElMessage.warning('至少保留一行');
  }
};

const submitData = async () => {
  try {
    const dataToSubmit = formData.value.map(row => ({
      username: username.value,
      region_name: row.region_name,
      locations: row.locations.split(',').map(loc => loc.trim()).filter(loc => loc),
      description: row.description
    }));

    // Filter out empty rows
    const validData = dataToSubmit.filter(row => row.region_name && row.locations.length > 0);

    if (validData.length === 0) {
      ElMessage.warning('請至少填寫一行有效數據（區域名和地點列表必填）');
      return;
    }

    for (const data of validData) {
      await customRegionsAPI.create(data);
    }

    submissionMessage.value = `成功創建 ${validData.length} 條區域數據！`;
    ElMessage.success(submissionMessage.value);

    setTimeout(() => {
      router.push({
        name: 'DataManagementPerUser',
        query: { username: username.value, tab: 'regions' }
      });
    }, 1500);
  } catch (error) {
    console.error('提交失敗:', error);
    ElMessage.error('提交失敗，請檢查數據格式');
  }
};

const goBack = () => {
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
  margin-bottom: $spacing-lg;
  color: #2c6e49;
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

