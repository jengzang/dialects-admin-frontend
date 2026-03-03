<template>
  <div :class="['base-card', `shadow-${shadow}`]">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseCard',
  props: {
    shadow: {
      type: String,
      default: 'always', // 'always', 'hover', 'never'
      validator: (value) => ['always', 'hover', 'never'].includes(value)
    }
  }
};
</script>

<style scoped>
.base-card {
  background: white;
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--color-border, #e4e7ed);
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.base-card.shadow-always {
  box-shadow: var(--shadow-md, 0 2px 8px rgba(0, 0, 0, 0.1));
}

.base-card.shadow-hover {
  box-shadow: none;
}

.base-card.shadow-hover:hover {
  box-shadow: var(--shadow-md, 0 2px 8px rgba(0, 0, 0, 0.1));
}

.base-card.shadow-never {
  box-shadow: none;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border, #e4e7ed);
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.card-body {
  padding: 20px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .card-header {
    padding: 12px 16px;
    font-size: 15px;
  }

  .card-body {
    padding: 16px;
  }
}
</style>
