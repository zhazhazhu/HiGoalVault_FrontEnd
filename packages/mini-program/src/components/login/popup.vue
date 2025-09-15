<script lang='ts' setup>
import { ref } from 'vue'
import { api } from '@/api'
import { getTokenExpireDateTime } from '@/utils'
import { useUserStore } from '~/store'

const model = defineModel({ type: Boolean, default: false })
const isAgreed = ref(false)
const userStore = useUserStore()

function close() {
  model.value = false
}

async function onGetPhoneNumber(e) {
  const phoneCode = e?.code
  if (!phoneCode)
    return

  try {
    const res = await uni.login()
    const data = await api.autoLoginByPhone({ code: res.code, phoneCode })
    if (data.code === 200) {
      userStore.auth = {
        ...data.result,
        accessTokenExpireDateTime: getTokenExpireDateTime(data.result.accessTokenExpireTime),
        refreshTokenExpireDateTime: getTokenExpireDateTime(data.result.refreshTokenExpireTime),
      }
      model.value = false // 登录成功后关闭弹窗
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

function handleCancel() {
  model.value = false
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
  <wd-action-sheet v-model="model" title="请阅读并勾选下方协议" custom-class="login_model" custom-header-class="login_model_header" @close="close">
    <uni-nav-bar title="导航栏组件" dark />
    <wd-toast />

    <view class="flex flex-col items-center gap-32rpx p-28rpx h-750rpx">
      <view class="my-30rpx flex items-center flex-col gap-20px">
        <wd-img :width="100" :height="100" src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" />

        <wd-text text="LOGO" />
      </view>

      <view class="flex flex-col items-center gap-32rpx">
        <view class="w-560rpx h-112rpx">
          <wd-button :open-type="'getPhoneNumber|agreePrivacyAuthorization' as any" :round="false" block size="large" @getphonenumber="onGetPhoneNumber" @agreeprivacyauthorization="handleAgreePrivacyAuthorization">
            同意协议并手机号一键登录
          </wd-button>
        </view>

        <view class="w-560rpx h-112rpx">
          <wd-button plain :round="false" size="large" block @click="handleCancel">
            取消使用
          </wd-button>
        </view>

        <view class="w-full">
          <wd-checkbox v-model="isAgreed" @change="handleChange">
            <view class="flex flex-wrap items-center text-24rpx">
              <text>
                我已经阅读并熟知
              </text>
              <text @click.stop="goToReadPrivacy">
                <wd-text type="primary" :text="userStore.privacySettings?.privacyContractName" />
              </text>
            </view>
          </wd-checkbox>
        </view>
      </view>
    </view>
  </wd-action-sheet>
</template>

<style lang='scss'>
</style>
