<template>
  <form class="base-form" :class="formClasses" @submit.prevent="handleSubmit">
    <slot></slot>
  </form>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  inline: {
    type: Boolean,
    default: false
  },
  labelWidth: {
    type: String,
    default: '100px'
  },
  labelPosition: {
    type: String,
    default: 'right', // 'left', 'right', 'top'
    validator: (value) => ['left', 'right', 'top'].includes(value)
  }
});

const emit = defineEmits(['submit']);

const formClasses = computed(() => ({
  'base-form-inline': props.inline,
  [`base-form-label-${props.labelPosition}`]: true
}));

const handleSubmit = () => {
  emit('submit');
};

// Provide form context to child FormItems
import { provide } from 'vue';
provide('baseForm', {
  labelWidth: props.labelWidth,
  labelPosition: props.labelPosition,
  inline: props.inline
});
</script>

<style scoped>
.base-form {
  width: 100%;
}

.base-form-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

/* Mobile: Force vertical layout */
@media (max-width: 768px) {
  .base-form-inline {
    display: block;
  }
}
</style>
