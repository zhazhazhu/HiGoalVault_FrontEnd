<script lang='ts' setup>
import type { CSSProperties } from 'vue'
import { computed } from 'vue'

interface Props {
  title?: string
  bgColor?: string
}
const { title, bgColor = '#FFFFFF' } = defineProps<Props>()
const slots = defineSlots<{
  left?: () => any
  title?: () => any
  right?: () => any
}>()

const statusBarHeight = computed(() => uni.getSystemInfoSync().statusBarHeight || 0)

const navbarStyle = computed<CSSProperties>(() => ({
  '--bg-color': bgColor,
}))

function changeBgColor(color: string) {
  navbarStyle.value['--bg-color'] = color
}

defineExpose({
  changeBgColor,
})
</script>

<template>
  <view class="navbar__container" :style="navbarStyle">
    <view class="navbar__status" :style="{ height: `${statusBarHeight}px` }" />
    <view class="navbar__content">
      <view class="navbar__content__left">
        <slot name="left" />
      </view>
      <view class="navbar__title">
        <slot v-if="slots.title" name="title" />
        <text v-else user-select="false">
          {{ title }}
        </text>
      </view>
      <view class="navbar__content__right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.navbar__container {
  background: var(--bg-color);
  padding: 0 32rpx;
}
.navbar__container .navbar__content {
  height: 100rpx;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
.navbar__content__left,
.navbar__content__right {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
}
.navbar__content__right {
  text-align: right;
}
.navbar__title {
  text-align: center;
  line-height: 80rpx;
  height: 80rpx;
  font-size: 32rpx;
  max-width: 300rpx;
  display: flex;
  align-items: center;
}
</style>
