# Options API → Composition API (`<script setup>`) 迁移计划

## 概述

将所有 20 个 Vue 组件从 Options API 迁移到 Composition API (`<script setup>`) 语法。

---

## 为什么迁移？

### Composition API 的优势

1. **更好的逻辑复用** - 通过 composables 提取和复用逻辑
2. **更好的类型推断** - TypeScript 支持更好
3. **更简洁的代码** - 减少样板代码
4. **更好的性能** - 编译时优化
5. **更灵活的组织** - 按功能而非选项组织代码

### `<script setup>` 的优势

- 更少的样板代码
- 自动暴露到模板
- 更好的运行时性能
- 更好的 IDE 支持

---

## 迁移策略

### 核心转换规则

#### 1. 基础结构转换

**Options API:**
```vue
<script>
export default {
  name: 'MyComponent',
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>
```

**Composition API (`<script setup>`):**
```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}
</script>
```

#### 2. Props 和 Emits

**Options API:**
```vue
<script>
export default {
  props: {
    title: String,
    count: Number
  },
  emits: ['update', 'delete']
}
</script>
```

**Composition API:**
```vue
<script setup>
const props = defineProps({
  title: String,
  count: Number
})

const emit = defineEmits(['update', 'delete'])
</script>
```

#### 3. Computed 属性

**Options API:**
```vue
<script>
export default {
  computed: {
    doubleCount() {
      return this.count * 2
    }
  }
}
</script>
```

**Composition API:**
```vue
<script setup>
import { computed } from 'vue'

const doubleCount = computed(() => count.value * 2)
</script>
```

#### 4. 生命周期钩子

**Options API:**
```vue
<script>
export default {
  mounted() {
    console.log('mounted')
  },
  beforeUnmount() {
    console.log('cleanup')
  }
}
</script>
```

**Composition API:**
```vue
<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

onMounted(() => {
  console.log('mounted')
})

onBeforeUnmount(() => {
  console.log('cleanup')
})
</script>
```

#### 5. Watch 和 WatchEffect

**Options API:**
```vue
<script>
export default {
  watch: {
    count(newVal, oldVal) {
      console.log(newVal, oldVal)
    }
  }
}
</script>
```

**Composition API:**
```vue
<script setup>
import { watch } from 'vue'

watch(count, (newVal, oldVal) => {
  console.log(newVal, oldVal)
})
</script>
```

#### 6. Pinia Store 使用

**Options API:**
```vue
<script>
import { useUserStore } from '@/stores'

export default {
  setup() {
    const userStore = useUserStore()
    return { userStore }
  }
}
</script>
```

**Composition API:**
```vue
<script setup>
import { useUserStore } from '@/stores'

const userStore = useUserStore()
</script>
```

#### 7. Router 使用

**Options API:**
```vue
<script>
export default {
  methods: {
    goToPage() {
      this.$router.push('/page')
    }
  }
}
</script>
```

**Composition API:**
```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToPage = () => {
  router.push('/page')
}
</script>
```

---

## 组件迁移优先级

### 第 1 批：简单组件（无状态/少状态）

**优先级：高 | 难度：低 | 预计时间：2-3 小时**

1. ✅ **BaseSearchInput.vue** (36 行)
   - 只有 props，无状态
   - 最简单的组件

2. ✅ **StatsCard.vue** (44 行)
   - 只有 props 和 computed
   - 无复杂逻辑

3. ✅ **BasePagination.vue** (122 行)
   - props + computed + methods
   - 逻辑简单

4. ✅ **BaseTable.vue** (115 行)
   - 有 data 和 methods
   - 排序逻辑简单

5. ✅ **DeleteCustom.vue** (190 行)
   - 简单的删除逻辑

6. ✅ **EditCustom.vue** (263 行)
   - 表单编辑逻辑

### 第 2 批：中等复杂度组件

**优先级：中 | 难度：中 | 预计时间：4-5 小时**

7. ✅ **Login.vue** (194 行)
   - 表单处理
   - API 调用
   - 路由跳转

8. ✅ **CreateUser.vue** (200 行)
   - 表单验证
   - API 调用

9. ✅ **IPQuery.vue** (199 行)
   - API 调用
   - Leaflet 地图集成

10. ✅ **CreateCustom.vue** (262 行)
    - 表格操作
    - 批量选择

11. ✅ **GlobalSessionManagement.vue** (416 行)
    - 统计数据
    - 表格过滤

12. ✅ **EditUser.vue** (398 行)
    - 复杂表单
    - 确认对话框

### 第 3 批：复杂组件

**优先级：高 | 难度：高 | 预计时间：6-8 小时**

13. ✅ **Custom.vue** (397 行)
    - 复杂表格
    - 排序、分页
    - 搜索过滤

14. ✅ **CustomPerUser.vue** (430 行)
    - 类似 Custom.vue
    - 用户数据管理

15. ✅ **UserStats.vue** (443 行)
    - 统计数据处理
    - 动态表格
    - 浏览器信息解析

16. ✅ **UserManagement.vue** (471 行)
    - 用户 CRUD
    - 复杂状态管理
    - 多个 API 调用

17. ✅ **SessionManagement.vue** (509 行)
    - 会话管理
    - 统计卡片
    - 表格操作

18. ✅ **UserSessionManagement.vue** (379 行)
    - 用户会话详情
    - IP 统计

19. ✅ **UserSessions.vue** (453 行)
    - 会话列表
    - 批量操作

20. ✅ **ApiDetail.vue** (690 行) - **最大最复杂**
    - 大量数据处理
    - 复杂统计计算
    - 图表集成
    - 多个过滤器

---

## 迁移检查清单

### 每个组件迁移时检查：

- [ ] 将 `<script>` 改为 `<script setup>`
- [ ] 移除 `export default`
- [ ] 转换 `data()` 为 `ref()` 或 `reactive()`
- [ ] 转换 `methods` 为普通函数
- [ ] 转换 `computed` 为 `computed()`
- [ ] 转换生命周期钩子（mounted → onMounted）
- [ ] 转换 `props` 为 `defineProps()`
- [ ] 转换 `emits` 为 `defineEmits()`
- [ ] 移除所有 `this.` 引用
- [ ] 添加必要的 `import` 语句
- [ ] 更新 `$router` 为 `useRouter()`
- [ ] 更新 `$route` 为 `useRoute()`
- [ ] 更新 Pinia store 使用方式
- [ ] 测试组件功能
- [ ] 验证构建成功

---

## 常见陷阱和注意事项

### 1. ref vs reactive

```vue
<script setup>
import { ref, reactive } from 'vue'

// ✅ 推荐：简单值用 ref
const count = ref(0)
const name = ref('John')

// ✅ 推荐：对象用 reactive
const user = reactive({
  name: 'John',
  age: 30
})

// ❌ 避免：reactive 包装简单值
const count = reactive({ value: 0 }) // 不推荐
</script>
```

### 2. ref 的 .value

```vue
<script setup>
const count = ref(0)

// ❌ 错误：忘记 .value
console.log(count) // Ref 对象

// ✅ 正确：使用 .value
console.log(count.value) // 0

// ✅ 模板中自动解包，不需要 .value
</script>

<template>
  <div>{{ count }}</div> <!-- 正确 -->
</template>
```

### 3. 解构 props 会失去响应性

```vue
<script setup>
const props = defineProps({
  user: Object
})

// ❌ 错误：失去响应性
const { user } = props

// ✅ 正确：使用 toRefs
import { toRefs } from 'vue'
const { user } = toRefs(props)

// ✅ 或者直接使用 props.user
console.log(props.user)
</script>
```

### 4. 异步操作

```vue
<script setup>
import { ref, onMounted } from 'vue'

const data = ref(null)

// ✅ 正确：在 onMounted 中调用异步函数
onMounted(async () => {
  data.value = await fetchData()
})

// ❌ 错误：顶层 await（除非使用实验性特性）
// const data = await fetchData()
</script>
```

### 5. Element Plus 组件

```vue
<script setup>
import { ElMessage } from 'element-plus'

// ✅ 直接使用，无需 this.$message
ElMessage.success('成功')
</script>
```

---

## 迁移示例

### 示例 1：Login.vue 迁移

**迁移前（Options API）：**
```vue
<script>
import { useUserStore } from '../stores'
import { setToken } from '../utils/auth'
import { ElMessage } from 'element-plus'

export default {
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.errorMessage = ''
      this.loading = true

      try {
        const form = new URLSearchParams()
        form.append('username', this.username)
        form.append('password', this.password)

        const res = await fetch(window.WEB_BASE + '/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form,
        })

        const data = await res.json()
        setToken(data.access_token, data.refresh_token, data.expires_in)

        ElMessage.success('登錄成功')
        this.$router.replace('/')
      } catch (error) {
        this.errorMessage = '登錄失敗'
        ElMessage.error(this.errorMessage)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
```

**迁移后（Composition API）：**
```vue
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores'
import { setToken } from '../utils/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const form = new URLSearchParams()
    form.append('username', username.value)
    form.append('password', password.value)

    const res = await fetch(window.WEB_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    })

    const data = await res.json()
    setToken(data.access_token, data.refresh_token, data.expires_in)

    ElMessage.success('登錄成功')
    router.replace('/')
  } catch (error) {
    errorMessage.value = '登錄失敗'
    ElMessage.error(errorMessage.value)
  } finally {
    loading.value = false
  }
}
</script>
```

**关键变化：**
1. ✅ 移除 `export default`
2. ✅ `data()` → `ref()`
3. ✅ `methods` → 普通函数
4. ✅ `this.` → 直接访问变量（加 `.value`）
5. ✅ `this.$router` → `useRouter()`
6. ✅ 添加必要的 imports

---

## 实施时间表

### 第 1 周：准备和简单组件（第 1 批）
- **Day 1-2:** 迁移 6 个简单组件
- **Day 3:** 测试和验证

### 第 2 周：中等复杂度组件（第 2 批）
- **Day 1-3:** 迁移 6 个中等组件
- **Day 4:** 测试和验证

### 第 3 周：复杂组件（第 3 批）
- **Day 1-4:** 迁移 8 个复杂组件
- **Day 5:** 全面测试和验证

**总计：15-16 个工作日（3 周）**

---

## 验证方案

### 每个组件迁移后：

1. **功能测试**
   - 所有交互功能正常
   - 表单提交正常
   - API 调用正常
   - 路由跳转正常

2. **构建测试**
   ```bash
   npm run build
   ```

3. **开发服务器测试**
   ```bash
   npm run dev
   ```

4. **视觉回归测试**
   - 样式无变化
   - 布局无变化
   - 响应式正常

---

## 回滚计划

### Git 分支策略

```bash
# 创建功能分支
git checkout -b feature/composition-api-migration

# 每批次提交一次
git commit -m "refactor: migrate batch 1 components to Composition API"
git commit -m "refactor: migrate batch 2 components to Composition API"
git commit -m "refactor: migrate batch 3 components to Composition API"
```

### 回滚触发条件

- 构建失败
- 功能异常
- 性能下降
- 生产环境严重 bug

---

## 预期收益

### 代码质量
- **减少代码量** - 预计减少 10-15%
- **更好的类型推断** - 更少的类型错误
- **更清晰的逻辑** - 按功能组织而非选项

### 可维护性
- **更容易提取逻辑** - 通过 composables
- **更好的代码复用** - 逻辑复用更简单
- **更好的测试** - 更容易单元测试

### 开发体验
- **更好的 IDE 支持** - 自动补全更准确
- **更少的样板代码** - 写更少的代码
- **更现代的语法** - 符合 Vue 3 最佳实践

---

## 参考资源

- [Vue 3 Composition API 官方文档](https://vuejs.org/guide/extras/composition-api-faq.html)
- [script setup 语法糖](https://vuejs.org/api/sfc-script-setup.html)
- [Composition API 最佳实践](https://vuejs.org/guide/reusability/composables.html)

---

## 决策记录

### 为什么选择 `<script setup>`？

1. **更简洁** - 比 `setup()` 函数少很多样板代码
2. **更好的性能** - 编译时优化
3. **官方推荐** - Vue 3 官方推荐的写法
4. **更好的 TypeScript 支持** - 类型推断更准确

### 为什么不保留 Options API？

1. **统一代码风格** - 避免混合两种风格
2. **面向未来** - Composition API 是 Vue 3 的未来
3. **更好的逻辑复用** - 当前项目已经有重复逻辑可以提取

---

**准备好开始迁移了吗？建议从第 1 批简单组件开始！**
