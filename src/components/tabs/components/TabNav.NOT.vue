<script lang='ts' setup>
import type { Navs, TabChildrenProps } from '../tabs'
import { useClassesName } from '@/composables'
import { getCurrentInstance, inject, nextTick, onMounted, ref } from 'vue'
import { TABS_INJECTION_KEY } from '../tabs'

defineProps<{
  navs: Navs[]
  customNavClass?: string
  editable?: boolean
  sticky?: boolean
}>()
const emit = defineEmits<{
  (e: 'tabClick', tab: TabChildrenProps, ev: Event): void
  (e: 'edit', ev: Event): void
}>()
const { activeName } = inject(TABS_INJECTION_KEY)!
const cs = useClassesName('tab-nav')
function handleTabClick(tab: TabChildrenProps, ev: Event) {
  if (tab.name !== undefined) {
    activeName.value = tab.name || 0
  }
  emit('tabClick', tab, ev)
}
const instance = getCurrentInstance()
const height = ref(0)
const query = uni.createSelectorQuery().in(instance)

function getHeight() {
  if (!instance) {
    console.error('无法获取组件实例。')
    return
  }
  nextTick(() => {
    query
      .select('.hi-tab-nav--container')
      .boundingClientRect((rect) => {
        height.value = (rect as any).height + 20
      })
      .exec()
  })
}

onMounted(() => {
  getHeight()
})

defineExpose({
  height,
})
</script>

<template>
  <view :class="[cs.m('wrapper'), cs.is('sticky', sticky)]">
    <view :class="[cs.m('container'), customNavClass]">
      <view :class="cs.m('left')">
        <view v-for="item in navs" :key="item.name" class="transition-all" :class="[cs.m('item'), cs.is('active', item.name === activeName)]" @click="handleTabClick(item, $event)">
          <view>
            <text>{{ item.label }}</text>
            <wd-icon v-if="item.icon" :name="item.icon" />
          </view>
          <view :class="cs.m('active-bar')">
            <view class="arc-icon" />
          </view>
        </view>
      </view>

      <view v-if="editable" :class="cs.m('right')">
        <view @click="emit('edit', $event)">
          <slot name="edit" />
        </view>
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-tab-nav--wrapper.is-sticky {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  left: 0;
  z-index: 99;
  background-color: var(--tab-nav-bg);
}
.hi-tab-nav--container {
  display: flex;
  justify-content: space-between;
}

.hi-tab-nav--left,
.hi-tab-nav--right {
  gap: 46rpx;
  display: flex;
}

.hi-tab-nav--item {
  text-align: center;
  font-size: var(--tab-nav-font-size, 32rpx);
  color: #666666;
  position: relative;
  line-height: 46rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  .hi-tab-nav--active-bar {
    display: none;
  }
}

.hi-tab-nav--item.is-active {
  color: #333333;
  font-weight: 500;
  .hi-tab-nav--active-bar {
    display: block;
    .arc-icon {
      background-size: contain;
      width: 28px;
      height: 12px;
    }
  }
}
</style>
