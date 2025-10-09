import dayjs from 'dayjs'

export enum DateRange {
  YEAR = 10,
  MONTH = 12,
  DAY = 6,
}

export enum DateGap {
  YEAR = 10,
  MONTH = 7,
  DAY = 30,
}

export enum DateCategoryType {
  YEAR = 'year',
  MONTH = 'month',
  DAY = 'day',
}

export enum DateFormat {
  YEAR = 'YYYY',
  MONTH = 'YYYY-MM',
  DAY = 'MM-DD',
}

export function generateDateCategory(date: string, type: DateCategoryType) {
  switch (type) {
    case DateCategoryType.YEAR:
      return Array.from({ length: DateRange.YEAR }).map((_, i) => {
        return dayjs(date).subtract(DateGap.YEAR * i, 'year').format(DateFormat.YEAR)
      }).reverse()
    case DateCategoryType.MONTH:
      return Array.from({ length: DateRange.MONTH }).map((_, i) => {
        return dayjs(date).subtract(DateGap.MONTH * i, 'month').format(DateFormat.MONTH)
      }).reverse()
    case DateCategoryType.DAY:
      return Array.from({ length: DateRange.DAY }).map((_, i) => {
        return dayjs(date).subtract(DateGap.DAY * i, 'day').format(DateFormat.DAY)
      }).reverse()
  }
}

/**
 * 计算移动平均线
 * @param dayCount 移动平均线的天数
 * @param data 股票数据，每个元素为 [日期, 收盘价]
 * @returns 移动平均线数据，每个元素为 [日期, 移动平均线值]
 */
export function calculateMA(dayCount: number, data: number[][]) {
  const result: Array<number | string> = []
  for (let i = 0, len = data.length; i < len; i++) {
    if (i < dayCount) {
      result.push('-')
      continue
    }
    let sum = 0
    for (let j = 0; j < dayCount; j++) {
      sum += +data[i - j][1]
    }
    result.push(sum / dayCount)
  }
  return result
}
