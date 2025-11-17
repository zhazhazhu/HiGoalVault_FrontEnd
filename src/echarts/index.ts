import type { MaybeRefOrGetter } from 'vue'
import type { ChatMessageStockData, GetFinanceDataRequest } from '@/api'
import dayjs from 'dayjs'
import { computed, reactive, ref, toValue, watch } from 'vue'
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
  preview: boolean
}

function isMinutesGranularity(type: TimeGranularity) {
  return type === TimeGranularity['1MINS'] || type === TimeGranularity['5MINS'] || type === TimeGranularity['30MINS'] || type === TimeGranularity['1HOUR']
}

export function useStockChart(options: UseStockChartOptions) {
  const stockInfo = ref(getStockInfo(options.stockData))

  const store = computed<StockChartStore>(() => {
    const stockChartData = toValue(options.stockData).map((item) => {
      return [item.open, item.close, item.low, item.high]
    })
    return {
      categoryData: toValue(options.stockData).map((item) => {
        return dayjs(isMinutesGranularity(toValue(options.timeGranularity)) ? item.trade_time : item.trade_date).format('YYYY-MM-DD HH:mm:ss')
      }),
      stockChartData,
      originalStockChartData: toValue(options.stockData),
      ma5: calculateMA(5, stockChartData),
      ma10: calculateMA(10, stockChartData),
      ma20: calculateMA(20, stockChartData),
      ma30: calculateMA(30, stockChartData),
    }
  })

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
      const newPushStockData = newStockData.slice(oldStockData.length)
      const stockChartData = newPushStockData.map((item) => {
        return [item.open, item.close, item.low, item.high]
      })
      const allStockChartData = newStockData.map((item) => {
        return [item.open, item.close, item.low, item.high]
      })
      const categoryData = newPushStockData.map((item) => {
        return dayjs(isMinutesGranularity(toValue(options.timeGranularity)) ? item.trade_time : item.trade_date).format('YYYY-MM-DD HH:mm:ss')
      })
      config.value.xAxis[0].data.unshift(...categoryData)
      if (toValue(options.timeGranularity) === '1MINS') {
        config.value.series[0].data.unshift(...(stockChartData.map(item => item[1])) as any)
      }
      else {
        config.value.series[0].data.unshift(...(stockChartData as any))
        config.value.series[1].data = calculateMA(5, allStockChartData)
        config.value.series[2].data = calculateMA(10, allStockChartData)
        config.value.series[3].data = calculateMA(20, allStockChartData)
        config.value.series[4].data = calculateMA(30, allStockChartData)
      }

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
  const [page, reset] = useResetRef<GetFinanceDataRequest>({
    pageNumber: 1,
    pageSize: 200,
    order: 'desc',
    startDateTime: dayjs('1970-01-01').format('YYYY-MM-DD HH:mm:ss'),
    endDateTime: dayjs(options.date).format('YYYY-MM-DD HH:mm:ss'),
    transCode: '',
    timeGranularity: toValue(options.type),
  })

  async function load(code: string) {
    if (!code)
      return { data: [], total: 0 } as const
    page.value.transCode = code
    page.value.timeGranularity = toValue(options.type)
    page.value.sort = isMinutesGranularity(toValue(options.type)) ? 'trade_time' : 'trade_date'
    const res = await api.getFinanceData(page.value)
    const data: ChatMessageStockData[] = Array.isArray(res.result?.records) ? res.result.records : []
    page.value.pageNumber!++

    return { data: data.reverse(), total: res.result.total || 0 } as const
  }

  return {
    load,
    reset,
  }
}

export interface UsePollingStockDataOptions {
  timeGranularity?: MaybeRefOrGetter<TimeGranularity>
  interval?: number
  code?: MaybeRefOrGetter<string>
}

const inlineDefaultOptions = {
  timeGranularity: TimeGranularity['5MINS'],
  interval: 3 * 1000,
} as const

export function usePollingStockDataService(options?: UsePollingStockDataOptions) {
  const opts = { ...inlineDefaultOptions, ...options }
  let timer: NodeJS.Timeout | null = null
  const config = reactive({
    timeRange: [dayjs(), dayjs()],
  })
  const data = ref<ChatMessageStockData[]>([])
  function updateDateRange() {
    config.timeRange = [dayjs(), dayjs()]
    switch (opts.timeGranularity) {
      case TimeGranularity['1MINS']:
        config.timeRange[0] = dayjs().subtract(1, 'minute')
        break
      case TimeGranularity['5MINS']:
        config.timeRange[0] = dayjs().subtract(5, 'minute')
        break
      case TimeGranularity['30MINS']:
        config.timeRange[0] = dayjs().subtract(30, 'minute')
        break
      case TimeGranularity.DAILY:
        config.timeRange[0] = dayjs().subtract(1, 'day')
        break
      case TimeGranularity.WEEKLY:
        config.timeRange[0] = dayjs().subtract(1, 'week')
        break
      case TimeGranularity.MONTHLY:
        config.timeRange[0] = dayjs().subtract(1, 'month')
        break
      case TimeGranularity.YEAR:
        config.timeRange[0] = dayjs().subtract(1, 'year')
        break
    }
  }

  function startPolling() {
    const symbol = toValue(opts.code)
    if (!symbol)
      return
    if (timer)
      clearInterval(timer)
    timer = setInterval(() => {
      updateDateRange()
      fetchData(symbol)
    }, opts.interval)
  }

  async function fetchData(symbol: string) {
    const res = await api.getFinanceData({
      startDateTime: config.timeRange[0].format('YYYY-MM-DD HH:mm:ss'),
      endDateTime: config.timeRange[1].format('YYYY-MM-DD HH:mm:ss'),
      transCode: symbol,
      timeGranularity: toValue(opts.timeGranularity),
    })
    if (res.code === 200) {
      data.value = res.result?.records || []
    }
  }

  function stopPolling() {
    if (!timer)
      return
    clearInterval(timer)
    timer = null
  }

  function onUpdateData(callback: (data: ChatMessageStockData[]) => void) {
    callback(data.value)
  }

  return {
    startPolling,
    stopPolling,
    onUpdateData,
  }
}
