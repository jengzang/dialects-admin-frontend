<template>
  <div :class="['base-card', shadowClass]">
    <slot></slot>
  </div>
</template>

<script setup>
defineOptions({
  name: 'BaseCard'
})

const props = defineProps({
  shadow: {
    type: String,
    default: 'always',
    validator: (value) => ['always', 'hover', 'never'].includes(value)
  }
})

const shadowClass = computed(() => {
  return `base-card--shadow-${props.shadow}`
})
</script>

<script>
import { computed } from 'vue'
export default {
  name: 'BaseCard'
}
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';

.base-card {
  background: white;
  border-radius: $radius-lg;
  padding: 20px;
  transition: all $transition-fast;
}

.base-card--shadow-always {
  box-shadow: $shadow-sm;
}

.base-card--shadow-hover {
  box-shadow: $shadow-sm;
  
  &:hover {
    box-shadow: $shadow-md;
  }
}

.base-card--shadow-never {
  box-shadow: none;
  border: 1px solid $color-border-light;
}
</style>
