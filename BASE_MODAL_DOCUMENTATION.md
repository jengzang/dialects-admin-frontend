# 自定义弹窗组件 (BaseModal) 说明文档

## 设计目标

替换 Element UI 的 `el-dialog`，创建一个：
1. **移动端友好** - 优秀的移动端适配
2. **符合设计风格** - 使用项目的 Apple Green 主题
3. **轻量级** - 无第三方依赖
4. **功能完整** - 支持常见弹窗需求

## 核心特性

### 1. 移动端优化

#### 桌面端
```
┌─────────────────────────────────┐
│  居中显示，固定宽度              │
│  圆角边框，阴影效果              │
└─────────────────────────────────┘
```

#### 移动端
```
┌─────────────────────────────────┐
│  底部滑出，全宽显示              │
│  顶部圆角，底部贴边              │
│  按钮垂直排列，全宽              │
└─────────────────────────────────┘
```

**关键改进：**
- 移动端从底部滑出（类似原生 App）
- 按钮垂直排列，易于点击
- 全宽显示，充分利用屏幕空间
- 顶部圆角，视觉更友好

### 2. 响应式动画

#### 桌面端动画
- **进入：** 淡入 + 向下移动 + 缩放
- **退出：** 淡出 + 缩放

#### 移动端动画
- **进入：** 从底部滑入
- **退出：** 向底部滑出

### 3. 滚动锁定

弹窗打开时自动锁定 body 滚动：
```javascript
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
```

### 4. 键盘支持

- **ESC 键关闭** - 可配置
- **自动清理** - 组件卸载时恢复滚动

## API 文档

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | Boolean | `false` | 是否显示弹窗（v-model） |
| `title` | String | `''` | 弹窗标题 |
| `width` | String | `'600px'` | 弹窗宽度（桌面端） |
| `fullscreen` | Boolean | `false` | 是否全屏显示 |
| `showClose` | Boolean | `true` | 是否显示关闭按钮 |
| `closeOnClickOverlay` | Boolean | `true` | 点击遮罩层是否关闭 |
| `closeOnEsc` | Boolean | `true` | 按 ESC 键是否关闭 |
| `showDefaultFooter` | Boolean | `false` | 是否显示默认底部按钮 |
| `confirmText` | String | `'確認'` | 确认按钮文本 |
| `cancelText` | String | `'取消'` | 取消按钮文本 |
| `bodyClass` | String | `''` | body 自定义类名 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: boolean)` | v-model 更新事件 |
| `close` | - | 弹窗关闭时触发 |
| `confirm` | - | 点击确认按钮时触发 |
| `cancel` | - | 点击取消按钮时触发 |

### Slots

| 插槽 | 说明 |
|------|------|
| `default` | 弹窗内容 |
| `header` | 自定义头部 |
| `footer` | 自定义底部 |

## 使用示例

### 基础用法

```vue
<template>
  <button @click="showModal = true">打開彈窗</button>

  <BaseModal v-model="showModal" title="基礎彈窗">
    <p>這是彈窗內容</p>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue';
import { BaseModal } from '@/components/common';

const showModal = ref(false);
</script>
```

### 自定义底部按钮

```vue
<BaseModal v-model="showModal" title="自定義底部">
  <p>彈窗內容</p>

  <template #footer>
    <button class="btn btn-secondary" @click="showModal = false">
      取消
    </button>
    <button class="btn btn-primary" @click="handleConfirm">
      確認
    </button>
  </template>
</BaseModal>
```

### 使用默认底部按钮

```vue
<BaseModal
  v-model="showModal"
  title="默認底部"
  :show-default-footer="true"
  confirm-text="保存"
  cancel-text="放棄"
  @confirm="handleSave"
  @cancel="handleCancel"
>
  <p>彈窗內容</p>
</BaseModal>
```

### 全屏弹窗

```vue
<BaseModal
  v-model="showModal"
  title="全屏彈窗"
  :fullscreen="true"
>
  <p>全屏顯示的內容</p>
</BaseModal>
```

### 自定义宽度

```vue
<BaseModal
  v-model="showModal"
  title="自定義寬度"
  width="800px"
>
  <p>寬度為 800px 的彈窗</p>
</BaseModal>
```

### 禁用遮罩层关闭

```vue
<BaseModal
  v-model="showModal"
  title="禁用遮罩關閉"
  :close-on-click-overlay="false"
>
  <p>點擊遮罩層不會關閉</p>
</BaseModal>
```

## 样式定制

### CSS 变量

弹窗使用项目的 SCSS 变量，可以通过修改变量来定制样式：

```scss
// 颜色
$color-primary: #4CAF50;
$color-border-light: #c8e6c9;
$color-background-white: #ffffff;

// 圆角
$radius-lg: 15px;
$radius-md: 12px;

// 阴影
$shadow-xl: 0 4px 16px rgba(0, 0, 0, 0.15);

// 间距
$spacing-md: 20px;
$spacing-lg: 30px;
```

### 自定义 body 样式

```vue
<BaseModal
  v-model="showModal"
  title="自定義 Body"
  body-class="custom-body"
>
  <p>自定義樣式的內容</p>
</BaseModal>

<style>
.custom-body {
  padding: 40px;
  background: #f5f5f5;
}
</style>
```

## 响应式断点

### 平板端（<768px）
- 弹窗从底部滑出
- 最大高度 90vh
- 顶部圆角，底部贴边
- 按钮垂直排列

### 移动端（<480px）
- 减小内边距
- 缩小字体大小
- 优化触摸区域

## 与 Element UI 对比

### Element UI (el-dialog)

**优点：**
- 功能丰富
- 文档完善

**缺点：**
- ❌ 移动端适配差
- ❌ 样式定制困难
- ❌ 体积较大
- ❌ 动画不够流畅

### BaseModal

**优点：**
- ✅ 移动端优化（底部滑出）
- ✅ 符合项目设计风格
- ✅ 轻量级（无依赖）
- ✅ 流畅的动画效果
- ✅ 易于定制

**缺点：**
- 功能相对简单（但足够使用）

## 迁移指南

### 从 Element UI 迁移

#### 1. 替换组件

```vue
<!-- 旧代码 -->
<el-dialog v-model="visible" title="標題" width="600px">
  <p>內容</p>
  <template #footer>
    <el-button @click="visible = false">取消</el-button>
    <el-button type="primary" @click="confirm">確認</el-button>
  </template>
</el-dialog>

<!-- 新代码 -->
<BaseModal v-model="visible" title="標題" width="600px">
  <p>內容</p>
  <template #footer>
    <button class="btn btn-secondary" @click="visible = false">取消</button>
    <button class="btn btn-primary" @click="confirm">確認</button>
  </template>
</BaseModal>
```

#### 2. 替换消息提示

```javascript
// 旧代码
import { ElMessage, ElMessageBox } from 'element-plus';

ElMessage.success('成功');
ElMessageBox.confirm('確定嗎？', '確認');

// 新代码
import { useMessage } from '@/composables';

const { showMessage } = useMessage();
showMessage('成功', 'success');
if (confirm('確定嗎？')) {
  // 执行操作
}
```

#### 3. 替换表单元素

```vue
<!-- 旧代码 -->
<el-form>
  <el-form-item label="標籤">
    <el-input v-model="value" />
  </el-form-item>
</el-form>

<!-- 新代码 -->
<div class="flag-form">
  <div class="form-group">
    <label class="form-label">標籤</label>
    <input v-model="value" class="form-input" />
  </div>
</div>
```

## 实际应用

### SessionDetailModal

会话详情弹窗使用 BaseModal 实现：
- 支持标签页切换
- 移动端友好
- 自定义底部按钮
- 嵌套弹窗（标记可疑）

### GlobalSessionManagement

标记可疑会话弹窗：
- 表单输入
- 条件显示
- 确认/取消操作

## 性能优化

### 1. Teleport 到 body

```vue
<Teleport to="body">
  <div class="base-modal-overlay">
    <!-- 弹窗内容 -->
  </div>
</Teleport>
```

**优点：**
- 避免 z-index 冲突
- 独立于父组件的样式
- 更好的可访问性

### 2. 条件渲染

```vue
<Transition name="modal-fade">
  <div v-if="modelValue" class="base-modal-overlay">
    <Transition name="modal-slide">
      <div v-if="modelValue" class="base-modal">
        <!-- 内容 -->
      </div>
    </Transition>
  </div>
</Transition>
```

**优点：**
- 不显示时不渲染 DOM
- 减少内存占用

### 3. 自定义滚动条

```scss
.base-modal__body {
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: $color-border;
    border-radius: 4px;
  }
}
```

**优点：**
- 美观的滚动条
- 符合设计风格

## 总结

BaseModal 是一个轻量级、移动端友好、符合项目设计风格的弹窗组件，完全可以替代 Element UI 的 el-dialog。

### 关键优势
1. ✅ **移动端优化** - 底部滑出，按钮垂直排列
2. ✅ **设计一致** - 使用项目主题色和样式
3. ✅ **轻量级** - 无第三方依赖
4. ✅ **易于使用** - API 简洁，文档完善
5. ✅ **性能优秀** - Teleport + 条件渲染

### 适用场景
- ✅ 表单弹窗
- ✅ 确认对话框
- ✅ 详情展示
- ✅ 多标签页内容
- ✅ 嵌套弹窗

现在项目中的所有弹窗都使用 BaseModal，提供了统一且优秀的用户体验！
