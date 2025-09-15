<script lang='ts' setup>
import { computed, onMounted, ref } from 'vue'

// 获取系统信息和导航栏高度
const navbarHeight = ref(0)

onMounted(() => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  // 状态栏高度
  const statusBarHeight = systemInfo.statusBarHeight || 0
  // navbar组件的高度 = 状态栏高度 + 100rpx（导航栏内容高度）
  // 100rpx转换为px：100rpx = 100 * (屏幕宽度 / 750) px
  const rpxToPx = systemInfo.windowWidth / 750
  const navbarContentHeight = 100 * rpxToPx
  navbarHeight.value = statusBarHeight + navbarContentHeight
})

// 计算容器高度
const containerHeight = computed(() => {
  return `calc(100vh - ${navbarHeight.value}px)`
})
</script>

<template>
  <div class="container flex flex-col" :style="{ height: containerHeight }">
    <slot />
  </div>
</template>

<style lang='scss' scoped>
.container {
  background-color: var(--hi-bg-color);
}
</style>
