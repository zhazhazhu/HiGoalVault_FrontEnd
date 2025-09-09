<script setup lang="ts">
import { api } from '@/api'
import { useToken } from '~/composables'

const token = useToken()

async function getPhoneNumber(e) {
  const res = await uni.login()
  const data = await api.autoLoginByPhone({ code: res.code, phoneCode: e.detail.code })
  if (data.code === 200) {
    token.value = data.result
  }
}

async function handleRefresh() {
  if (!token.value?.refreshToken) {
    return
  }
  console.log(token.value.refreshToken)

  const data = await api.refreshToken(token.value.refreshToken)
  if (data.code === 200) {
    token.value = data.result
  }
}
</script>

<template>
  <view class="content">
    <button open-type="getPhoneNumber" class="bg-amber" @getphonenumber="getPhoneNumber">
      手机号一键登录
    </button>
    <view class="mt-20 text-3xl">
      1111
    </view>

    <button @click="handleRefresh">
      刷新Token
    </button>
  </view>
</template>

<style lang="css">

</style>
