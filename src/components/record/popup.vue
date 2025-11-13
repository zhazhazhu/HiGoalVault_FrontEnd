<script lang='ts' setup>
import { computed, getCurrentInstance } from 'vue'
import { useClassesName } from '@/composables'

const props = defineProps<{
  focusedButton: 'cancel' | 'microphone' | 'text' | null
  decibel: number
  isConnecting: boolean
  text: string
}>()
const model = defineModel({ type: Boolean, default: false })
const cs = useClassesName('record')
const voiceCs = useClassesName('voice')
const instance = getCurrentInstance()
const query = uni.createSelectorQuery().in(instance)
const tipText = computed(() => {
  if (props.focusedButton === 'cancel') {
    return '松手取消'
  }
  else if (props.focusedButton === 'microphone') {
    return '松开发送'
  }
  return '松开编辑文字'
})

function handleClose() {
  model.value = false
}

defineExpose({
  query,
})
</script>

<template>
  <view v-if="model" class="fixed top-0 left-0 w-screen h-screen z-9999">
    <view
      class="w-screen h-screen voice-popup-wrapper"
      @click="handleClose"
    />

    <view :class="[cs.m('container')]">
      <view class="chat-wrapper" :class="{ show: focusedButton === 'microphone' }">
        <RecordWave v-if="isConnecting" :visible="model" :decibel="decibel" />
        <view v-else>
          <view class="i-line-md-loading-twotone-loop text-20px" />
        </view>
      </view>
      <view class="chat-wrapper text" :class="{ show: focusedButton === 'text' }">
        <wd-textarea
          :model-value="text"
          no-border
          auto-height
          confirm-type="send"
          :fixed="true"
          :adjust-position="false"
          :show-confirm-bar="false"
          :custom-textarea-class="voiceCs.m('textarea')"
          :custom-class="voiceCs.m('textarea-container')"
          :placeholder-class="voiceCs.m('textarea-placeholder')"
        />
      </view>

      <view class="operate-container">
        <view class="operate-button cancel" :class="{ focus: focusedButton === 'cancel' }">
          取消
        </view>
        <view class="color-white text-14px">
          {{ tipText }}
        </view>
        <view class="operate-button text" :class="{ focus: focusedButton === 'text' }">
          转文字
        </view>
      </view>
      <view class="voice-button" :class="{ focus: focusedButton === 'microphone' }" />
    </view>
  </view>
</template>

<style lang='scss' scoped>
.voice-popup-wrapper {
  background: linear-gradient(0deg, #2f66fe 0%, white 40%, transparent 100%);
}

.hi-record--container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

.operate-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  text-align: center;
  justify-items: center;
  align-items: end;
  margin-bottom: 10px;
  width: 100%;
}
.operate-button {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.6);
  position: relative;
  transition: all 0.2s ease;
  &::before {
    position: absolute;
    content: '';
    width: 84px;
    height: 84px;
    border-radius: 100%;
    background: rgba(255, 255, 255, 0.1);
    transition: all 1s ease;
  }
  &.focus {
    color: rgba(0, 0, 0, 1);
    background: white;
    &::before {
      width: 90px;
      height: 90px;
    }
  }
}
.voice-button {
  position: relative;
  overflow: hidden;
  height: 130px;
  width: 100%;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 230%;
    height: 400px;
    background: linear-gradient(180deg, rgb(255 255 255 / 53%) 0%, transparent 40%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 100%;
    opacity: 1;
    transition: opacity 0.2s ease;
  }
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 230%;
    height: 400px;
    background: linear-gradient(180deg, rgb(0 0 0 / 32%) 0%, transparent 40%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 100%;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &.focus {
    &::before {
      opacity: 0;
    }
    &::after {
      opacity: 1;
    }
  }
}
.chat-wrapper {
  min-height: 64px;
  width: 140px;
  background-color: var(--hi-primary-color);
  padding: 6px 0;
  position: relative;
  display: none;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-bottom: 30px;
  &.show {
    display: flex;
  }
  &.text {
    width: 90vw;
    &::before {
      left: auto;
      right: 7vw;
    }
  }
  &::before {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid var(--hi-primary-color);
  }
}
</style>
