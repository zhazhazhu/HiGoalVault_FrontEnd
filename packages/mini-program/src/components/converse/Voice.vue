<script lang='ts' setup>
import { onLoad } from '@dcloudio/uni-app'
import { useClassesName } from '@higoal/hooks'
import { ref } from 'vue'
import { useGlobalStore } from '@/store'
import RecordPopup from '~/components/record/popup.vue'

const cs = useClassesName('voice')
const isRecording = ref(false)
const recordPopupFocusedButton = ref<'cancel' | 'microphone' | 'text' | null>(null)
const recordPopupRef = ref<InstanceType<typeof RecordPopup>>()
const globalStore = useGlobalStore()
const qCloudAIVoice = requirePlugin('QCloudAIVoice')
const speechRecognizerManager = qCloudAIVoice.speechRecognizerManager()
const isConnecting = ref(false)
const speechText = ref('')

function onTouchStart() {
  recordPopupFocusedButton.value = 'microphone'
  isRecording.value = true
  start()
}

function onTouchEnd() {
  recordPopupFocusedButton.value = null
  isRecording.value = false

  stop()
}
function onTouchMove(event) {
  const touch = event.touches[0]

  // 使用小程序的方式获取按钮组元素信息
  recordPopupRef.value?.recordContainer.boundingClientRect((data) => {
    if (data && !Array.isArray(data)) {
      const buttonGroupRect = data as UniApp.NodeInfo
      const centerX = (buttonGroupRect.left || 0) + (buttonGroupRect.width || 0) / 2
      const touchX = touch.clientX

      // 根据触摸位置判断聚焦哪个按钮
      const leftThreshold = centerX - 50 // 左侧阈值
      const rightThreshold = centerX + 50 // 右侧阈值

      if (touchX < leftThreshold) {
        recordPopupFocusedButton.value = 'cancel'
      }
      else if (touchX > rightThreshold) {
        recordPopupFocusedButton.value = 'text'
      }
      else {
        recordPopupFocusedButton.value = 'microphone'
      }
    }
  }).exec()
}
function start() {
  const config: QCloudAIVoiceSpeechRecognizerManagerStartParams = {
    secretkey: globalStore.stsTempConfig?.tmpSecretKey || '',
    secretid: globalStore.stsTempConfig?.tmpSecretId || '',
    appid: 1308154027,
    token: globalStore.stsTempConfig?.token || '',
    engine_model_type: '16k_zh',
    voice_format: 1,
    frameSize: 20,
    duration: 60 * 1000 * 3,
  }
  speechRecognizerManager.start(config)
}
function stop() {
  if (!isConnecting.value) {
    console.log('未连接，无需停止')
    return
  }
  speechRecognizerManager.stop()
  isConnecting.value = false
}

onLoad(async () => {
  await globalStore.generateStsTempKey()

  if (!speechRecognizerManager)
    return

  speechRecognizerManager.OnRecognitionStart = (res) => {
    isConnecting.value = true
    console.log('OnRecognitionComplete', res)
  }
  speechRecognizerManager.OnRecognitionComplete = (res) => {
    console.log('OnRecognitionComplete', res)
    console.log('识别结果', speechText.value)
  }
  speechRecognizerManager.OnRecognitionResultChange = (res) => {
    console.log('OnRecognitionResultChange', res)
    speechText.value = res.result
  }
  speechRecognizerManager.OnSentenceEnd = (res) => {
    console.log('OnSentenceEnd', res)
  }
  speechRecognizerManager.OnError = (res) => {
    console.log('OnError', res)
  }
  speechRecognizerManager.OnRecorderStop = (res) => {
    console.log('OnRecorderStop', res)
  }
})
</script>

<template>
  <RecordPopup ref="recordPopupRef" v-model="isRecording" :speech-text="speechText" :focused-button="recordPopupFocusedButton" />

  <view :class="cs.m('wrapper')" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
    按住 说话
  </view>
</template>

<style lang='scss' scoped>
.hi-voice--wrapper {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  line-height: 36px;
}
</style>
