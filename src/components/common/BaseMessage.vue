<template>
  <Teleport to="body">
    <div class="message-container">
      <TransitionGroup name="message">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message', `message-${message.type}`]"
          @click="removeMessage(message.id)"
        >
          <span class="message-icon">{{ getIcon(message.type) }}</span>
          <span class="message-content">{{ message.content }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script>
import { useMessage } from '@/composables/useMessage';

export default {
  name: 'BaseMessage',
  setup() {
    const { messages, removeMessage } = useMessage();

    const getIcon = (type) => {
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };
      return icons[type] || icons.info;
    };

    return {
      messages,
      removeMessage,
      getIcon
    };
  }
};
</script>

<style scoped>
.message-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: var(--radius-md, 8px);
  background: white;
  box-shadow: var(--shadow-lg, 0 4px 12px rgba(0, 0, 0, 0.15));
  min-width: 300px;
  max-width: 400px;
  pointer-events: auto;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.5;
}

.message-icon {
  font-size: 18px;
  font-weight: bold;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  word-break: break-word;
}

/* Message types */
.message-success {
  border-left: 4px solid var(--color-success, #67c23a);
}

.message-success .message-icon {
  color: var(--color-success, #67c23a);
}

.message-error {
  border-left: 4px solid var(--color-danger, #f56c6c);
}

.message-error .message-icon {
  color: var(--color-danger, #f56c6c);
}

.message-warning {
  border-left: 4px solid var(--color-warning, #e6a23c);
}

.message-warning .message-icon {
  color: var(--color-warning, #e6a23c);
}

.message-info {
  border-left: 4px solid var(--color-primary, #409eff);
}

.message-info .message-icon {
  color: var(--color-primary, #409eff);
}

/* Animations */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.message-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .message-container {
    top: 10px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: calc(100% - 20px);
    max-width: 400px;
  }

  .message {
    min-width: auto;
    width: 100%;
    font-size: 16px;
  }

  .message-enter-from {
    transform: translateY(-100%);
  }

  .message-leave-to {
    transform: translateY(-100%);
  }
}
</style>
