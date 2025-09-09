import { ref, watch } from 'vue'

export function useStoreRef<T>(key: string, value: T) {
  const state = ref<T>(value)

  watch(state, (value) => {
    value !== undefined
      ? uni.setStorageSync(key, value)
      : uni.removeStorageSync(key)
  }, { immediate: true })

  return state
}
