<template>
  <div class="search-container">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      :placeholder="placeholder"
      class="search-input"
    />
  </div>
</template>

<script>
export default {
  name: 'BaseSearchInput',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '搜索...'
    }
  },
  emits: ['update:modelValue']
};
</script>

<style scoped>
.search-container {
  display: inline-block;
}
</style>
