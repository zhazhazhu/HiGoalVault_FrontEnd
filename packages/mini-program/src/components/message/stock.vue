<script lang='ts' setup>
import type { ChatMessageStock } from '@/api'
import dayjs from 'dayjs'
import { computed, ref } from 'vue'
import { calculateMA, DateFormat } from '@/utils/stock'

const props = defineProps<{
  data: [ChatMessageStock]
}>()

interface SelectedDataType {
  date: string
  open: number
  close: number
  low: number
  high: number
  volume: number
  ma5: number | null
  ma10: number | null
  ma20: number | null
  ma30: number | null
}

console.log(props.data)

// eslint-disable-next-line ts/no-require-imports
const echarts = require('../../wxcomponents/ec-canvas/echarts.min.js')

const upColor = '#ec0000'
const downColor = '#00da3c'

const selectedData = ref<SelectedDataType>({} as SelectedDataType)
const selectedVisible = ref(false)
const list = ref<string[]>(['分时', '日K', '周K', '月K'])
const current = ref('日K')
const dateRange = props.data[0].data.map((item) => {
  return dayjs(item.trade_date || '').format(DateFormat.DAY)
})
const stockData1 = props.data[0].data.map((item) => {
  return [item.open, item.close, item.low, item.high]
})
const ma5 = calculateMA(5, stockData1)
const ma10 = calculateMA(10, stockData1)
const ma20 = calculateMA(20, stockData1)
const ma30 = calculateMA(30, stockData1)

// 计算股票基本信息
const stockInfo = computed(() => {
  const data = props.data[0].data
  const latestData = data[data.length - 1]
  const previousData = data[data.length - 2]

  if (!latestData || !previousData) {
    return null
  }

  const currentPrice = latestData.close
  const previousPrice = previousData.close
  const change = currentPrice - previousPrice
  const changePercent = ((change / previousPrice) * 100).toFixed(2)
  const totalVolume = data.reduce((sum, item) => sum + item.vol, 0)
  const openInterest = latestData.oi || 0

  return {
    currentPrice: currentPrice.toFixed(2),
    change: change.toFixed(2),
    changePercent,
    isUp: change >= 0,
    totalVolume,
    openInterest,
    high: latestData.high.toFixed(2),
    low: latestData.low.toFixed(2),
    open: latestData.open.toFixed(2),
  }
})

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width,
    height,
    devicePixelRatio: dpr, // 像素比
  })
  canvas.setChart(chart)

  const option = {
    legend: {
      data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30'],
      top: 10,
      itemWidth: 12,
      itemHeight: 8,
      itemGap: 8,
      textStyle: {
        fontSize: 11,
      },
      itemStyle: {
        color: 'transparent',
      },
    },
    grid: [
      {
        left: '8%',
        right: '8%',
        top: '15%',
        height: '50%',
      },
      {
        left: '8%',
        right: '8%',
        top: '70%',
        height: '16%',
      },
    ],
    xAxis: [
      {
        type: 'category',
        data: dateRange,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
        axisPointer: {
          z: 100,
        },
      },
      {
        type: 'category',
        gridIndex: 1,
        data: dateRange,
        boundaryGap: false,
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        min: 'dataMin',
        max: 'dataMax',
      },
    ],
    yAxis: [
      {
        scale: true,
        splitArea: {
          show: true,
        },
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 70,
        end: 100,
        minSpan: 5,
        maxSpan: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
        preventDefaultMouseMove: false,
      },
      {
        type: 'slider',
        xAxisIndex: [0, 1],
        start: 70,
        end: 100,
        height: 20,
        bottom: 10,
        borderColor: '#ccc',
        fillerColor: 'rgba(17, 100, 210, 0.2)',
        handleStyle: {
          color: '#1164d2',
          borderColor: '#1164d2',
        },
        textStyle: {
          color: '#999',
        },
        showDetail: false,
        showDataShadow: true,
        realtime: true,
        filterMode: 'filter',
      },
    ],
    series: [
      {
        name: '日K',
        type: 'candlestick',
        data: stockData1,
        itemStyle: {
          color: upColor,
          color0: downColor,
          borderColor: upColor,
          borderColor0: downColor,
        },
      },
      {
        name: 'MA5',
        type: 'line',
        data: ma5,
        smooth: true,
        lineStyle: {
          opacity: 0.8,
          width: 1,
          color: '#1E90FF',
        },
        symbol: 'none',
      },
      {
        name: 'MA10',
        type: 'line',
        data: ma10,
        smooth: true,
        lineStyle: {
          opacity: 0.8,
          width: 1,
          color: '#FFD700',
        },
        symbol: 'none',
      },
      {
        name: 'MA20',
        type: 'line',
        data: ma20,
        smooth: true,
        lineStyle: {
          opacity: 0.8,
          width: 1,
          color: '#9370DB',
        },
        symbol: 'none',
      },
      {
        name: 'MA30',
        type: 'line',
        data: ma30,
        smooth: true,
        lineStyle: {
          opacity: 0.8,
          width: 1,
          color: '#00CED1',
        },
        symbol: 'none',
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: props.data[0].data.map((item, index) => {
          const isUp = stockData1[index][1] >= stockData1[index][0]
          return {
            value: item.vol,
            itemStyle: {
              color: isUp ? upColor : downColor,
              opacity: 0.7,
            },
          }
        }),
      },
    ],
  }
  // 添加点击事件监听
  chart.on('click', (params) => {
    if (params.componentType === 'series') {
      selectedVisible.value = true
      const dataIndex = params.dataIndex
      const originalData = props.data[0].data[dataIndex]
      const klineData = stockData1[dataIndex]

      selectedData.value = {
        date: dayjs(originalData.trade_date).format(DateFormat.DAY),
        open: klineData[0],
        close: klineData[1],
        low: klineData[2],
        high: klineData[3],
        volume: originalData.vol,
        ma5: calculateMA(5, stockData1)[dataIndex],
        ma10: calculateMA(10, stockData1)[dataIndex],
        ma20: calculateMA(20, stockData1)[dataIndex],
        ma30: calculateMA(30, stockData1)[dataIndex],
      }
    }
  })

  chart.setOption(option)
  return chart
}
function onClickContainer(e) {
  if (e.target.id === 'stock-chart-bar')
    return
  selectedVisible.value = false
}

const ec = {
  onInit: initChart,
}
</script>

<template>
  <view class="stock-chart-container" @click="onClickContainer">
    <!-- 股票基本信息 -->
    <view v-if="stockInfo" class="stock-header">
      <view class="stock-title-section">
        <text class="stock-name">
          {{ props.data?.[0]?.metadata?.symbol?.[0] || '股票名称' }}
        </text>
        <text class="stock-code">
          {{ props.data?.[0]?.metadata?.symbol?.[1] || '000000' }}
        </text>
      </view>

      <view class="stock-price-section">
        <text class="current-price" :class="{ 'price-up': stockInfo.isUp, 'price-down': !stockInfo.isUp }">
          ¥{{ stockInfo.currentPrice }}
        </text>
        <view class="price-change">
          <text class="change-amount" :class="{ 'price-up': stockInfo.isUp, 'price-down': !stockInfo.isUp }">
            {{ stockInfo.isUp ? '+' : '' }}{{ stockInfo.change }}
          </text>
          <text class="change-percent" :class="{ 'price-up': stockInfo.isUp, 'price-down': !stockInfo.isUp }">
            {{ stockInfo.isUp ? '+' : '' }}{{ stockInfo.changePercent }}%
          </text>
        </view>
      </view>
    </view>

    <!-- 价格信息面板 -->
    <view v-if="stockInfo" class="price-info-panel">
      <view class="price-item">
        <text class="label">
          开盘
        </text>
        <text class="value">
          {{ stockInfo.open }}
        </text>
      </view>
      <view class="price-item">
        <text class="label">
          最高
        </text>
        <text class="value price-up">
          {{ stockInfo.high }}
        </text>
      </view>
      <view class="price-item">
        <text class="label">
          最低
        </text>
        <text class="value price-down">
          {{ stockInfo.low }}
        </text>
      </view>
      <view class="price-item">
        <text class="label">
          成交量
        </text>
        <text class="value">
          {{ (stockInfo.totalVolume / 10000).toFixed(2) }}万
        </text>
      </view>
      <view class="price-item">
        <text class="label">
          持仓量
        </text>
        <text class="value">
          {{ (stockInfo.openInterest / 10000).toFixed(2) }}万
        </text>
      </view>
    </view>

    <!-- 时间周期选择器 -->
    <view class="period-selector">
      <wd-segmented v-model:value="current" :options="list" />
    </view>

    <!-- 点击数据显示区域 -->
    <view v-show="selectedVisible" class="selected-data-panel" @click.stop>
      <view class="data-grid">
        <view class="data-row">
          <view class="data-item">
            <text class="data-label">
              日期
            </text>
            <text class="data-value">
              {{ selectedData?.date || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              开盘
            </text>
            <text class="data-value" :class="selectedData?.open > selectedData?.close ? 'price-down' : 'price-up'">
              {{ selectedData?.open || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              收盘
            </text>
            <text class="data-value" :class="selectedData?.close > selectedData?.open ? 'price-up' : 'price-down'">
              {{ selectedData?.close || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              最高
            </text>
            <text class="data-value">
              {{ selectedData?.high || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              最低
            </text>
            <text class="data-value">
              {{ selectedData?.low || '--' }}
            </text>
          </view>
        </view>
        <view class="data-row">
          <view class="data-item">
            <text class="data-label">
              成交量
            </text>
            <text class="data-value">
              {{ selectedData?.volume || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              MA5
            </text>
            <text class="data-value" style="color: #1E90FF;">
              {{ selectedData?.ma5 || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              MA10
            </text>
            <text class="data-value" style="color: #FFD700;">
              {{ selectedData?.ma10 || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              MA20
            </text>
            <text class="data-value" style="color: #9370DB;">
              {{ selectedData?.ma20 || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              MA30
            </text>
            <text class="data-value" style="color: #00CED1;">
              {{ selectedData?.ma30 || '--' }}
            </text>
          </view>
        </view>
      </view>
    </view>

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

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.stock-title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stock-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stock-code {
  font-size: 14px;
  color: #666;
}

.stock-price-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.current-price {
  font-size: 24px;
  font-weight: 700;
}

.price-change {
  display: flex;
  gap: 8px;
  align-items: center;
}

.change-amount,
.change-percent {
  font-size: 14px;
  font-weight: 500;
}

.price-up {
  color: #ec0000;
}

.price-down {
  color: #00da3c;
}

.period-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.period-label {
  background-color: #f5f5f5;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
}

.price-info-panel {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 8px;
}

.price-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.price-item .label {
  font-size: 12px;
  color: #999;
}

.price-item .value {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.chart-wrapper {
  height: 300px;
  width: 100%;
  overflow: hidden;
  margin-top: 16px;
  position: relative;
}

// 点击数据显示区域样式
.selected-data-panel {
  margin-top: 16px;
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .panel-title {
      font-size: 12px;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      font-size: 16px;
      color: #999;
      cursor: pointer;
      padding: 2px;
      line-height: 1;

      &:hover {
        color: #666;
      }
    }
  }

  .data-grid {
    .data-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;

      &:last-child {
        margin-bottom: 0;
      }

      .data-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        flex: 1;

        .data-label {
          font-size: 10px;
          color: #999;
        }

        .data-value {
          font-size: 10px;
          color: #333;
          font-weight: 500;

          &.price-up {
            color: #ec0000;
          }

          &.price-down {
            color: #00da3c;
          }
        }
      }
    }
  }
}

.chart-name {
  text-align: center;
}
</style>
