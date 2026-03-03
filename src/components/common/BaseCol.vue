<template>
  <div :class="['base-col']" :style="colStyle">
    <slot></slot>
  </div>
</template>

<script>
import { inject, computed } from 'vue';

export default {
  name: 'BaseCol',
  props: {
    span: {
      type: Number,
      default: 24
    },
    mobile: {
      type: Number,
      default: null
    },
    tablet: {
      type: Number,
      default: null
    }
  },
  setup(props) {
    const gutter = inject('rowGutter', 0);

    const colStyle = computed(() => {
      const styles = {
        paddingLeft: `${gutter / 2}px`,
        paddingRight: `${gutter / 2}px`,
        flex: `0 0 ${(props.span / 24) * 100}%`,
        maxWidth: `${(props.span / 24) * 100}%`
      };

      // Mobile responsive
      if (props.mobile !== null) {
        styles['--mobile-width'] = `${(props.mobile / 12) * 100}%`;
      }

      // Tablet responsive
      if (props.tablet !== null) {
        styles['--tablet-width'] = `${(props.tablet / 12) * 100}%`;
      }

      return styles;
    });

    return {
      colStyle
    };
  }
};
</script>

<style scoped>
.base-col {
  box-sizing: border-box;
}

/* Mobile: Use mobile prop if provided, otherwise 100% */
@media (max-width: 480px) {
  .base-col {
    flex: 0 0 var(--mobile-width, 100%) !important;
    max-width: var(--mobile-width, 100%) !important;
  }
}

/* Tablet: Use tablet prop if provided */
@media (min-width: 481px) and (max-width: 768px) {
  .base-col {
    flex: 0 0 var(--tablet-width, 100%) !important;
    max-width: var(--tablet-width, 100%) !important;
  }
}
</style>
