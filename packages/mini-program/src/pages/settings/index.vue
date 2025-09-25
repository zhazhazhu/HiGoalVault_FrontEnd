<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import { useMessage } from 'wot-design-uni'
import { useUserStore } from '@/store'

const user = useUserStore()
const cs = useClassesName('settings')
const message = useMessage()

function gotoHome() {
  uni.redirectTo({ url: '/pages/index/index' })
}
function onLogout() {
  message
    .confirm({
      msg: '提示',
      title: '确认退出吗?',
    })
    .then(() => {
      user.logout()
      uni.reLaunch({ url: '/pages/index/index' })
    })
    .catch(() => {
    })
}
function openPrivacyPolicy() {
  uni.openPrivacyContract({
    success: (res) => {
      console.log('openPrivacyContract success', res)
    },
    fail: (err) => {
      console.log('openPrivacyContract fail', err)
    },
  })
}
</script>

<template>
  <view>
    <wd-message-box />

    <Navbar enable-left-slot>
      <template #left>
        <wd-icon name="home" size="22px" @click="gotoHome" />
      </template>
    </Navbar>

    <Container custom-class="px-32rpx flex flex-col gap-60rpx">
      <view class="flex items-center flex-col">
        <wd-img round mode="aspectFill" :src="user.userInfo?.face" width="200rpx" height="200rpx" />
        <view class="color-#333 text-32rpx font-bold mt-20rpx">
          {{ user.userInfo?.username }}
        </view>
      </view>

      <view class="flex flex-col px-24px rounded-20rpx bg-white">
        <button open-type="contact" :class="cs.m('btn')">
          联系我们
          <view class="i-material-symbols-arrow-forward-ios-rounded color-gray-4" />
        </button>
        <button :class="cs.m('btn')" @click="openPrivacyPolicy">
          隐私协议
          <view class="i-material-symbols-arrow-forward-ios-rounded color-gray-4" />
        </button>
        <button open-type="feedback" :class="cs.m('btn')">
          投诉建议
          <view class="i-material-symbols-arrow-forward-ios-rounded color-gray-4" />
        </button>
      </view>

      <view>
        <wd-button type="primary" block :round="false" size="large" plain @click="onLogout">
          退出登录
        </wd-button>
      </view>
    </Container>
  </view>
</template>

<style lang='scss' scoped>
.hi-settings--btn {
  border-radius: 0;
  padding: 22rpx 20rpx;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  background-color: transparent;
  font-size: 26rpx;
  color: var(--hi-h2-color);
  &::after {
    display: none;
  }
  & + & {
    border-top: 1px solid #e5e5e5;
  }
}
</style>
