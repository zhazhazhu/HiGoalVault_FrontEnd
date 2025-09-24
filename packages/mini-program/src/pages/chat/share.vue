<script lang='ts' setup>
import { onLoad } from '@dcloudio/uni-app'
import { api } from '@/api'

async function getData(id: string) {
  api.getShareMessageList(id)
}
onLoad((options) => {
  getData(options?.id)
})
</script>

<template>
  <view>
    <Navbar title="分享" enable-left-slot>
      <template #left>
        <wd-icon name="home" size="22px" />
      </template>
    </Navbar>
  </view>
</template>

<style lang='css' scoped></style>
