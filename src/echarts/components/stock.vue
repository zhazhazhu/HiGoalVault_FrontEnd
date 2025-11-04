<script lang='ts' setup>
import type { ElementEvent } from 'echarts/core'
import type { UniEchartsInst } from 'uni-echarts/shared'
import type { ChatMessageStockData, DateParameterOfStock } from '@/api'
import { onHide, onShow } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { CandlestickChart, LineChart } from 'echarts/charts'
import { AxisPointerComponent, DatasetComponent, DataZoomComponent, GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core?async'
import { CanvasRenderer } from 'echarts/renderers'
import { provideEcharts } from 'uni-echarts/shared'
import { computed, onUnmounted, ref, shallowRef, watch } from 'vue'
import { getStockInfo, useLoadStockData, usePollingStockDataService, useStockChart } from '@/echarts'
import { otherTimeGranularityOptions, StockChartStyleConfig, timeGranularityOptions } from '@/echarts/config'
import StockHeader from './header.vue'

const props = defineProps<{
  data?: ChatMessageStockData[]
  params: DateParameterOfStock
  preview?: boolean
}>()

provideEcharts(echarts)

echarts.use([
  DatasetComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
  DataZoomComponent,
  LineChart,
  CandlestickChart,
  AxisPointerComponent,
  TooltipComponent,
])

const currentTimeGranularity = ref(timeGranularityOptions.DAILY)
const stockData = ref<ChatMessageStockData[]>([])
const chartCanvasInstance = shallowRef<UniEchartsInst | null>(null)
const isLoadingMore = ref(false) // 加载更多数据的标志
const hasMoreData = ref(true) // 是否还有更早的数据
const zoomStart = ref<number | null>(null)
const zoomEnd = ref<number | null>(null)
const selectedIndex = ref<number | null>(null)
const isCrossDragActive = ref(false) // 长按后拖动十字光标的状态
const { store, config, stockInfo, resetConfigData } = useStockChart({
  stockData: computed(() => stockData.value),
  timeGranularity: computed(() => currentTimeGranularity.value.key),
  zoomStart: computed(() => zoomStart.value),
  zoomEnd: computed(() => zoomEnd.value),
  code: props.params.code,
})
const { load, reset } = useLoadStockData({
  date: props.params.todate,
  type: computed(() => currentTimeGranularity.value.key),
})
const enablePolling = computed(() => {
  return currentTimeGranularity.value.key === '5MINS' && dayjs(props.params.todate).isSame(dayjs(), 'day')
})
const { startPolling, stopPolling, onUpdateData } = usePollingStockDataService({ code: props.params.code })
const showOtherPeriod = ref(false)

onUpdateData((data) => {
  stockData.value.push(...data)
})
onShow(() => {
  if (enablePolling.value) {
    startPolling()
  }
})
onHide(() => {
  stopPolling()
})
onUnmounted(() => {
  stopPolling()
})

watch(currentTimeGranularity, () => {
  stockData.value = []
  reset()
  hasMoreData.value = true
  zoomStart.value = null
  zoomEnd.value = null
  resetConfigData()
  loadMoreData()
  if (enablePolling.value) {
    startPolling()
  }
  else {
    stopPolling()
  }
}, { immediate: true })

function handleSegmentChange(option, showOther = true) {
  showOtherPeriod.value = showOther
  currentTimeGranularity.value = option
}

let timer: NodeJS.Timeout | null = null

function handleZRClick(params: ElementEvent) {
  // 若点击在网格区域，则根据像素位置映射到最近的数据索引
  const idx = pickIndexByPixel(params)
  if (idx !== null) {
    selectedIndex.value = idx
    stockInfo.value = getStockInfo(store.value.originalStockChartData, idx)
    showCrossAtSelected()
    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer)
    }
    // 设置新的定时器，300ms 后隐藏十字线
    timer = setTimeout(() => {
      stockInfo.value = getStockInfo(store.value.originalStockChartData)
      hideCross()
      timer = null
    }, 3000)
  }
}

// 监听 dataZoom 事件，当滑动到左边时加载更多数据
function handleDataZoom(event: any) {
  let start: number | null = null
  let end: number | null = null
  if (event?.dataZoomId && event.dataZoomId === 'dataZoomSlider') {
    start = event.start as number
    end = event.end as number
  }
  else {
    start = event?.batch?.[0].start as number
    end = event?.batch?.[0].end as number
  }

  // 记录当前窗口位置用于加载后校正（仅非拖动场景）
  zoomStart.value = typeof start === 'number' ? start : zoomStart.value
  zoomEnd.value = typeof end === 'number' ? end : zoomEnd.value

  if (start !== null && start < 10 && !isLoadingMore.value && hasMoreData.value) {
    loadMoreData()
  }

  // 非拖动场景：滑动期间隐藏十字光标，并清空选中状态
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  selectedIndex.value = null
  hideCross()
}

// 当前显示的索引（选中则用选中，否则用最新）
const displayIndex = computed(() => {
  const len = store.value.stockChartData.length
  if (len <= 0)
    return -1
  const idx = selectedIndex.value ?? (len - 1)
  return Math.max(0, Math.min(idx, len - 1))
})

// 当前显示的 MA 值
const displayedMA = computed(() => {
  const idx = displayIndex.value
  if (idx < 0) {
    return { ma5: null, ma10: null, ma20: null, ma30: null }
  }
  return {
    ma5: store.value.ma5[idx],
    ma10: store.value.ma10[idx],
    ma20: store.value.ma20[idx],
    ma30: store.value.ma30[idx],
  }
})

function formatMA(v: number | null) {
  if (v == null)
    return '-'
  const n = Number(v)
  return Number.isNaN(n) ? '-' : n.toFixed(2).replace(/\.\?0+$/, '')
}

// 十字线显隐控制
function showCrossAtSelected() {
  const chart = chartCanvasInstance.value?.chart
  const idx = selectedIndex.value
  if (!chart || idx == null)
    return
  try {
    chart.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex: idx,
    })
  }
  catch {
    // ignore
  }
}

function hideCross() {
  const chart = chartCanvasInstance.value?.chart
  if (!chart)
    return
  try {
    selectedIndex.value = null
    chart.dispatchAction({ type: 'hideTip' })
    chart.dispatchAction({
      type: 'updateAxisPointer',
      currTrigger: 'leave',
    })
  }
  catch {
    // ignore
  }
}

// 根据像素位置选择最近的索引
function pickIndexByPixel(evt: ElementEvent): number | null {
  const chart = chartCanvasInstance.value?.chart
  if (!chart)
    return null

  // 兼容不同事件结构，优先使用 zrender 坐标，其次 offset；不使用任何 DOM API
  const ev: any = (evt as any).event ?? evt
  const ox: number | undefined = ev?.zrX ?? ev?.offsetX
  const oy: number | undefined = ev?.zrY ?? ev?.offsetY
  if (ox == null || oy == null)
    return null
  const point: [number, number] = [ox, oy]

  // 若不在主网格内，直接返回 null（避免误选坐标轴或滑块区域）
  const inGrid = chart.containPixel({ gridIndex: 0 }, point as any)
  if (!inGrid)
    return null

  // 将像素转换为坐标：优先 xAxisIndex，其次 grid，再次 seriesIndex
  let xCoord: any = chart.convertFromPixel({ xAxisIndex: 0 }, point as any)
  if (!xCoord) {
    const gridCoord: any = chart.convertFromPixel({ gridIndex: 0 }, point as any)
    xCoord = Array.isArray(gridCoord) ? gridCoord[0] : gridCoord
  }
  if (!xCoord) {
    const seriesCoord: any = chart.convertFromPixel({ seriesIndex: 0 }, point as any)
    xCoord = Array.isArray(seriesCoord) ? seriesCoord[0] : seriesCoord
  }

  const raw = Array.isArray(xCoord) ? xCoord[0] : xCoord
  let idx: number | null = null
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    idx = Math.round(raw)
  }
  else if (typeof raw === 'string') {
    const i = store.value.categoryData.indexOf(raw)
    idx = i >= 0 ? i : null
  }
  if (idx == null || !Number.isFinite(idx))
    return null
  const max = Math.max(0, store.value.stockChartData.length - 1)
  return Math.max(0, Math.min(idx, max))
}

// 长按事件：激活拖动，使用 zrender 事件跟随与结束；长按期间禁用 dataZoom
function handleLongPress(params: any) {
  uni.vibrateShort()
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  isCrossDragActive.value = true
  chartCanvasInstance.value?.setOption({
    dataZoom: [
      { disabled: true },
      { disabled: true },
    ],
  })
  const ev = {
    zrX: params.touches[0].x,
    zrY: params.touches[0].y,
  }
  handleZRMouseMove(ev as any)
}

function handleZRMouseMove(params: ElementEvent) {
  if (!isCrossDragActive.value)
    return

  const idx = pickIndexByPixel(params)
  const chart = chartCanvasInstance.value?.chart
  // 先根据像素移动 axisPointer（更稳定），再同步选中索引和信息
  const ev: any = (params as any).event ?? params
  const x: number | undefined = ev?.zrX ?? ev?.offsetX
  const y: number | undefined = ev?.zrY ?? ev?.offsetY
  if (x != null && y != null && chart?.containPixel({ gridIndex: 0 }, [x, y] as any)) {
    try {
      chart?.dispatchAction({
        type: 'updateAxisPointer',
        currTrigger: 'mousemove',
        position: {
          x,
          y,
        },
      })
    }
    catch {
      // ignore
    }
  }
  if (idx !== null) {
    selectedIndex.value = idx
    stockInfo.value = getStockInfo(store.value.originalStockChartData, idx)
    try {
      chart?.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: idx })
    }
    catch {
      // ignore
    }
  }
}

function handleZRMouseUp() {
  if (!isCrossDragActive.value)
    return
  isCrossDragActive.value = false
  chartCanvasInstance.value?.setOption({
    dataZoom: [
      { disabled: false },
      { disabled: false },
    ],
  })
  timer = setTimeout(() => {
    hideCross()
  }, 3000)
}

// 加载更多历史数据
async function loadMoreData() {
  if (isLoadingMore.value || !hasMoreData.value)
    return

  isLoadingMore.value = true
  chartCanvasInstance.value?.chart?.showLoading()

  try {
    const data = await load(props.params.code)
    // 判断是否返回了数据
    if (!data || data.length === 0) {
      // 没有更多数据了
      hasMoreData.value = false
      uni.showToast({ title: '没有更早的数据了', icon: 'none' })
      return
    }
    stockData.value.unshift(...data)
  }
  catch (error) {
    console.error('加载更多数据失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
  finally {
    isLoadingMore.value = false
    chartCanvasInstance.value?.chart?.hideLoading()
  }
}
</script>

<template>
  <view class="stock-chart-container">
    <view class="text-13px color-#ff1e1e mb-10px">
      这是查询到的行情数据：
    </view>
    <!-- 股票基本信息 -->
    <view class="my-16px">
      <StockHeader v-if="stockInfo" :stock-info="stockInfo" />
    </view>

    <template v-if="!preview">
      <!-- 时间周期选择器 -->
      <view class="period-selector">
        <!-- <wd-segmented size="small" :value="currentTimeGranularity.value" :options="Object.values(timeGranularityOptions)" @change="handleSegmentChange" /> -->
        <view v-for="item in timeGranularityOptions" :key="item.key" class="period-item" :class="{ active: item.key === currentTimeGranularity.key }" @click="handleSegmentChange(item, false)">
          {{ item.value }}
        </view>
        <view class="period-item" @click="showOtherPeriod = !showOtherPeriod">
          更多
        </view>
      </view>

      <view class="other-period" :class="{ visible: showOtherPeriod }">
        <view v-for="item in otherTimeGranularityOptions" :key="item.key" class="other-period-item" :class="{ active: item.key === currentTimeGranularity.key }" @click="handleSegmentChange(item)">
          {{ item.value }}
        </view>
      </view>

      <view class="flex gap-12px text-8px my-8px" @click="hideCross">
        <text :style="{ color: StockChartStyleConfig.MA5_COLOR }">
          MA5: {{ formatMA(displayedMA.ma5) }}
        </text>
        <text :style="{ color: StockChartStyleConfig.MA10_COLOR }">
          MA10: {{ formatMA(displayedMA.ma10) }}
        </text>
        <text :style="{ color: StockChartStyleConfig.MA20_COLOR }">
          MA20: {{ formatMA(displayedMA.ma20) }}
        </text>
        <text :style="{ color: StockChartStyleConfig.MA30_COLOR }">
          MA30: {{ formatMA(displayedMA.ma30) }}
        </text>
      </view>

      <!-- 图表容器 -->
      <view class="chart-wrapper">
        <uni-echarts
          ref="chartCanvasInstance"
          custom-class="h-280px"
          :option="config"
          @zr:click="handleZRClick"
          @zr:mousemove="handleZRMouseMove"
          @zr:mouseup="handleZRMouseUp"
          @datazoom="handleDataZoom"
          @native:longpress="handleLongPress"
        />
      </view>
    </template>
  </view>
</template>

<style lang='scss' scoped>
.stock-chart-container {
  background-color: #fff;
  overflow: hidden;
  margin: 12px 0;
}

.chart-wrapper {
  height: 280px;
  width: 100%;
  overflow: hidden;
  position: relative;
  /* H5 下限制只允许水平手势，减少垂直滚动 */
  touch-action: pan-x;
}

.period-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #e4e4e4;
  padding: 4px;
  font-size: 12px;
  border-radius: 4px;
  position: relative;
}

.period-item {
  cursor: pointer;
  padding: 4px 16px;
  color: #4c4c4c;
  font-weight: 500;
  border-radius: 4px;
  &.active {
    color: #272727;
    background-color: #fff;
  }
}

.other-period {
  width: 100%;
  padding: 4px;
  font-size: 9px;
  border-radius: 4px;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
  display: none;
}

.other-period.visible {
  display: flex;
}

.other-period-item {
  cursor: pointer;
  padding: 4px 8px;
  color: #777777;
  border: 1px solid #dedede;
  font-weight: 500;
  border-radius: 4px;
  &.active {
    color: #272727;
    background-color: #cccccc;
  }
}
</style>
