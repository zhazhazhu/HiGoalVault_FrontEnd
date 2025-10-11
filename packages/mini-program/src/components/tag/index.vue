<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'

const props = withDefaults(defineProps<{
  customClass?: string
  type?: 'primary' | 'info' | 'warning'
  size?: 'large' | 'default' | 'small'
}>(), {
  type: 'primary',
  size: 'default',
})
const model = defineModel('active', { type: Boolean, default: false })
const cs = useClassesName('tag')
</script>

<template>
  <view :class="[cs.m('container'), props.customClass, cs.m(props.type), cs.is('active', model), cs.m(props.size)]">
    <slot />
  </view>
</template>

<style lang='scss' scoped>
.hi-tag--container {
  width: auto;
  border-radius: 8rpx;
  padding: 10rpx 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  &.hi-tag--large {
    font-size: 26rpx;
  }
  &.hi-tag--default {
    font-size: 24rpx;
  }
  &.hi-tag--small {
    font-size: 18rpx;
  }
  &.hi-tag--primary {
    background: #66666614;
    color: var(--hi-primary-color);
  }
  &.hi-tag--info {
    background: #66666614;
    color: #404040;
  }
  &.hi-tag--warning {
    background: #ff950014;
    color: #666666;
    &.is-active {
      background: #ff950033;
      color: #121212;
    }
  }
}
</style>
