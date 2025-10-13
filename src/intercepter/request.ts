import { useUserStore } from '@/store'

export function requestInterceptor() {
  const userStore = useUserStore()

  uni.addInterceptor('request', {
    invoke: (options) => {
      options.header = {
        ...options.header,
        AccessToken: `${userStore.accessToken}`,
      }
    },
  })
}
