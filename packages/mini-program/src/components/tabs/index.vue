<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import TabNav from './components/TabNav.NOT.vue'
import { useTabs } from './tabs'

const props = defineProps<{
  modelValue?: string | number
  customNavClass?: string
  customClass?: string
  customContentClass?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number): void
  (e: 'tabChange', val: string | number): void
}>()
const cs = useClassesName('tabs')
const { navs } = useTabs(props, emit)
</script>

<template>
  <view :class="[cs.s(), customClass]">
    <TabNav :navs="navs" :custom-nav-class="customNavClass" />

    <view :class="[cs.m('content'), customContentClass]">
      <slot />
    </view>
  </view>
</template>

<style lang='scss'>
.hi-tabs {
  --tab-nav-bg: white;
  --tab-nav-font-size: 32rpx;
}
</style>
