<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { watch } from 'vue'
import { useGlobalStore, useUserStore } from './store'
import { useWebsocketStore } from './store/websocket'

const userStore = useUserStore()
const globalStore = useGlobalStore()
const websocket = useWebsocketStore()

watch(() => userStore.accessToken, async (val) => {
  if (val) {
    await userStore.getUserInfo()
  }
})

globalStore.syncStatusBarHeight()
globalStore.syncKeyboardHeight()
userStore.getUserInfo()

uni.getPrivacySetting({
  success: (res) => {
    console.log('getPrivacySetting success', res)
    userStore.privacySettings = {
      needAuthorization: res.needAuthorization,
      privacyContractName: res.privacyContractName,
    }
  },
  fail: (err) => {
    console.log('getPrivacySetting fail', err)
  },
})

onLaunch(async () => {
  if (userStore.accessTokenExpired)
    await userStore.refreshAccessToken()
})
onShow(() => {
  if (userStore.isLogin) {
    websocket.connectWebSocket()
    uni.onNetworkStatusChange((res) => {
      console.log('network status change', res)
      websocket.connectWebSocket()
    })
  }
})
</script>

<style lang="scss">
@import './styles/global.scss';
</style>
