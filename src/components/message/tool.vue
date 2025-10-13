<script lang='ts' setup>
import type { CSSProperties } from 'vue'
import type { MessageToolOperateType } from '@/types'
import { useClassesName } from '@/composables'
import { computed } from 'vue'
import { useGlobalStore } from '@/store'

const props = defineProps<{
  rect: { x: number, y: number }
  messageTextToSpeaking: boolean
}>()
const emit = defineEmits<{
  (e: 'operate', type: MessageToolOperateType): void
}>()
const visible = defineModel('visible', { type: Boolean, default: false })
const cs = useClassesName('message-tool')
const globalStore = useGlobalStore()

const wrapperStyle = computed<CSSProperties>(() => {
  const { screenWidth, statusBarHeight } = globalStore.windowInfo!
  const left = props.rect.x > screenWidth / 2 ? props.rect.x - 150 : props.rect.x
  const top = props.rect.y > statusBarHeight ? props.rect.y - statusBarHeight : props.rect.y
  return {
    left: `${left}px`,
    top: `${top}px`,
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
      <view :class="cs.m('wrapper')" :style="wrapperStyle" @click.stop>
        <view :class="cs.m('item')" @click.stop="onOperate('delete')">
          <view class="delete-float-menu-icon bg-white size-40rpx" />
          <text>删除</text>
        </view>
        <view :class="cs.m('item')" @click.stop="onOperate('refresh')">
          <view class="refresh-float-menu-icon bg-white size-40rpx" />
          <text>重新生成</text>
        </view>
        <!-- <view v-if="!messageTextToSpeaking" :class="cs.m('item')" @click.stop="onOperate('voice')">
          <view class="speaker-float-menu-icon bg-white size-40rpx" />
          <text>语音播放</text>
        </view>
        <view v-else :class="cs.m('item')" @click.stop="onOperate('stopVoice')">
          <view class="i-material-symbols-stop-rounded bg-white text-40rpx" />
          <text>停止播放</text>
        </view> -->
        <view :class="cs.m('item')" @click.stop="onOperate('copy')">
          <view class="copy-float-menu-icon bg-white size-40rpx" />
          <text>复制</text>
        </view>
        <view :class="cs.m('item')" @click.stop="onOperate('excerptCopy')">
          <view class="excerpt-copy-float-menu-icon bg-white size-40rpx" />
          <text>节选复制</text>
        </view>
      </view>
    </view>
  </wd-root-portal>
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
