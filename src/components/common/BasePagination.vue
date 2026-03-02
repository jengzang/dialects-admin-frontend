<template>
  <div class="pagination">
    <button
      class="pagination-btn"
      @click="goToPage(1)"
      :disabled="currentPage === 1"
    >
      首頁
    </button>

    <button
      class="pagination-btn"
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
    >
      上一頁
    </button>

    <span class="pagination-info">
      第 {{ currentPage }} / {{ totalPages }} 頁
    </span>

    <button
      class="pagination-btn"
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage >= totalPages"
    >
      下一頁
    </button>

    <button
      class="pagination-btn"
      @click="goToPage(totalPages)"
      :disabled="currentPage >= totalPages"
    >
      末頁
    </button>
  </div>
</template>

<script>
export default {
  name: 'BasePagination',
  props: {
    currentPage: {
      type: Number,
      required: true,
      default: 1
    },
    totalPages: {
      type: Number,
      required: true,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 30
    }
  },
  emits: ['page-change'],
  methods: {
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.$emit('page-change', page);
      }
    }
  }
};
</script>

<style scoped>
/* 使用全局樣式，這裡只添加組件特定樣式 */
</style>
