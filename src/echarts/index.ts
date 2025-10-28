import type { EChartsOption } from 'echarts'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { ChatMessageStock, ChatMessageStockData, ChatMessageStockMetadata, Page } from '@/api'
import dayjs from 'dayjs'
import { computed, ref, toValue } from 'vue'
import { api, TimeGranularity } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { calculateMA, DateFormat } from '@/utils/stock'
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
  totalVolume: number // 总成交量
  openInterest: number // 持仓量
  high: number // 最高价
  low: number // 最低价
  open: number // 开盘价
}

export interface StockChartStore {
  data: ComputedRef<{
    stockInfo: StockInfo | null
    categoryData: string[]
    stockChartData: number[][]
    ma5: Array<number | null>
    ma10: Array<number | null>
    ma20: Array<number | null>
    ma30: Array<number | null>
  }>
  getStockData: (index: number) => StockData
}

export function useStockChart(stockData: MaybeRefOrGetter<ChatMessageStockData[]>, metadata: ChatMessageStockMetadata) {
  const code = metadata.symbol[0]
  const stockInfo = computed(() => getStockInfo(stockData, metadata))
  const categoryData = computed(() => {
    return toValue(stockData).map((item) => {
      // 使用完整日期供 xAxis 做按月间隔与自定义格式化
      return dayjs(item.trade_date || '').format('YYYY-MM-DD')
    })
  })
  const stockChartData = computed(() => {
    return toValue(stockData).map((item) => {
      return [item.open, item.close, item.low, item.high]
    })
  })
  const ma5 = computed(() => {
    return calculateMA(5, stockChartData.value)
  })
  const ma10 = computed(() => {
    return calculateMA(10, stockChartData.value)
  })
  const ma20 = computed(() => {
    return calculateMA(20, stockChartData.value)
  })
  const ma30 = computed(() => {
    return calculateMA(30, stockChartData.value)
  })

  function getStockData(index: number): StockData {
    const original = toValue(stockData)[index]

    return {
      ...original,
      date: dayjs(original.trade_date || '').format(DateFormat.DAY),
      ma5: ma5.value[index],
      ma10: ma10.value[index],
      ma20: ma20.value[index],
      ma30: ma30.value[index],
    }
  }

  const store = {
    data: computed(() => {
      return {
        stockInfo: stockInfo.value || null,
        categoryData: categoryData.value,
        stockChartData: stockChartData.value,
        ma5: ma5.value,
        ma10: ma10.value,
        ma20: ma20.value,
        ma30: ma30.value,
      }
    }),
    getStockData,
  }

  const config = computed<EChartsOption>(() => generateStockChartConfig(store))

  return {
    store,
    config,
    code,
  }
}

function getStockInfo(stockChartData: MaybeRefOrGetter<ChatMessageStockData[]>, metadata: ChatMessageStockMetadata): StockInfo | null {
  const stockData = toValue(stockChartData)
  const latestData = stockData[stockData.length - 1]
  const previousData = stockData[stockData.length - 2]

  if (!latestData || !previousData) {
    return null
  }

  return {
    code: metadata.symbol[0],
    currentPrice: Number(latestData.close.toFixed(2)),
    change: Number((latestData.close - previousData.close).toFixed(2)),
    changePercent: Number((latestData.close - previousData.close) / previousData.close),
    isUp: latestData.close > previousData.close,
    totalVolume: Number(stockData.reduce((sum, item) => sum + item.vol, 0).toFixed(2)),
    openInterest: latestData.oi || 0,
    high: Number(latestData.high.toFixed(2)),
    low: Number(latestData.low.toFixed(2)),
    open: Number(latestData.open.toFixed(2)),
  }
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
