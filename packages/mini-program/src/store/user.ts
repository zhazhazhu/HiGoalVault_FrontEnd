import type { LoginResult } from '@higoal/api'
import { computed } from 'vue'
import { useStoreRef } from '@/composables'

export type Auth = LoginResult

export interface PrivacySetting {
  needAuthorization: boolean
  privacyContractName: string
}

export function useUserStore() {
  // state
  const auth = useStoreRef<Auth | null>('AUTH', null)
  const needAuthorization = useStoreRef<boolean>('NEED_AUTHORIZATION', false)
  const privacySettings = useStoreRef<PrivacySetting>('PRIVACY_SETTINGS', {
    needAuthorization: false,
    privacyContractName: '',
  })

  // getter
  const isLogin = computed(() => !!auth.value)
  const accessToken = computed(() => auth.value?.accessToken)
  const refreshToken = computed(() => auth.value?.refreshToken)

  return {
    auth,
    isLogin,
    accessToken,
    refreshToken,
    needAuthorization,
    privacySettings,
  }
}
