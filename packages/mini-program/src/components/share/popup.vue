<script lang='ts' setup>
import { inject } from 'vue'
import { messageInjectKey } from '@/composables/inject'

const model = defineModel({ type: Boolean, default: false })

const messageInject = inject(messageInjectKey)
</script>

<template>
  <wd-popup v-model="model" root-portal position="bottom" :modal="false" safe-area-inset-bottom custom-class="rounded-t-20px">
    <view class="h-110px flex items-center justify-center flex-col">
      <button open-type="share" :data-ids="messageInject?.share.value.ids" class="share-btn">
        <view class="share-wechat-icon" />
        <text>分享好友</text>
      </button>
    </view>
  </wd-popup>
</template>

<style lang='scss' scoped>
.share-btn {
  display: contents;
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
