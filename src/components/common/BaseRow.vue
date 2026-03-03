<template>
  <div :class="['base-row']" :style="rowStyle">
    <slot></slot>
  </div>
</template>

<script>
import { provide, computed } from 'vue';

export default {
  name: 'BaseRow',
  props: {
    gutter: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    // Provide gutter to child columns
    provide('rowGutter', props.gutter);

    const rowStyle = computed(() => {
      if (props.gutter) {
        return {
          marginLeft: `-${props.gutter / 2}px`,
          marginRight: `-${props.gutter / 2}px`
        };
      }
      return {};
    });

    return {
      rowStyle
    };
  }
};
</script>

<style scoped>
.base-row {
  display: flex;
  flex-wrap: wrap;
}
</style>
