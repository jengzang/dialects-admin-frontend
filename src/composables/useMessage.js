import { ref } from 'vue';

// Global message state
const messages = ref([]);
let messageId = 0;

export function useMessage() {
  const showMessage = (content, type = 'info', duration = 3000) => {
    const id = messageId++;
    const message = {
      id,
      content,
      type, // 'success', 'error', 'warning', 'info'
      visible: true
    };

    messages.value.push(message);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        removeMessage(id);
      }, duration);
    }

    return id;
  };

  const removeMessage = (id) => {
    const index = messages.value.findIndex(msg => msg.id === id);
    if (index > -1) {
      messages.value.splice(index, 1);
    }
  };

  // Convenience methods matching ElMessage API
  const success = (content, duration) => showMessage(content, 'success', duration);
  const error = (content, duration) => showMessage(content, 'error', duration);
  const warning = (content, duration) => showMessage(content, 'warning', duration);
  const info = (content, duration) => showMessage(content, 'info', duration);

  return {
    messages,
    showMessage,
    removeMessage,
    success,
    error,
    warning,
    info
  };
}
