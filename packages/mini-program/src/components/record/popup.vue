<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import { computed, getCurrentInstance, ref, watch } from 'vue'
import Wave from './Wave.vue'

const props = defineProps<{
  focusedButton: 'cancel' | 'microphone' | 'text' | null
}>()
const model = defineModel({ type: Boolean, default: false })
const cs = useClassesName('record')
const record = uni.getRecorderManager()
const currentDecibel = ref(0)
const instance = getCurrentInstance()
const query = uni.createSelectorQuery().in(instance)
const recordContainer = query.select('.hi-record--container')
const text = computed(() => {
  if (props.focusedButton === 'cancel') {
    return '松手取消'
  }
  else if (props.focusedButton === 'microphone') {
    return '松开发送'
  }
  return '松开编辑文字'
})

record.onFrameRecorded((res) => {
  const { frameBuffer } = res
  // 将音频数据转换为 16 位整数
  const audioData = new Int16Array(frameBuffer)

  let sum = 0
  for (let i = 0; i < audioData.length; i++) {
    // 将16位整数归一化到 -1 到 1 的范围
    const normalizedValue = audioData[i] / 32768
    sum += normalizedValue * normalizedValue // 平方和
  }
  // 计算 RMS
  const rms = Math.sqrt(sum / audioData.length)
  // 将 RMS 转换为分贝，并处理对数函数的边界问题
  const db = 20 * Math.log10(Math.max(rms, 0.00001))

  const minDb = -60 // 假设-60dB为最低音量
  const maxDb = 0 // 0dB为最高音量

  let mappedAmplitude = (db - minDb) / (maxDb - minDb) * 60 // 映射到0-60的振幅
  mappedAmplitude = Math.max(0, mappedAmplitude) // 确保振幅为正数

  // console.log('当前音量（分贝）：', db)
  // console.log('Canvas振幅：', mappedAmplitude)

  // 更新 ref，触发 Canvas 重新绘制
  currentDecibel.value = mappedAmplitude
})

record.onStart(() => {
  console.log('录音开始')
})

record.onStop((res) => {
  console.log('录音停止', res)
  model.value = false
  currentDecibel.value = 0
})

record.onError((err) => {
  console.error('录音错误', err)
  model.value = false
  currentDecibel.value = 0
})

function handleClose() {
  model.value = false
  stopRecording()
}

function startRecording() {
  record.start({
    duration: 60000 * 3,
    sampleRate: 44100,
    numberOfChannels: 1,
    encodeBitRate: 192000,
    format: 'pcm',
    frameSize: 5, // 每帧音频数据的大小
  })
}

function stopRecording() {
  model.value = false
  record.stop()
}

watch(() => model.value, (value) => {
  if (value) {
    startRecording()
  }
  else {
    stopRecording()
  }
})

defineExpose({
  recordContainer,
})
</script>

<template>
  <wd-popup
    v-model="model"
    position="bottom"
    custom-style="height: 250px; border-radius: 16px; margin: 20px;"
    lazy-render
    lock-scroll
    root-portal
    transition="zoom-in"
    @close="handleClose"
  >
    <view :class="cs.m('container')">
      <view :class="cs.e('decibel')">
        <Wave :decibel="currentDecibel" :is-recording="model" />
      </view>

      <text :class="cs.e('description')">
        {{ text }}
      </text>

      <view id="button-group" :class="cs.e('button-group')">
        <view class="transition-all" :class="[cs.e('cancel'), cs.e('secund-button'), { focus: focusedButton === 'cancel' }]">
          <view class="i-weui-close-filled icon text-28px" />
        </view>

        <view
          class="transition-all"
          :class="[cs.e('microphone'), { focus: focusedButton === 'microphone' }]"
        >
          <view class="i-iconamoon-microphone text-40px color-#333" />
        </view>

        <view class="transition-all" :class="[cs.e('text'), cs.e('secund-button'), { focus: focusedButton === 'text' }]">
          <text class="icon text-20px">
            文
          </text>
        </view>
      </view>
    </view>
  </wd-popup>
</template>

<style lang='scss' scoped>
.hi-record--container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  overflow: hidden;
}

.hi-record__decibel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.hi-record__description {
  font-size: 12px;
  color: #666666;
  line-height: 18px;
  text-align: center;
  margin: 20px 0;
}

.hi-record__button-group {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
}
.hi-record__microphone {
  width: 72px;
  height: 72px;
  background-color: #ff3b301f;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  &.focus {
    background-color: #ff3b3042;
  }
}
.hi-record__secund-button {
  width: 46px;
  height: 46px;
  background: #f3f3f3;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .icon {
    color: #333333;
  }
}
.hi-record__secund-button.hi-record__cancel.focus {
  background-color: #ff5555;
  .icon {
    color: white;
  }
}
.hi-record__secund-button.hi-record__text.focus {
  background-color: #04b578ff;
  .icon {
    color: white;
  }
}
</style>
