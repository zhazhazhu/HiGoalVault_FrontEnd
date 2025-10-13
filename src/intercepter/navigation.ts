import { useUserStore } from '@/store'

const navigateMethods = ['navigateTo', 'redirectTo', 'navigateBack', 'switchTab']
export function navigationInterceptor() {
  const userStore = useUserStore()

  navigateMethods.forEach((method) => {
    uni.addInterceptor(method, {
      invoke: () => {
        if (!userStore.isLogin) {
          uni.showToast({
            title: '请先登录',
            icon: 'none',
          })
        }
        return userStore.isLogin
      },
    })
  })
}
