<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import { getCurrentInstance, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  speechText: string
  visible: boolean
}>()
const canvasRect = {
  width: 300,
  height: 50,
  gap: 7,
  count: 26,
}
const rectangleRect = {
  radius: 2,
  minHeight: canvasRect.height * 0.2,
  maxHeight: canvasRect.height * 0.8,
}

const cs = useClassesName('wave')
const instance = getCurrentInstance()
const dpr = ref(1)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const context = ref<CanvasRenderingContext2D | null>(null)
const animationTimer = ref<number | null>(null)

function animation() {
  drawWave()
  const frameDelay = 50
  animationTimer.value = setTimeout(animation, frameDelay)
}

watch(() => props.speechText, () => {
  if (animationTimer.value !== null) {
    clearTimeout(animationTimer.value)
    animationTimer.value = null
  }
  animation()
})

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const r_dpr = r * dpr.value
  const w_dpr = w * dpr.value
  const x_dpr = x * dpr.value
  const y_dpr = y * dpr.value
  const h_dpr = h * dpr.value

  const final_r_dpr = Math.min(r_dpr, w_dpr / 2, h_dpr / 2)
  ctx.beginPath()
  ctx.moveTo(x_dpr + final_r_dpr, y_dpr)
  ctx.arcTo(x_dpr + w_dpr, y_dpr, x_dpr + w_dpr, y_dpr + final_r_dpr, final_r_dpr)
  ctx.arcTo(x_dpr + w_dpr, y_dpr + h_dpr, x_dpr + w_dpr - final_r_dpr, y_dpr + h_dpr, final_r_dpr)
  ctx.arcTo(x_dpr, y_dpr + h_dpr, x_dpr, y_dpr + h_dpr - final_r_dpr, final_r_dpr)
  ctx.arcTo(x_dpr, y_dpr, x_dpr + final_r_dpr, y_dpr, final_r_dpr)
  ctx.closePath()
  ctx.fill()
}

// 核心绘图逻辑
function drawWave() {
  if (!context.value || !canvasRef.value)
    return

  const ctx = context.value
  // Canvas 的实际绘图尺寸 (物理像素)
  const actualWidth = canvasRect.width * dpr.value
  const actualHeight = canvasRect.height * dpr.value

  const width = (canvasRect.width / canvasRect.count) - canvasRect.gap
  const halfCanvasHeight = canvasRect.height / 2 // 中心线Y坐标 (CSS尺寸)
  const heightRange = rectangleRect.maxHeight - rectangleRect.minHeight

  // 清空画布
  ctx.clearRect(0, 0, actualWidth, actualHeight)
  ctx.fillStyle = '#FF3B30'

  for (let i = 0; i < canvasRect.count; i++) {
    const randomFactor = Math.random()
    const height = animationTimer.value === null ? 20 : (randomFactor * heightRange) + rectangleRect.minHeight

    const x = i * (width + canvasRect.gap) + canvasRect.gap / 2
    const topY = halfCanvasHeight - height / 2
    drawRoundRect(ctx, x, topY, width, height, rectangleRect.radius)
  }
}

onMounted(async () => {
  const res = await uni.getSystemInfo()
  dpr.value = res.pixelRatio || 1
  const query = uni.createSelectorQuery().in(instance)
  query.select('#waveCanvas').node((res) => {
    if (!res || !res.node)
      return

    const canvas = res.node as HTMLCanvasElement
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    canvasRef.value = canvas
    context.value = ctx

    canvas.width = canvasRect.width * dpr.value
    canvas.height = canvasRect.height * dpr.value

    drawWave()
  }).exec()
})

watch(() => props.visible, (visible) => {
  if (!visible && animationTimer.value !== null)
    clearTimeout(animationTimer.value)
})

onUnmounted(() => {
  // 🌟 清理 requestAnimationFrame
  if (animationTimer.value !== null) {
    clearTimeout(animationTimer.value)
    animationTimer.value = null
  }
})
</script>

<template>
  <view :class="cs.m('wrapper')" class="wave-wrapper">
    <canvas
      id="waveCanvas"
      type="2d"
      disable-scroll
      :style="{ width: `${canvasRect.width}px`, height: `${canvasRect.height}px` }"
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
