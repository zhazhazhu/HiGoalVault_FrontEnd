<script lang='ts' setup>
import { api } from '@/api'

async function getPhoneNumber(e) {
  const res = await uni.login()
  const data = await api.login({ code: res.code, phoneCode: e.detail.code })
  console.log('login', data)
}
</script>

<template>
  <view class="content">
    <!-- #ifdef MP-WEIXIN -->
    <button open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
      手机号一键登录1
    </button>
    <!-- #endif -->
  </view>
</template>

<style lang='css'></style>
