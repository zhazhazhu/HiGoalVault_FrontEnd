<script lang='ts' setup>
import type { CSSProperties } from 'vue'
import { useClassesName } from '@higoal/hooks'
import { ref } from 'vue'
import { useSse } from '@/api'
import { ClientType } from '@/api/wx'

withDefaults(defineProps<{
  placeholder?: string
}>(), {
  placeholder: '你的金融助理，有什么问题可以咨询我',
})

const model = defineModel({ type: String, default: '' })
const cs = useClassesName('converse')
const cursorPosition = ref(0)
const cursorSpacing = ref(36)
const converseContainerStyle = ref<CSSProperties>({
  paddingBottom: '40px',
})
function onLineChange(e) {
  cursorSpacing.value = 20 + e.height
}

function onKeyboardHeightChange(e) {
  converseContainerStyle.value.paddingBottom = `${e.height + 20}px`
}

async function onConfirmMessage() {
  const _model = model.value.trim()
  model.value = ''
  const { onChunkReceived } = useSse({
    chatId: '123',
    clientType: ClientType.WECHAT_MP,
    query: _model,
  })
  onChunkReceived((data) => {
    console.log(data)
  })
}
</script>

<template>
  <view :class="cs.m('wrapper')" :style="converseContainerStyle">
    <view :class="cs.m('container')">
      <view :class="cs.e('left')">
        <view class="i-weui-voice-outlined" :class="cs.e('icon')" />
      </view>

      <view :class="cs.e('input')">
        <wd-textarea
          v-model="model"
          no-border
          auto-height
          confirm-type="send"
          placeholder-style="color: #666; line-height: 24px"
          :placeholder="placeholder"
          :show-confirm-bar="false"
          :adjust-position="false"
          :custom-textarea-class="cs.e('textarea')"
          :cursor="cursorPosition"
          @focus="() => {
            cursorPosition = model.length
          }"
          @linechange="onLineChange"
          @keyboardheightchange="onKeyboardHeightChange"
          @confirm="onConfirmMessage"
        />
      </view>

      <view :class="cs.e('right')">
        <view class="i-weui-add2-outlined" :class="cs.e('icon')" />
        <view v-if="model.trim().length > 0" class="i-fluent-color-send-16" :class="cs.e('icon')" />
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-converse--container {
  padding: 20px;
  background-color: white;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  display: flex;
  align-items: baseline;
}
.hi-converse__right {
  display: flex;
  align-items: center;
}
.hi-converse__input {
  flex: 1;
  padding: 0 10px;
}
.hi-converse__icon {
  font-size: 28px;
  width: 28px;
  height: 28px;
  padding: 5px 0;
  & + & {
    margin-left: 10px;
  }
}
</style>
