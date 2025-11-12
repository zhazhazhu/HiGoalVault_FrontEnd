<script lang='ts' setup>
import type { CSSProperties } from 'vue'
import type { MessageToolOperateType } from '@/types'
import { computed } from 'vue'
import { useClassesName } from '@/composables'
import { useGlobalStore } from '@/store'

const props = defineProps<{
  rect: { x: number, y: number }
  messageTextToSpeaking: boolean
  operateType?: 'response' | 'step' | 'user'
}>()
const emit = defineEmits<{
  (e: 'operate', type: MessageToolOperateType): void
}>()
const visible = defineModel('visible', { type: Boolean, default: false })
const cs = useClassesName('message-tool')
const globalStore = useGlobalStore()
const isOffsetBottom = computed(() => {
  const { screenHeight } = globalStore.windowInfo!
  return screenHeight - props.rect.y < 300
})

const wrapperStyle = computed<CSSProperties>(() => {
  const { screenWidth, screenHeight } = globalStore.windowInfo!
  const wrapperWith = screenWidth * 0.7
  const left = props.rect.x + wrapperWith / 2 > screenWidth
    ? screenWidth - wrapperWith - 20
    : props.rect.x - wrapperWith / 2 < 0
      ? 20
      : props.rect.x - wrapperWith / 2
  const top = screenHeight - props.rect.y < 300 ? props.rect.y - 170 : props.rect.y + 40
  return {
    'left': `${left}px`,
    'top': `${top}px`,
    '--arrow-offset-left': `${props.rect.x - left < 35 ? 35 : props.rect.x - left - 35}px`,
  }
})

function onOperate(type: MessageToolOperateType) {
  emit('operate', type)
}
function onClickOutside() {
  visible.value = false
}
</script>

<template>
  <wd-root-portal>
    <view v-if="visible" class="w-screen h-screen bg-transparent fixed top-0 left-0 z-99" @touchstart="onClickOutside">
      <view :class="[cs.m('wrapper'), isOffsetBottom && 'offset-bottom']" :style="wrapperStyle" @click.stop>
        <view :class="cs.m('item')" @click.stop="onOperate('copy')">
          <view class="copy-float-menu-icon bg-white size-28px" />
          <text>复制全文</text>
        </view>
        <view v-if="operateType !== 'user'" :class="cs.m('item')" @click.stop="onOperate('excerptCopy')">
          <view class="excerpt-copy-float-menu-icon bg-white size-28px" />
          <text>节选</text>
        </view>
        <view v-if="operateType !== 'user'" :class="cs.m('item')" @click.stop="onOperate('favorite')">
          <view class="favorite-float-menu-icon bg-white size-28px" />
          <text>收藏</text>
        </view>
        <view :class="cs.m('item')" @click.stop="onOperate('delete')">
          <view class="delete-float-menu-icon bg-white size-28px" />
          <text>删除</text>
        </view>
        <view :class="cs.m('item')" @click.stop="onOperate('refresh')">
          <view class="refresh-float-menu-icon bg-white size-28px" />
          <text>重新生成</text>
        </view>
        <view :class="cs.m('item')" @click.stop="onOperate('publish')">
          <view class="publish-icon bg-white size-28px" />
          <text>发布</text>
        </view>
        <view :class="cs.m('item')" @click.stop="onOperate('share')">
          <view class="share-icon bg-white size-26px" />
          <text>分享</text>
        </view>
        <!-- <view v-if="!messageTextToSpeaking" :class="cs.m('item')" @click.stop="onOperate('voice')">
          <view class="speaker-float-menu-icon bg-white size-50rpx" />
          <text>语音播放</text>
        </view>
        <view v-else :class="cs.m('item')" @click.stop="onOperate('stopVoice')">
          <view class="i-material-symbols-stop-rounded bg-white text-50rpx" />
          <text>停止播放</text>
        </view> -->
      </view>
    </view>
  </wd-root-portal>
</template>

<style lang='scss' scoped>
.hi-message-tool--wrapper {
  position: absolute;
  background-color: #484848;
  color: white;
  z-index: 9999;
  min-width: 240px;
  width: 70vw;
  height: 170px;
  border-radius: 30rpx;
  // display: flex;
  // flex-direction: column;
  // justify-content: center;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  // -webkit-backdrop-filter: blur(5px);
  // backdrop-filter: blur(5px);
  // 箭头
  padding: 10rpx 20rpx;
  &::before {
    content: '';
    position: absolute;
    top: -18rpx;
    left: var(--arrow-offset-left);
    width: 0;
    height: 0;
    border-left: 20rpx solid transparent;
    border-right: 20rpx solid transparent;
    border-bottom: 20rpx solid #484848;
  }
}
.hi-message-tool--wrapper.offset-bottom {
  &::before {
    top: auto;
    bottom: -18rpx;
    border-left: 20rpx solid transparent;
    border-right: 20rpx solid transparent;
    border-top: 20rpx solid #484848;
    border-bottom: none;
  }
}
.hi-message-tool--item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}
</style>
