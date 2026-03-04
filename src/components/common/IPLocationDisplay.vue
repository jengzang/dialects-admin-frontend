<template>
  <span class="ip-location-display">
    <span class="ip-address" :class="{ 'monospace': monospace }">{{ ip }}</span>
    <span v-if="location" class="location-badge">
      <span class="location-icon">📍</span>
      <span class="location-text">{{ location }}</span>
    </span>
    <span v-else-if="showUnknown" class="location-badge unknown">
      <span class="location-text">未知</span>
    </span>
  </span>
</template>

<script>
export default {
  name: 'IPLocationDisplay',
  props: {
    ip: {
      type: String,
      required: true
    },
    location: {
      type: String,
      default: null
    },
    showUnknown: {
      type: Boolean,
      default: true
    },
    monospace: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style scoped>
.ip-location-display {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ip-address {
  color: var(--color-text-primary, #333);
}

.ip-address.monospace {
  font-family: 'Courier New', Courier, monospace;
}

.location-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background-color: var(--color-primary-light, #e8f5e9);
  color: var(--color-primary, #4CAF50);
  border-radius: var(--radius-sm, 4px);
  font-size: 12px;
}

.location-badge.unknown {
  background-color: #f5f5f5;
  color: #999;
}

.location-icon {
  font-size: 10px;
}

.location-text {
  font-weight: 500;
}
</style>
