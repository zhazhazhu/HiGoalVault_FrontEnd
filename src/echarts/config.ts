import type { EChartsOption } from 'echarts'
import type { StockChartStore } from '.'
import { toValue } from 'vue'

export enum StockChartStyleConfig {
  UP_COLOR = '#e63434ff',
  DOWN_COLOR = '#56ce78ff',
}

export const StockShowType = {
  MINUTE: '分时',
  DAY_K: '日K',
  WEEK_K: '周K',
  MONTH_K: '月K',
}

export function generateStockChartConfig(store: StockChartStore): EChartsOption {
  const { categoryData, stockChartData, ma5, ma10, ma20, ma30 } = toValue(store.data)
  return {
    // legend: {
    //   data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30'],
    //   top: 10,
    //   itemWidth: 12,
    //   itemHeight: 8,
    //   itemGap: 8,
    //   textStyle: {
    //     fontSize: 11,
    //   },
    //   itemStyle: {
    //     color: 'transparent',
    //   },
    // },
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
        // splitLine: {
        //   show: true,
        //   lineStyle: {
        //     color: '#8392A5',
        //     opacity: 0.2,
        //     type: 'dashed',
        //   },
        // },
      },
    ],
    yAxis: {
      scale: true,
      splitNumber: 4,
      axisLine: { lineStyle: { color: '#8392A5' } },
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
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 0,
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
        data: stockChartData,
        barWidth: 5, // 固定K线宽度为5px
        itemStyle: {
          color: StockChartStyleConfig.UP_COLOR,
          color0: StockChartStyleConfig.DOWN_COLOR,
          borderColor: StockChartStyleConfig.UP_COLOR,
          borderColor0: StockChartStyleConfig.DOWN_COLOR,
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
