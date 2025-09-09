import type { LoginResult } from '@higoal/api'
import { computed } from 'vue'
import { useStoreRef } from '@/composables'

export type Auth = LoginResult

export function useUserStore() {
  // state
  const auth = useStoreRef<Auth | null>('AUTH', null)

  // getter
  const isLogin = computed(() => !!auth.value)
  const accessToken = computed(() => auth.value?.accessToken)
  const refreshToken = computed(() => auth.value?.refreshToken)

  return {
    auth,
    isLogin,
    accessToken,
    refreshToken,
  }
}
