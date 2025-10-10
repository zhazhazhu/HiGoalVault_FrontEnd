<script lang='ts' setup>
import type { ChatMessageStock } from '@/api'
import { calculateMA, DateCategoryType, generateDateCategory } from '@/utils/stock'

const props = defineProps<{
  data: [ChatMessageStock]
}>()

console.log(props.data)

// eslint-disable-next-line ts/no-require-imports
const echarts = require('../../wxcomponents/ec-canvas/echarts.min.js')

const upColor = '#ec0000'
const downColor = '#00da3c'

const dateRange = generateDateCategory(props.data[0].data[props.data[0].data.length - 1].trade_date || '', DateCategoryType.DAY)
const stockData1 = props.data[0].data.map((item) => {
  return [item.open, item.close, item.low, item.high]
})
const ma5 = calculateMA(5, stockData1)
const ma10 = calculateMA(10, stockData1)
const ma20 = calculateMA(20, stockData1)
const ma30 = calculateMA(30, stockData1)

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width,
    height,
    devicePixelRatio: dpr, // 像素比
  })
  canvas.setChart(chart)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30'],
      top: 20,
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: dateRange,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: 'dataMin',
      max: 'dataMax',
    },
    yAxis: {
      scale: true,
      splitArea: {
        show: true,
      },
    },
    dataZoom: [
      {
        type: 'inside',
        start: 50,
        end: 100,
      },
      {
        show: true,
        type: 'slider',
        top: '90%',
        start: 50,
        end: 100,
      },
    ],
    series: [
      {
        name: '日K',
        type: 'candlestick',
        data: stockData1,
        itemStyle: {
          color: 'transparent',
          borderColor: upColor,
          Color0: downColor,
        },
        markPoint: {
          label: {
            formatter(param) {
              return param != null ? `${Math.round(param.value)}` : ''
            },
          },
          data: [
            {
              name: 'Mark',
              coord: ['2013/5/31', 2300],
              value: 2300,
              itemStyle: {
                color: 'rgb(41,60,85)',
              },
            },
            {
              name: 'highest value',
              type: 'max',
              valueDim: 'highest',
            },
            {
              name: 'lowest value',
              type: 'min',
              valueDim: 'lowest',
            },
            {
              name: 'average value on close',
              type: 'average',
              valueDim: 'close',
            },
          ],
          tooltip: {
            formatter(param) {
              return `${param.name}<br>${param.data.coord || ''}`
            },
          },
        },
        markLine: {
          symbol: ['none', 'none'],
          data: [
            [
              {
                name: 'from lowest to highest',
                type: 'min',
                valueDim: 'lowest',
                symbol: 'circle',
                symbolSize: 10,
                label: {
                  show: false,
                },
                emphasis: {
                  label: {
                    show: false,
                  },
                },
              },
              {
                type: 'max',
                valueDim: 'highest',
                symbol: 'circle',
                symbolSize: 10,
                label: {
                  show: false,
                },
                emphasis: {
                  label: {
                    show: false,
                  },
                },
              },
            ],
            {
              name: 'min line on close',
              type: 'min',
              valueDim: 'close',
            },
            {
              name: 'max line on close',
              type: 'max',
              valueDim: 'close',
            },
          ],
        },
      },
      {
        name: 'MA5',
        type: 'line',
        data: ma5,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          opacity: 0.5,
        },
      },
      {
        name: 'MA10',
        type: 'line',
        data: ma10,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          opacity: 0.5,
        },
      },
      {
        name: 'MA20',
        type: 'line',
        data: ma20,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          opacity: 0.5,
        },
      },
      {
        name: 'MA30',
        type: 'line',
        data: ma30,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          opacity: 0.5,
        },
      },
    ],
  }
  chart.setOption(option)
  return chart
}

const ec = {
  onInit: initChart,
}
</script>

<template>
  <view class="stock-chart-container">
    <view v-if="data[0]?.metadata" class="stock-info mb-10px">
      <text class="stock-title">
        {{ data[0].metadata.symbol?.join(', ') || '股票数据' }}
      </text>
      <text class="stock-period">
        {{ data[0].metadata.time_granularity_label || '' }}
      </text>
    </view>

    <view class="chart-wrapper">
      <ec-canvas id="stock-chart-bar" :canvas-id="`stock-chart-${Date.now()}`" :ec="ec" type="2d" />
    </view>
  </view>
</template>

<style lang='scss' scoped>
.stock-chart-container {
  background-color: #fff;
  border-radius: 8px;
  margin: 10px 0;
}

.stock-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.stock-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.stock-period {
  font-size: 12px;
  color: #666;
}

.chart-wrapper {
  width: 100%;
  height: 300px;
  overflow: hidden;
  position: relative;
}

.chart-name {
  text-align: center;
}
</style>
