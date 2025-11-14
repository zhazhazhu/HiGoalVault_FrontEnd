import { useChatStore, useGlobalStore, useUserStore } from '@/store'

const navigateMethods = ['navigateTo', 'redirectTo', 'navigateBack', 'switchTab', 'reLaunch']
export function navigationInterceptor() {
  const userStore = useUserStore()
  const globalStore = useGlobalStore()
  const chatStore = useChatStore()

  navigateMethods.forEach((method) => {
    uni.addInterceptor(method, {
      invoke: () => {
        if (!userStore.isLogin) {
          globalStore.showLoginPopup = true
        }
        if (chatStore.isReplying) {
          uni.showToast({
            title: '回答生成中，请稍后再试',
            icon: 'none',
          })
          chatStore.showSidebar = false
          return false
        }
        return userStore.isLogin
      },
    })
  })
}
