import type { Ref } from 'vue'
import type { GenerateStsTempKeyResponse } from '@/api'
import { defineStore } from 'pinia'
import { api } from '@/api'
import { useStoreRef } from '@/composables'
import { isTokenExpired } from '@/utils'

interface Status {
  windowInfo: UniApp.GetWindowInfoResult | null
  hasKeyboard: boolean
  keyboardHeight: number
  stsTempConfig: Ref<GenerateStsTempKeyResponse | null>
}

export const useGlobalStore = defineStore('global', {
  state: (): Status => ({
    windowInfo: null,
    hasKeyboard: false,
    keyboardHeight: 0,
    stsTempConfig: useStoreRef('Q_CLOUD_AI_VOICE', null),
  }),
  actions: {
    syncStatusBarHeight() {
      const windowInfo = uni.getWindowInfo()
      this.windowInfo = windowInfo
    },
    syncKeyboardHeight() {
      uni.onKeyboardHeightChange((res) => {
        this.keyboardHeight = res.height
        this.hasKeyboard = res.height > 0
      })
    },
    async generateStsTempKey() {
      const isExpired = isTokenExpired(this.stsTempConfig?.expiredTime, 30 * 60)
      if (isExpired) {
        console.log('STS临时密钥已过期:', this.stsTempConfig)
      }
      else if (this.stsTempConfig && !isExpired) {
        console.log('STS临时密钥已存在:', this.stsTempConfig)
        return
      }

      console.log('开始获取STS临时密钥...')
      const res = await api.generateStsTempKey()
      console.log('STS临时密钥响应:', res)
      if (res.code === 200) {
        this.stsTempConfig = res.result
        console.log('STS临时密钥获取成功:', this.stsTempConfig)
      }
      else {
        console.error('STS临时密钥获取失败:', res)
      }
    },
  },
})
