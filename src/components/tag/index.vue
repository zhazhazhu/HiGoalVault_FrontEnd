<script lang='ts' setup>
import { useClassesName } from '@/composables'

const props = withDefaults(defineProps<{
  customClass?: string
  type?: 'primary'
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
  border-radius: 6px;
  padding: 6rpx 18rpx;
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
    background: white;
    color: #5e5c66;
    border: 1px solid #e5e5e7;
    &.is-active {
      background: #f5f7f9;
      color: #2f2e33;
      border: 1px solid #e5e5e7;
      color: #2f2e33;
      font-weight: 500;
    }
  }
}
</style>
