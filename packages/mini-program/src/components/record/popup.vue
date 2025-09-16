<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import { ref, watch } from 'vue'
import WaveForm from './Wave.vue'

const model = defineModel({ type: Boolean, default: false })

const cs = useClassesName('record')
const record = uni.getRecorderManager()
const currentDecibel = ref(0)

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

  console.log('当前音量（分贝）：', db)
  console.log('Canvas振幅：', mappedAmplitude)

  // 更新 ref，触发 Canvas 重新绘制
  currentDecibel.value = mappedAmplitude
})
// 监听录音开始事件
record.onStart(() => {
  console.log('录音开始')
})

// 监听录音停止事件
record.onStop((res) => {
  console.log('录音停止', res)
  model.value = false
  currentDecibel.value = 0
})

// 监听录音错误事件
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
    frameSize: 10, // 每帧音频数据的大小
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
</script>

<template>
  <wd-popup
    v-model="model"
    position="bottom"
    custom-style="height: 240px; border-radius: 16px; margin: 20px;"
    lazy-render
    @close="handleClose"
  >
    <view :class="cs.m('container')">
      <view :class="cs.e('decibel')">
        <WaveForm :decibel="currentDecibel" :is-recording="model" />
      </view>

      <text :class="cs.e('description')">
        松开发送
      </text>

      <view :class="cs.e('button')">
        <view class="w-72px h-72px bg-#FF3B301F rounded-full flex items-center justify-center">
          <view class="i-iconamoon-microphone text-40px" />
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
</style>
