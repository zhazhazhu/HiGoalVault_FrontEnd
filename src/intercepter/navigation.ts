import { useGlobalStore, useUserStore } from '@/store'

const navigateMethods = ['navigateTo', 'redirectTo', 'navigateBack', 'switchTab']
export function navigationInterceptor() {
  const userStore = useUserStore()
  const globalStore = useGlobalStore()

  navigateMethods.forEach((method) => {
    uni.addInterceptor(method, {
      invoke: () => {
        if (!userStore.isLogin) {
          globalStore.showLoginPopup = true
        }
        return userStore.isLogin
      },
    })
  })
}
