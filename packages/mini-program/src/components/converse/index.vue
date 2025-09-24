<script lang='ts' setup>
import type { CSSProperties } from 'vue'
import { useClassesName } from '@higoal/hooks'
import { getCurrentInstance, nextTick, onMounted, onUnmounted, onUpdated, ref } from 'vue'
import { useWs } from '@/api/wx'
import { useMessageInject } from '@/composables/inject'
import { useChatStore } from '@/store/chat'
import { createUUID } from '@/utils'

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
  paddingBottom: '10px',
})
const sourceActionShow = ref(false)
const messageType = ref<'text' | 'voice'>('text')
const ws = useWs()
const chatStore = useChatStore()
const messageInject = useMessageInject()

const instance = getCurrentInstance()
const query = uni.createSelectorQuery().in(instance)
const height = ref(0)

ws.onMessage((data) => {
  console.log('onMessage', data)
  if (!chatStore.currentTemporaryMessage || !chatStore.currentRunId)
    return
  const currentMessage = chatStore.currentTemporaryMessage.chatQueryAnswerList.find(item => item.runId === chatStore.currentRunId)
  if (!currentMessage)
    return

  if (data.code === '200') {
    data.data?.response && (currentMessage.response += data.data?.response)
    data.data?.message && (currentMessage.message += data.data?.message)
    data.data?.reference && (currentMessage.reference = data.data?.reference)
    messageInject?.scrollToTop()
  }
  if (data.type === 'stream-end') {
    // 清空当前runId
    chatStore.currentRunId = ''
    chatStore.isReplying = false
  }
})

ws.onClose(() => {
  chatStore.isReplying = false
})

function onLineChange(e) {
  cursorSpacing.value = 20 + e.height
}

function onKeyboardHeightChange(e) {
  converseContainerStyle.value.paddingBottom = `${e.height + 10}px`
}

async function onConfirmMessage() {
  if (!model.value.trim().length)
    return
  const text = model.value.trim()
  model.value = ''
  chatStore.isReplying = true
  // 创建并保存当前消息的runId
  chatStore.currentRunId = createUUID(32)

  ws.send({ chatId: chatStore.currentChatId, query: text, runId: chatStore.currentRunId }).then(() => {
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
  messageType.value = messageType.value === 'text' ? 'voice' : 'text'
}

function onStopSend() {
  ws.stop({ runId: chatStore.currentRunId })
}

function getConverseHeight() {
  if (!instance) {
    console.error('无法获取组件实例。')
    return
  }

  nextTick(() => {
    query
      .select('.hi-converse--wrapper')
      .boundingClientRect((rect) => {
        height.value = (rect as any).height + 20
      })
      .exec()
  })
}

onMounted(() => {
  getConverseHeight()
  ws.connect()
})

onUnmounted(() => {
  ws.close()
})

defineExpose({
  height,
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
          :disabled="chatStore.isReplying"
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
  margin-top: 20px;
}
.hi-converse--container {
  padding: 30rpx 40rpx;
  background-color: white;
  box-shadow: 0px 4rpx 16rpx 0px rgba(0, 0, 0, 0.08);
  border-radius: 40rpx;
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
  width: 56rpx;
  height: 56rpx;
  padding: 5px 0;
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
