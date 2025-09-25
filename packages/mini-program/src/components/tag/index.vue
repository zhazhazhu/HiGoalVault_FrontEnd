<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'

const props = defineProps<{ customClass?: string }>()
const cs = useClassesName('tag')
</script>

<template>
  <view :class="[cs.m('container'), props.customClass]">
    <slot />
  </view>
</template>

<style lang='scss' scoped>
.hi-tag--container {
  width: auto;
  height: 24rpx;
  background: #66666614;
  border-radius: 4rpx;
  padding: 10rpx 16rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18rpx;
  color: var(--hi-primary-color);
}
</style>
