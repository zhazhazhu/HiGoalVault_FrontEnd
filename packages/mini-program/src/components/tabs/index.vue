<script lang='ts' setup>
import type { TabChildrenProps } from './tabs'
import { useClassesName } from '@higoal/hooks'
import { computed, ref } from 'vue'
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
const tabNavInstance = ref<InstanceType<typeof TabNav>>()
const tabNavInstanceHeight = computed(() => tabNavInstance.value?.height || 0)

function onTabClick(event: TabChildrenProps) {
  if (!props.editable)
    return
  emit('tabChange', event.name)
}
</script>

<template>
  <view :class="[cs.s(), customClass]">
    <TabNav ref="tabNavInstance" :navs="navs" :editable="editable" :custom-nav-class="customNavClass" @tab-click="onTabClick" @edit="$emit('edit', $event)">
      <template #edit>
        <slot name="edit" />
      </template>
    </TabNav>

    <view :class="[cs.m('content'), customContentClass]" :style="{ height: `calc(100% - ${tabNavInstanceHeight}px)` }">
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
