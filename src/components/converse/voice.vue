<script lang='ts' setup>
import type RecordPopup from '~/components/record/popup.vue'
import { onHide, onLoad } from '@dcloudio/uni-app'
import { ref, watch } from 'vue'
import { useClassesName, useUUID } from '@/composables'
import { useGlobalStore } from '@/store'
import { checkPermission } from '@/utils/wx'

const emit = defineEmits<{
  (e: 'done', text: string, immediate?: boolean): void
}>()

const cs = useClassesName('voice')
const isRecording = ref(false)
const recordPopupFocusedButton = ref<'cancel' | 'microphone' | 'text' | null>('text')
const recordPopupRef = ref<InstanceType<typeof RecordPopup>>()
const globalStore = useGlobalStore()
const speechRecognizerManager = requirePlugin('QCloudAIVoice').realtimeRecognition()
const isConnected = ref(false)
const speechText = ref('')
const record = uni.getRecorderManager()
const voiceId = ref('')
const decibel = ref(0)
const textRecognitionVisible = ref(false)
const isTouched = ref(false)

record.onFrameRecorded((res) => {
  if (res.frameBuffer && isConnected.value) {
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
watch(() => [isRecording.value, isConnected.value], ([isRecording, isConnected]) => {
  if (!isRecording || !isConnected) {
    record.stop()
    speechRecognizerManager.stop()
  }
})
async function onTouchStart() {
  isTouched.value = false
  const status = await checkPermission('scope.record')
  if (!status) {
    uni.showToast({
      title: '请允许录音权限',
      icon: 'none',
    })
    return
  }
  if (isTouched.value) {
    return
  }
  recordPopupFocusedButton.value = 'microphone'
  isRecording.value = true
  start()
}
function onTouchEnd() {
  isTouched.value = true
  if (!isConnected.value) {
    uni.showToast({
      title: '按住时间太短',
      icon: 'none',
    })
    isRecording.value = false
    isConnected.value = false
    return
  }
  if (recordPopupFocusedButton.value === 'cancel') {
    speechText.value = ''
  }
  isRecording.value = false
  if (!isConnected.value) {
    console.log('未连接，无需停止')
    return
  }
  isConnected.value = false
}
function onTouchMove(event) {
  const touch = event.touches[0]
  const touchX = touch.clientX
  const touchY = touch.clientY

  // 获取取消按钮位置
  recordPopupRef.value?.query.select('.operate-button.cancel').boundingClientRect((cancelRect) => {
    if (cancelRect && !Array.isArray(cancelRect)) {
      const rect = cancelRect as UniApp.NodeInfo
      if (isPointInButton(touchX, touchY, rect)) {
        recordPopupFocusedButton.value = 'cancel'
        textRecognitionVisible.value = false
      }
    }
  })

  // 获取录音按钮位置
  recordPopupRef.value?.query.select('.voice-button').boundingClientRect((voiceRect) => {
    if (voiceRect && !Array.isArray(voiceRect)) {
      const rect = voiceRect as UniApp.NodeInfo
      if (isPointInButton(touchX, touchY, rect)) {
        recordPopupFocusedButton.value = 'microphone'
        textRecognitionVisible.value = false
      }
    }
  })

  // 获取转文字按钮位置（第二个operate-button）
  recordPopupRef.value?.query.select('.operate-button.text').boundingClientRect((textRect) => {
    if (textRect && !Array.isArray(textRect)) {
      const rect = textRect as UniApp.NodeInfo
      if (isPointInButton(touchX, touchY, rect)) {
        recordPopupFocusedButton.value = 'text'
        textRecognitionVisible.value = false
      }
    }
  })

  recordPopupRef.value?.query.exec()
}

// 辅助函数：检测触摸点是否在按钮区域内
function isPointInButton(x: number, y: number, buttonRect: UniApp.NodeInfo): boolean {
  const left = buttonRect.left || 0
  const right = left + (buttonRect.width || 0)
  const top = buttonRect.top || 0
  const bottom = top + (buttonRect.height || 0)

  return x >= left && x <= right && y >= top && y <= bottom
}
async function start() {
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
function onConfirm() {
  isRecording.value = false
  textRecognitionVisible.value = false
  isConnected.value = false
  emit('done', speechText.value, true)
  speechText.value = ''
}
function onCloseTextRecognition() {
  isRecording.value = false
  textRecognitionVisible.value = false
  isConnected.value = false
  speechText.value = ''
}

onLoad(async () => {
  await globalStore.generateStsTempKey()

  if (!speechRecognizerManager)
    return

  speechRecognizerManager.OnRecognitionStart = () => {
    isConnected.value = true
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
    console.log('OnRecognitionResultChange', res.result?.voice_text_str)
    if (res.result?.voice_text_str) {
      speechText.value = String(res.result?.voice_text_str || '')
    }
  }
  speechRecognizerManager.OnSentenceEnd = (res) => {
    const text = String(res.result?.voice_text_str || '')
    if (text.length > speechText.value.length) {
      speechText.value = text
    }
    console.log('OnSentenceEnd', text)
    if (recordPopupFocusedButton.value !== 'cancel') {
      emit('done', speechText.value)
    }
  }
  speechRecognizerManager.OnError = (res) => {
    console.log('OnError', res)
  }
})

onHide(() => {
  console.log('Voice onHide')
  isConnected.value = false
  speechText.value = ''
  record.stop()
  speechRecognizerManager.stop()
})
</script>

<template>
  <root-portal>
    <RecordPopup ref="recordPopupRef" v-model="isRecording" :is-connecting="isConnected" :speech-text="speechText" :decibel="decibel" :focused-button="recordPopupFocusedButton" />

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
