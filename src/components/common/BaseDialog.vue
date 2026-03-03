<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="dialogState.visible" class="dialog-overlay" @click="handleBackdropClick">
        <div class="dialog-container" @click.stop>
          <div class="dialog-header">
            <h3 class="dialog-title">{{ dialogState.title }}</h3>
          </div>
          <div class="dialog-body">
            <p class="dialog-message">{{ dialogState.message }}</p>
          </div>
          <div class="dialog-footer">
            <button
              v-if="dialogState.type === 'confirm'"
              class="btn btn-secondary"
              @click="handleCancel"
            >
              {{ dialogState.cancelText }}
            </button>
            <button
              class="btn btn-primary"
              @click="handleConfirm"
            >
              {{ dialogState.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { useDialog } from '@/composables/useDialog';
import { onMounted, onUnmounted } from 'vue';

export default {
  name: 'BaseDialog',
  setup() {
    const { dialogState, handleConfirm, handleCancel, closeDialog } = useDialog();

    const handleBackdropClick = () => {
      if (dialogState.value.type === 'confirm') {
        handleCancel();
      } else {
        closeDialog();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape' && dialogState.value.visible) {
        handleBackdropClick();
      }
    };

    onMounted(() => {
      document.addEventListener('keydown', handleEscape);
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handleEscape);
    });

    return {
      dialogState,
      handleConfirm,
      handleCancel,
      handleBackdropClick
    };
  }
};
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.dialog-container {
  background: white;
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-xl, 0 8px 24px rgba(0, 0, 0, 0.2));
  max-width: 500px;
  width: 100%;
  overflow: hidden;
}

.dialog-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border, #e4e7ed);
}

.dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.dialog-body {
  padding: 24px;
}

.dialog-message {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border, #e4e7ed);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Animations */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-active .dialog-container,
.dialog-leave-active .dialog-container {
  transition: transform 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog-container {
  transform: scale(0.9);
}

.dialog-leave-to .dialog-container {
  transform: scale(0.9);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .dialog-overlay {
    padding: 10px;
  }

  .dialog-container {
    max-width: 100%;
  }

  .dialog-header {
    padding: 16px 20px;
  }

  .dialog-title {
    font-size: 16px;
  }

  .dialog-body {
    padding: 20px;
  }

  .dialog-message {
    font-size: 16px;
  }

  .dialog-footer {
    padding: 12px 20px;
    flex-direction: column-reverse;
  }

  .dialog-footer .btn {
    width: 100%;
    min-height: 44px;
  }
}
</style>

