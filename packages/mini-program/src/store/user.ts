import type { LoginResult, UserInfo } from '@higoal/api'
import { defineStore } from 'pinia'
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

export const useUserStore = defineStore('user', {
  state: () => ({
    auth: useStoreRef<Auth | null>('AUTH', null),
    privacySettings: useStoreRef<PrivacySetting | null>('PRIVACY_SETTINGS', null),
    userInfo: useStoreRef<UserInfo | null>('USER_INFO', null),
  }),
  getters: {
    isLogin: state => !!state.auth,
    accessToken: state => state.auth?.accessToken,
    refreshToken: state => state.auth?.refreshToken,
    accessTokenExpired: state => isTokenExpired(state.auth?.accessTokenExpireDateTime),
    refreshTokenExpired: state => isTokenExpired(state.auth?.refreshTokenExpireDateTime),
  },
  actions: {
    async refreshAccessToken() {
      if (!this.refreshToken || !this.refreshTokenExpired)
        return

      const res = await api.refreshToken(this.refreshToken)
      if (res.code === 200) {
        this.auth = {
          ...res.result,
          accessTokenExpireDateTime: getTokenExpireDateTime(res.result.accessTokenExpireTime),
          refreshTokenExpireDateTime: getTokenExpireDateTime(res.result.refreshTokenExpireTime),
        }
      }
      else {
        this.auth = null
      }
    },
  },
})
