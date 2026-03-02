<template>
  <div :class="containerClass">
    <button
      v-if="showFirstLast"
      :class="buttonClass"
      @click="goToPage(1)"
      :disabled="currentPage === 1"
    >
      {{ firstText }}
    </button>

    <button
      :class="buttonClass"
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
    >
      {{ prevText }}
    </button>

    <span :class="infoClass">
      {{ infoText }}
    </span>

    <button
      :class="buttonClass"
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage >= totalPages"
    >
      {{ nextText }}
    </button>

    <button
      v-if="showFirstLast"
      :class="buttonClass"
      @click="goToPage(totalPages)"
      :disabled="currentPage >= totalPages"
    >
      {{ lastText }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'BasePagination'
})

const props = defineProps({
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
  },
  // 样式定制
  containerClass: {
    type: String,
    default: 'pagination'
  },
  buttonClass: {
    type: String,
    default: 'pagination-btn'
  },
  infoClass: {
    type: String,
    default: 'pagination-info'
  },
  // 文本定制
  showFirstLast: {
    type: Boolean,
    default: true
  },
  firstText: {
    type: String,
    default: '首頁'
  },
  prevText: {
    type: String,
    default: '上一頁'
  },
  nextText: {
    type: String,
    default: '下一頁'
  },
  lastText: {
    type: String,
    default: '末頁'
  },
  infoFormat: {
    type: String,
    default: 'default' // 'default' 或 'simple'
  }
})

const emit = defineEmits(['page-change'])

const infoText = computed(() => {
  if (props.infoFormat === 'simple') {
    return `頁面 ${props.currentPage} / ${props.totalPages}`
  }
  return `第 ${props.currentPage} / ${props.totalPages} 頁`
})

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
/* 组件不再包含默认样式，使用父组件或全局样式 */
</style>
