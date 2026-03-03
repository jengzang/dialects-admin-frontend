<template>
  <label class="base-checkbox" :class="{ 'is-disabled': disabled, 'is-checked': modelValue }">
    <input
      type="checkbox"
      class="base-checkbox-input"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange"
    />
    <span class="base-checkbox-box">
      <span v-if="modelValue" class="base-checkbox-icon">✓</span>
    </span>
    <span v-if="$slots.default || label" class="base-checkbox-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const handleChange = (event) => {
  const checked = event.target.checked;
  emit('update:modelValue', checked);
  emit('change', checked);
};
</script>

<style scoped>
.base-checkbox {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  min-height: 44px; /* Touch target for mobile */
}

.base-checkbox.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.base-checkbox-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-background-white);
  transition: all var(--transition-fast);
}

.base-checkbox:hover .base-checkbox-box {
  border-color: var(--color-primary);
}

.base-checkbox.is-checked .base-checkbox-box {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.base-checkbox-icon {
  color: white;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
}

.base-checkbox-label {
  margin-left: 8px;
  color: var(--color-text);
  font-size: 14px;
}

/* Mobile: Larger touch target */
@media (max-width: 768px) {
  .base-checkbox-box {
    width: 24px;
    height: 24px;
  }

  .base-checkbox-label {
    font-size: 16px;
  }
}
</style>
