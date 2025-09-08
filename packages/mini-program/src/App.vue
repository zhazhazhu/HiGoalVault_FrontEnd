<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})
onShow(async () => {
  const res = await uni.login()
  const { data } = await uni.request({
    url: `http://localhost:3000/login?code=${res.code}`,
  })
  console.log(data)
})
onHide(() => {
  console.log('App Hide')
})
</script>

<style></style>
