<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { useUserStore } from './store'

const { privacySettings, accessTokenExpired, refreshAccessToken } = useUserStore()

onLaunch(async () => {
  uni.getPrivacySetting({
    success: (res) => {
      console.log('getPrivacySetting success', res)
      privacySettings.value = {
        needAuthorization: res.needAuthorization,
        privacyContractName: res.privacyContractName,
      }
    },
    fail: (err) => {
      console.log('getPrivacySetting fail', err)
    },
  })

  if (accessTokenExpired.value)
    await refreshAccessToken()
})
onShow(() => {
})
onHide(() => {
})
</script>

<style lang="scss">
@import './styles/global.scss';
</style>
