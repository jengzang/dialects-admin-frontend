<template>
  <div class="loading-overlay">
    <div class="loading-spinner"></div>
  </div>
</template>

<script>
export default {
  name: 'BaseLoading'
};
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: all;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border-light, #e4e7ed);
  border-top-color: var(--color-primary, #409eff);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .loading-spinner {
    width: 36px;
    height: 36px;
    border-width: 3px;
  }
}
</style>
