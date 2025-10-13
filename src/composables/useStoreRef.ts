import { ref, watch } from 'vue'

export function useStoreRef<T>(key: string, defaultValue: T) {
  const state = ref<T>(uni.getStorageSync(key) || defaultValue)

  watch(state, (value) => {
    value !== undefined
      ? uni.setStorageSync(key, value)
      : uni.removeStorageSync(key)
  }, { immediate: true, deep: true })

  return state
}
