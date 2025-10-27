<script lang='ts' setup>
import type { ECElementEvent, ElementEvent } from 'echarts/core'
import type { UniEchartsInst } from 'uni-echarts/shared'
import type { ChatMessageStock } from '@/api'
import type { StockData } from '@/echarts'
import { CandlestickChart, LineChart } from 'echarts/charts'
import { DatasetComponent, DataZoomComponent, GridComponent, LegendComponent } from 'echarts/components'
import * as echarts from 'echarts/core?async'
import { CanvasRenderer } from 'echarts/renderers'
import { provideEcharts } from 'uni-echarts/shared'
import { computed, ref, shallowRef } from 'vue'
import { useStockChart } from '@/echarts'
import { StockShowType } from '@/echarts/config'
import StockHeader from './header.vue'
import StockPriceInfo from './price-info.vue'
import StockSelectedDataPanel from './selected-data-panel.vue'

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

function handleZRClick(params: ElementEvent) {
  if (!params.target) {
    activeData.value = null
  }
}
</script>

<template>
  <view class="stock-chart-container">
    <view class="text-13px color-#ff1e1e mb-10px">
      这是查询到的行情数据：
    </view>
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
        <uni-echarts ref="chartCanvasInstance" custom-class="h-240px" :option="config" @click="handleChartClick" @zr:click="handleZRClick" />
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
  height: 240px;
  width: 100%;
  overflow: hidden;
  margin-top: 16px;
  position: relative;
}
</style>
