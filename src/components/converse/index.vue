<script lang='ts' setup>
import type { CSSProperties } from 'vue'
import { getCurrentInstance, nextTick, onMounted, ref } from 'vue'
import { api } from '@/api'
import { useClassesName, useUUID } from '@/composables'
import { useMessageInject } from '@/composables/inject'
import { useChatStore } from '@/store/chat'
import { useWebsocketStore } from '@/store/websocket'

const props = withDefaults(defineProps<{
  placeholder?: string
  disabled?: boolean
}>(), {
  placeholder: '你的金融助理，有什么问题可以咨询我',
})
const emit = defineEmits<{
  (e: 'resize', height: number): void
}>()

const model = defineModel({ type: String, default: '' })
const cs = useClassesName('converse')
const cursorPosition = ref(0)
const cursorSpacing = ref(40)
const converseContainerStyle = ref<CSSProperties>({
  paddingBottom: '10px',
})
const sourceActionShow = ref(false)
const messageType = ref<'text' | 'voice'>('text')
const websocketStore = useWebsocketStore()
const chatStore = useChatStore()
const messageInject = useMessageInject()

const instance = getCurrentInstance()
const query = uni.createSelectorQuery().in(instance)

function onLineChange(e) {
  cursorSpacing.value = 20 + e.height
  getConverseHeight()
}

function onKeyboardHeightChange(e) {
  converseContainerStyle.value.paddingBottom = `${e.height + 10}px`
}

async function waitConfirmMessage(text: string) {
  const data = await api.addChat()
  if (data.code === 200) {
    chatStore.currentChatId = data.result.chatId
  }
  chatStore.waitingMessageTask = {
    query: text,
    chatId: chatStore.currentChatId,
    runId: useUUID(32),
  }
  uni.navigateTo({ url: '/chat-package/pages/chat/index' })
}

function sendWaitingMessage() {
  if (chatStore.waitingMessageTask === null)
    return
  websocketStore.sendMessage(chatStore.waitingMessageTask).then(() => {
    chatStore.createTemporaryMessage({
      query: chatStore.waitingMessageTask!.query,
      chatId: chatStore.waitingMessageTask!.chatId,
    })
    messageInject?.scrollToTop()
  }).catch((err) => {
    console.log(err)
  }).finally(() => {
    chatStore.waitingMessageTask = null
  })
}

async function onConfirmMessage(content?: string) {
  if (content) {
    model.value = content
  }
  if (!model.value.trim().length)
    return
  const text = model.value.trim()
  model.value = ''
  chatStore.isReplying = true
  // 创建并保存当前消息的runId
  chatStore.currentRunId = useUUID(32)
  const messageContent = { chatId: chatStore.currentChatId, query: text, runId: chatStore.currentRunId }
  // 如果当前会话不存在，创建并保存当前会话
  if (!chatStore.currentChatId) {
    waitConfirmMessage(text)
    return
  }

  websocketStore.sendMessage(messageContent).then(() => {
    chatStore.createTemporaryMessage({
      query: text,
      chatId: chatStore.currentChatId,
    })
    messageInject?.scrollToTop()
  })
}

function onAddSource() {
  sourceActionShow.value = true
}
function onMessageTypeChange() {
  if (props.disabled) {
    return
  }
  messageType.value = messageType.value === 'text' ? 'voice' : 'text'
}

function onStopSend() {
  websocketStore.stopMessage({ runId: chatStore.currentRunId })
}

function getConverseHeight() {
  nextTick(() => {
    query
      .select('.hi-converse--wrapper')
      .boundingClientRect((rect) => {
        emit('resize', (rect as any).height)
      })
      .exec()
  })
}
function onVoiceDone(text: string, immediate?: boolean) {
  model.value = text
  messageType.value = 'text'
  if (immediate)
    onConfirmMessage()
}
function onInputFocus(e) {
  cursorPosition.value = model.value.length
}

onMounted(async () => {
  // 确保 WebSocket 连接已建立
  websocketStore.connectWebSocket()

  if (chatStore.waitingMessageTask) {
    sendWaitingMessage()
  }
  getConverseHeight()
})

defineExpose({
  onConfirmMessage,
})
</script>

<template>
  <view :class="cs.m('wrapper')" :style="converseContainerStyle">
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
          :disabled="chatStore.isReplying || disabled"
          :placeholder="placeholder"
          :show-confirm-bar="false"
          :adjust-position="false"
          :custom-textarea-class="cs.e('textarea')"
          :cursor="cursorPosition"
          :disable-default-padding="true"
          @focus="onInputFocus"
          @blur="getConverseHeight"
          @linechange="onLineChange"
          @keyboardheightchange="onKeyboardHeightChange"
          @confirm="onConfirmMessage()"
        />
      </view>

      <view v-show="messageType === 'voice'" :class="cs.m('voice')">
        <ConverseVoice @done="onVoiceDone" />
      </view>

      <view :class="cs.e('right')">
        <!-- <view class="i-weui-add2-outlined" :class="cs.e('icon')" @click="onAddSource" /> -->
        <view v-if="model.trim().length > 0" class="i-mdi-send-circle" :class="cs.e('icon')" @click="onConfirmMessage()" />
        <view v-if="chatStore.isReplying" class="converse-stop-icon" :class="cs.e('icon')" @click="onStopSend" />
      </view>
    </view>
    <text :class="cs.e('tip')">
      内容由AI生成，仅供参考
    </text>
  </view>
</template>

<style lang='scss' scoped>
.hi-converse--wrapper {
  padding-top: 10px;
}
.hi-converse--container {
  padding: 30rpx 40rpx;
  background-color: white;
  box-shadow: 0px 4rpx 16rpx 0px rgba(0, 0, 0, 0.08);
  border-radius: 26rpx;
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
  padding: 0 20rpx;
}
.hi-converse__icon {
  font-size: 56rpx;
  margin: 5px 0;
  & + & {
    margin-left: 20rpx;
  }
}
.hi-converse__tip {
  font-size: 20rpx;
  color: #666666;
  line-height: 20rpx;
  display: block;
  margin: 20rpx auto;
  text-align: center;
}
</style>
