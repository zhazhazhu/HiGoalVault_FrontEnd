<script lang='ts' setup>
import type { CSSProperties } from 'vue'
import { computed, ref, watch } from 'vue'
import { useGlobalStore, useUserStore } from '@/store'

interface Props {
  title?: string
  bgColor?: string
  enableLeftSlot?: boolean
  leftText?: string | boolean
}
const props = withDefaults(defineProps<Props>(), {
  bgColor: '#F3F3F3',
})
const emits = defineEmits<{
  (e: 'leftClick'): void
}>()
const slots = defineSlots<{
  left?: () => any
  title?: () => any
  right?: () => any
}>()

const show = ref(false)
const userStore = useUserStore()
const globalStore = useGlobalStore()

const navbarStyle = computed<CSSProperties>(() => ({
  '--bg-color': props.bgColor,
}))

function changeBgColor(color: string) {
  navbarStyle.value['--bg-color'] = color
}
function handleClick() {
  show.value = !show.value
}

// watch(show, (show) => {
//   if (show) {
//     changeBgColor('#FF3B30')
//   }
//   else {
//     changeBgColor('#FFFFFF')
//   }
// })

defineExpose({
  changeBgColor,
})
</script>

<template>
  <view class="navbar__container" :style="navbarStyle">
    <login-popup v-model="show" />
    <view class="navbar__status" :style="{ '--status-bar-height': `${globalStore.windowInfo?.statusBarHeight}px` }" />
    <view class="navbar__content">
      <view class="navbar__content__left">
        <view v-if="!enableLeftSlot && leftText" @click="emits('leftClick')">
          {{ leftText }}
        </view>

        <view v-else>
          <slot name="left">
            <view v-if="userStore.isLogin" class="i-uil-list-ul text-54rpx" @click="emits('leftClick')" />
            <view v-else class="flex items-center color-#3e3e3e" @click="handleClick">
              <view class="i-uil-user text-46rpx mr-6rpx" />
              <text class="text-24rpx" user-select="false">
                未登录
              </text>
            </view>
          </slot>
        </view>
      </view>
      <view class="navbar__title">
        <slot v-if="slots.title" name="title" />
        <text v-else user-select="false">
          {{ title }}
        </text>
      </view>
      <view class="navbar__content__right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.navbar__container {
  background: var(--bg-color);
  padding: 0 32rpx;
}
.navbar__container .navbar__content {
  height: 90rpx;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
.navbar__content__left,
.navbar__content__right {
  flex: 1;
  height: 90rpx;
  display: flex;
  align-items: center;
}
.navbar__content__right {
  text-align: right;
}
.navbar__title {
  max-width: 300rpx;
  margin-top: 20rpx;
}
.navbar__status {
  height: var(--status-bar-height);
}
</style>
