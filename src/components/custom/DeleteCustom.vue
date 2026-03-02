<template>
  <div>
    <h1>刪除用戶 {{ username }} 的數據</h1>

    <p>請確認要刪除的數據，這將無法恢復！</p>

    <!-- 合并后的表格 -->
    <el-table :data="mergedData" style="width: 100%">
      <el-table-column label="簡稱" prop="簡稱"></el-table-column>
      <el-table-column label="音典分區" prop="音典分區"></el-table-column>
      <el-table-column label="經緯度" prop="經緯度"></el-table-column>
      <el-table-column label="特徵" prop="特徵"></el-table-column>
      <el-table-column label="聲韻調" prop="聲韻調"></el-table-column>
      <el-table-column label="值" prop="值"></el-table-column>
      <el-table-column label="說明" prop="說明">
        <template v-slot="scope">
          <span>{{ scope.row.說明 || '無' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="創建時間" prop="created_at">
        <template v-slot="scope">
          <el-input
              v-if="scope.row.created_at"
              v-model="scope.row.created_at"
              size="small"
              placeholder="慎改！（格式：YYYY-MM-DD HH:MM:SS.SSSSSS）"
          />
          <span v-else>{{ scope.row.created_at }}</span>
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
            取消刪除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-button type="danger" @click="submitDeleteData">批量刪除</el-button>

    <p v-if="deleteData.length === 0" style="color: red; margin-top: 20px;">
      ⚠️ 目前沒有要刪除的數據！請先添加要刪除的行。
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../../axios.js'
import { formatTime } from '../../utils.js'
import { useCustomStore } from '../../stores'

const router = useRouter()
const route = useRoute()
const customStore = useCustomStore()

const users = ref([])
const username = ref('')
const deleteData = ref([
  { created_at: '' }
])

const mergedData = computed(() => {
  // 合并 users 和 deleteData
  const combinedData = [...users.value, ...deleteData.value]

  // 用 Set 去除重复的 created_at
  const seen = new Set()
  return combinedData.filter(item => {
    // 如果该 created_at 已存在，跳过
    if (seen.has(item.created_at)) {
      return false
    }
    seen.add(item.created_at)
    return true
  })
})

const fetchSelectedData = async (requestData) => {
  try {
    // 发送 POST 请求，传递包含所有 created_at 和 username 的列表
    const response = await api.post('/custom/selected', requestData)

    users.value = response.data
    // 确保 'T' 被替换为空格
    users.value = users.value.map(user => ({
      ...user,
      created_at: user.created_at.replace('T', ' ') // 统一格式化
    }))
    // 将格式化后的 users 数据赋值给 deleteData，直接使用相同的数据源
    deleteData.value = [...users.value] // 直接引用 users
  } catch (error) {
    console.error('请求失败:', error)
  }
}

const deleteRow = (index) => {
  deleteData.value.splice(index, 1)
}

const submitDeleteData = async () => {
  // 校验每一行的创建时间是否已填写
  if (deleteData.value.some(item => !item.created_at)) {
    ElMessage.warning('⚠️ 請填寫所有創建時間！')
    return
  }

  // 组织批量删除的数据，这里保持时间字段与后端一致
  const deleteList = deleteData.value.map(item => ({
    username: username.value, // 保持每条数据的用户名一致
    created_at: item.created_at // 直接传递用户输入的时间
  }))

  const confirmMessage = `你確定要刪除用戶 ${username.value} 的數據嗎？這將無法恢復！🚨`

  try {
    await ElMessageBox.confirm(confirmMessage, '警告', {
      type: 'warning'
    })

    try {
      // 发送到后端，后端将接收一个包含多个对象的列表
      const res = await api.delete('/custom/delete', {
        data: deleteList, // 批量刪除的數據
      })
      ElMessage.success('✅ 批量刪除成功！')
      goToCustomPerUser(username.value)
    } catch (error) {
      console.error('刪除失敗', error)

      // 如果后端返回了详细错误信息，显示具体的错误信息
      if (error.response && error.response.data && error.response.data.detail) {
        ElMessage.error(`❌ 刪除失敗: ${error.response.data.detail}`)
      } else {
        // 如果没有返回详细的错误信息，显示通用的错误信息
        ElMessage.error('❌ 刪除失敗，請稍後再試！')
      }
    }
  } catch {
    ElMessage.info('取消刪除操作。😌')
  }
}

const goToCustomPerUser = (user) => {
  console.log(user)
  router.push({ name: 'PerUser', query: { username: user } })
}

onMounted(async () => {
  // 從 customStore 獲取選中的數據
  const selectedUsers = customStore.selectedUsers
  const usernameQuery = route.query.username  // 获取用户名

  if (selectedUsers && selectedUsers.length > 0 && usernameQuery) {
    // 构造请求数据
    const requestData = selectedUsers.map(createdAt => ({
      username: usernameQuery,
      created_at: createdAt.replace('T', ' ')  // 将 'T' 替换为空格
    }))
    username.value = usernameQuery

    // 获取用户数据
    await fetchSelectedData(requestData)
  } else {
    console.log('没有选中的数据或没有用户名')
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';

.el-table {
  margin-bottom: $spacing-md;
}
</style>
