<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { watch } from 'vue'
import { useUserStore } from './store/user'

const userStore = useUserStore()

watch(() => userStore.accessToken, async (val) => {
  if (val) {
    await userStore.getUserInfo()
  }
})

onLaunch(async () => {
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

  if (userStore.accessTokenExpired)
    await userStore.refreshAccessToken()
})
onShow(() => {
})
onHide(() => {
})
</script>

<style lang="scss">
@import './styles/global.scss';
</style>
