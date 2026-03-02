<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    type="text"
    :placeholder="placeholder"
    :class="inputClass"
  />
</template>

<script setup>
defineOptions({
  name: 'BaseSearchInput',
  inheritAttrs: false
})

defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '搜索...'
  },
  inputClass: {
    type: String,
    default: 'search-input'
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
/* 组件不再包含默认样式，使用父组件或全局样式 */
</style>
