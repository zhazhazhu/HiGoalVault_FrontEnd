import { useUserStore } from '@/store'

export function requestInterceptor() {
  const { accessToken } = useUserStore()

  uni.addInterceptor('request', {
    invoke: (options) => {
      options.header = {
        ...options.header,
        AccessToken: `${accessToken.value}`,
      }
    },
  })
}
