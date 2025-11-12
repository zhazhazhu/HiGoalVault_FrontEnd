<script lang='ts' setup>
import { getCurrentInstance, ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  decibel: number
}>()

const canvasRect = {
  width: 80,
  height: 50,
  gap: 6,
  count: 8,
}
const rectangleRect = {
  radius: 0,
  minHeight: canvasRect.height * 0.2,
  maxHeight: canvasRect.height * 0.8,
}

const instance = getCurrentInstance()
const dpr = ref(1)
const canvasInstance = ref<any | null>(null)
const context = ref<CanvasRenderingContext2D | null>(null)
const animationTimer = ref<number | null>(null)
const FPS = 10 // 目标帧率：每秒 10 帧
const frameInterval = 1000 / FPS // 目标帧间隔时间 (1000ms / 10 = 100ms)
let lastTime = 0 // 记录上次绘制的时间

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
/**
 * 完整的波形图绘制函数
 * 包含了 DPR 适配、分贝映射（平方衰减）、以及中间高两边低的权重处理。
 */
function drawWave() {
  if (!context.value || !canvasInstance.value)
    return

  const ctx = context.value
  // Canvas 的实际绘图尺寸 (物理像素)
  const actualWidth = canvasRect.width * dpr.value
  const actualHeight = canvasRect.height * dpr.value

  const width = (canvasRect.width / canvasRect.count) - canvasRect.gap
  const halfCanvasHeight = canvasRect.height / 2 // 中心线Y坐标 (CSS尺寸)
  const heightRange = rectangleRect.maxHeight - rectangleRect.minHeight // 最大有效高度

  // 清空画布
  ctx.clearRect(0, 0, actualWidth, actualHeight)
  ctx.fillStyle = 'white' // 你的颜色设置

  // --- 1. 分贝处理和非线性映射 ---
  const centerIndex = canvasRect.count / 2
  const fluctuationRange = 0.2 // 高度随机浮动幅度 (±20%)

  // 确保 decibel 在 0-1 之间
  const clampedDecibel = Math.max(0, Math.min(1, props.decibel || 0))

  // 🌟 非线性映射：平方衰减，压低小分贝的敏感度
  // eslint-disable-next-line prefer-exponentiation-operator
  const normalizedDecibel = Math.pow(clampedDecibel, 2)

  // 基准高度：由标准化分贝值决定
  const baseHeight = (normalizedDecibel * heightRange) + rectangleRect.minHeight

  // -------------------------------------------------------------------

  for (let i = 0; i < canvasRect.count; i++) {
    let height: number

    // --- 2. 距离和权重计算 (中间高两边低) ---
    // 距离中心点的标准化距离 (0 到 1)
    const distanceFactor = Math.abs(i - centerIndex) / centerIndex

    // 衰减权重：使用平方衰减 (1 - distance²)
    // eslint-disable-next-line prefer-exponentiation-operator
    const weight = 1 - Math.pow(distanceFactor, 2)

    // -------------------------------------------------------------------

    if (clampedDecibel === 0) {
      // 3. 静音状态：波形在最小高度附近微弱浮动，并受权重影响
      const minRandom = Math.random() * 0.5 * weight
      height = rectangleRect.minHeight + minRandom
    }
    else {
      // 4. 声音激活状态：应用权重和随机浮动
      const fluctuation = (Math.random() * fluctuationRange * 2) - fluctuationRange

      // 衰减基准高度：weight * baseHeight
      const decayedBaseHeight = baseHeight * weight

      // 在衰减后的高度上增加随机浮动
      height = decayedBaseHeight * (1 + fluctuation)

      // 确保高度被限制在有效范围内
      height = Math.max(height, rectangleRect.minHeight)
      height = Math.min(height, rectangleRect.maxHeight)
    }

    // --- 5. 绘制 ---
    const x = i * (width + canvasRect.gap) + canvasRect.gap / 2
    const topY = halfCanvasHeight - height / 2

    // drawRoundRect 函数内部负责 DPR 尺寸转换
    drawRoundRect(ctx, x, topY, width, height, rectangleRect.radius)
  }
}
function animation(currentTime: number) {
  if (currentTime - lastTime > frameInterval) {
    lastTime = currentTime
    drawWave()
  }
  animationTimer.value = canvasInstance.value.requestAnimationFrame(animation)
}

async function startCanvas() {
  const res = await uni.getSystemInfo()
  dpr.value = res.pixelRatio || 1
  const query = uni.createSelectorQuery().in(instance)
  setTimeout(() => {
    query.select('#voiceCanvas').node((res) => {
      if (!res || !res.node)
        return

      const canvas = res.node as any
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

      canvasInstance.value = canvas
      context.value = ctx

      canvas.width = canvasRect.width * dpr.value
      canvas.height = canvasRect.height * dpr.value
      animationTimer.value = canvasInstance.value.requestAnimationFrame(animation)
    }).exec()
  }, 300)
}
function stopCanvas() {
  animationTimer.value && canvasInstance.value.cancelAnimationFrame(animationTimer.value)
  animationTimer.value = null
  context.value?.clearRect(0, 0, canvasRect.width * dpr.value, canvasRect.height * dpr.value)
}

watch(() => props.visible, (visible) => {
  if (!visible) {
    stopCanvas()
  }
  else {
    startCanvas()
  }
}, { immediate: true })
</script>

<template>
  <canvas
    id="voiceCanvas"
    type="2d"
    disable-scroll
    class="w-80px h-50px"
  />
</template>

<style lang='scss' scoped>
.wave-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
