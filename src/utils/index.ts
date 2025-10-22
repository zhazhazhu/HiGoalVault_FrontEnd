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
  if (!markdown)
    return ''
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

/**
 * 将 Markdown 格式的字符串转换为纯文本。
 * @param markdownText 包含 Markdown 标记的字符串
 * @returns 移除所有标记的纯文本字符串
 */
export function markdownToPlainText(markdownText: string): string {
  if (!markdownText) {
    return ''
  }

  let plainText = markdownText

  // 1. 移除代码块 (```...) - 这是最需要注意的，防止内部代码被当作标记处理
  // 使用非贪婪匹配 (.*?)，处理多行
  plainText = plainText.replace(/```[\s\S]*?```/g, '')

  // 2. 移除行内代码 (`...`)
  plainText = plainText.replace(/`([^`]+)`/g, '$1')

  // 3. 移除链接和图片 ([文字](链接))
  // 只保留方括号内的文字 ($1)
  plainText = plainText.replace(/!?\[(.*?)\]\(.*?\)/g, '$1')

  // 4. 移除标题 (#, ##, ...)
  plainText = plainText.replace(/^#+\s/gm, '')

  // 5. 移除粗体/斜体/删除线标记 (*, _, ~)
  // **文字**, *文字*, __文字__, ~~文字~~
  plainText = plainText.replace(/(\*\*|__)(.*?)\1/g, '$2') // 粗体
  plainText = plainText.replace(/(\*|_)(.*?)\1/g, '$2') // 斜体
  plainText = plainText.replace(/~~(.*?)~~/g, '$1') // 删除线

  // 6. 移除列表标记 (*, -, + 和数字. )
  // 注意：需要移除行首的标记和空格
  plainText = plainText.replace(/^\s*[*+-]\s+/gm, '') // 无序列表
  plainText = plainText.replace(/^\s*\d+\.\s+/gm, '') // 有序列表

  // 7. 移除块引用标记 (>)
  plainText = plainText.replace(/^\s*>\s?/gm, '')

  // 8. 移除水平线 (---, ***, ===)
  plainText = plainText.replace(/^(-{3,}|\*{3,}|={3,})$/gm, '')

  // 9. 移除多余的空行和首尾空格
  // 将连续的换行符替换为一个换行符
  plainText = plainText.replace(/(\r\n|\r|\n){2,}/g, '\n')
  plainText = plainText.trim()

  return plainText
}

export function formatCommentOrThumbUpCount(count?: number) {
  if (!count) {
    return '0'
  }
  else if (count < 100) {
    return count.toString()
  }
  else if (count < 200) {
    return '100+'
  }
  else if (count < 1000) {
    return '200+'
  }
  else if (count > 1000) {
    return '1000+'
  }
}

export type Awaitable<T> = T | Promise<T>

export function useJsonParse<T>(val: string): T | null | undefined {
  try {
    return JSON.parse(val) as T
  }
  catch (e) {
    console.log('parse json error cause', e)
  }
}

/**
 *
 * @param seconds 接受一个秒数
 * @returns 返回时分秒,如果秒数小于60,则返回秒数,如果秒数大于60并且小于3600,则返回分秒,如果秒数大于3600,则返回时分秒
 */
export function formatSeconds(seconds: number) {
  // 取整秒数
  const totalSeconds = Math.floor(seconds)

  // 小于60秒,直接返回秒数
  if (totalSeconds < 60) {
    return `${totalSeconds}秒`
  }

  // 计算分钟和秒数
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60

  // 小于3600秒(60分钟),返回分秒
  if (totalSeconds < 3600) {
    return `${minutes}分${remainingSeconds}秒`
  }

  // 大于等于3600秒,返回时分秒
  const hours = Math.floor(totalSeconds / 3600)
  const remainingMinutes = Math.floor((totalSeconds % 3600) / 60)
  const finalSeconds = totalSeconds % 60

  return `${hours}小时${remainingMinutes}分${finalSeconds}秒`
}
