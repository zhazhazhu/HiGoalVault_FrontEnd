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
    success(res) {
      if (res.statusCode === 403 || res.statusCode === 401) {
        userStore.logout()
      }
    },
    fail(err) {
      console.log('request err', err)
    },
  })
}
