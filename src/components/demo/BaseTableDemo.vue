<template>
  <div class="demo-container">
    <h1>BaseTable 功能演示</h1>

    <!-- 示例 1: 基本用法 -->
    <section>
      <h2>1. 基本用法（默认样式）</h2>
      <BaseTable
        :columns="basicColumns"
        :data="sampleData"
        @sort="handleSort"
      />
    </section>

    <!-- 示例 2: 复刻旧版样式（边框 + 居中对齐） -->
    <section>
      <h2>2. 旧版样式（边框 + 居中对齐）</h2>
      <BaseTable
        :columns="oldStyleColumns"
        :data="sampleData"
        table-width="100%"
        table-align="center"
        border
        stripe
        @sort="handleSort"
      />
    </section>

    <!-- 示例 3: 列宽控制 -->
    <section>
      <h2>3. 列宽控制</h2>
      <BaseTable
        :columns="widthColumns"
        :data="sampleData"
        border
      />
    </section>

    <!-- 示例 4: 不同对齐方式 -->
    <section>
      <h2>4. 不同对齐方式</h2>
      <BaseTable
        :columns="alignColumns"
        :data="sampleData"
        border
      />
    </section>

    <!-- 示例 5: 不同尺寸 -->
    <section>
      <h2>5. 小尺寸表格</h2>
      <BaseTable
        :columns="basicColumns"
        :data="sampleData"
        size="small"
        border
      />
    </section>

    <!-- 示例 6: 选择功能 -->
    <section>
      <h2>6. 选择功能</h2>
      <BaseTable
        :columns="basicColumns"
        :data="sampleData"
        selectable
        row-key="id"
        @selection-change="handleSelectionChange"
      />
      <p>已选择: {{ selectedCount }} 条</p>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { BaseTable } from '@/components/common';

// 示例数据
const sampleData = [
  { id: 1, username: 'user1', email: 'user1@example.com', age: 25, status: '活躍' },
  { id: 2, username: 'user2', email: 'user2@example.com', age: 30, status: '禁用' },
  { id: 3, username: 'user3', email: 'user3@example.com', age: 28, status: '活躍' },
  { id: 4, username: 'user4', email: 'user4@example.com', age: 35, status: '活躍' }
];

// 基本列配置
const basicColumns = [
  { key: 'username', label: '用戶名', sortable: true },
  { key: 'email', label: '郵箱', sortable: true },
  { key: 'age', label: '年齡', sortable: true },
  { key: 'status', label: '狀態', sortable: false }
];

// 旧版样式列配置（居中对齐）
const oldStyleColumns = [
  { key: 'username', label: '用戶名', sortable: true, align: 'center' },
  { key: 'email', label: '郵箱', sortable: true, align: 'center' },
  { key: 'age', label: '年齡', sortable: true, align: 'center' },
  { key: 'status', label: '狀態', sortable: false, align: 'center' }
];

// 列宽控制示例
const widthColumns = [
  {
    key: 'username',
    label: '用戶名',
    sortable: true,
    width: '100px',  // 固定宽度
    align: 'center'
  },
  {
    key: 'email',
    label: '郵箱',
    sortable: true,
    minWidth: '200px',  // 最小宽度
    align: 'center'
  },
  {
    key: 'age',
    label: '年齡',
    sortable: true,
    width: '80px',
    align: 'center'
  },
  {
    key: 'status',
    label: '狀態',
    sortable: false,
    flex: 1,  // flex 比例
    align: 'center'
  }
];

// 不同对齐方式示例
const alignColumns = [
  { key: 'username', label: '用戶名（左对齐）', sortable: true, align: 'left' },
  { key: 'email', label: '郵箱（居中）', sortable: true, align: 'center' },
  { key: 'age', label: '年齡（右对齐）', sortable: true, align: 'right' },
  { key: 'status', label: '狀態（居中）', sortable: false, align: 'center' }
];

const selectedCount = ref(0);

const handleSort = ({ key, order }) => {
  console.log('排序:', key, order);
};

const handleSelectionChange = (selection) => {
  selectedCount.value = selection.length;
  console.log('选择变化:', selection);
};
</script>

<style scoped lang="scss">
.demo-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  h1 {
    font-size: 32px;
    color: #2c6e49;
    text-align: center;
    margin-bottom: 40px;
  }

  section {
    margin-bottom: 60px;

    h2 {
      font-size: 24px;
      color: #2c6e49;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e4f4e7;
    }

    p {
      margin-top: 10px;
      font-size: 16px;
      color: #666;
    }
  }
}
</style>
