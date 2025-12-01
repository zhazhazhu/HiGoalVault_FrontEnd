import type { Ref } from 'vue'
import type { StockChartStore, UseStockChartOptions } from '.'
import dayjs from 'dayjs'
import { toValue } from 'vue'
import { TimeGranularity } from '@/api'

export enum StockChartStyleConfig {
  UP_COLOR = '#FF193D',
  DOWN_COLOR = '#25B230',
  MA5_COLOR = '#007fff',
  MA10_COLOR = '#FFD700',
  MA20_COLOR = '#9370DB',
  MA30_COLOR = '#00CED1',
  TIME_SERIES_COLOR = '#2c2c2cff',
}

type TimeGranularityOptions = Record<Exclude<keyof typeof TimeGranularity, '5MINS' | '15MINS' | '30MINS' | '1HOUR' | '50MINS' | 'YEAR'>, { key: TimeGranularity, value: string }>

type OtherTimeGranularityOptions = Record<Exclude<keyof typeof TimeGranularity, '1MINS' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | '5DAILY'>, { key: TimeGranularity, value: string }>

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
  //   value: '分时',
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
  [TimeGranularity['5DAILY']]: {
    key: TimeGranularity['5DAILY'],
    value: '5日',
  },
  // [TimeGranularity.YEAR]: {
  //   key: TimeGranularity.YEAR,
  //   value: '年K',
  // },
}

export const otherTimeGranularityOptions: OtherTimeGranularityOptions = {
  [TimeGranularity['5MINS']]: {
    key: TimeGranularity['5MINS'],
    value: '5分',
  },
  [TimeGranularity['15MINS']]: {
    key: TimeGranularity['15MINS'],
    value: '15分',
  },
  [TimeGranularity['30MINS']]: {
    key: TimeGranularity['30MINS'],
    value: '30分',
  },
  [TimeGranularity['1HOUR']]: {
    key: TimeGranularity['1HOUR'],
    value: '1小时',
  },
  [TimeGranularity.YEAR]: {
    key: TimeGranularity.YEAR,
    value: '年K',
  },
}

let lastPassedIndex = -1

function xAxisInterval(index: number, value: string, categoryData: string[], timeGranularity: TimeGranularity) {
  if (index === 0 || index === categoryData.length - 1)
    return true
  const prev = categoryData[lastPassedIndex === -1 ? 0 : lastPassedIndex]
  if (timeGranularity === '1MINS')
    return dayjs(value).diff(dayjs(prev), 'minute') >= 2
  else if (timeGranularity === '5MINS')
    return dayjs(value).diff(dayjs(prev), 'hour') >= 4
  else if (timeGranularity === '30MINS')
    return dayjs(value).diff(dayjs(prev), 'day') >= 2
  else if (timeGranularity === '1HOUR')
    return dayjs(value).diff(dayjs(prev), 'day') >= 3
  else if (timeGranularity === 'DAILY')
    return dayjs(value).diff(dayjs(prev), 'day') >= 20
  else if (timeGranularity === '5DAILY')
    return dayjs(value).diff(dayjs(prev), 'month') >= 1
  else if (timeGranularity === 'WEEKLY')
    return dayjs(value).diff(dayjs(prev), 'month') >= 3
  else if (timeGranularity === 'MONTHLY')
    return dayjs(value).diff(dayjs(prev), 'month') >= 6
  else if (timeGranularity === 'YEAR')
    return dayjs(value).diff(dayjs(prev), 'year') >= 30
  else
    return dayjs(value).diff(dayjs(prev), 'month') >= 1
}

export function xAxisFormat(value: string, timeGranularity: TimeGranularity) {
  if (timeGranularity === '1MINS')
    return dayjs(value).format('HH:mm')
  else if (timeGranularity === '5MINS')
    return dayjs(value).format('HH:mm')
  else if (timeGranularity === '30MINS')
    return dayjs(value).format('HH:mm')
  else if (timeGranularity === '1HOUR')
    return dayjs(value).format('HH:mm')
  else if (timeGranularity === 'DAILY')
    return dayjs(value).format('M-DD')
  else if (timeGranularity === '5DAILY')
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
  if (toValue(options.timeGranularity) === '1MINS') {
    return generateLineConfig(store, options)
  }
  else {
    return generateKLineConfig(store, options)
  }
}

export function generateKLineConfig(store: Ref<StockChartStore>, options: UseStockChartOptions) {
  const { categoryData, stockChartData, ma5, ma10, ma20, ma30, volumes, volumeMA5, volumeMA10 } = store.value
  const endValue = Math.max(0, stockChartData.length - 1)
  const startValue = options.preview ? 0 : Math.max(0, endValue - 50)

  return {
    animation: false,
    // axisPointer: {
    //   link: [{ xAxisIndex: 'all' }],
    // },
    tooltip: {
      trigger: 'axis',
      triggerOn: 'none',
      showContent: false,
      axisPointer: {
        type: 'cross',
        snap: true,
        label: {
          show: true,
          backgroundColor: '#616c7b8c',
        },
        crossStyle: {
          color: '#8392A5',
          width: 1,
          type: 'dashed',
        },
      },
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      textStyle: {
        color: '#000',
      },
    },
    grid: [
      {
        left: 10,
        right: 10,
        top: 0,
        bottom: options.preview ? 10 : 60,
        outerBoundsContain: 'all',
        height: 260,
      },
      // {
      //   left: 10,
      //   right: 10,
      //   top: 260,
      //   height: 60,
      // },
    ],
    // title: [
    //   {
    //     text: '成交额',
    //     left: 0,
    //     top: 260,
    //     coordinateSystem: 'cartesian2d',
    //     textStyle: {
    //       color: '#616c7b',
    //       fontSize: 10,
    //       fontWeight: 'normal',
    //     },
    //   },
    // ],
    xAxis: [
      {
        type: 'category',
        data: categoryData,
        boundaryGap: false,
        axisLine: { onZero: false, lineStyle: { color: '#8392A5', opacity: 0.7 } },
        min: 'dataMin',
        max: 'dataMax',
        axisLabel: {
          formatter: (value: string) => xAxisFormat(value, toValue(options.timeGranularity)),
        },
      },
      // {
      //   type: 'category',
      //   gridIndex: 1,
      //   data: categoryData,
      //   boundaryGap: false,
      //   axisLine: { onZero: false },
      //   axisTick: { show: false },
      //   axisLabel: { show: false },
      //   min: 'dataMin',
      //   max: 'dataMax',
      // },
    ],
    yAxis: [
      {
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
      // {
      //   scale: true,
      //   gridIndex: 1,
      //   axisLabel: { show: false },
      //   axisLine: { show: false },
      //   axisTick: { show: false },
      //   splitLine: { show: false },
      // },
    ],
    // visualMap: {
    //   show: false,
    //   seriesIndex: 5,
    //   dimension: 2,
    //   pieces: [
    //     {
    //       value: 1,
    //       color: StockChartStyleConfig.UP_COLOR,
    //     },
    //     {
    //       value: -1,
    //       color: StockChartStyleConfig.DOWN_COLOR,
    //     },
    //   ],
    // },
    dataZoom: [
      {
        id: 'dataZoomInside',
        type: 'inside',
        xAxisIndex: [0, 1],
        startValue,
        endValue,
        zoomLock: true,
        zoomOnMouseWheel: !options.preview,
        moveOnMouseMove: !options.preview,
        moveOnMouseWheel: !options.preview,
        preventDefaultMouseMove: true,
      },
      {
        id: 'dataZoomSlider',
        show: false,
        type: 'slider',
        xAxisIndex: [0, 1],
        startValue,
        endValue,
        zoomLock: true,
        borderColor: '#ccc',
        fillerColor: 'rgba(17, 100, 210, 0.2)',
        handleStyle: {
          color: '#1164d2',
          borderColor: '#1164d2',
        },
        textStyle: {
          color: '#999',
        },
        filterMode: 'filter',
      },
    ],
    series: [
      {
        name: '日K',
        type: 'candlestick',
        data: stockChartData,
        barWidth: 4,
        barMaxWidth: 8,
        itemStyle: {
          color: undefined,
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
      //   name: 'Volume',
      //   type: 'bar',
      //   xAxisIndex: 1,
      //   yAxisIndex: 1,
      //   barWidth: 4,
      //   barMaxWidth: 8,
      //   data: volumes,
      //   itemStyle: {
      //     opacity: 0.7,
      //   },
      // },
      // {
      //   name: 'VolumeMA5',
      //   type: 'line',
      //   xAxisIndex: 1,
      //   yAxisIndex: 1,
      //   data: volumeMA5,
      //   smooth: true,
      //   lineStyle: {
      //     opacity: 0.8,
      //     width: 1,
      //     color: StockChartStyleConfig.MA5_COLOR,
      //   },
      //   symbol: 'none',
      // },
      // {
      //   name: 'VolumeMA10',
      //   type: 'line',
      //   xAxisIndex: 1,
      //   yAxisIndex: 1,
      //   data: volumeMA10,
      //   smooth: true,
      //   lineStyle: {
      //     opacity: 0.8,
      //     width: 1,
      //     color: StockChartStyleConfig.MA10_COLOR,
      //   },
      //   symbol: 'none',
      // },
    ],
  }
}

export function generateLineConfig(store: Ref<StockChartStore>, options: UseStockChartOptions) {
  const { categoryData, stockChartData, volumes, volumeMA5, volumeMA10 } = store.value
  const endValue = Math.max(0, stockChartData.length - 1)
  const startValue = options.preview ? 0 : Math.max(0, endValue - 50)

  return {
    animation: false,
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
    },
    tooltip: {
      trigger: 'axis',
      triggerOn: 'none',
      showContent: false,
      axisPointer: {
        type: 'cross',
        snap: true,
        label: {
          show: true,
          backgroundColor: '#616c7b8c',
        },
        crossStyle: {
          color: '#8392A5',
          width: 1,
          type: 'dashed',
        },
      },
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      textStyle: {
        color: '#000',
      },
    },
    grid: [
      {
        left: 10,
        right: 10,
        top: 0,
        bottom: options.preview ? 10 : 60,
        outerBoundsContain: 'all',
        height: 260,
      },
    ],
    xAxis: [
      {
        type: 'category',
        data: categoryData,
        boundaryGap: false,
        axisLine: { onZero: false, lineStyle: { color: '#8392A5', opacity: 0.7 } },
        min: 'dataMin',
        max: 'dataMax',
        axisLabel: {
          formatter: (value: string) => xAxisFormat(value, toValue(options.timeGranularity)),
        },
      },
    ],
    yAxis: [
      {
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
    ],
    dataZoom: [
      {
        id: 'dataZoomInside',
        type: 'inside',
        xAxisIndex: [0, 1],
        startValue,
        endValue,
        zoomLock: true,
        zoomOnMouseWheel: !options.preview,
        moveOnMouseMove: !options.preview,
        moveOnMouseWheel: !options.preview,
        preventDefaultMouseMove: true,
      },
      {
        id: 'dataZoomSlider',
        show: false,
        type: 'slider',
        xAxisIndex: [0, 1],
        startValue,
        endValue,
        zoomLock: true,
        borderColor: '#ccc',
        fillerColor: 'rgba(17, 100, 210, 0.2)',
        handleStyle: {
          color: '#1164d2',
          borderColor: '#1164d2',
        },
        textStyle: {
          color: '#999',
        },
        filterMode: 'filter',
      },
    ],
    series: [
      {
        name: '分时',
        type: 'line',
        data: stockChartData.map(item => item[1]),
        showSymbol: false,
        lineStyle: {
          color: StockChartStyleConfig.TIME_SERIES_COLOR,
          width: 1,
        },
      },
      // {
      //   name: 'Volume',
      //   type: 'bar',
      //   xAxisIndex: 1,
      //   yAxisIndex: 1,
      //   barWidth: 4,
      //   barMaxWidth: 8,
      //   data: volumes,
      //   itemStyle: {
      //     opacity: 0.7,
      //   },
      // },
      // {
      //   name: 'VolumeMA5',
      //   type: 'line',
      //   xAxisIndex: 1,
      //   yAxisIndex: 1,
      //   data: volumeMA5,
      //   smooth: true,
      //   lineStyle: {
      //     opacity: 0.8,
      //     width: 1,
      //     color: StockChartStyleConfig.MA5_COLOR,
      //   },
      //   symbol: 'none',
      // },
      // {
      //   name: 'VolumeMA10',
      //   type: 'line',
      //   xAxisIndex: 1,
      //   yAxisIndex: 1,
      //   data: volumeMA10,
      //   smooth: true,
      //   lineStyle: {
      //     opacity: 0.8,
      //     width: 1,
      //     color: StockChartStyleConfig.MA10_COLOR,
      //   },
      //   symbol: 'none',
      // },
    ],
  }
}
