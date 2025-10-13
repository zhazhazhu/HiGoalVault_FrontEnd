<script lang='ts' setup>
import { useClassesName } from '@/composables'
import { computed } from 'vue'
import { useGlobalStore } from '@/store'

const props = defineProps<{
  customClass?: string
}>()
const cs = useClassesName('container')
// 获取系统信息和导航栏高度
const globalStore = useGlobalStore()

function rpxToPx(rpx: number = 0) {
  return globalStore.windowInfo!.screenWidth * (rpx / 750)
}

// 计算容器高度
const containerHeight = computed(() => {
  const navbarHeight = rpxToPx(80) + globalStore.windowInfo!.statusBarHeight
  return `calc(100vh - ${navbarHeight}px)`
})
</script>

<template>
  <div :class="[cs.s(), props.customClass]" class="flex flex-col" :style="{ height: containerHeight }">
    <slot />
  </div>
</template>

<style lang='scss' scoped>
.hi-container {
  background-color: var(--hi-bg-color);
}
</style>
