<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="base-modal-overlay"
        @click="handleOverlayClick"
      >
        <Transition name="modal-slide">
          <div
            v-if="modelValue"
            class="base-modal"
            :class="modalClasses"
            @click.stop
          >
            <!-- Header -->
            <div class="base-modal__header">
              <slot name="header">
                <h3 class="base-modal__title">{{ title }}</h3>
              </slot>
              <button
                v-if="showClose"
                class="base-modal__close"
                @click="handleClose"
                aria-label="關閉"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="base-modal__body" :class="bodyClass">
              <slot></slot>
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer || showDefaultFooter" class="base-modal__footer">
              <slot name="footer">
                <button class="btn btn-secondary" @click="handleClose">
                  {{ cancelText }}
                </button>
                <button class="btn btn-primary" @click="handleConfirm">
                  {{ confirmText }}
                </button>
              </slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '600px'
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  showClose: {
    type: Boolean,
    default: true
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  },
  closeOnEsc: {
    type: Boolean,
    default: true
  },
  showDefaultFooter: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: '確認'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  bodyClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'close', 'confirm', 'cancel']);

const modalClasses = computed(() => ({
  'base-modal--fullscreen': props.fullscreen
}));

const handleClose = () => {
  emit('update:modelValue', false);
  emit('close');
  emit('cancel');
};

const handleConfirm = () => {
  emit('confirm');
};

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    handleClose();
  }
};

const handleEscKey = (e) => {
  if (e.key === 'Escape' && props.closeOnEsc && props.modelValue) {
    handleClose();
  }
};

// Lock body scroll when modal is open
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  document.addEventListener('keydown', handleEscKey);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey);
  document.body.style.overflow = '';
});
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

// Overlay
.base-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: $spacing-md;
  overflow-y: auto;
}

// Modal
.base-modal {
  background: $color-background-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-xl;
  width: 100%;
  max-width: v-bind(width);
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  position: relative;
}

.base-modal--fullscreen {
  max-width: none;
  max-height: none;
  height: calc(100vh - 40px);
  border-radius: $radius-md;
}

// Header
.base-modal__header {
  padding: $spacing-lg $spacing-lg $spacing-md;
  border-bottom: 1px solid $color-border-light;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.base-modal__title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: 600;
  color: $color-text-primary;
}

.base-modal__close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: $color-text-secondary;
  cursor: pointer;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-fast;
  flex-shrink: 0;

  &:hover {
    background: $color-background-light;
    color: $color-text-primary;
  }

  &:active {
    transform: scale(0.95);
  }
}

// Body
.base-modal__body {
  padding: $spacing-lg;
  overflow-y: auto;
  flex: 1;
  min-height: 0;

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: $color-background-light;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: $color-border;
    border-radius: 4px;

    &:hover {
      background: $color-border-dark;
    }
  }
}

// Footer
.base-modal__footer {
  padding: $spacing-md $spacing-lg $spacing-lg;
  border-top: 1px solid $color-border-light;
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  flex-shrink: 0;
}

// Animations
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity $transition-normal;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active {
  transition: all $transition-normal;
}

.modal-slide-leave-active {
  transition: all 0.2s ease;
}

.modal-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.modal-slide-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

// Mobile responsive
@include respond-to(tablet) {
  .base-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .base-modal {
    max-width: none;
    max-height: 90vh;
    border-radius: $radius-lg $radius-lg 0 0;
    margin: 0;
  }

  .base-modal--fullscreen {
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }

  .base-modal__header {
    padding: $spacing-md;
  }

  .base-modal__body {
    padding: $spacing-md;
  }

  .base-modal__footer {
    padding: $spacing-md;
    flex-wrap: wrap;

    .btn {
      flex: 1;
      min-width: calc(50% - 4px); // 一行最多2个按钮
    }
  }

  // Mobile slide up animation
  .modal-slide-enter-from {
    transform: translateY(100%);
  }

  .modal-slide-leave-to {
    transform: translateY(100%);
  }
}

@include respond-to(mobile) {
  .base-modal__header {
    padding: $spacing-sm $spacing-md;
  }

  .base-modal__title {
    font-size: $font-size-md;
  }

  .base-modal__body {
    padding: $spacing-sm $spacing-md;
  }

  .base-modal__footer {
    padding: $spacing-sm $spacing-md;
  }
}
</style>
