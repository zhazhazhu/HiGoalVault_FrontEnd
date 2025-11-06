import type { MaybeRefOrGetter } from 'vue'
import type { ChatMessageStockData } from '@/api'
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
        return dayjs(item.trade_date || item.trade_time || '').format('YYYY-MM-DD HH:mm:ss')
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
  const [page, reset] = useResetRef({
    pageNumber: 1,
    pageSize: 200,
  })
  const result = ref<ChatMessageStockData[]>([])
  // 通过 Promise.race 与外部触发的 abort 信号结合，实现“立刻中断等待”
  const ABORTED = Symbol('ABORTED')
  let triggerAbort: (() => void) | null = null

  function abort() {
    // 触发当前等待中的 abortPromise，使 load 立刻结束并返回空数组
    if (triggerAbort) {
      const fn = triggerAbort
      triggerAbort = null
      fn()
    }
  }
  async function load(code: string) {
    if (!code)
      return []
    // 迭代请求，直到累计数据条数 >= pageSize 或无更多数据
    while (result.value.length < page.value.pageSize) {
      const [start, end] = updateDate(page.value, toValue(options.type), options.date)
      // 构造一个 abortPromise，外部调用 abort() 时立即 resolve，为了不抛错用特殊标记值
      const abortPromise = new Promise<any>((resolve) => {
        triggerAbort = () => resolve(ABORTED)
      })
      const res = await Promise.race([
        api.getFinanceData({
          startDateTime: start.format('YYYY-MM-DD HH:mm:ss'),
          endDateTime: end.format('YYYY-MM-DD HH:mm:ss'),
          transCode: code,
          timeGranularity: toValue(options.type),
        }),
        abortPromise,
      ])

      // 若被中断，清理并返回空数据（避免外层出现“加载失败”的错误提示）
      if (res === ABORTED) {
        result.value = []
        triggerAbort = null
        return []
      }

      if (res.code !== 200)
        break

      const records: ChatMessageStockData[] = Array.isArray(res.result?.records) ? res.result.records : []
      if (records.length === 0)
        break
      result.value.unshift(...records)
      page.value.pageNumber++
    }

    const _result = result.value.slice()
    result.value = []
    triggerAbort = null
    return _result
  }

  return {
    load,
    reset,
    abort,
  }
}

function updateDate(page: { pageNumber: number, pageSize: number }, type: TimeGranularity, date: string) {
  const baseDate = dayjs(date)
  const now = dayjs()
  const dateRange = [now, now] // [startDate, endDate]

  switch (type) {
    case TimeGranularity['1MINS']:
      // 结束时间 = 基准时间 - (pageNumber - 1) * pageSize 分钟
      dateRange[1] = now.isSame(baseDate, 'day') ? now.subtract((page.pageNumber - 1) * page.pageSize, 'minute') : baseDate.subtract((page.pageNumber - 1) * page.pageSize, 'minute')
      // 开始时间 = 结束时间 - pageSize 分钟
      dateRange[0] = dateRange[1].subtract(page.pageSize, 'minute')
      break
    case TimeGranularity['5MINS']:
      dateRange[1] = now.isSame(baseDate, 'day') ? now.subtract((page.pageNumber - 1) * page.pageSize * 5, 'minute') : baseDate.subtract((page.pageNumber - 1) * page.pageSize * 5, 'minute')
      dateRange[0] = dateRange[1].subtract(page.pageSize * 5, 'minute')
      break
    case TimeGranularity['30MINS']:
      dateRange[1] = baseDate.subtract((page.pageNumber - 1) * page.pageSize * 30, 'minute')
      dateRange[0] = dateRange[1].subtract(page.pageSize * 30, 'minute')
      break
    case TimeGranularity['1HOUR']:
      dateRange[1] = baseDate.subtract((page.pageNumber - 1) * page.pageSize, 'hour')
      dateRange[0] = dateRange[1].subtract(page.pageSize, 'hour')
      break
    case TimeGranularity.DAILY:
      dateRange[1] = baseDate.subtract((page.pageNumber - 1) * page.pageSize, 'day')
      dateRange[0] = dateRange[1].subtract(page.pageSize, 'day')
      break
    case TimeGranularity['5DAILY']:
      dateRange[1] = baseDate.subtract((page.pageNumber - 1) * page.pageSize * 5, 'day')
      dateRange[0] = dateRange[1].subtract(page.pageSize * 5, 'day')
      break
    case TimeGranularity.WEEKLY:
      dateRange[1] = baseDate.subtract((page.pageNumber - 1) * page.pageSize, 'week')
      dateRange[0] = dateRange[1].subtract(page.pageSize, 'week')
      break
    case TimeGranularity.MONTHLY:
      dateRange[1] = baseDate.subtract((page.pageNumber - 1) * page.pageSize, 'month')
      dateRange[0] = dateRange[1].subtract(page.pageSize, 'month')
      break
    case TimeGranularity.YEAR:
      dateRange[1] = baseDate.subtract((page.pageNumber - 1) * page.pageSize, 'year')
      dateRange[0] = dateRange[1].subtract(page.pageSize, 'year')
      break
  }

  return dateRange
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
