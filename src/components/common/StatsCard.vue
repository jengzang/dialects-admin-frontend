<template>
  <div class="stats-card" :style="cardStyle">
    <div class="number" :style="{ color: color }">{{ formattedNumber }}</div>
    <div class="label">{{ label }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'StatsCard'
})

const props = defineProps({
  number: {
    type: [Number, String],
    default: 0
  },
  label: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'var(--color-primary)'
  }
})

const formattedNumber = computed(() => {
  if (typeof props.number === 'number') {
    return props.number.toLocaleString()
  }
  return props.number
})

const cardStyle = computed(() => {
  return {
    borderTop: `3px solid ${props.color}`
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
/* 使用全局 stats-card 樣式 */
</style>
