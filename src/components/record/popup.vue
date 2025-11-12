<script lang='ts' setup>
import { computed, getCurrentInstance } from 'vue'
import { useClassesName } from '@/composables'

const props = defineProps<{
  focusedButton: 'cancel' | 'microphone' | 'text' | null
  speechText: string
  decibel: number
  isConnecting: boolean
}>()
const model = defineModel({ type: Boolean, default: false })
const cs = useClassesName('record')
const instance = getCurrentInstance()
const query = uni.createSelectorQuery().in(instance)
const text = computed(() => {
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
      <view v-if="isConnecting" class="decibel-wrapper">
        <RecordWave :visible="model" :decibel="decibel" />
      </view>

      <view class="operate-container">
        <view class="operate-button cancel" :class="{ focus: focusedButton === 'cancel' }">
          取消
        </view>
        <view class="color-white text-14px">
          {{ text }}
        </view>
        <view class="operate-button text" :class="{ focus: focusedButton === 'text' }">
          转文字
        </view>
      </view>
      <view class="voice-button" :class="{ focus: focusedButton === 'microphone' }" />
    </view>
  </view>
  <!-- <wd-popup
    v-model="model"
    position="bottom"
    lazy-render
    lock-scroll
    custom-class="voice-popup"
    custom-style="border-radius: 20px 20px 0 0;"
    @close="handleClose"
  >
    <view :class="cs.m('container')">
      <template v-if="isConnecting">
        <RecordWave :visible="model" :decibel="decibel" />
      </template>
      <view v-else class="w-200px h-50px flex items-center justify-center">
        <view class="i-line-md-loading-twotone-loop text-20px" />
      </view>

      <text :class="cs.e('description')">
        {{ text }}
      </text>

      <view id="button-group" :class="cs.e('button-group')">
        <view class="transition-all" :class="[cs.e('cancel'), cs.e('secund-button'), { focus: focusedButton === 'cancel' }]">
          <view class="i-weui-close-filled icon text-28px" />
        </view>

        <view
          class="transition-all"
          :class="[cs.e('microphone'), { focus: focusedButton === 'microphone' }]"
        >
          <view class="i-iconamoon-microphone text-40px color-#333" />
        </view>

        <view class="transition-all" :class="[cs.e('text'), cs.e('secund-button'), { focus: focusedButton === 'text' }]">
          <text class="icon text-20px">
            文
          </text>
        </view>
      </view>
    </view>
  </wd-popup> -->
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
  &::before {
    position: absolute;
    content: '';
    width: 84px;
    height: 84px;
    border-radius: 100%;
    background: rgba(255, 255, 255, 0.1);
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
  }
  &.focus::before {
    background: linear-gradient(180deg, rgb(0 0 0 / 32%) 0%, transparent 40%);
  }
}
.decibel-wrapper {
  background-color: var(--hi-primary-color);
  padding: 6px 0;
  width: 140px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-bottom: 30px;
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
