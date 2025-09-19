<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import { computed } from 'vue'
import { useGlobalStore } from '@/store'

const cs = useClassesName('container')
// 获取系统信息和导航栏高度
const globalStore = useGlobalStore()

function rpxToPx(rpx: number = 0) {
  return globalStore.windowInfo!.screenWidth * (rpx / 750)
}

// 计算容器高度
const containerHeight = computed(() => {
  const navbarHeight = rpxToPx(100) + globalStore.windowInfo!.statusBarHeight
  return `calc(100vh - ${navbarHeight}px)`
})
</script>

<template>
  <div :class="cs.s()" class="flex flex-col" :style="{ height: containerHeight }">
    <slot />
  </div>
</template>

<style lang='scss' scoped>
.hi-container {
  background-color: var(--hi-bg-color);
}
</style>
