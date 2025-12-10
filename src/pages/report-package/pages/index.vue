<script lang='ts' setup>
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { api } from '@/api'

const isRefreshing = ref(false)

function getData() {
  api.getComplaintList({ parentCode: 0 })
}
function gotoBack() {
  uni.navigateBack()
}

onShow(() => {
  getData()
})
</script>

<template>
  <view class="h-screen">
    <Navbar title="消息通知">
      <template #left>
        <view class="flex items-center gap-20rpx" @click="gotoBack">
          <view class="i-material-symbols-arrow-back-ios-new-rounded text-44rpx" />
        </view>
      </template>
    </Navbar>

    <Container>
      <scroll-view
        scroll-into-view-alignment="end"
        enhanced
        :scroll-y="true"
        :show-scrollbar="false"
        class="h-[calc(100vh-100px)] bg-white"
        :lower-threshold="50"
        :refresher-enabled="true"
        :refresher-triggered="isRefreshing"
      />
    </Container>
  </view>
</template>

<style lang='css' scoped></style>
