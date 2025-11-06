import { getCurrentInstance, ref } from 'vue'

export function useIntersectionObserver(selector: string) {
  const instance = getCurrentInstance()
  const observer = uni.createIntersectionObserver(instance?.proxy)
  const visible = ref(false)
  observer.relativeToViewport().observe(selector, (res) => {
    if (res.intersectionRatio > 0) {
      console.log('visible', selector)
      visible.value = true
    }
  })
  return visible
}
