<template>
  <div class="base-input-wrapper">
    <input
      :class="['base-input', inputClass, { 'has-prefix': $slots.prefix, 'has-suffix': $slots.suffix || clearable }]"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <span v-if="$slots.prefix" class="input-prefix">
      <slot name="prefix"></slot>
    </span>
    <span v-if="clearable && modelValue && !disabled" class="input-suffix input-clear" @click="handleClear">
      ✕
    </span>
    <span v-else-if="$slots.suffix" class="input-suffix">
      <slot name="suffix"></slot>
    </span>
  </div>
</template>

<script>
export default {
  name: 'BaseInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    inputClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'focus', 'blur', 'clear'],
  methods: {
    handleInput(e) {
      this.$emit('update:modelValue', e.target.value);
    },
    handleFocus(e) {
      this.$emit('focus', e);
    },
    handleBlur(e) {
      this.$emit('blur', e);
    },
    handleClear() {
      this.$emit('update:modelValue', '');
      this.$emit('clear');
    }
  }
};
</script>

<style scoped>
.base-input-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.base-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #606266;
  background-color: #fff;
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-sm, 4px);
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.base-input:hover {
  border-color: var(--color-border-hover, #c0c4cc);
}

.base-input:focus {
  outline: none;
  border-color: var(--color-primary, #409eff);
}

.base-input:disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}

.base-input.has-prefix {
  padding-left: 36px;
}

.base-input.has-suffix {
  padding-right: 36px;
}

.input-prefix,
.input-suffix {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
}

.input-prefix {
  left: 12px;
}

.input-suffix {
  right: 12px;
}

.input-clear {
  cursor: pointer;
  color: #c0c4cc;
  transition: color 0.2s;
}

.input-clear:hover {
  color: #909399;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .base-input {
    font-size: 16px; /* Prevent iOS zoom */
    padding: 10px 14px;
  }

  .base-input.has-prefix {
    padding-left: 40px;
  }

  .base-input.has-suffix {
    padding-right: 40px;
  }
}
</style>

