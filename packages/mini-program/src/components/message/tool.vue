<script lang='ts' setup>
import type { CSSProperties } from 'vue'
import { useClassesName } from '@higoal/hooks'
import { getCurrentInstance, nextTick, ref, watch } from 'vue'
import { useMessageInject } from '@/composables/inject'
import { useGlobalStore } from '@/store'

interface Props {
  rect: { x: number, y: number }
  id: string
}
type OperateType = 'delete' | 'refresh' | 'voice' | 'copy' | 'quote'

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'operate', type: OperateType): void
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
function onOperate(type: OperateType) {
  messageInject.currentToolMessageId.value = null
  emit('operate', type)
}
</script>

<template>
  <view v-if="id === messageInject.currentToolMessageId.value" :class="cs.m('wrapper')" :style="wrapperStyle" @tap.stop>
    <view :class="cs.m('item')" @click="onOperate('delete')">
      <view class="copy-icon bg-white" />
      <text>删除</text>
    </view>
    <view :class="cs.m('item')" @click="onOperate('refresh')">
      <view class="copy-icon bg-white" />
      <text>重新生成</text>
    </view>
    <view :class="cs.m('item')" @click="onOperate('voice')">
      <view class="copy-icon bg-white" />
      <text>语音播放</text>
    </view>
    <view :class="cs.m('item')" @click="onOperate('copy')">
      <view class="copy-icon bg-white" />
      <text>复制</text>
    </view>
    <view :class="cs.m('item')" @click="onOperate('quote')">
      <view class="copy-icon bg-white" />
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
  padding: 10rpx;
}
.hi-message-tool--item {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
