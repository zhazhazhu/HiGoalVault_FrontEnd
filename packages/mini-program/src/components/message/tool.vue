<script lang='ts' setup>
import type { CSSProperties } from 'vue'
import type { MessageToolOperateType } from '@/types'
import { useClassesName } from '@higoal/hooks'
import { getCurrentInstance, nextTick, ref, watch } from 'vue'
import { useMessageInject } from '@/composables/inject'
import { useGlobalStore } from '@/store'

interface Props {
  rect: { x: number, y: number }
  id: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'operate', type: MessageToolOperateType): void
}>()

const cs = useClassesName('message-tool')
const instance = getCurrentInstance()
const query = uni.createSelectorQuery().in(instance)
const globalStore = useGlobalStore()
const messageInject = useMessageInject()

const wrapperStyle = ref<CSSProperties>({
  position: 'absolute',
  left: `${props.rect.x}px`,
  top: `${props.rect.y}px`,
})

watch(() => props.rect, ({ x, y }) => {
  nextTick(() => {
    if (x === 0 && y === 0)
      return
    calculatePosition(props.rect.x, props.rect.y)
  })
}, { deep: true })

function calculatePosition(touchX: number, touchY: number) {
  if (!instance)
    return

  const screenWidth = globalStore.windowInfo?.screenWidth || 0

  query
    .select('.hi-message-tool--wrapper')
    .boundingClientRect((rect) => {
      const _rect = rect as UniApp.NodeInfo
      if (!_rect)
        return

      const menuHeight = _rect.height || 0
      const menuWidth = _rect.width || 0
      let finalY = touchY
      // 默认在上方弹出，如果上方空间不足则在下方
      if (touchY < menuHeight) {
        finalY = touchY
      }
      else {
        finalY = touchY - menuHeight
      }
      let finalX = touchX
      if (touchX + menuWidth > screenWidth) {
        finalX = touchX - menuWidth
      }
      if (finalX < 0) {
        finalX = 0
      }
      wrapperStyle.value.left = `${finalX}px`
      wrapperStyle.value.top = `${finalY}px`
    })
    .exec()
}
function onOperate(type: MessageToolOperateType) {
  messageInject.currentToolMessageId.value = null
  emit('operate', type)
}
</script>

<template>
  <view v-if="id === messageInject.currentToolMessageId.value" :class="cs.m('wrapper')" :style="wrapperStyle" @click.stop>
    <view :class="cs.m('item')" @click.stop="onOperate('delete')">
      <view class="delete-float-menu-icon bg-white size-40rpx" />
      <text>删除</text>
    </view>
    <view :class="cs.m('item')" @click.stop="onOperate('refresh')">
      <view class="refresh-float-menu-icon bg-white size-40rpx" />
      <text>重新生成</text>
    </view>
    <view :class="cs.m('item')" @click.stop="onOperate('voice')">
      <view class="speaker-float-menu-icon bg-white size-40rpx" />
      <text>语音播放</text>
    </view>
    <view :class="cs.m('item')" @click.stop="onOperate('copy')">
      <view class="copy-float-menu-icon bg-white size-40rpx" />
      <text>复制</text>
    </view>
    <view :class="cs.m('item')" @click.stop="onOperate('quote')">
      <view class="excerpt-copy-float-menu-icon bg-white size-40rpx" />
      <text>节选复制</text>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-message-tool--wrapper {
  position: absolute;
  background-color: #333333bd;
  color: white;
  z-index: 9999;
  width: 150px;
  height: 200px;
  border-radius: 30rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
  padding: 10rpx 20rpx;
}
.hi-message-tool--item {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
