import { defineStore } from 'pinia'

interface Status {
  windowInfo: UniApp.GetWindowInfoResult | null
  hasKeyboard: boolean
}

export const useGlobalStore = defineStore('global', {
  state: (): Status => ({
    windowInfo: null,
    hasKeyboard: false,
  }),
  actions: {
    syncStatusBarHeight() {
      const windowInfo = uni.getWindowInfo()
      this.windowInfo = windowInfo
    },
    syncKeyboardHeight() {
      uni.onKeyboardHeightChange((res) => {
        console.log('onKeyboardHeightChange', res)

        this.hasKeyboard = res.height > 0
      })
    },
  },
})
