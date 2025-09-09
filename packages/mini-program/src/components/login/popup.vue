<script lang='ts' setup>
import { ref, watch } from 'vue'
import { useToast } from 'wot-design-uni'
import { api } from '@/api'
import { useUserStore } from '~/store'

const toast = useToast()

const model = defineModel({ type: Boolean, default: false })
const isAgreed = ref(false)

const { auth } = useUserStore()

function close() {
  model.value = false
}

async function onGetPhoneNumber(e) {
  const res = await uni.login()
  const data = await api.autoLoginByPhone({ code: res.code, phoneCode: e.detail.code })
  if (data.code === 200) {
    auth.value = data.result
  }
}
function goToUserAgreementPrivacy() {
  if (isAgreed.value === false) {
    toast.show('请勾选同意协议')
  }
}

function handleCancel() {
  model.value = false
}

function handleChange({ value }) {
  isAgreed.value = value
}
</script>

<template>
  <wd-action-sheet v-model="model" title="请阅读并勾选下方协议" custom-class="login_model" custom-header-class="login_model_header" @close="close">
    <uni-nav-bar title="导航栏组件" dark />
    <wd-toast />

    <view class="flex flex-col items-center gap-32rpx p-28rpx h-750rpx">
      <wd-img :width="100" :height="100" src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" />

      <wd-text text="LOGO" />

      <view class="flex flex-col gap-32rpx">
        <view class="w-560rpx h-112rpx">
          <wd-button v-if="!isAgreed" :round="false" block size="large" @click="goToUserAgreementPrivacy">
            手机号一键登录
          </wd-button>

          <wd-button v-else open-type="getPhoneNumber" :round="false" block size="large" @getphonenumber="onGetPhoneNumber">
            手机号一键登录
          </wd-button>
        </view>

        <view class="w-560rpx h-112rpx">
          <wd-button plain :round="false" size="large" block @click="handleCancel">
            取消使用
          </wd-button>
        </view>

        <view class="w-full">
          <wd-checkbox v-model="isAgreed" @change="handleChange">
            我已经阅读并熟知《xxxxxxxxxxxxxxxxx协议》
          </wd-checkbox>
        </view>
      </view>
    </view>
  </wd-action-sheet>
</template>

<style lang='scss'>
</style>
