<script setup lang="ts">
import { ref } from 'vue'

const title = ref('Hello1')

async function getPhoneNumber(e) {
  const { data } = await uni.request({
    url: `http://localhost:3000/login-phone?code=${e.detail.code}`,
    method: 'GET',
  })
  console.log(data)
}
</script>

<template>
  <view class="content">
    <image class="logo" src="/static/logo.png" />
    <view class="text-area">
      <text class="title">
        {{ title }}
      </text>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <button type="primary" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
      手机号一键登录
    </button>
    <!-- #endif -->
  </view>
</template>

<style lang="css">
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
