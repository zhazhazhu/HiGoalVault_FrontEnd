import dayjs from 'dayjs'

const EXPIRE_TIME = 24 * 60 * 60

export function getTokenExpireDateTime(expireTime: number) {
  const now = dayjs().unix()
  return now + expireTime
}

export function isTokenExpired(expireDateTime?: number) {
  if (!expireDateTime)
    return true

  const now = dayjs().unix()
  return now > (expireDateTime - EXPIRE_TIME)
}

export function markdownToText(markdown: string) {
  return markdown.replace(/\n/g, ' ')
}

export function createUUID(len: number = 16) {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  const maxPos = chars.length
  let uuid = ''
  for (let i = 0; i < len; i++) {
    uuid += chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return uuid
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
