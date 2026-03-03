<template>
  <div class="base-page-header">
    <button
      v-if="showBack"
      class="base-page-header-back"
      @click="handleBack"
      type="button"
    >
      <span class="back-icon">←</span>
      <span class="back-text">返回</span>
    </button>
    <div class="base-page-header-content">
      <slot name="icon"></slot>
      <slot name="title">
        <h2 class="base-page-header-title">{{ title }}</h2>
      </slot>
    </div>
    <div v-if="$slots.extra" class="base-page-header-extra">
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['back']);

const handleBack = () => {
  emit('back');
};
</script>

<style scoped>
.base-page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-border-light);
}

.base-page-header-back {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.base-page-header-back:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.back-icon {
  font-size: 18px;
  line-height: 1;
}

.base-page-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.base-page-header-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
}

.base-page-header-extra {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Mobile: Simplified layout */
@media (max-width: 768px) {
  .base-page-header {
    padding: 12px 0;
    margin-bottom: 16px;
  }

  .base-page-header-back .back-text {
    display: none; /* Icon only on mobile */
  }

  .base-page-header-back {
    padding: 8px;
    min-width: 40px;
    justify-content: center;
  }

  .base-page-header-title {
    font-size: 18px;
  }

  .base-page-header-extra {
    flex-wrap: wrap;
  }
}
</style>
