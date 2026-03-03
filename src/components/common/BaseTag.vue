<template>
  <span :class="['base-tag', `tag-${type}`, `tag-${size}`]">
    <slot></slot>
  </span>
</template>

<script>
export default {
  name: 'BaseTag',
  props: {
    type: {
      type: String,
      default: 'info', // 'success', 'warning', 'danger', 'info'
      validator: (value) => ['success', 'warning', 'danger', 'info'].includes(value)
    },
    size: {
      type: String,
      default: 'default', // 'small', 'default'
      validator: (value) => ['small', 'default'].includes(value)
    }
  }
};
</script>

<style scoped>
.base-tag {
  display: inline-block;
  padding: 4px 10px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: var(--radius-sm, 4px);
  white-space: nowrap;
  font-weight: 500;
}

.tag-small {
  padding: 2px 8px;
  font-size: 11px;
}

.tag-success {
  background-color: #f0f9ff;
  color: var(--color-success, #67c23a);
  border: 1px solid #b3e19d;
}

.tag-warning {
  background-color: #fdf6ec;
  color: var(--color-warning, #e6a23c);
  border: 1px solid #f5dab1;
}

.tag-danger {
  background-color: #fef0f0;
  color: var(--color-danger, #f56c6c);
  border: 1px solid #fbc4c4;
}

.tag-info {
  background-color: #f4f4f5;
  color: #909399;
  border: 1px solid #d3d4d6;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .base-tag {
    font-size: 13px;
    padding: 5px 11px;
  }

  .tag-small {
    font-size: 12px;
    padding: 3px 9px;
  }
}
</style>
