<template>
  <div class="stats-card" :style="cardStyle">
    <div class="number" :style="{ color: color }">{{ formattedNumber }}</div>
    <div class="label">{{ label }}</div>
  </div>
</template>

<script>
export default {
  name: 'StatsCard',
  props: {
    number: {
      type: [Number, String],
      default: 0
    },
    label: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: 'var(--color-primary)'
    }
  },
  computed: {
    formattedNumber() {
      if (typeof this.number === 'number') {
        return this.number.toLocaleString();
      }
      return this.number;
    },
    cardStyle() {
      return {
        borderTop: `3px solid ${this.color}`
      };
    }
  }
};
</script>

<style scoped>
/* 使用全局 stats-card 樣式 */
</style>
