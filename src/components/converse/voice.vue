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
const recordPopupFocusedButton = ref<'cancel' | 'microphone' | 'text' | null>(null)
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
const isFocus = ref(false)

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

watch(recordPopupFocusedButton, (val, oldVal) => {
  if (val !== oldVal) {
    uni.vibrateShort()
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

  if (!recordPopupRef.value?.query)
    return

  const query = recordPopupRef.value.query

  // 批量获取所有按钮位置
  query
    .select('.operate-button.cancel')
    .boundingClientRect()
    .select('.voice-button')
    .boundingClientRect()
    .select('.operate-button.text')
    .boundingClientRect()
    .exec((res) => {
      if (!res || res.length < 3)
        return

      const [cancelRect, voiceRect, textRect] = res

      // 检查取消按钮
      if (cancelRect && isPointInButton(touchX, touchY, cancelRect as UniApp.NodeInfo)) {
        recordPopupFocusedButton.value = 'cancel'
        textRecognitionVisible.value = false
        return
      }

      // 检查录音按钮
      if (voiceRect && isPointInButton(touchX, touchY, voiceRect as UniApp.NodeInfo)) {
        recordPopupFocusedButton.value = 'microphone'
        textRecognitionVisible.value = false
        return
      }

      // 检查转文字按钮
      if (textRect && isPointInButton(touchX, touchY, textRect as UniApp.NodeInfo)) {
        recordPopupFocusedButton.value = 'text'
        textRecognitionVisible.value = true
        return
      }

      // 如果没有触摸到任何按钮，保持当前状态或设置为默认状态
      if (recordPopupFocusedButton.value !== 'microphone') {
        recordPopupFocusedButton.value = 'microphone'
        textRecognitionVisible.value = false
      }
    })
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
  await globalStore.generateStsTempKey()

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
    <RecordPopup
      ref="recordPopupRef"
      v-model="isRecording"
      :text="speechText"
      :is-connecting="isConnected"
      :decibel="decibel"
      :focused-button="recordPopupFocusedButton"
    />

    <view v-show="!isRecording && textRecognitionVisible" class="fixed top-0 left-0 w-screen h-screen z-9999">
      <view class="w-screen h-screen voice-popup-wrapper" />

      <view :class="[cs.m('text-recognition-wrapper')]">
        <view class="w-full h-70% box-border flex flex-col items-center justify-between" :style="{ paddingBottom: globalStore.keyboardHeight ? `${globalStore.keyboardHeight + 30}px` : '8%' }">
          <view :class="cs.m('textarea-wrapper')">
            <wd-textarea
              v-model="speechText"
              no-border
              auto-height
              confirm-type="send"
              :focus="isFocus"
              :show-confirm-bar="false"
              :adjust-position="false"
              :custom-textarea-class="cs.m('textarea')"
              :custom-class="cs.m('textarea-container')"
              :placeholder-class="cs.m('textarea-placeholder')"
              @focus="isFocus = true"
              @blur="isFocus = false"
              @confirm="onConfirm"
            />
          </view>

          <view class="w-85% flex justify-between mt-20rpx">
            <view class="operate-button" @click="onCloseTextRecognition">
              <view class="message-return-icon size-24px" />
              <view>
                取消
              </view>
            </view>
            <view class="operate-button" @click="onConfirm">
              <view class="message-check-icon size-24px" />
              <view>
                发送
              </view>
            </view>
          </view>
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
  transform: translateX(15px);
}

.voice-popup-wrapper {
  background: linear-gradient(0deg, #2f66fe 0%, #f2f2f2 40%, #f2f2f2 100%);
}

.hi-record--container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

.hi-voice--textarea-wrapper {
  width: 90vw;
  background-color: var(--hi-primary-color);
  padding: 6px 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-bottom: 30px;
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    right: 7vw;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid var(--hi-primary-color);
  }
}

.hi-voice--text-recognition-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding-bottom: 20px;
}

.operate-button {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: black;
  position: relative;
  transition: all 0.2s ease;
  font-size: 13px;
  gap: 4px;
  &::before {
    position: absolute;
    content: '';
    width: 84px;
    height: 84px;
    border-radius: 100%;
    background: rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
  }
}
</style>
