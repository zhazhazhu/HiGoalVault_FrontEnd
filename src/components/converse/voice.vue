<script lang='ts' setup>
import type RecordPopup from '~/components/record/popup.vue'
import { onLoad } from '@dcloudio/uni-app'
import { useClassesName, useUUID } from '@/composables'
import { ref } from 'vue'
import { useGlobalStore } from '@/store'

const emit = defineEmits<{
  (e: 'done', text: string, immediate?: boolean): void
}>()

const cs = useClassesName('voice')
const isRecording = ref(false)
const recordPopupFocusedButton = ref<'cancel' | 'microphone' | 'text' | null>('microphone')
const recordPopupRef = ref<InstanceType<typeof RecordPopup>>()
const globalStore = useGlobalStore()
const qCloudAIVoice = requirePlugin('QCloudAIVoice')
const speechRecognizerManager = qCloudAIVoice.realtimeRecognition()
const isConnecting = ref(false)
const speechText = ref('')
const record = uni.getRecorderManager()
const voiceId = ref('')
const decibel = ref(0)
const textRecognitionVisible = ref(false)

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
  if (recordPopupFocusedButton.value === 'cancel') {
    speechText.value = ''
  }

  if (recordPopupFocusedButton.value !== 'text') {
    recordPopupFocusedButton.value = null
  }

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
        textRecognitionVisible.value = false
      }
      else if (touchX > rightThreshold) {
        recordPopupFocusedButton.value = 'text'
        textRecognitionVisible.value = true
      }
      else {
        recordPopupFocusedButton.value = 'microphone'
        textRecognitionVisible.value = false
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
function onConfirm() {
  isRecording.value = false
  textRecognitionVisible.value = false
  isConnecting.value = false
  emit('done', speechText.value, true)
  speechText.value = ''
}
function onCloseTextRecognition() {
  isRecording.value = false
  textRecognitionVisible.value = false
  isConnecting.value = false
  speechText.value = ''
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
    console.log('OnRecognitionComplete', res)
  }
  speechRecognizerManager.OnRecognitionResultChange = (res) => {
    speechText.value = String(res.result?.voice_text_str || '')
  }
  speechRecognizerManager.OnSentenceEnd = (res) => {
    speechText.value = String(res.result?.voice_text_str || '')
  }
  speechRecognizerManager.OnError = (res) => {
    console.log('OnError', res)
  }
})
</script>

<template>
  <root-portal>
    <RecordPopup ref="recordPopupRef" v-model="isRecording" :speech-text="speechText" :decibel="decibel" :focused-button="recordPopupFocusedButton" />

    <view v-show="textRecognitionVisible" class="w-screen h-screen fixed top-0 left-0 flex flex-col items-center justify-end z-10" :class="[cs.m('text-recognition-wrapper'), cs.is('transparent', isRecording)]">
      <view class="p-8% w-full h-70% box-border flex flex-col justify-between" :style="{ paddingBottom: globalStore.keyboardHeight ? `${globalStore.keyboardHeight + 30}px` : '8%' }">
        <view class="bg-white p-20rpx rounded-20rpx max-w-500px" :class="cs.m('textarea-wrapper')">
          <wd-textarea
            v-model="speechText"
            no-border
            confirm-type="send"
            :show-confirm-bar="false"
            :auto-height="true"
            :custom-textarea-class="cs.m('textarea')"
            :custom-class="cs.m('textarea-container')"
            :placeholder-class="cs.m('textarea-placeholder')"
            @confirm="onConfirm"
          />
        </view>

        <view v-show="!isRecording" class="w-full flex justify-between mt-20rpx">
          <wd-button
            type="info"
            size="large"
            custom-style="--wot-button-large-height: 55px;--wot-button-info-bg-color: #212121;--wot-button-info-color: white;"
            @click="onCloseTextRecognition"
          >
            取消
          </wd-button>
          <wd-button type="info" size="large" custom-style="--wot-button-large-height: 55px" @click="onConfirm">
            发送
          </wd-button>
        </view>
      </view>
    </view>
  </root-portal>

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

.hi-voice--textarea-wrapper {
  position: relative;
  &::after {
    content: '';
    position: absolute;
    right: 15%;
    bottom: -5px;
    width: 14px;
    height: 14px;
    border-radius: 4px;
    background-color: white;
    transform: rotate(45deg);
  }
}

.hi-voice--text-recognition-wrapper {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.45));
  justify-content: flex-end;
  &.is-transparent {
    background: transparent;
    justify-content: center;
  }
}
</style>
