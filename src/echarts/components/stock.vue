<script lang='ts' setup>
import type { ECElementEvent, ElementEvent } from 'echarts/core'
import type { UniEchartsInst } from 'uni-echarts/shared'
import type { ChatMessageStockData, DateParameterOfStock } from '@/api'
import { CandlestickChart, LineChart } from 'echarts/charts'
import { DatasetComponent, DataZoomComponent, GridComponent, LegendComponent } from 'echarts/components'
import * as echarts from 'echarts/core?async'
import { CanvasRenderer } from 'echarts/renderers'
import { provideEcharts } from 'uni-echarts/shared'
import { computed, ref, shallowRef, watch, watchEffect } from 'vue'
import { getStockInfo, useLoadStockData, useStockChart } from '@/echarts'
import { timeGranularityOptions } from '@/echarts/config'
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
const { store, config, code } = useStockChart(stockData, props.params.code, computed(() => currentTimeGranularity.value.key))

const chartCanvasInstance = shallowRef<UniEchartsInst | null>(null)
const isLoadingMore = ref(false) // 加载更多数据的标志
const hasMoreData = ref(true) // 是否还有更早的数据
const { load, reset } = useLoadStockData({
  date: props.params.todate,
  type: computed(() => currentTimeGranularity.value.key),
})

watch(currentTimeGranularity, () => {
  stockData.value = []
  reset()
  hasMoreData.value = true
  loadMoreData()
}, { immediate: true })

function handleSegmentChange(option) {
  currentTimeGranularity.value = option
}
function handleChartClick(params: ECElementEvent) {
  if (params.componentType === 'series') {
    store.value.stockInfo = getStockInfo(store.value.originalStockChartData, props.params.code || code, params.dataIndex)
  }
}
function handleZRClick(params: ElementEvent) {
  if (!params.target) {
    store.value.stockInfo = getStockInfo(store.value.originalStockChartData, props.params.code || code)
  }
}

// 监听 dataZoom 事件，当滑动到左边时加载更多数据
function handleDataZoom(event: any) {
  let start: number | null = null
  if (event?.dataZoomId && event.dataZoomId === 'dataZoomSlider') {
    start = event.start as number
  }
  else {
    start = event?.batch?.[0].start as number
  }

  if (start !== null && start < 10 && !isLoadingMore.value && hasMoreData.value) {
    loadMoreData()
  }
}

// 加载更多历史数据
async function loadMoreData() {
  if (isLoadingMore.value || !hasMoreData.value)
    return

  isLoadingMore.value = true
  // uni.showLoading({ title: '加载中...' })

  try {
    const data = await load(props.params.code || code)
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
    uni.hideLoading()
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
      <StockHeader v-if="store.stockInfo" :stock-info="store.stockInfo" />
    </view>

    <template v-if="!preview">
      <!-- 时间周期选择器 -->
      <view class="period-selector">
        <wd-segmented :value="currentTimeGranularity.value" :options="Object.values(timeGranularityOptions)" @change="handleSegmentChange" />
      </view>

      <!-- 图表容器 -->
      <view class="chart-wrapper">
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
  margin-top: 16px;
  position: relative;
}
</style>
