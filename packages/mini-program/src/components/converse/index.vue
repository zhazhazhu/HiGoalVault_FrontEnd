<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'

withDefaults(defineProps<{
  placeholder?: string
}>(), {
  placeholder: '你的金融助理，随便...',
})

const model = defineModel({ type: String, default: '' })
const cs = useClassesName('converse')
</script>

<template>
  <view :class="cs.m('container')">
    <view :class="cs.e('left')">
      <view class="i-weui-voice-outlined" :class="cs.e('icon')" />
    </view>
    <view :class="cs.e('input')">
      <wd-input v-model="model" type="text" :placeholder="placeholder" no-border />
    </view>
    <view :class="cs.e('right')">
      <view class="i-weui-add2-outlined" :class="cs.e('icon')" />
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-converse--container {
  padding: 30rpx;
  background-color: white;
  box-shadow: 0rpx 4rpx 16rpx 0rpx rgba(0, 0, 0, 0.08);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
}
.hi-converse__input {
  flex: 1;
  padding: 0 20rpx;
}
.hi-converse__icon {
  font-size: 50rpx;
}
</style>
