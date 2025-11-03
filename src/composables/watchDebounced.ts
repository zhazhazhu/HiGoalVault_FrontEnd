import type { WatchOptions, WatchSource } from 'vue'
import { watch } from 'vue'

export function watchDebounced<T>(
  source: WatchSource<T> | WatchSource<T>[],
  callback: (newValue: T, oldValue: T) => void,
  options: WatchOptions & { delay?: number } = {},
) {
  let timer: ReturnType<typeof setTimeout> | null = null

  const stop = watch(
    source as any,
    (newValue, oldValue) => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      const delay = options.delay ?? 200
      timer = setTimeout(() => {
        callback(newValue as T, oldValue as T)
      }, delay)
    },
    options,
  )

  return () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    stop()
  }
}
