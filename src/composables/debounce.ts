/**
 * 防抖函数 - 在延迟时间内只执行最后一次调用
 * @param func 要防抖的函数
 * @param wait 延迟时间（毫秒）
 * @param immediate 是否立即执行第一次调用
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false,
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let result: any

  return (function (this: any, ...args: Parameters<T>) {
    const callNow = immediate && !timeout

    const later = () => {
      timeout = null
      if (!immediate) {
        result = func.apply(this, args)
      }
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)

    if (callNow) {
      result = func.apply(this, args)
    }

    return result
  }) as T
}

/**
 * 节流函数 - 在指定时间间隔内最多执行一次
 * @param func 要节流的函数
 * @param wait 时间间隔（毫秒）
 * @param options 配置选项
 * @param options.leading 是否在开始时执行
 * @param options.trailing 是否在结束时执行
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: {
    leading?: boolean // 是否在开始时执行
    trailing?: boolean // 是否在结束时执行
  } = {},
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let previous = 0
  let result: any

  const { leading = true, trailing = true } = options

  return (function (this: any, ...args: Parameters<T>) {
    const now = Date.now()

    // 如果是第一次调用且不需要立即执行，则设置 previous
    if (!previous && !leading) {
      previous = now
    }

    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(this, args)
    }
    else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = leading ? Date.now() : 0
        timeout = null
        result = func.apply(this, args)
      }, remaining)
    }

    return result
  }) as T
}

/**
 * 取消防抖函数
 * @param debouncedFunc 防抖函数
 */
export function cancelDebounce(debouncedFunc: any) {
  if (debouncedFunc && typeof debouncedFunc.cancel === 'function') {
    debouncedFunc.cancel()
  }
}

/**
 * 带取消功能的防抖函数
 * @param func 要防抖的函数
 * @param wait 延迟时间（毫秒）
 * @param immediate 是否立即执行第一次调用
 * @returns 带取消功能的防抖函数
 */
export function debounceCancelable<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false,
) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let result: any

  const debounced = (function (this: any, ...args: Parameters<T>) {
    const callNow = immediate && !timeout

    const later = () => {
      timeout = null
      if (!immediate) {
        result = func.apply(this, args)
      }
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)

    if (callNow) {
      result = func.apply(this, args)
    }

    return result
  }) as T & { cancel: () => void, flush: () => any }

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  debounced.flush = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
      return func()
    }
  }

  return debounced
}
