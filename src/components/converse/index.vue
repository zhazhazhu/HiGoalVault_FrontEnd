<script lang='ts' setup>
import type { CSSProperties } from 'vue'
import { getCurrentInstance, nextTick, onMounted, ref } from 'vue'
import { api } from '@/api'
import { debounce, useClassesName, useUUID } from '@/composables'
import { useMessageInject } from '@/composables/inject'
import { useChatStore } from '@/store/chat'
import { useWebsocketStore } from '@/store/websocket'

const props = withDefaults(defineProps<{
  placeholder?: string
  disabled?: boolean
}>(), {
  placeholder: '你的金融助理，随便问我',
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
const messageType = ref<'text' | 'voice'>('voice')
const websocketStore = useWebsocketStore()
const chatStore = useChatStore()
const messageInject = useMessageInject()

const instance = getCurrentInstance()
const query = uni.createSelectorQuery().in(instance)

function init() {
  if (chatStore.waitingMessageTask) {
    sendWaitingMessage()
  }
  getConverseHeight()
}
function onLineChange(e) {
  cursorSpacing.value = 20 + e.height
  getConverseHeight()
}

function onKeyboardHeightChange(e) {
  converseContainerStyle.value.paddingBottom = `${e.height + 10}px`
}
const pages = getCurrentPages()
async function waitConfirmMessage(text: string) {
  const data = await api.addChat()
  if (data.code === 200) {
    chatStore.currentChatId = data.result.chatId
  }
  chatStore.currentRunId = useUUID(32)
  chatStore.waitingMessageTask = {
    query: text,
    chatId: data.result.chatId,
    runId: chatStore.currentRunId,
  }
  if (pages[pages.length - 1].route === 'chat-package/pages/chat/index') {
    sendWaitingMessage()
  }
  else {
    uni.navigateTo({ url: '/chat-package/pages/chat/index' })
  }
}

function sendWaitingMessage() {
  if (chatStore.waitingMessageTask === null)
    return

  websocketStore.sendMessage(chatStore.waitingMessageTask).then(() => {
    chatStore.isReplying = true
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
const isSending = ref(false)

async function confirmMessage(content?: string) {
  if (chatStore.isReplying || props.disabled)
    return

  isSending.value = true
  if (content) {
    model.value = content
  }
  if (!model.value.trim().length) {
    isSending.value = false
    return
  }
  const text = model.value.trim()
  // 检查是否包含敏感词
  const hasSensitive = await api.hasSensitiveWord(text)
  if (hasSensitive.result) {
    uni.showToast({
      title: '包含敏感词，无法发送',
      icon: 'none',
    })
    isSending.value = false
    return
  }
  model.value = ''

  // 创建并保存当前消息的runId
  const currentRunId = useUUID(32)
  const messageContent = { chatId: chatStore.currentChatId, query: text, runId: currentRunId }
  // 如果当前会话不存在，创建并保存当前会话
  if (!chatStore.currentChatId) {
    waitConfirmMessage(text)
    return
  }
  chatStore.isReplying = true

  websocketStore.sendMessage(messageContent).then(() => {
    chatStore.currentRunId = currentRunId
    chatStore.createTemporaryMessage({
      query: text,
      chatId: chatStore.currentChatId,
    })
    messageInject?.scrollToTop()
  }).finally(() => {
    isSending.value = false
  })
}

const onConfirmMessage = debounce((content?: string) => {
  confirmMessage(content)
}, 300)

// eslint-disable-next-line unused-imports/no-unused-vars
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
  chatStore.isReplying = false
  websocketStore.stopMessage({ runId: chatStore.currentRunId, queryId: chatStore.currentAnswer?.queryId })
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
function onInputFocus() {
  cursorPosition.value = model.value.length
}

onMounted(() => {
  init()
})

defineExpose({
  onConfirmMessage,
  confirmMessage,
})
</script>

<template>
  <view :class="cs.m('wrapper')" :style="converseContainerStyle">
    <ConverseSourceAction v-model="sourceActionShow" />

    <view :class="cs.m('container')">
      <view class="flex items-center w-full z-9">
        <view :class="cs.e('left')">
          <!-- <view :class="[cs.e('icon'), messageType === 'text' ? 'i-weui-voice-outlined' : 'i-weui-keyboard-outlined']" @click="onMessageTypeChange" /> -->
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
          <view :class="[cs.e('icon'), messageType === 'text' ? 'message-voice-icon' : 'message-keyboard-icon']" @click="onMessageTypeChange" />
          <!-- <view class="i-weui-add2-outlined" :class="cs.e('icon')" @click="onAddSource" /> -->
          <view v-if="model.trim().length > 0" class="message-send-icon" :class="cs.e('icon')" @click="onConfirmMessage()" />
          <view v-if="chatStore.isReplying" class="message-stop-icon" :class="cs.e('icon')" @click="onStopSend" />
        </view>
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
  background-color: white;
  padding-left: 32rpx;
  padding-right: 32rpx;
}
// 渐变流动动画
@keyframes gradientFlow {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

.hi-converse--container {
  padding: 0 18rpx;
  height: 50px;
  background-color: white;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  position: relative;

  // 创建渐变边框效果
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 24rpx;
    background: linear-gradient(45deg, #abbaff, #1763eb, #45b7d1, #54a0ff, #ffc88e, #ff9ff3, #5f27cd, #ff6b6b);
    background-size: 400% 400%;
    animation: gradientFlow 3s ease infinite;
  }

  // 内部背景
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    border-radius: 22rpx;
  }
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
  width: 56rpx;
  height: 56rpx;
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
