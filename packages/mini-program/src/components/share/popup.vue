<script lang='ts' setup>
import { inject } from 'vue'
import { messageInjectKey } from '@/composables/inject'

const model = defineModel({ type: Boolean, default: false })

const messageInject = inject(messageInjectKey)
</script>

<template>
  <wd-popup v-model="model" position="bottom" :modal="false" root-portal custom-style="border-radius: 20px;">
    <view class="p-20px h-100px">
      <button open-type="share" :data-ids="messageInject?.share.value.ids" class="share-btn" @click="() => model = false">
        <view class="share-wechat-icon" />
        <text>分享好友</text>
      </button>
    </view>
  </wd-popup>
</template>

<style lang='scss' scoped>
.share-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 12px;
  &::after {
    display: none;
  }
  view {
    border-radius: 100%;
    width: 48px;
    height: 48px;
  }
  text {
    font-size: 12px;
    color: #666666;
    line-height: 48rpx;
  }
}
</style>
