<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import TabNav from './components/TabNav.NOT.vue'
import { useTabs } from './tabs'

const props = defineProps<{
  modelValue?: string | number
  customNavClass?: string
  customClass?: string
  customContentClass?: string
  editable?: boolean
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number): void
  (e: 'tabChange', val?: string | number): void
  (e: 'edit', ev: Event): void
}>()
const cs = useClassesName('tabs')
const { navs } = useTabs(props, emit)
</script>

<template>
  <view :class="[cs.s(), customClass]">
    <TabNav :navs="navs" :editable="editable" :custom-nav-class="customNavClass" @tab-click="$emit('tabChange', $event.name)" @edit="$emit('edit', $event)">
      <template #edit>
        <slot name="edit" />
      </template>
    </TabNav>

    <view :class="[cs.m('content'), customContentClass]" class="h-full">
      <slot />
    </view>
  </view>
</template>

<style lang='scss'>
.hi-tabs {
  --tab-nav-bg: white;
  --tab-nav-font-size: 32rpx;
  height: 100%;
}
</style>
