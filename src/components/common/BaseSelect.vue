<template>
  <div class="base-select" :class="{ 'is-disabled': disabled }">
    <!-- Mobile: Native select -->
    <select
      v-if="isMobile"
      :value="modelValue"
      @change="handleNativeChange"
      :disabled="disabled"
      class="base-select-native"
    >
      <option value="" v-if="placeholder">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- Desktop: Custom dropdown -->
    <div v-else class="base-select-custom">
      <div
        class="base-select-trigger"
        @click="toggleDropdown"
        :class="{ 'is-open': isOpen }"
      >
        <span class="base-select-value">
          {{ selectedLabel || placeholder }}
        </span>
        <span class="base-select-arrow">▼</span>
        <span
          v-if="clearable && modelValue"
          class="base-select-clear"
          @click.stop="handleClear"
        >
          ✕
        </span>
      </div>

      <!-- Dropdown menu -->
      <transition name="dropdown">
        <div v-if="isOpen" class="base-select-dropdown">
          <!-- Search input -->
          <input
            v-if="filterable"
            v-model="searchQuery"
            type="text"
            class="base-select-search"
            placeholder="搜索..."
            @click.stop
          />

          <!-- Options list -->
          <div class="base-select-options">
            <div
              v-for="option in filteredOptions"
              :key="option.value"
              class="base-select-option"
              :class="{ 'is-selected': option.value === modelValue }"
              @click="handleSelect(option.value)"
            >
              {{ option.label }}
            </div>
            <div v-if="filteredOptions.length === 0" class="base-select-empty">
              無匹配選項
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true,
    // Format: [{ label: 'Label', value: 'value' }]
  },
  placeholder: {
    type: String,
    default: '請選擇'
  },
  clearable: {
    type: Boolean,
    default: false
  },
  filterable: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const searchQuery = ref('');
const isMobile = ref(false);

// Check if mobile on mount
onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  document.removeEventListener('click', handleClickOutside);
});

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue);
  return selected ? selected.label : '';
});

const filteredOptions = computed(() => {
  if (!props.filterable || !searchQuery.value) {
    return props.options;
  }
  const query = searchQuery.value.toLowerCase();
  return props.options.filter(opt =>
    opt.label.toLowerCase().includes(query)
  );
});

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
    if (!isOpen.value) {
      searchQuery.value = '';
    }
  }
};

const handleSelect = (value) => {
  emit('update:modelValue', value);
  emit('change', value);
  isOpen.value = false;
  searchQuery.value = '';
};

const handleClear = () => {
  emit('update:modelValue', '');
  emit('change', '');
  isOpen.value = false;
};

const handleNativeChange = (event) => {
  const value = event.target.value;
  emit('update:modelValue', value);
  emit('change', value);
};

const handleClickOutside = (event) => {
  if (!event.target.closest('.base-select-custom')) {
    isOpen.value = false;
    searchQuery.value = '';
  }
};
</script>

<style scoped>
.base-select {
  position: relative;
  width: 100%;
}

.base-select.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Native select (mobile) */
.base-select-native {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  font-size: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-background-white);
  color: var(--color-text);
  cursor: pointer;
}

.base-select-native:disabled {
  cursor: not-allowed;
}

/* Custom select (desktop) */
.base-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-background-white);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.base-select-trigger:hover {
  border-color: var(--color-primary);
}

.base-select-trigger.is-open {
  border-color: var(--color-primary);
}

.base-select-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text);
}

.base-select-value:empty::before {
  content: attr(placeholder);
  color: var(--color-text-secondary);
}

.base-select-arrow {
  margin-left: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
  transition: transform var(--transition-fast);
}

.base-select-trigger.is-open .base-select-arrow {
  transform: rotate(180deg);
}

.base-select-clear {
  margin-left: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.base-select-clear:hover {
  color: var(--color-danger);
}

/* Dropdown */
.base-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 300px;
  background-color: var(--color-background-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  z-index: var(--z-index-dropdown);
  overflow: hidden;
}

.base-select-search {
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid var(--color-border-light);
  font-size: 14px;
  outline: none;
}

.base-select-options {
  max-height: 250px;
  overflow-y: auto;
}

.base-select-option {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.base-select-option:hover {
  background-color: var(--color-background);
}

.base-select-option.is-selected {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 500;
}

.base-select-empty {
  padding: 20px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
