<script setup lang="ts">
import { onMounted, ref } from 'vue'

const title = ref('Hello1')
const avatarUrl = ref('')

function onChooseAvatar(e) {
  avatarUrl.value = e.detail.avatarUrl
  uni.setStorageSync('avatarUrl', e.detail.avatarUrl)
}

onMounted(() => {
})
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
    <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
      <image class="avatar" :src="avatarUrl" />
    </button>
    <input type="nickname" class="weui-input" placeholder="请输入昵称">
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
