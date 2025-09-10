import type { LoginResult } from '@higoal/api'
import { computed } from 'vue'
import { api } from '@/api'
import { useStoreRef } from '@/composables'
import { getTokenExpireDateTime, isTokenExpired } from '@/utils'

export type Auth = LoginResult & {
  accessTokenExpireDateTime: number
  refreshTokenExpireDateTime: number
}

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
  const accessTokenExpired = computed(() => isTokenExpired(auth.value?.accessTokenExpireDateTime))
  const refreshTokenExpired = computed(() => isTokenExpired(auth.value?.refreshTokenExpireDateTime))

  // action
  async function refreshAccessToken() {
    if (!refreshToken.value || !refreshTokenExpired.value)
      return

    const res = await api.refreshToken(refreshToken.value)
    if (res.code === 200) {
      auth.value = {
        ...res.result,
        accessTokenExpireDateTime: getTokenExpireDateTime(res.result.accessTokenExpireTime),
        refreshTokenExpireDateTime: getTokenExpireDateTime(res.result.refreshTokenExpireTime),
      }
    }
    else {
      auth.value = null
    }
  }

  return {
    auth,
    isLogin,
    accessToken,
    refreshToken,
    needAuthorization,
    privacySettings,
    accessTokenExpired,
    refreshTokenExpired,
    refreshAccessToken,
  }
}
