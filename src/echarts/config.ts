import type { ComputedRef, Ref } from 'vue'
import type { StockChartStore, UseStockChartOptions } from '.'
import dayjs from 'dayjs'
import { toValue } from 'vue'
import { TimeGranularity } from '@/api'

export enum StockChartStyleConfig {
  UP_COLOR = '#e63434ff',
  DOWN_COLOR = '#237b3cff',
  MA5_COLOR = '#007fff',
  MA10_COLOR = '#FFD700',
  MA20_COLOR = '#9370DB',
  MA30_COLOR = '#00CED1',
}

type TimeGranularityOptions = Record<Exclude<keyof typeof TimeGranularity, '5MINS' | '30MINS' | '1HOUR' | '50MINS' | '5DAILY'>, { key: TimeGranularity, value: string }>

export const timeGranularityOptions: TimeGranularityOptions = {
  // [TimeGranularity['30MINS']]: {
  //   key: TimeGranularity['30MINS'],
  //   value: '30分',
  // },
  // [TimeGranularity['1HOUR']]: {
  //   key: TimeGranularity['1HOUR'],
  //   value: '1小时',
  // },

  [TimeGranularity['1MINS']]: {
    key: TimeGranularity['1MINS'],
    value: '分时',
  },
  // [TimeGranularity['5MINS']]: {
  //   key: TimeGranularity['5MINS'],
  //   value: '5分',
  // },
  [TimeGranularity.DAILY]: {
    key: TimeGranularity.DAILY,
    value: '日K',
  },
  [TimeGranularity.WEEKLY]: {
    key: TimeGranularity.WEEKLY,
    value: '周K',
  },
  [TimeGranularity.MONTHLY]: {
    key: TimeGranularity.MONTHLY,
    value: '月K',
  },
  [TimeGranularity.YEAR]: {
    key: TimeGranularity.YEAR,
    value: '年K',
  },
}

// eslint-disable-next-line unused-imports/no-unused-vars
function xAxisInterval(index: number, value: string, categoryData: string[], timeGranularity: TimeGranularity) {
  if (index === 0 || index === categoryData.length - 1)
    return true
  const prev = categoryData[index - 1]
  if (timeGranularity === '1MINS')
    return dayjs(value).hour() - dayjs(prev).hour() >= 2
  else if (timeGranularity === 'DAILY')
    return dayjs(value).month() - dayjs(prev).month() >= 1
  else if (timeGranularity === 'WEEKLY')
    return dayjs(value).month() - dayjs(prev).month() >= 3
  else if (timeGranularity === 'MONTHLY')
    return dayjs(value).month() - dayjs(prev).month() >= 6
  else if (timeGranularity === 'YEAR')
    return dayjs(value).year() - dayjs(prev).year() >= 30
  else
    return dayjs(value).month() - dayjs(prev).month() >= 1
}

export function xAxisFormat(value: string, timeGranularity: TimeGranularity) {
  if (timeGranularity === '1MINS')
    return dayjs(value).format('HH:mm')
  else if (timeGranularity === 'DAILY')
    return dayjs(value).format('M-DD')
  else if (timeGranularity === 'WEEKLY')
    return dayjs(value).format('YYYY-MM')
  else if (timeGranularity === 'MONTHLY')
    return dayjs(value).format('YYYY-MM')
  else if (timeGranularity === 'YEAR')
    return dayjs(value).format('YYYY')
  else
    return dayjs(value).format('M-DD')
}

export function generateStockChartConfig(store: Ref<StockChartStore>, options: UseStockChartOptions) {
  const { categoryData, stockChartData, ma5, ma10, ma20, ma30 } = store.value
  const endValue = Math.max(0, stockChartData.length - 1)
  const startValue = Math.max(0, endValue - 50)

  return {
    grid: {
      left: 10,
      right: 10,
      top: 0,
      bottom: 60,
      outerBoundsContain: 'all',
    },
    xAxis: [
      {
        type: 'category',
        data: categoryData,
        axisLine: { lineStyle: { color: '#8392A5' } },
        axisLabel: {
          formatter: (value: string) => xAxisFormat(value, toValue(options.timeGranularity)),
          // interval: (index: number, value: string) => {
          //   return xAxisInterval(index, value, categoryData, timeGranularity)
          // },
        },
        // axisTick: {
        //   show: true,
        //   interval: (index: number, value: string) => xAxisInterval(index, value, categoryData, timeGranularity),
        // },
      },
    ],
    yAxis: {
      scale: true,
      splitNumber: 4,
      axisLine: { lineStyle: { color: '#8392A5' } },
      axisLabel: {
        align: 'right', // 文本右对齐
        margin: 20, // 可根据实际情况调整的右边距
        inside: true,
        color: '#616c7b79',
        formatter: (value: number, index: number) => {
          if (index === 0) {
            return ''
          }
          return value
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#8392A5',
          opacity: 0.2,
          type: 'dashed',
        },
      },
      boundaryGap: [0, 0],
    },
    dataZoom: [
      {
        id: 'dataZoomInside',
        type: 'inside',
        xAxisIndex: [0, 1],
        startValue,
        endValue,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
        preventDefaultMouseMove: true,
      },
      {
        id: 'dataZoomSlider',
        type: 'slider',
        xAxisIndex: [0, 1],
        startValue,
        endValue,
        zoomLock: true,
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
        data: stockChartData,
        barMinWith: 3,
        barMaxWith: 10,
        itemStyle: {
          color: 'transparent',
          color0: StockChartStyleConfig.DOWN_COLOR,
          borderColor: StockChartStyleConfig.UP_COLOR,
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
          color: StockChartStyleConfig.MA5_COLOR,
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
          color: StockChartStyleConfig.MA10_COLOR,
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
          color: StockChartStyleConfig.MA20_COLOR,
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
          color: StockChartStyleConfig.MA30_COLOR,
        },
        symbol: 'none',
      },
      // {
      //   name: '成交量',
      //   type: 'bar',
      //   xAxisIndex: 1,
      //   yAxisIndex: 1,
      //   barWidth: 10,
      //   data: stockChartData.map((item) => {
      //     const isUp = item[1] >= item[0]
      //     return {
      //       value: item[3],
      //       itemStyle: {
      //         color: isUp ? StockChartStyleConfig.UP_COLOR : StockChartStyleConfig.DOWN_COLOR,
      //         opacity: 1,
      //       },
      //     }
      //   }),
      // },
    ],
  }
}
