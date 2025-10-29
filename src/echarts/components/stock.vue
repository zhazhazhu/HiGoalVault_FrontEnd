<script lang='ts' setup>
import type { ECElementEvent, ElementEvent } from 'echarts/core'
import type { UniEchartsInst } from 'uni-echarts/shared'
import type { ChatMessageStockData, DateParameterOfStock } from '@/api'
import { CandlestickChart, LineChart } from 'echarts/charts'
import { DatasetComponent, DataZoomComponent, GridComponent, LegendComponent } from 'echarts/components'
import * as echarts from 'echarts/core?async'
import { CanvasRenderer } from 'echarts/renderers'
import { provideEcharts } from 'uni-echarts/shared'
import { computed, ref, shallowRef, watch } from 'vue'
import { getStockInfo, useLoadStockData, useStockChart } from '@/echarts'
import { StockChartStyleConfig, timeGranularityOptions } from '@/echarts/config'
import StockHeader from './header.vue'

const props = defineProps<{
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
])

const currentTimeGranularity = ref(timeGranularityOptions.DAILY)
const stockData = ref<ChatMessageStockData[]>([])

const chartCanvasInstance = shallowRef<UniEchartsInst | null>(null)
const isLoadingMore = ref(false) // 加载更多数据的标志
const hasMoreData = ref(true) // 是否还有更早的数据
const zoomStart = ref<number | null>(null)
const zoomEnd = ref<number | null>(null)
const selectedIndex = ref<number | null>(null)
const { store, config, stockInfo, resetConfigData } = useStockChart({
  stockData: computed(() => stockData.value),
  code: props.params.code,
  timeGranularity: computed(() => currentTimeGranularity.value.key),
  zoomStart: computed(() => zoomStart.value),
  zoomEnd: computed(() => zoomEnd.value),
})

const { load, reset } = useLoadStockData({
  date: props.params.todate,
  type: computed(() => currentTimeGranularity.value.key),
})

function preventScroll(e: TouchEvent) {
  e.preventDefault()
  e.stopPropagation()
}

watch(currentTimeGranularity, () => {
  stockData.value = []
  reset()
  hasMoreData.value = true
  zoomStart.value = null
  zoomEnd.value = null
  resetConfigData()
  loadMoreData()
}, { immediate: true })

function handleSegmentChange(option) {
  currentTimeGranularity.value = option
}
function handleChartClick(params: ECElementEvent) {
  if (params.componentType === 'series') {
    stockInfo.value = getStockInfo(store.value.originalStockChartData, props.params.code, params.dataIndex)
    selectedIndex.value = params.dataIndex
  }
}
function handleZRClick(params: ElementEvent) {
  if (!params.target) {
    stockInfo.value = getStockInfo(store.value.originalStockChartData, props.params.code)
    selectedIndex.value = null
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

  // 记录当前窗口位置用于加载后校正
  zoomStart.value = typeof start === 'number' ? start : zoomStart.value
  zoomEnd.value = typeof end === 'number' ? end : zoomEnd.value

  if (start !== null && start < 10 && !isLoadingMore.value && hasMoreData.value) {
    loadMoreData()
  }
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
        <wd-segmented :value="currentTimeGranularity.value" :options="Object.values(timeGranularityOptions)" @change="handleSegmentChange" />
      </view>

      <view class="flex gap-12px text-8px my-8px">
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
      <view class="chart-wrapper" @touchmove.stop.prevent="preventScroll">
        <uni-echarts
          ref="chartCanvasInstance"
          custom-class="h-280px"
          :option="config"
          @click="handleChartClick"
          @zr:click="handleZRClick"
          @datazoom="handleDataZoom"
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
</style>
