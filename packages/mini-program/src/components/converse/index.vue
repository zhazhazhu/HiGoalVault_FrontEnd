<script lang='ts' setup>
import type { CSSProperties } from 'vue'
import { useClassesName } from '@higoal/hooks'
import { onMounted, onUnmounted, ref } from 'vue'
import { useWs } from '@/api/wx'
import { useMessageInject } from '@/composables/inject'
import { useChatStore } from '@/store/chat'

withDefaults(defineProps<{
  placeholder?: string
}>(), {
  placeholder: '你的金融助理，有什么问题可以咨询我',
})

const model = defineModel({ type: String, default: '' })
const cs = useClassesName('converse')
const cursorPosition = ref(0)
const cursorSpacing = ref(40)
const converseContainerStyle = ref<CSSProperties>({
  paddingBottom: '20px',
})
const sourceActionShow = ref(false)
const messageType = ref<'text' | 'voice'>('text')
const ws = useWs()
const chatStore = useChatStore()
const { scrollToTop } = useMessageInject()!
const isReplying = ref(false)

ws.onMessage((data) => {
  console.log('onMessage', data)
  if (!chatStore.currentTemporaryMessage)
    return
  if (data.code === '200') {
    data.data?.response && (chatStore.currentTemporaryMessage.response += data.data?.response)
    data.data?.message && (chatStore.currentTemporaryMessage.message += data.data?.message)
    data.data?.reference && (chatStore.currentTemporaryMessage.reference = data.data?.reference)
    scrollToTop()
  }
  if (data.type === 'stream-end') {
    isReplying.value = false
  }
})

ws.onClose(() => {
  isReplying.value = false
})

function onLineChange(e) {
  cursorSpacing.value = 20 + e.height
}

function onKeyboardHeightChange(e) {
  converseContainerStyle.value.paddingBottom = `${e.height + 20}px`
}

async function onConfirmMessage() {
  if (!model.value.trim().length)
    return
  const text = model.value.trim()
  model.value = ''
  isReplying.value = true

  ws.send({ chatId: '123', query: text }).then(() => {
    chatStore.createTemporaryMessage({
      query: text,
      chatId: '123',
    })
    scrollToTop()
  })
}

function onAddSource() {
  sourceActionShow.value = true
}
function onMessageTypeChange() {
  messageType.value = messageType.value === 'text' ? 'voice' : 'text'
}

function onStopSend() {
}

onMounted(() => {
  ws.connect()
})

onUnmounted(() => {
  ws.close()
})
</script>

<template>
  <view class="mt-20px" :class="cs.m('wrapper')" :style="converseContainerStyle">
    <ConverseSourceAction v-model="sourceActionShow" />

    <view :class="cs.m('container')">
      <view :class="cs.e('left')">
        <view :class="[cs.e('icon'), messageType === 'text' ? 'i-weui-voice-outlined' : 'i-weui-keyboard-outlined']" @click="onMessageTypeChange" />
      </view>

      <view v-show="messageType === 'text'" :class="cs.e('input')">
        <wd-textarea
          v-model="model"
          no-border
          auto-height
          confirm-type="send"
          placeholder-style="color: #666; line-height: 28px;"
          :placeholder="placeholder"
          :show-confirm-bar="false"
          :adjust-position="false"
          :custom-textarea-class="cs.e('textarea')"
          :cursor="cursorPosition"
          :disable-default-padding="true"
          @focus="() => {
            cursorPosition = model.length
          }"
          @linechange="onLineChange"
          @keyboardheightchange="onKeyboardHeightChange"
          @confirm="onConfirmMessage"
        />
      </view>

      <view v-show="messageType === 'voice'" :class="cs.m('voice')">
        <ConverseVoice />
      </view>

      <view :class="cs.e('right')">
        <view class="i-weui-add2-outlined" :class="cs.e('icon')" @click="onAddSource" />
        <view v-if="model.trim().length > 0" class="i-mdi-send-circle" :class="cs.e('icon')" @click="onConfirmMessage" />
        <view v-if="isReplying" class="i-material-symbols-stop-circle-outline-rounded" :class="cs.e('icon')" @click="onStopSend" />
      </view>
    </view>
    <text :class="cs.e('tip')">
      内容由AI生成，仅供参考
    </text>
  </view>
</template>

<style lang='scss' scoped>
.hi-converse--container {
  padding: 20px;
  background-color: white;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  display: flex;
  align-items: flex-end;
}
.hi-converse__right {
  display: flex;
  align-items: center;
}
.hi-converse__input,
.hi-converse--voice {
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
.hi-converse__tip {
  font-size: 10px;
  color: #666666;
  line-height: 10px;
  display: block;
  margin: 10px auto;
  text-align: center;
}
</style>
