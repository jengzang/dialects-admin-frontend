<template>
  <div>
    <h1>編輯用戶 {{ username }} 的數據</h1>

    <!-- 合并后的表格 -->
    <el-table :data="mergedData" style="width: 100%">
      <el-table-column label="簡稱" prop="簡稱">
        <template v-slot="scope">
          <el-input
              v-model="scope.row.簡稱"
              size="small"
              placeholder="請輸入簡稱"
          />
        </template>
      </el-table-column>
      <el-table-column label="音典分區" prop="音典分區">
        <template v-slot="scope">
          <el-input
              v-model="scope.row.音典分區"
              size="small"
              placeholder="請輸入音典分區"
          />
        </template>
      </el-table-column>
      <el-table-column label="經緯度" prop="經緯度">
        <template v-slot="scope">
          <el-input
              v-model="scope.row.經緯度"
              size="small"
              placeholder="請輸入經緯度"
          />
        </template>
      </el-table-column>
      <el-table-column label="特徵" prop="特徵">
        <template v-slot="scope">
          <el-input
              v-model="scope.row.特徵"
              size="small"
              placeholder="請輸入特徵"
          />
        </template>
      </el-table-column>
      <el-table-column label="聲韻調" prop="聲韻調">
        <template v-slot="scope">
          <el-input
              v-model="scope.row.聲韻調"
              size="small"
              placeholder="請輸入聲韻調"
          />
        </template>
      </el-table-column>
      <el-table-column label="值" prop="值">
        <template v-slot="scope">
          <el-input
              v-model="scope.row.值"
              size="small"
              placeholder="請輸入值"
          />
        </template>
      </el-table-column>
      <el-table-column label="說明" prop="說明">
        <template v-slot="scope">
          <el-input
              v-model="scope.row.說明"
              size="small"
              placeholder="請輸入說明"
          />
        </template>
      </el-table-column>
      <el-table-column label="創建時間" prop="created_at">
        <template v-slot="scope">
          <span>{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button
              v-if="scope.row.created_at"
              @click="deleteRow(scope.$index)"
              type="danger"
              size="small"
              color="green"
          >
            取消編輯
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-button type="danger" @click="editNewData">提交修改</el-button>

    <p v-if="EditData.length === 0" style="color: red; margin-top: 20px;">
      ⚠️ 目前沒有要編輯的數據！請先填充要編輯的行。
    </p>
  </div>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import api from "../../axios.js";
import { formatTime } from "../../utils.js";
import { useCustomStore } from "../../stores";

const customStore = useCustomStore();
const router = useRouter();
const route = useRoute();

const users = ref([]);
const username = ref('');
const EditData = ref([{ created_at: '' }]);

const mergedData = computed(() => {
  // 合并 users 和 EditData
  const combinedData = [...users.value, ...EditData.value];

  // 用 Set 去除重复的 created_at
  const seen = new Set();
  return combinedData.filter(item => {
    // 如果该 created_at 已存在，跳过
    if (seen.has(item.created_at)) {
      return false;
    }
    seen.add(item.created_at);
    return true;
  });
});

const fetchSelectedData = async (requestData) => {
  try {
    // 发送 POST 请求，传递包含所有 created_at 和 username 的列表
    const response = await api.post('/custom/selected', requestData);

    users.value = response.data;
    // 确保 'T' 被替换为空格
    users.value = users.value.map(user => ({
      ...user,
      created_at: user.created_at.replace('T', ' ') // 统一格式化
    }));
    // 将格式化后的 users 数据赋值给 EditData，直接使用相同的数据源
    EditData.value = [...users.value]; // 直接引用 users
  } catch (error) {
    console.error('请求失败:', error);
  }
};

const DeleteData = async () => {
  // 校验每一行的创建时间是否已填写
  if (EditData.value.some(item => !item.created_at)) {
    ElMessage.warning("⚠️ 請填寫所有創建時間！");
    return;
  }

  // 组织批量删除的数据，这里保持时间字段与后端一致
  const deleteList = EditData.value.map(item => ({
    username: username.value, // 保持每条数据的用户名一致
    created_at: item.created_at // 直接传递用户输入的时间
  }));

  try {
    // 发送到后端，后端将接收一个包含多个对象的列表
    const res = await api.delete("/custom/delete", {
      data: deleteList, // 批量刪除的數據
    });
    ElMessage.success("✅ 編輯成功！");
  } catch (error) {
    console.error("刪除失敗", error);
    ElMessage.error("❌ 刪除失敗！");
  }
};

const SubmitData = async () => {
  try {
    // 在提交前，檢查是否有其他字段為空（除了"說明"）
    for (let row of EditData.value) {
      if (!row.簡稱 || !row.音典分區 || !row.經緯度 || !row.特徵 || !row.值) {
        ElMessage.warning("⚠️ 所有字段（除了'說明'）都必須填寫！");
        return; // 如果有空字段，停止提交
      }
    }

    // 提交数据，直接使用已更新的 EditData
    const submitData = EditData.value.map(item => ({
      簡稱: item.簡稱,
      音典分區: item.音典分區,
      經緯度: item.經緯度,
      聲韻調: item.聲韻調,
      特徵: item.特徵,
      值: item.值,
      說明: item.說明 || '無',  // 如果沒有說明，则默认为'無'
      username: username.value
    }));

    // 提交数据
    const res = await api.post("/custom/create", submitData);

    // 提示用户提交了多少份数据
    const dataCount = res.data.length || submitData.length;
    ElMessage.success(`✅ 批量提交成功！提交了 ${dataCount} 份數據`);
  } catch (error) {
    console.error("提交失敗", error);
    ElMessage.error("❌ 提交失敗！");
  }
};

const editNewData = async () => {
  await SubmitData();
  await DeleteData();
  goToCustomPerUser(username.value);
};

const deleteRow = (index) => {
  EditData.value.splice(index, 1);
};

const goToCustomPerUser = (username) => {
  console.log(username);
  router.push({ name: 'PerUser', query: { username: username } });
};

onMounted(async () => {
  // 從 customStore 獲取選中的數據
  const selectedUsers = customStore.selectedUsers;
  const usernameQuery = route.query.username;  // 获取用户名

  if (selectedUsers && selectedUsers.length > 0 && usernameQuery) {
    // 构造请求数据
    const requestData = selectedUsers.map(createdAt => ({
      username: usernameQuery,
      created_at: createdAt.replace('T', ' ')  // 将 'T' 替换为空格
    }));
    username.value = usernameQuery;

    // 获取用户数据
    await fetchSelectedData(requestData);
  } else {
    console.log('没有选中的数据或没有用户名');
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';

.el-table {
  margin-bottom: $spacing-md;
}
</style>
