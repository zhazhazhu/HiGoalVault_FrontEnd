import { useGlobalStore, useUserStore } from '@/store'

export function requestInterceptor() {
  const userStore = useUserStore()
  const globalStore = useGlobalStore()

  uni.addInterceptor('request', {
    invoke: (options) => {
      options.header = {
        ...options.header,
        AccessToken: `${userStore.accessToken}`,
      }
    },
    success(res) {
      if (res.statusCode === 403 || res.statusCode === 401) {
        uni.showToast({
          title: '登录状态已过期，即将跳转到首页',
          icon: 'none',
        })
        userStore.logout()
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/index/index' }).then(() => {
            globalStore.showLoginPopup = true
          })
        }, 2000)
      }
    },
    fail(err) {
      console.log('request err', err)
    },
  })
}
