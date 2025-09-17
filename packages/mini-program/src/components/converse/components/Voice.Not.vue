<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import { ref } from 'vue'
import RecordPopup from '~/components/record/popup.vue'

const cs = useClassesName('voice')
const isRecording = ref(false)
const recordPopupFocusedButton = ref<'cancel' | 'microphone' | 'text' | null>(null)
const recordPopupRef = ref<InstanceType<typeof RecordPopup>>()

function onTouchStart() {
  recordPopupFocusedButton.value = 'microphone'
  isRecording.value = true
}

function onTouchEnd() {
  recordPopupFocusedButton.value = null
  isRecording.value = false
}
function onTouchMove(event) {
  const touch = event.touches[0]

  // 使用小程序的方式获取按钮组元素信息
  recordPopupRef.value?.buttonGroup.boundingClientRect((data) => {
    if (data && !Array.isArray(data)) {
      const buttonGroupRect = data as UniApp.NodeInfo
      const centerX = (buttonGroupRect.left || 0) + (buttonGroupRect.width || 0) / 2
      const touchX = touch.clientX

      // 检查触摸点是否还在按钮组范围内
      const isInButtonGroup = touchX >= (buttonGroupRect.left || 0)
        && touchX <= (buttonGroupRect.right || 0)
        && touch.clientY >= (buttonGroupRect.top || 0)
        && touch.clientY <= (buttonGroupRect.bottom || 0)

      if (isInButtonGroup) {
        // 根据触摸位置判断聚焦哪个按钮
        const leftThreshold = centerX - 50 // 左侧阈值
        const rightThreshold = centerX + 50 // 右侧阈值

        if (touchX < leftThreshold) {
          recordPopupFocusedButton.value = 'cancel'
        }
        else if (touchX > rightThreshold) {
          recordPopupFocusedButton.value = 'text'
        }
        else {
          recordPopupFocusedButton.value = 'microphone'
        }
      }
      else {
        // 如果滑出按钮组范围，取消所有聚焦
        recordPopupFocusedButton.value = null
        isRecording.value = false
      }
    }
  }).exec()
}
</script>

<template>
  <RecordPopup ref="recordPopupRef" v-model="isRecording" :focused-button="recordPopupFocusedButton" />

  <view :class="cs.m('wrapper')" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
    按住 说话
  </view>
</template>

<style lang='scss' scoped>
.hi-voice--wrapper {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  line-height: 36px;
}
</style>
