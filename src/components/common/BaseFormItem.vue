<template>
  <div class="base-form-item" :class="formItemClasses">
    <label
      v-if="label"
      class="base-form-item-label"
      :style="labelStyle"
    >
      <span v-if="required" class="base-form-item-required">*</span>
      {{ label }}
    </label>
    <div class="base-form-item-content">
      <slot></slot>
      <div v-if="error" class="base-form-item-error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
});

// Inject form context
const baseForm = inject('baseForm', {
  labelWidth: '100px',
  labelPosition: 'right',
  inline: false
});

const formItemClasses = computed(() => ({
  'is-error': !!props.error,
  'is-required': props.required,
  [`label-${baseForm.labelPosition}`]: true
}));

const labelStyle = computed(() => {
  if (baseForm.labelPosition === 'top') {
    return {};
  }
  return {
    width: baseForm.labelWidth
  };
});
</script>

<style scoped>
.base-form-item {
  margin-bottom: 20px;
}

.base-form-item.label-left,
.base-form-item.label-right {
  display: flex;
  align-items: flex-start;
}

.base-form-item.label-top {
  display: block;
}

.base-form-item-label {
  display: inline-block;
  padding: 10px 12px 10px 0;
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.5;
}

.base-form-item.label-left .base-form-item-label {
  text-align: left;
}

.base-form-item.label-right .base-form-item-label {
  text-align: right;
}

.base-form-item.label-top .base-form-item-label {
  display: block;
  padding: 0 0 8px 0;
  text-align: left;
}

.base-form-item-required {
  color: var(--color-danger);
  margin-right: 4px;
}

.base-form-item-content {
  flex: 1;
}

.base-form-item-error {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-danger);
  line-height: 1.5;
}

/* Mobile: Force vertical layout */
@media (max-width: 768px) {
  .base-form-item.label-left,
  .base-form-item.label-right {
    display: block;
  }

  .base-form-item-label {
    display: block;
    width: 100% !important;
    padding: 0 0 8px 0;
    text-align: left !important;
  }

  .base-form-item {
    margin-bottom: 16px;
  }
}
</style>
