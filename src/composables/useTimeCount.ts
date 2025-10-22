import { ref } from 'vue'

export interface UseTimeCountOptions {
  immediate?: boolean
}

export function useTimeCount(options: UseTimeCountOptions = {}) {
  const count = ref(0)
  let timer: NodeJS.Timeout | null = null
  let changeCallback: ((count: number) => void) | null = null

  function stop() {
    timer && clearTimeout(timer)
    timer = null
  }
  function reset() {
    stop()
    count.value = 0
  }
  function pause() {
    stop()
  }
  function start() {
    if (timer) {
      return
    }
    timer = setInterval(() => {
      count.value += 1000
      changeCallback && changeCallback(count.value)
    }, 1000)
  }
  function continueFn() {
    start()
  }
  function onChange(cb: (count: number) => void) {
    changeCallback = cb
  }

  options.immediate && start()

  return {
    count,
    stop,
    reset,
    pause,
    start,
    continue: continueFn,
    onChange,
  }
}
