<script lang='ts' setup>
import type { ECElementEvent } from 'echarts/core'
import type { UniEchartsInst } from 'uni-echarts/shared'
import type { StockData } from '.'
import type { ChatMessageStock } from '@/api'
import { CandlestickChart, LineChart } from 'echarts/charts'
import { DatasetComponent, DataZoomComponent, GridComponent, LegendComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { provideEcharts } from 'uni-echarts/shared'
import { computed, ref, shallowRef } from 'vue'
import { useStockChart } from '.'
import { StockShowType } from './config'

const props = defineProps<{
  data: [ChatMessageStock]
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

const current = ref(StockShowType.DAY_K)
const activeData = ref<StockData | null>(null)
const { store, config } = useStockChart(props.data)
const stockInfo = computed(() => store.data.value.stockInfo)
const chartCanvasInstance = shallowRef<UniEchartsInst | null>(null)

function handleChartClick(params: ECElementEvent) {
  if (params.componentType === 'series') {
    activeData.value = store.getStockData(params.dataIndex)
  }
}
</script>

<template>
  <view class="stock-chart-container">
    <!-- 股票基本信息 -->
    <StockHeader v-if="stockInfo" :stock-info="stockInfo" />

    <!-- 价格信息面板 -->
    <StockPriceInfo v-if="stockInfo" :stock-info="stockInfo" />

    <template v-if="!preview">
      <!-- 时间周期选择器 -->
      <view class="period-selector">
        <wd-segmented v-model:value="current" :options="Object.values(StockShowType)" />
      </view>

      <!-- 点击数据显示区域 -->
      <view v-if="activeData">
        <StockSelectedDataPanel :data="activeData" />
      </view>

      <!-- 图表容器 -->
      <view class="chart-wrapper">
        <uni-echarts ref="chartCanvasInstance" custom-class="h-300px" :option="config" @click="handleChartClick" />
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
  height: 300px;
  width: 100%;
  overflow: hidden;
  margin-top: 16px;
  position: relative;
}
</style>
