<script lang='ts' setup>
import type { StockData } from '.'
import type { ChatMessageStock } from '@/api'
import { computed, ref } from 'vue'
import echarts from '@/echarts'
import { useStockChart } from '.'
import { StockShowType } from './config'

const props = defineProps<{
  data: [ChatMessageStock]
}>()

const current = ref(StockShowType.DAY_K)
const activeData = ref<StockData | null>(null)
const { store, config } = useStockChart(props.data)
const stockInfo = computed(() => store.data.value.stockInfo)

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width,
    height,
    devicePixelRatio: dpr, // 像素比
  })
  canvas.setChart(chart)
  chart.on('click', (params) => {
    if (params.componentType === 'series') {
      activeData.value = store.getStockData(params.dataIndex)
    }
  })
  chart.setOption(config)
  return chart
}
function onClickContainer(e) {
  if (e.target.id === 'stock-chart-bar')
    return
  activeData.value = null
}
const ec = {
  onInit: initChart,
}
</script>

<template>
  <view class="stock-chart-container" @click="onClickContainer">
    <!-- 股票基本信息 -->
    <StockHeader v-if="stockInfo" :stock-info="stockInfo" />

    <!-- 价格信息面板 -->
    <StockPriceInfo v-if="stockInfo" :stock-info="stockInfo" />

    <!-- 时间周期选择器 -->
    <view class="period-selector">
      <wd-segmented v-model:value="current" :options="Object.values(StockShowType)" />
    </view>

    <!-- 点击数据显示区域 -->
    <StockSelectedDataPanel v-if="activeData" :data="activeData" />

    <!-- 图表容器 -->
    <view class="chart-wrapper">
      <ec-canvas id="stock-chart-bar" :canvas-id="`stock-chart-${Date.now()}`" :ec="ec" type="2d" />
    </view>
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
