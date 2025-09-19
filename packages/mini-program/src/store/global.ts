import { defineStore } from 'pinia'

interface Status {
  windowInfo: UniApp.GetWindowInfoResult | null
}

export const useGlobalStore = defineStore('global', {
  state: (): Status => ({
    windowInfo: null,
  }),
  actions: {
    syncStatusBarHeight() {
      const windowInfo = uni.getWindowInfo()
      this.windowInfo = windowInfo
    },
  },
})
