import { createApp, h } from 'vue';
import BaseLoading from '@/components/common/BaseLoading.vue';

const loadingDirective = {
  mounted(el, binding) {
    if (binding.value) {
      appendLoading(el);
    }
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      if (binding.value) {
        appendLoading(el);
      } else {
        removeLoading(el);
      }
    }
  },
  unmounted(el) {
    removeLoading(el);
  }
};

function appendLoading(el) {
  // Set relative positioning if not already positioned
  const position = window.getComputedStyle(el).position;
  if (position === 'static') {
    el.style.position = 'relative';
  }

  // Create loading instance
  const loadingInstance = createApp({
    render() {
      return h(BaseLoading);
    }
  });

  const container = document.createElement('div');
  el.appendChild(container);
  loadingInstance.mount(container);

  // Store instance for cleanup
  el._loadingInstance = { app: loadingInstance, container };
}

function removeLoading(el) {
  if (el._loadingInstance) {
    el._loadingInstance.app.unmount();
    el._loadingInstance.container.remove();
    el._loadingInstance = null;
  }
}

export default loadingDirective;
