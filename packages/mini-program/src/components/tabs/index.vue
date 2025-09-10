<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import TabNav from './components/TabNav.NOT.vue'
import { useTabs } from './tabs'

const props = defineProps<{
  modelValue?: string | number
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number): void
  (e: 'tabChange', val: string | number): void
}>()

const cs = useClassesName('tabs')
const { navs } = useTabs(props, emit)
</script>

<template>
  <view :class="[cs.s()]">
    <TabNav :navs="navs" />
    <view :class="[cs.m('content')]">
      <slot />
    </view>
  </view>
</template>

<style lang='css' scoped></style>
