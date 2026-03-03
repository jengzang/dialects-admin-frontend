<template>
  <div
    class="base-tooltip"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <slot></slot>
    <transition name="tooltip-fade">
      <div
        v-if="visible"
        class="base-tooltip-content"
        :class="[`placement-${placement}`]"
        :style="tooltipStyle"
      >
        {{ content }}
        <div class="base-tooltip-arrow"></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  placement: {
    type: String,
    default: 'top', // 'top', 'bottom', 'left', 'right'
    validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
  },
  trigger: {
    type: String,
    default: 'hover', // 'hover', 'click'
    validator: (value) => ['hover', 'click'].includes(value)
  }
});

const visible = ref(false);
const isMobile = ref(false);
let hideTimer = null;

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  if (hideTimer) {
    clearTimeout(hideTimer);
  }
});

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

const tooltipStyle = computed(() => {
  return {};
});

const handleMouseEnter = () => {
  if (props.trigger === 'hover' && !isMobile.value) {
    visible.value = true;
    if (hideTimer) {
      clearTimeout(hideTimer);
    }
  }
};

const handleMouseLeave = () => {
  if (props.trigger === 'hover' && !isMobile.value) {
    visible.value = false;
  }
};

const handleClick = () => {
  if (isMobile.value || props.trigger === 'click') {
    visible.value = !visible.value;

    // Auto-hide after 2s on mobile
    if (visible.value && isMobile.value) {
      hideTimer = setTimeout(() => {
        visible.value = false;
      }, 2000);
    }
  }
};
</script>

<style scoped>
.base-tooltip {
  position: relative;
  display: inline-block;
}

.base-tooltip-content {
  position: absolute;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  font-size: 12px;
  line-height: 1.5;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  z-index: var(--z-index-tooltip);
  pointer-events: none;
}

/* Placement */
.base-tooltip-content.placement-top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.base-tooltip-content.placement-bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.base-tooltip-content.placement-left {
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.base-tooltip-content.placement-right {
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

/* Arrow */
.base-tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 4px solid transparent;
}

.placement-top .base-tooltip-arrow {
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: rgba(0, 0, 0, 0.85);
}

.placement-bottom .base-tooltip-arrow {
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: rgba(0, 0, 0, 0.85);
}

.placement-left .base-tooltip-arrow {
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: rgba(0, 0, 0, 0.85);
}

.placement-right .base-tooltip-arrow {
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: rgba(0, 0, 0, 0.85);
}

/* Animation */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity var(--transition-fast);
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}

/* Mobile: Larger font */
@media (max-width: 768px) {
  .base-tooltip-content {
    font-size: 14px;
    white-space: normal;
    max-width: 200px;
  }
}
</style>
