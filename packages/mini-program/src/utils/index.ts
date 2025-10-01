import dayjs from 'dayjs'

const EXPIRE_TIME = 24 * 60 * 60

export function getTokenExpireDateTime(expireTime: number) {
  const now = dayjs().unix()
  return now + expireTime
}

export function isTokenExpired(expireDateTime?: number, offset: number = EXPIRE_TIME) {
  if (!expireDateTime)
    return true

  const now = dayjs().unix()
  return now > (expireDateTime - offset)
}

export function markdownToText(markdown: string) {
  return markdown.replace(/\n/g, ' ')
}

export function isToday(date: string) {
  return dayjs().format('YYYY-MM-DD') === dayjs(date).format('YYYY-MM-DD')
}

export function isThisWeek(date: string) {
  return dayjs().isSame(dayjs(date), 'week')
}

export function isThisMonth(date: string) {
  return dayjs().isSame(dayjs(date), 'month')
}

export function formatDate(date: string) {
  if (isToday(date)) {
    return dayjs(date).format('HH:mm')
  }
  return dayjs(date).format('MM/DD HH:mm')
}

/**
 * @description 如果date距离现在在5分钟以内，返回刚刚
 * @description 如果date距离现在在5分钟以外并且1小时以内，返回多少分钟前
 * @description 如果date距离现在1小时以上12小时以内，返回多少小时前
 * @description 如果date距离现在12小时以上，返回 MM/DD HH:mm
 */
export function formatCommentDate(date: string) {
  const now = dayjs()
  const _date = dayjs(date)
  if (_date.isAfter(now.subtract(5, 'minute'))) {
    return '刚刚'
  }
  if (_date.isAfter(now.subtract(1, 'hour'))) {
    const diff = now.diff(_date, 'minute')
    return `${diff} 分钟前`
  }
  if (_date.isAfter(now.subtract(12, 'hour'))) {
    const diff = now.diff(_date, 'hour')
    return `${diff} 小时前`
  }
  return _date.format('MM/DD HH:mm')
}
