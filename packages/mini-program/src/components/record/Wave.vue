<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import { getCurrentInstance, onMounted, onUnmounted, ref, watch } from 'vue'

interface Props {
  decibel?: number
  isRecording?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  decibel: 0,
  isRecording: false,
})

const cs = useClassesName('wave')

const canvasContext = ref<UniNamespace.CanvasContext | null>(null)
const animationTimer = ref<number | null>(null)

const canvasWidth = 300
const canvasHeight = 40

// 自定义函数：绘制圆角矩形
function drawRoundedRect(context: any, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.arcTo(x + width, y, x + width, y + height, radius)
  context.arcTo(x + width, y + height, x, y + height, radius)
  context.arcTo(x, y + height, x, y, radius)
  context.arcTo(x, y, x + width, y, radius)
  context.closePath()
  context.fill()
}

function drawWave(decibel: number) {
  const context = canvasContext.value
  if (!context)
    return

  context.clearRect(0, 0, canvasWidth, canvasHeight)

  // 设置柱子的基础高度，当没有声音输入时，柱子会保持在这个高度
  const minHeight = 10

  // 根据当前分贝值和基础高度，计算柱子的实际高度
  // 使用 Math.max 确保柱子高度不低于 minHeight
  const baseVolumeHeight = Math.max(minHeight, decibel * 0.8)

  const barColor = '#FF3B30'
  const barWidth = 4
  const barSpacing = 10
  const barRadius = 2
  const totalBars = Math.floor(canvasWidth / (barWidth + barSpacing))
  const centerHeight = canvasHeight / 2

  const barHeights: number[] = []
  for (let i = 0; i < totalBars; i++) {
    const distanceFactor = Math.abs(i - totalBars / 2) / (totalBars / 2)
    const heightFactor = 1 - distanceFactor ** 2 * 0.8
    const currentBarHeight = baseVolumeHeight * heightFactor
    barHeights.push(currentBarHeight)
  }

  context.setFillStyle(barColor)
  for (let i = 0; i < totalBars; i++) {
    const barHeight = barHeights[i]
    const x = i * (barWidth + barSpacing) + barSpacing / 2
    const y = centerHeight - barHeight / 2

    drawRoundedRect(context, x, y, barWidth, barHeight, barRadius)
  }

  context.draw()
}

function startAnimation() {
  if (animationTimer.value !== null)
    return
  animationTimer.value = setInterval(() => {
    if (props.isRecording) {
      drawWave(props.decibel)
    }
    else {
      // 停止录音后，波形图逐渐回到基础高度
      if (props.decibel > 0) { // 只要分贝值大于0，就继续绘制，并让它逐渐减小
        drawWave(props.decibel * 0.95)
      }
      else {
        // 当分贝值降为0时，绘制基础波形并停止动画
        drawWave(0) // 这里传入0，会绘制minHeight的波形
        clearInterval(animationTimer.value!)
        animationTimer.value = null
      }
    }
  }, 30)
}

watch(() => props.isRecording, (newValue) => {
  if (newValue) {
    startAnimation()
  }
  else {
    canvasContext.value?.clearRect(0, 0, canvasWidth, canvasHeight)
  }
}, { immediate: true }) // 立即执行一次，确保在组件加载时显示基础波形

onMounted(() => {
  const instance = getCurrentInstance()
  if (instance) {
    canvasContext.value = uni.createCanvasContext('waveCanvas', instance)
  }
})

onUnmounted(() => {
  if (animationTimer.value !== null) {
    clearInterval(animationTimer.value)
    animationTimer.value = null
  }
})
</script>

<template>
  <view :class="cs.m('wrapper')" class="wave-wrapper">
    <canvas
      canvas-id="waveCanvas"
      class="wave-canvas"
      :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }"
    />
  </view>
</template>

<style lang='scss' scoped>
.wave-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
