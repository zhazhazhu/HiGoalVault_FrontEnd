<script lang='ts' setup>
import { computed, inject } from 'vue'
import { messageInjectKey } from '@/composables/inject'

const model = defineModel({ type: Boolean, default: false })
const messageInject = inject(messageInjectKey)
const openType = computed(() => messageInject?.share.value.ids.size ? 'share' : '')

function onShare() {
  if (messageInject?.share.value.ids.size === 0) {
    uni.showToast({
      title: '请选择要分享的消息',
      icon: 'none',
    })
  }
}
function onGenerateImage() {

}
</script>

<template>
  <wd-popup v-model="model" root-portal position="bottom" :modal="false" safe-area-inset-bottom custom-class="rounded-t-20px">
    <view class="h-150px flex items-center justify-center flex-col gap-10px">
      <button :open-type="openType" :data-ids="messageInject?.share.value.ids" class="share-btn" @tap.stop="onShare">
        <view class="share-wechat-icon" />
        <text>分享好友</text>
      </button>
      <!-- <button :data-ids="messageInject?.share.value.ids" class="share-btn" @click="onGenerateImage">
        <view class="share-wechat-icon" />
        <text>生成图片</text>
      </button> -->
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
