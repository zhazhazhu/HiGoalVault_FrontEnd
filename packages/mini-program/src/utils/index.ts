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
