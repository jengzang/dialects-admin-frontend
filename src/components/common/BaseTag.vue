<template>
  <span :class="['base-tag', `base-tag--${type}`, `base-tag--${size}`]">
    <slot></slot>
  </span>
</template>

<script setup>
defineOptions({
  name: 'BaseTag'
})

defineProps({
  type: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['small', 'default', 'large'].includes(value)
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';

.base-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: $radius-sm;
  font-weight: 500;
  white-space: nowrap;
  transition: all $transition-fast;
  font-size: $font-size-xs;
  line-height: 1.5;
}

// Sizes
.base-tag--small {
  padding: 2px 8px;
  font-size: 11px;
}

.base-tag--large {
  padding: 6px 16px;
  font-size: $font-size-sm;
}

// Types
.base-tag--primary {
  background-color: rgba($color-primary, 0.1);
  color: $color-primary;
  border: 1px solid rgba($color-primary, 0.3);
}

.base-tag--success {
  background-color: rgba($color-success, 0.1);
  color: $color-success;
  border: 1px solid rgba($color-success, 0.3);
}

.base-tag--warning {
  background-color: rgba($color-warning, 0.1);
  color: $color-warning;
  border: 1px solid rgba($color-warning, 0.3);
}

.base-tag--danger {
  background-color: rgba($color-danger, 0.1);
  color: $color-danger;
  border: 1px solid rgba($color-danger, 0.3);
}

.base-tag--info {
  background-color: rgba(144, 147, 153, 0.1);
  color: #606266;
  border: 1px solid rgba(144, 147, 153, 0.3);
}
</style>
