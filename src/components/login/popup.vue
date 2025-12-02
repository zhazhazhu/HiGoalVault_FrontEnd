<script lang='ts' setup>
import { ref } from 'vue'
import { api } from '@/api'
import { getTokenExpireDateTime } from '@/utils'
import { useUserStore } from '~/store'

const model = defineModel({ type: Boolean, default: false })
const isAgreed = ref(false)
const userStore = useUserStore()
const phoneOpentype = 'getPhoneNumber|agreePrivacyAuthorization' as any
const isLoading = ref(false)

function handleClose() {
  model.value = false
}

async function onGetPhoneNumber(e) {
  isLoading.value = true

  const phoneCode = e?.code
  if (!phoneCode) {
    uni.showToast({
      title: '获取手机号失败',
      icon: 'none',
    })
    isLoading.value = false
    return
  }

  try {
    const res = await uni.login()
    const data = await api.autoLoginByPhone({ code: res.code, phoneCode }).finally(() => {
      isLoading.value = false
    })
    if (data.code === 200) {
      userStore.auth = {
        ...data.result,
        accessTokenExpireDateTime: getTokenExpireDateTime(data.result.accessTokenExpireTime),
        refreshTokenExpireDateTime: getTokenExpireDateTime(data.result.refreshTokenExpireTime),
      }
      model.value = false // 登录成功后关闭弹窗
      uni.reLaunch({ url: '/pages/index/index' })
    }
    else {
      console.error('登录失败:', data.message)
      uni.showToast({
        title: data.message || '登录失败',
        icon: 'none',
      })
    }
  }
  catch (error) {
    console.error('登录请求失败:', error)
    uni.showToast({
      title: '网络请求失败，请检查网络连接',
      icon: 'none',
    })
  }
}

function handleChange({ value }) {
  isAgreed.value = value
}

function goToReadPrivacy() {
  uni.openPrivacyContract({
    success: (res) => {
      console.log('openPrivacyContract success', res)
    },
    fail: (err) => {
      console.log('openPrivacyContract fail', err)
    },
  })
}

function handleAgreePrivacyAuthorization() {
  isAgreed.value = true
}
</script>

<template>
  <wd-popup
    v-model="model"
    position="bottom"
    lock-scroll
    custom-class="rounded-t-32rpx"
    :safe-area-inset-bottom="true"
  >
    <wd-toast />

    <view class="content">
      <view class="flex items-center justify-between header">
        <view class="w-50rpx" />

        <view class="font-bold flex-1 text-center">
          请阅读并勾选下方协议
        </view>

        <view class="i-material-symbols-light-close-rounded text-50rpx color-#333 w-50rpx" @click="handleClose" />
      </view>

      <view class="flex flex-col items-center gap-32rpx py-28rpx px-60rpx h-600rpx">
        <view class="mt-30rpx flex items-center flex-col gap-20px">
          <wd-img :width="100" :height="100" round src="https://avatars.githubusercontent.com/u/233332699?s=48&v=4" />

          <text class="text-32rpx font-bold italic">
            HiGoal
          </text>
        </view>

        <view class="flex flex-col items-center gap-32rpx w-full">
          <view class="w-full h-100rpx">
            <wd-button
              :open-type="phoneOpentype"
              :round="false"
              block
              size="large"
              :loading="isLoading"
              @getphonenumber="onGetPhoneNumber"
              @agreeprivacyauthorization="handleAgreePrivacyAuthorization"
            >
              同意协议并手机号一键登录
            </wd-button>
          </view>

          <wd-checkbox v-model="isAgreed" custom-class="w-full" @change="handleChange">
            <text class="text-22rpx word-wrap" style="white-space: normal;">
              我已经阅读并熟知
              <text class="text-primary" @click.stop="goToReadPrivacy">
                {{ userStore.privacySettings?.privacyContractName }}
              </text>
            </text>
          </wd-checkbox>
        </view>
      </view>
    </view>
  </wd-popup>
</template>

<style lang='scss' scoped>
.header {
  background: linear-gradient(180deg, #d8dff7 0%, #ffffff 100%);
  padding: 32rpx;
}
.content {
  --wot-button-large-height: 100%;
  --wot-button-large-radius: 15rpx;
}
</style>
