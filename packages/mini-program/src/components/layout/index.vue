<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'

const model = defineModel({ type: Boolean, default: false })
const cs = useClassesName('side')

function onClose() {
  if (model.value) {
    model.value = false
  }
}
</script>

<template>
  <view :class="[cs.m('container'), cs.is('open', model)]" class="h-screen overflow-hidden">
    <view :class="cs.m('wrapper')">
      <LayoutContent />
    </view>
    <view :class="cs.m('content')">
      <view :class="cs.e('content-mask')" @click.stop="onClose" />
      <slot />
    </view>
  </view>
</template>

<style lang='scss' scoped>
/* 容器 */
.hi-side--container {
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* 侧边栏包装器 */
.hi-side--wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 1000;
  transform: translateX(0); /* 默认保持在0，等待父级控制 */
  transition: transform 0.3s ease-in-out;
}

/* 侧边栏打开时的状态 */
.hi-side--container.is-open .hi-side--wrapper {
  transform: translateX(0);
}

/* 侧边栏关闭时的状态 */
.hi-side--container:not(.is-open) .hi-side--wrapper {
  transform: translateX(-100%);
}

/* 主内容区 */
.hi-side--content {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1001;
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
.hi-side--container.is-open .hi-side--content {
  transform: translateX(75%) scale(0.8) translateY(260rpx);
  border-radius: 20px;
  box-shadow: 0 0 70px rgb(0 0 0 / 21%);
}

/* 遮罩层 */
.hi-side__content-mask {
  display: none;
}

.hi-side--container.is-open .hi-side__content-mask {
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
