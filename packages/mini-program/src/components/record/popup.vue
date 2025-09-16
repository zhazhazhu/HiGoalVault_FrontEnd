<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import { getCurrentInstance, ref, watch } from 'vue'
import Wave from './Wave.vue'

const model = defineModel({ type: Boolean, default: false })

const cs = useClassesName('record')
const record = uni.getRecorderManager()
const currentDecibel = ref(0)
const focusedButton = ref<'cancel' | 'microphone' | 'text' | null>(null)
const instance = getCurrentInstance()

const query = uni.createSelectorQuery().in(instance?.proxy)

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
    focusedButton.value = 'microphone'
  }
  else {
    stopRecording()
    focusedButton.value = null
  }
})

function onTouchStart() {
  focusedButton.value = 'microphone'
}

function onTouchMove(event) {
  const touch = event.touches[0]
  if (!touch) {
    return
  }

  const buttonGroup = query.select('.hi-record__button-group')

  // 使用小程序的方式获取按钮组元素信息
  buttonGroup.boundingClientRect((data) => {
    if (data && !Array.isArray(data)) {
      const buttonGroupRect = data as UniApp.NodeInfo
      const centerX = (buttonGroupRect.left || 0) + (buttonGroupRect.width || 0) / 2
      const touchX = touch.clientX

      // 检查触摸点是否还在按钮组范围内
      const isInButtonGroup = touchX >= (buttonGroupRect.left || 0)
        && touchX <= (buttonGroupRect.right || 0)
        && touch.clientY >= (buttonGroupRect.top || 0)
        && touch.clientY <= (buttonGroupRect.bottom || 0)

      if (isInButtonGroup) {
        // 根据触摸位置判断聚焦哪个按钮
        const leftThreshold = centerX - 50 // 左侧阈值
        const rightThreshold = centerX + 50 // 右侧阈值

        if (touchX < leftThreshold) {
          focusedButton.value = 'cancel'
        }
        else if (touchX > rightThreshold) {
          focusedButton.value = 'text'
        }
        else {
          focusedButton.value = 'microphone'
        }
      }
      else {
        // 如果滑出按钮组范围，取消所有聚焦
        focusedButton.value = null
        model.value = false
      }
    }
  }).exec()
}

function onTouchEnd() {
  focusedButton.value = null
}
</script>

<template>
  <wd-popup
    v-model="model"
    position="bottom"
    custom-style="border-radius: 16px; margin: 20px; margin-bottom: 30px;"
    :lazy-render="true"
    :lock-scroll="true"
    :root-portal="true"
    transition="zoom-in"
    @close="handleClose"
  >
    <view :class="cs.m('container')">
      <view :class="cs.e('decibel')">
        <Wave :decibel="currentDecibel" :is-recording="model" />
      </view>

      <text :class="cs.e('description')">
        松开发送
      </text>

      <view :class="cs.e('button-group')">
        <view :class="[cs.e('cancel'), cs.e('secund-button'), { focus: focusedButton === 'cancel' }]">
          <view class="i-weui-close-filled icon text-28px" />
        </view>

        <view
          :class="[cs.e('microphone'), { focus: focusedButton === 'microphone' }]"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <view class="i-iconamoon-microphone icon text-40px color-#333" />
        </view>

        <view :class="[cs.e('text'), cs.e('secund-button'), { focus: focusedButton === 'text' }]">
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
  padding: 20px 0;
}

.hi-record__button-group {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  touch-action: manipulation;
  user-select: none;
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
