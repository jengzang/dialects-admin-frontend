import { ref } from 'vue';

// Global dialog state
const dialogState = ref({
  visible: false,
  title: '',
  message: '',
  type: 'confirm', // 'confirm' or 'alert'
  confirmText: '確定',
  cancelText: '取消',
  resolve: null,
  reject: null
});

export function useDialog() {
  const showDialog = (message, title = '提示', options = {}) => {
    return new Promise((resolve, reject) => {
      dialogState.value = {
        visible: true,
        title,
        message,
        type: options.type || 'confirm',
        confirmText: options.confirmText || '確定',
        cancelText: options.cancelText || '取消',
        resolve,
        reject
      };
    });
  };

  const confirm = (message, title = '確認', options = {}) => {
    return showDialog(message, title, { ...options, type: 'confirm' });
  };

  const alert = (message, title = '提示', options = {}) => {
    return showDialog(message, title, { ...options, type: 'alert' });
  };

  const handleConfirm = () => {
    if (dialogState.value.resolve) {
      dialogState.value.resolve(true);
    }
    closeDialog();
  };

  const handleCancel = () => {
    if (dialogState.value.reject) {
      dialogState.value.reject(false);
    }
    closeDialog();
  };

  const closeDialog = () => {
    dialogState.value.visible = false;
  };

  return {
    dialogState,
    showDialog,
    confirm,
    alert,
    handleConfirm,
    handleCancel,
    closeDialog
  };
}
