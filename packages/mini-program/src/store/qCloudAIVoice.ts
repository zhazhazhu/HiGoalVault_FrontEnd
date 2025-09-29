import type { Ref } from 'vue'
import type { GenerateStsTempKeyResponse } from '@/api'
import { defineStore } from 'pinia'
import { api } from '@/api'
import { useStoreRef } from '@/composables'

interface Status {
  speechRecognizerManager: QCloudAIVoiceSpeechRecognizerManager | null
  stsTempConfig: Ref<GenerateStsTempKeyResponse | null>
}

export const useQCloudAIVoiceStore = defineStore('qCloudAIVoice', {
  state: (): Status => ({
    speechRecognizerManager: null,
    stsTempConfig: useStoreRef('qCloudAIVoice', null),
  }),
  actions: {
    async generateStsTempKey() {
      if (this.stsTempConfig) {
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
    initSpeechRecognizerManager() {
      if (this.speechRecognizerManager) {
        console.log('语音识别管理器已存在')
        return
      }

      try {
        const qCloudAIVoice = requirePlugin('QCloudAIVoice')
        console.log('插件加载成功:', qCloudAIVoice)
        this.speechRecognizerManager = qCloudAIVoice.speechRecognizerManager()
        console.log('语音识别管理器创建成功:', this.speechRecognizerManager)
      }
      catch (error) {
        console.error('插件加载失败:', error)
      }
    },
  },
})
