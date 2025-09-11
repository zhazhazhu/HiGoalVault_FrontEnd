<script lang='ts' setup>
import type { Navs, TabChildrenProps } from '../tabs'
import { useClassesName } from '@higoal/hooks'
import { inject } from 'vue'
import { TABS_INJECTION_KEY } from '../tabs'

const { navs } = defineProps<{
  navs: Navs[]
  customNavClass?: string
}>()
const emit = defineEmits<{
  (e: 'tabClick', tab: TabChildrenProps, ev: Event): void
}>()
const { activeName } = inject(TABS_INJECTION_KEY)!
const cs = useClassesName('tab-nav')

function handleTabClick(tab: TabChildrenProps, ev: Event) {
  activeName.value = tab.name || 0
  emit('tabClick', tab, ev)
}
</script>

<template>
  <view :class="[cs.m('container'), customNavClass]">
    <view v-for="item in navs" :key="item.name" class="transition-all" :class="[cs.m('item'), cs.is('active', item.name === activeName)]" @click="handleTabClick(item, $event)">
      {{ item.label }}
    </view>

    <view class="flex-1 flex justify-end">
      <slot name="right" />
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-tab-nav--container {
  display: flex;
  align-items: center;
  gap: 46rpx;
  padding: 0 20rpx 40rpx 20rpx;
}

.hi-tab-nav--item {
  text-align: center;
  font-size: 32rpx;
  color: #666666;
  position: relative;
}

.hi-tab-nav--item.is-active {
  color: #333333;
  font-weight: 500;
  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 50%;
    background-color: #ff4d4f; /* 小图标的颜色 */
    transform: translateX(-50%); /* 水平居中 */
    height: 4px; /* 确保高度设置 */
    width: 30px; /* 确保宽度设置 */
    border-radius: 9999px;
  }
}
</style>
