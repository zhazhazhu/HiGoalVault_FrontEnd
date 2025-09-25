<script lang='ts' setup>
import { useUserStore } from '@/store'

const user = useUserStore()

function gotoHome() {
  uni.redirectTo({ url: '/pages/index/index' })
}
function onLogout() {
  user.logout()
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<template>
  <view>
    <Navbar enable-left-slot>
      <template #left>
        <wd-icon name="home" size="22px" @click="gotoHome" />
      </template>
    </Navbar>

    <Container custom-class="px-32rpx flex flex-col gap-32rpx">
      <view class="flex items-center flex-col">
        <wd-img round mode="aspectFill" :src="user.userInfo?.face" width="200rpx" height="200rpx" />
        <view class="color-#333 text-32rpx font-bold mt-20rpx">
          {{ user.userInfo?.username }}
        </view>
      </view>

      <view class="flex flex-col py-60rpx px-18px rounded-20rpx bg-white gap-20rpx">
        <wd-cell title="联系我们" is-link />
        <wd-cell title="隐私协议" is-link />
        <wd-cell title="投诉" is-link />
      </view>

      <view>
        <wd-button type="primary" block :round="false" size="large" plain @click="onLogout">
          退出登录
        </wd-button>
      </view>
    </Container>
  </view>
</template>

<style lang='scss'></style>
