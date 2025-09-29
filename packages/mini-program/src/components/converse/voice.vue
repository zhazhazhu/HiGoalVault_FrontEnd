<script lang='ts' setup>
import type RecordPopup from '~/components/record/popup.vue'
import { onLoad } from '@dcloudio/uni-app'
import { useClassesName, useUUID } from '@higoal/hooks'
import { ref } from 'vue'
import { useGlobalStore } from '@/store'

const emit = defineEmits<{
  (e: 'done', text: string): void
}>()

const cs = useClassesName('voice')
const isRecording = ref(false)
const recordPopupFocusedButton = ref<'cancel' | 'microphone' | 'text' | null>(null)
const recordPopupRef = ref<InstanceType<typeof RecordPopup>>()
const globalStore = useGlobalStore()
const qCloudAIVoice = requirePlugin('QCloudAIVoice')
const speechRecognizerManager = qCloudAIVoice.realtimeRecognition()
const isConnecting = ref(false)
const speechText = ref('')
const record = uni.getRecorderManager()
const voiceId = ref('')
const decibel = ref(0)

record.onFrameRecorded((res) => {
  if (res.frameBuffer && isConnecting.value) {
    speechRecognizerManager.write(res.frameBuffer)
    const audioData = new Int16Array(res.frameBuffer)

    let sum = 0
    for (let i = 0; i < audioData.length; i++) {
      const normalizedValue = audioData[i] / 32768
      sum += normalizedValue * normalizedValue // 平方和
    }
    const rms = Math.sqrt(sum / audioData.length)
    const db = 20 * Math.log10(Math.max(rms, 0.00001))
    const minDb = -60 // 假设-60dB为最低音量
    const maxDb = 0 // 0dB为最高音量
    let mappedAmplitude = (db - minDb) / (maxDb - minDb) * 60 // 映射到0-60的振幅
    mappedAmplitude = Math.max(0, mappedAmplitude) // 确保振幅为正数
    decibel.value = mappedAmplitude
  }
})

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
    frameSize: 20, // 20kb
    duration: 60 * 1000 * 3, // 最长3分钟
  }
  voiceId.value = useUUID(32)
  speechRecognizerManager.start(config, voiceId.value)
}
function stop() {
  if (!isConnecting.value) {
    console.log('未连接，无需停止')
    return
  }
  speechRecognizerManager.stop()
  record.stop()
  isConnecting.value = false
  emit('done', speechText.value)
}

onLoad(async () => {
  await globalStore.generateStsTempKey()

  if (!speechRecognizerManager)
    return

  speechRecognizerManager.OnRecognitionStart = () => {
    isConnecting.value = true
    record.start({
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 32000,
      format: 'pcm',
      frameSize: 20, // 20kb
      duration: 60 * 1000 * 3, // 最长3分钟
    })
  }
  speechRecognizerManager.OnRecognitionComplete = (res) => {
    speechText.value = String(res.result.voice_text_str)
  }
  speechRecognizerManager.OnRecognitionResultChange = (res) => {
    speechText.value = String(res.result.voice_text_str)
  }
  speechRecognizerManager.OnSentenceEnd = (res) => {
    speechText.value = String(res.result.voice_text_str)
  }
  speechRecognizerManager.OnError = (res) => {
    console.log('OnError', res)
  }
})
</script>

<template>
  <RecordPopup ref="recordPopupRef" v-model="isRecording" :speech-text="speechText" :decibel="decibel" :focused-button="recordPopupFocusedButton" />

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
