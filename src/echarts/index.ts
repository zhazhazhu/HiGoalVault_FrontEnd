import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { ChatMessageStock, ChatMessageStockData, ChatMessageStockMetadata } from '@/api'
import dayjs from 'dayjs'
import { computed, toValue } from 'vue'
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
  name: string // 股票名称
  code: string // 股票代码
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

export function useStockChart(stockData: MaybeRefOrGetter<[ChatMessageStock]>) {
  const [stock] = toValue(stockData)
  const data = computed(() => stock.data)
  const stockInfo = getStockInfo(data, stock.metadata)
  const categoryData = computed(() => {
    return data.value.map((item) => {
      return dayjs(item.trade_date || '').format(DateFormat.DAY)
    })
  })
  const stockChartData = computed(() => {
    return data.value.map((item) => {
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
    const original = data.value[index]

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
        stockInfo: stockInfo?.value || null,
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

  const config = generateStockChartConfig(store)

  return {
    store,
    config,
  }
}

function getStockInfo(stockChartData: MaybeRefOrGetter<ChatMessageStockData[]>, metadata: ChatMessageStockMetadata) {
  const stockData = toValue(stockChartData)
  const latestData = stockData[stockData.length - 1]
  const previousData = stockData[stockData.length - 2]

  if (!latestData || !previousData) {
    return null
  }

  return computed<StockInfo>(() => ({
    name: metadata.symbol?.[0],
    code: metadata.symbol?.[1],
    currentPrice: Number(latestData.close.toFixed(2)),
    change: Number((latestData.close - previousData.close).toFixed(2)),
    changePercent: Number((latestData.close - previousData.close) / previousData.close),
    isUp: latestData.close > previousData.close,
    totalVolume: Number(stockData.reduce((sum, item) => sum + item.vol, 0).toFixed(2)),
    openInterest: latestData.oi || 0,
    high: Number(latestData.high.toFixed(2)),
    low: Number(latestData.low.toFixed(2)),
    open: Number(latestData.open.toFixed(2)),
  }))
}
