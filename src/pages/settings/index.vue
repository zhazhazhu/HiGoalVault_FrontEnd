<script lang='ts' setup>
import { computed, ref } from 'vue'
import { useMessage } from 'wot-design-uni'
import { api } from '@/api'
import { useClassesName } from '@/composables'
import { useUserStore } from '@/store'

const user = useUserStore()
const cs = useClassesName('settings')
const message = useMessage()
const isUpdateNickname = ref(false)
const userInfo = computed({
  get() {
    return user.userInfo
  },
  set(val) {
    user.userInfo = val
  },
})

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
function onChooseAvatar(e) {
  console.log(e)
}
async function onUpdateNickname() {
  if (isUpdateNickname.value) {
    isUpdateNickname.value = false
    const res = await api.updateUserInfo({ nickName: user.userInfo?.nickName })
    if (res.code === 200) {
      console.log('修改昵称成功')
    }
  }
  else {
    isUpdateNickname.value = true
  }
}
</script>

<template>
  <view>
    <wd-message-box />

    <Navbar enable-left-slot>
      <template #left>
        <view class="flex items-center gap-20rpx" @click="gotoHome">
          <view class="i-material-symbols-arrow-back-ios-new-rounded text-44rpx" />
          <view class="i-material-symbols-home-outline-rounded text-46rpx" />
        </view>
      </template>
    </Navbar>

    <Container custom-class="px-32rpx flex flex-col gap-60rpx">
      <view class="flex items-center flex-col">
        <view class="relative w-200rpx h-200rpx">
          <wd-img round mode="aspectFill" :src="user.userInfo?.face" width="200rpx" height="200rpx" />
          <view class="absolute top-0 left-0 w-100% h-100% bg-black opacity-50 rounded-full flex items-center justify-center">
            <button :class="cs.m('icon-btn')" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
              <view class="i-material-symbols-landscape-2-edit-rounded text-60rpx color-white" />
            </button>
          </view>
        </view>
        <view class="flex items-center">
          <view class=" mt-20rpx flex items-center gap-10rpx">
            <wd-input v-if="isUpdateNickname" :model-value="userInfo?.nickName" no-border :autofocus="true" type="nickname" @update:model-value="user.userInfo!.nickName = $event" @blur="onUpdateNickname" />
            <view v-else class="color-#333 text-32rpx font-bold">
              {{ userInfo?.nickName }}
            </view>
            <view v-if="!isUpdateNickname" class="i-tabler-pencil-minus color-#333 text-36rpx" @click="onUpdateNickname" />
          </view>
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
.hi-settings--icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  &::after {
    display: none;
  }
}
</style>
