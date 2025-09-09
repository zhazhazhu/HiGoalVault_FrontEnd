import type { LoginResult } from '@higoal/api'
import { ref, watch } from 'vue'

const TOKEN_KEY = 'token'

export type Token = LoginResult

export function useToken() {
  const token = ref<Token | null>(uni.getStorageSync(TOKEN_KEY) || null)

  watch(token, (token) => {
    if (!token) {
      uni.removeStorageSync(TOKEN_KEY)
      return
    }
    uni.setStorageSync(TOKEN_KEY, token)
  })

  return token
}
