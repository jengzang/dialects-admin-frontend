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

/* Responsive breakpoints */
@media (max-width: 480px) {
  .base-col {
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .base-col[data-tablet] {
    flex: 0 0 var(--tablet-width) !important;
    max-width: var(--tablet-width) !important;
  }
}
</style>
