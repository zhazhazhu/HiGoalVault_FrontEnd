import type { MaybeRefOrGetter } from 'vue'
import type { ChatMessageStockData } from '@/api'
import dayjs from 'dayjs'
import { computed, ref, toValue, watch } from 'vue'
import { api, TimeGranularity } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { calculateMA, DateFormat } from '@/utils/stock'
import { generateStockChartConfig, xAxisFormat } from './config'

export interface StockData extends ChatMessageStockData {
  date: string // 日期
  open: number // 开盘价
  close: number // 收盘价
  low: number // 最低价
  high: number // 最高价
  ma5: number | null // 5日均线
  ma10: number | null // 10日均线
  ma20: number | null // 20日均线
  ma30: number | null // 30日均线
}

export interface StockInfo {
  code: string // 股票名称
  currentPrice: number // 当前价格
  change: number // 涨跌值
  changePercent: number // 涨跌百分比
  isUp: boolean // 是否上涨
  openInterest: number // 持仓量
  high: number // 最高价
  low: number // 最低价
  open: number // 开盘价
  close: number // 收盘价
  vol: number // 成交量
}

export interface StockChartStore {
  categoryData: string[]
  stockChartData: number[][]
  originalStockChartData: ChatMessageStockData[]
  ma5: Array<number | null>
  ma10: Array<number | null>
  ma20: Array<number | null>
  ma30: Array<number | null>
}

export interface UseStockChartOptions {
  stockData: MaybeRefOrGetter<ChatMessageStockData[]>
  code: string
  timeGranularity: MaybeRefOrGetter<TimeGranularity>
  zoomStart: MaybeRefOrGetter<number | null>
  zoomEnd: MaybeRefOrGetter<number | null>
}

export function useStockChart(options: UseStockChartOptions) {
  const stockInfo = ref(getStockInfo(toValue(options.stockData), options.code))

  const store = computed<StockChartStore>(() => {
    const stockChartData = toValue(options.stockData).map((item) => {
      return [item.open, item.close, item.low, item.high]
    })
    return {
      categoryData: toValue(options.stockData).map((item) => {
        return dayjs(item.trade_date || '').format('YYYY-MM-DD')
      }),
      stockChartData,
      originalStockChartData: toValue(options.stockData),
      ma5: calculateMA(5, stockChartData),
      ma10: calculateMA(10, stockChartData),
      ma20: calculateMA(20, stockChartData),
      ma30: calculateMA(30, stockChartData),
    }
  },
  )

  function getStockData(store: StockChartStore, index: number): StockData {
    const original = toValue(store.originalStockChartData)[index]

    return {
      ...original,
      date: dayjs(original.trade_date || '').format(DateFormat.DAY),
      ma5: store.ma5[index],
      ma10: store.ma10[index],
      ma20: store.ma20[index],
      ma30: store.ma30[index],
    }
  }

  const config = ref(generateStockChartConfig(store, options))

  function resetConfigData() {
    config.value = generateStockChartConfig(store, options)
  }

  watch<ChatMessageStockData[]>(
    () => toValue(options.stockData).slice(),
    (newStockData, oldStockData) => {
      if (!stockInfo.value) {
        stockInfo.value = getStockInfo(newStockData, options.code)
      }
      // config.value = generateStockChartConfig(store, options)
      const newPushStockData = newStockData.slice(oldStockData.length)
      const stockChartData = newPushStockData.map((item) => {
        return [item.open, item.close, item.low, item.high]
      })
      const categoryData = newPushStockData.map((item) => {
        return dayjs(item.trade_date || '').format('YYYY-MM-DD')
      })
      const ma5 = calculateMA(5, stockChartData)
      const ma10 = calculateMA(10, stockChartData)
      const ma20 = calculateMA(20, stockChartData)
      const ma30 = calculateMA(30, stockChartData)
      config.value.xAxis[0].data.unshift(...categoryData)
      config.value.series[0].data.unshift(...(stockChartData as any))
      config.value.series[1].data.unshift(...ma5 as any)
      config.value.series[2].data.unshift(...ma10 as any)
      config.value.series[3].data.unshift(...ma20 as any)
      config.value.series[4].data.unshift(...ma30 as any)
      const delta = stockChartData.length
      const defaultDataZoomEnd = Math.max(0, stockChartData.length - 1)
      const defaultDataZoomStart = Math.max(0, defaultDataZoomEnd - 50)
      const maxIndex = Math.max(0, store.value.categoryData.length - 1)
      const prevE = (toValue(options.zoomEnd) ?? 0) as number
      const endValue = Math.min(maxIndex, Number(prevE) + delta)
      const startValue = Math.max(0, endValue - 50)
      if (toValue(options.zoomEnd) === null) {
        config.value.dataZoom.forEach((item) => {
          item.endValue = defaultDataZoomEnd
          item.startValue = defaultDataZoomStart
        })
      }
      else {
        config.value.dataZoom.forEach((item) => {
          item.endValue = endValue
          item.startValue = startValue
        })
      }
    },
    { deep: true },
  )

  return {
    store,
    config,
    stockInfo,
    getStockData,
    resetConfigData,
  }
}

export function getStockInfo(stockChartData: MaybeRefOrGetter<ChatMessageStockData[]>, code: string, index?: number): StockInfo | null {
  const stockData = toValue(stockChartData)
  const latestData = stockData[index !== undefined ? index : stockData.length - 1]
  const previousData = stockData[index !== undefined ? index - 1 : stockData.length - 2]

  if (!latestData || !previousData) {
    return null
  }

  return {
    code,
    currentPrice: Number(latestData.close.toFixed(2)),
    change: Number((latestData.close - previousData.close).toFixed(2)),
    changePercent: Number((latestData.close - previousData.close) / previousData.close),
    isUp: latestData.close > previousData.close,
    openInterest: latestData.oi || 0,
    high: Number(latestData.high.toFixed(2)),
    low: Number(latestData.low.toFixed(2)),
    open: Number(latestData.open.toFixed(2)),
    close: Number(latestData.close.toFixed(2)),
    vol: Number(latestData.vol.toFixed(2)),
  }
}

interface UseLoadStockDataOptions {
  date: string
  type: MaybeRefOrGetter<TimeGranularity>
}

export function useLoadStockData(options: UseLoadStockDataOptions) {
  const [page, reset] = useResetRef({
    pageNumber: 1,
    pageSize: 300,
  })

  async function load(code?: string) {
    if (!code)
      return []
    const [start, end] = updateDate(page.value, toValue(options.type), options.date)
    const res = await api.getFinanceData({
      startDateTime: start.format('YYYY-MM-DD HH:mm:ss'),
      endDateTime: end.format('YYYY-MM-DD HH:mm:ss'),
      transCode: code,
      timeGranularity: toValue(options.type),
    })

    if (res.code === 200) {
      page.value.pageNumber++
      return res.result.records
    }
    return []
  }

  return {
    load,
    reset,
  }
}

function updateDate(page: { pageNumber: number, pageSize: number }, type: TimeGranularity, date: string) {
  const baseDate = dayjs(date)
  const dateRange = [dayjs(), dayjs()] // [startDate, endDate]

  switch (type) {
    case TimeGranularity['1MINS']:
      // 结束时间 = 基准时间 - (pageNumber - 1) * pageSize 分钟
      dateRange[1] = baseDate.subtract((page.pageNumber - 1) * page.pageSize, 'minute')
      // 开始时间 = 结束时间 - pageSize 分钟
      dateRange[0] = dateRange[1].subtract(page.pageSize, 'minute')
      break
    case TimeGranularity['5MINS']:
      dateRange[1] = baseDate.subtract((page.pageNumber - 1) * page.pageSize * 5, 'minute')
      dateRange[0] = dateRange[1].subtract(page.pageSize * 5, 'minute')
      break
    case TimeGranularity['30MINS']:
      dateRange[1] = baseDate.subtract((page.pageNumber - 1) * page.pageSize * 30, 'minute')
      dateRange[0] = dateRange[1].subtract(page.pageSize * 30, 'minute')
      break
    case TimeGranularity.DAILY:
      dateRange[1] = baseDate.subtract((page.pageNumber - 1) * page.pageSize, 'day')
      dateRange[0] = dateRange[1].subtract(page.pageSize, 'day')
      break
    case TimeGranularity.WEEKLY:
      dateRange[1] = baseDate.subtract((page.pageNumber - 1) * page.pageSize, 'week')
      dateRange[0] = dateRange[1].subtract(page.pageSize, 'week')
      break
    case TimeGranularity.MONTHLY:
      dateRange[1] = baseDate.subtract((page.pageNumber - 1) * page.pageSize, 'month')
      dateRange[0] = dateRange[1].subtract(page.pageSize, 'month')
      break
  }

  return dateRange
}
