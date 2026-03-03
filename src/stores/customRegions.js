import { defineStore } from 'pinia';

export const useCustomRegionsStore = defineStore('customRegions', {
  state: () => ({
    selectedRegions: [],
    currentUsername: ''
  }),

  getters: {
    selectedCount: (state) => state.selectedRegions.length,
    hasSelected: (state) => state.selectedRegions.length > 0
  },

  actions: {
    setSelectedRegions(regions) {
      this.selectedRegions = regions;
    },

    setCurrentUsername(username) {
      this.currentUsername = username;
    },

    clearSelectedRegions() {
      this.selectedRegions = [];
    }
  }
});
