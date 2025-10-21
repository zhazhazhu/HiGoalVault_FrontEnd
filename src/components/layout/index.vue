<script lang='ts' setup>
import { ref } from 'vue'
import { useClassesName } from '@/composables'
import { useUserStore } from '@/store'

const emit = defineEmits<{
  (e: 'changeChat'): void
}>()
const model = defineModel({ type: Boolean, default: false })
const cs = useClassesName('layout')
const isConnected = ref(true)
const userStore = useUserStore()

function onClose() {
  if (model.value) {
    model.value = false
  }
}
function onChangeChat() {
  if (model.value) {
    model.value = false
  }
  emit('changeChat')
}
</script>

<template>
  <view :class="[cs.m('container'), cs.is('open', model)]" class="h-screen overflow-hidden">
    <view v-if="userStore.isLogin" :class="cs.m('wrapper')">
      <LayoutContent :show-sidebar="model" @close="onClose" @change-chat="onChangeChat" />
    </view>
    <view v-if="isConnected" :class="cs.m('content')">
      <view :class="cs.e('content-mask')" @click.stop="onClose" />
      <slot />
    </view>
    <view v-else :class="cs.m('content')">
      <view class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <view class="flex flex-col items-center gap-10rpx">
          <view class="i-hugeicons-cellular-network-offline text-80rpx color-[var(--hi-primary-color)]" />
          <view class="text-xl color-gray-7">
            网络异常
          </view>
          <view class="text-sm color-gray-5">
            请检查网络是否正常
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
/* 容器 */
.hi-layout--container {
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* 侧边栏包装器 */
.hi-layout--wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 2;
  transform: translateX(0); /* 默认保持在0，等待父级控制 */
  transition: transform 0.3s ease-in-out;
}

/* 侧边栏打开时的状态 */
.hi-layout--container.is-open .hi-layout--wrapper {
  transform: translateX(0);
}

/* 侧边栏关闭时的状态 */
.hi-layout--container:not(.is-open) .hi-layout--wrapper {
  transform: translateX(-100%);
}

/* 主内容区 */
.hi-layout--content {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  background-color: #fff;
  transition:
    transform 0.3s ease-in-out,
    border-radius 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;
  transform: translateX(0) scale(1);
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  transform-origin: top center;
}

/* 主内容区打开时的动画效果 */
.hi-layout--container.is-open .hi-layout--content {
  transform: translateX(75%) scale(0.75) translateY(260rpx);
  border-radius: 20px;
  box-shadow: 0 0 70px rgb(0 0 0 / 21%);
}

/* 遮罩层 */
.hi-layout__content-mask {
  display: none;
}

.hi-layout--container.is-open .hi-layout__content-mask {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.08);
}
</style>
