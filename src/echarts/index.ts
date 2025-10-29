import type { MaybeRefOrGetter } from 'vue'
import type { ChatMessageStockData } from '@/api'
import dayjs from 'dayjs'
import { computed, ref, toValue, watch } from 'vue'
import { api, TimeGranularity } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { calculateMA } from '@/utils/stock'
import { generateStockChartConfig } from './config'

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
  const stockInfo = ref(getStockInfo(options.stockData))

  const store = computed<StockChartStore>(() => {
    const stockChartData = toValue(options.stockData).map((item) => {
      return [item.open, item.close, item.low, item.high]
    })
    return {
      categoryData: toValue(options.stockData).map((item) => {
        return dayjs(item.trade_date || item.trade_time || '').format('YYYY-MM-DD HH:mm:ss')
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

  const config = ref(generateStockChartConfig(store, options))

  function resetConfigData() {
    config.value = generateStockChartConfig(store, options)
  }

  watch<ChatMessageStockData[]>(
    () => toValue(options.stockData).slice(),
    (newStockData, oldStockData) => {
      if (!stockInfo.value) {
        stockInfo.value = getStockInfo(newStockData)
      }
      // config.value = generateStockChartConfig(store, options)
      const newPushStockData = newStockData.slice(oldStockData.length)
      const stockChartData = newPushStockData.map((item) => {
        return [item.open, item.close, item.low, item.high]
      })
      const allStockChartData = newStockData.map((item) => {
        return [item.open, item.close, item.low, item.high]
      })
      const categoryData = newPushStockData.map((item) => {
        return dayjs(item.trade_date || item.trade_time || '').format('YYYY-MM-DD HH:mm:ss')
      })
      config.value.xAxis[0].data.unshift(...categoryData)
      config.value.series[0].data.unshift(...(stockChartData as any))
      config.value.series[1].data = calculateMA(5, allStockChartData)
      config.value.series[2].data = calculateMA(10, allStockChartData)
      config.value.series[3].data = calculateMA(20, allStockChartData)
      config.value.series[4].data = calculateMA(30, allStockChartData)
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
    resetConfigData,
  }
}

export function getStockInfo(stockChartData: MaybeRefOrGetter<ChatMessageStockData[]>, index?: number): ChatMessageStockData | null {
  const stockData = toValue(stockChartData)
  const data = stockData[index !== undefined ? index : stockData.length - 1]

  return data || null
}

interface UseLoadStockDataOptions {
  date: string
  type: MaybeRefOrGetter<TimeGranularity>
}

export function useLoadStockData(options: UseLoadStockDataOptions) {
  const [page, reset] = useResetRef({
    pageNumber: 1,
    pageSize: 200,
  })
  const result = ref<ChatMessageStockData[]>([])
  async function load(code: string) {
    if (!code)
      return []
    // 迭代请求，直到累计数据条数 >= pageSize 或无更多数据
    while (result.value.length < page.value.pageSize) {
      const [start, end] = updateDate(page.value, toValue(options.type), options.date)
      const res = await api.getFinanceData({
        startDateTime: start.format('YYYY-MM-DD HH:mm:ss'),
        endDateTime: end.format('YYYY-MM-DD HH:mm:ss'),
        transCode: code,
        timeGranularity: toValue(options.type),
      })

      if (res.code !== 200)
        break

      const records: ChatMessageStockData[] = Array.isArray(res.result?.records) ? res.result.records : []
      if (records.length === 0)
        break

      result.value.push(...records)
      page.value.pageNumber++
    }

    const _result = result.value.slice()
    result.value = []
    return _result
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
