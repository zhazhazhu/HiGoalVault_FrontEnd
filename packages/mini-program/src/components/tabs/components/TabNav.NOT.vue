<script lang='ts' setup>
import type { Navs, TabChildrenProps } from '../tabs'
import { useClassesName } from '@higoal/hooks'
import { computed, inject } from 'vue'
import { TABS_INJECTION_KEY } from '../tabs'

const props = defineProps<{
  navs: Navs[]
  customNavClass?: string
}>()
const emit = defineEmits<{
  (e: 'tabClick', tab: TabChildrenProps, ev: Event): void
}>()
const { activeName } = inject(TABS_INJECTION_KEY)!
const cs = useClassesName('tab-nav')
const leftNavs = computed(() => props.navs.filter(item => !item.right))
const rightNavs = computed(() => props.navs.filter(item => item.right))

function handleTabClick(tab: TabChildrenProps, ev: Event) {
  if (tab.name !== undefined) {
    activeName.value = tab.name || 0
  }
  emit('tabClick', tab, ev)
}
</script>

<template>
  <view :class="[cs.m('container'), customNavClass]">
    <view :class="cs.m('left')">
      <view v-for="item in leftNavs" :key="item.name" class="transition-all" :class="[cs.m('item'), cs.is('active', item.name === activeName)]" @click="handleTabClick(item, $event)">
        <text>{{ item.label }}</text>
        <wd-icon v-if="item.icon" :name="item.icon" />
      </view>
    </view>

    <view :class="cs.m('right')">
      <view v-for="item in rightNavs" :key="item.name" class="transition-all" :class="[cs.m('item'), cs.is('active', item.name === activeName)]" @click="handleTabClick(item, $event)">
        <text>{{ item.label }}</text>
        <wd-icon v-if="item.icon" :name="item.icon" />
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-tab-nav--container {
  display: flex;
  justify-content: space-between;
}

.hi-tab-nav--left,
.hi-tab-nav--right {
  gap: 46rpx;
  display: flex;
  align-items: center;
}

.hi-tab-nav--item {
  text-align: center;
  font-size: 32rpx;
  color: #666666;
  position: relative;
  line-height: 46rpx;
}

.hi-tab-nav--item.is-active {
  color: #333333;
  font-weight: 500;
  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    background-image: url(/static/navbar/svg/路径.svg);
    background-size: cover;
    background-repeat: no-repeat;
    width: 30px;
    height: 10px;
  }
}
</style>
