import { ref } from 'vue'

const TYPING_SPEED = 5

export function useCharQueue(speed?: number) {
  const timer = ref<NodeJS.Timeout | null>(null)
  const isTyping = ref(false)
  const charQueue = ref<string[]>([])
  let callback: (char: string) => void

  function pushQueue(message: string) {
    charQueue.value.push(...message.split(''))
    isTyping.value = true
    if (timer.value) {
      clearInterval(timer.value)
    }
    timer.value = setInterval(() => {
      if (charQueue.value.length > 0) {
        const char = charQueue.value.shift()
        if (char) {
          callback && callback(char)
        }
      }
      else {
        timer.value && clearInterval(timer.value)
        timer.value = null
        isTyping.value = false
      }
    }, speed || TYPING_SPEED)
  }
  function pushFullQueue() {
    timer.value && clearInterval(timer.value)
    timer.value = null
    isTyping.value = false
    callback && callback(charQueue.value.join(''))
    charQueue.value = []
  }
  function onTyping(cb: (char: string) => void) {
    callback = cb
  }

  return {
    timer,
    isTyping,
    charQueue,
    pushQueue,
    onTyping,
    pushFullQueue,
  }
}
