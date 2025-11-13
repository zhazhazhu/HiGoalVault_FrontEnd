<script lang='ts' setup>
import type { PropType } from 'vue'
import type { ChatMessageAfter, ChatMessageReference } from '@/api'
import type { MessageToolOperateType } from '@/types'
import { computed, ref, watch } from 'vue'
import { useCountDown } from 'wot-design-uni'
import { useMessage } from 'wot-design-uni/components/wd-message-box'
import { api, Truth } from '@/api'
import { useClassesName, useUUID } from '@/composables'
import { useMessageInject } from '@/composables/inject'
import { useChatStore, useGlobalStore } from '@/store'
import { useWebsocketStore } from '@/store/websocket'
import { markdownToPlainText } from '@/utils'

const props = withDefaults(defineProps<{
  readonly?: boolean
  withAvatar?: boolean
}>(), {
  readonly: false,
})
const message = defineModel('message', { type: Object as PropType<ChatMessageAfter & Record<string, any>>, required: true })
console.log('message', message.value)

const messageInject = useMessageInject()
const cs = useClassesName('message-card')
const currentAnswerIndex = ref(message.value.chatQueryAnswerList.length)
const currentAnswer = computed(() => message.value.chatQueryAnswerList[currentAnswerIndex.value - 1])
const publishVisible = ref(false)
const messageToolRect = ref({
  x: 0,
  y: 0,
})
const messageToolVisible = ref(false)
const messageExcerptCopyPopupVisible = ref(false)
const messageTextToSpeaking = ref(false)
const globalStore = useGlobalStore()
const qCloudAIVoice = requirePlugin('QCloudAIVoice')
const innerAudioContext = uni.createInnerAudioContext()
const audioUrl = ref('')
const { start, reset } = useCountDown({
  time: 50 * 1000,
  onFinish() {
    audioUrl.value = ''
    innerAudioContext.destroy()
  },
})
const messageBox = useMessage()
const currentLongPressType = ref<'response' | 'step' | 'user'>()

innerAudioContext.onPlay(() => {
  console.log('音频开始播放')
})
innerAudioContext.onEnded(() => {
  reset()
  messageTextToSpeaking.value = false
})
innerAudioContext.onError((res) => {
  reset()
  messageTextToSpeaking.value = false
  console.error('音频播放错误:', res.errCode)
  uni.showToast({
    title: '音频播放失败',
    icon: 'error',
  })
})

// 初始化QCloudAIVoice配置
async function initQCloudAIVoice() {
  try {
    // 确保STS临时密钥已获取
    await globalStore.generateStsTempKey()

    if (!globalStore.stsTempConfig) {
      console.error('STS临时密钥获取失败')
      return false
    }

    qCloudAIVoice.setQCloudSecret(1308154027, globalStore.stsTempConfig.tmpSecretId, globalStore.stsTempConfig.tmpSecretKey, true, globalStore.stsTempConfig.token)

    console.log('QCloudAIVoice 初始化成功')
    return true
  }
  catch (error) {
    console.error('QCloudAIVoice 初始化失败:', error)
    return false
  }
}

watch(() => message.value.chatQueryAnswerList.length, (val) => {
  currentAnswerIndex.value = val
})

const userInstance = ref<Element>()
const check = ref(false)
const chatStore = useChatStore()
const websocketStore = useWebsocketStore()
const showMessageButtons = computed(() => !messageInject.share.value.isChecked && !props.readonly && !currentAnswer.value.isLoading)

function changeCheckbox({ value }: { value: boolean }) {
  if (value)
    messageInject.share.value.ids.push(currentAnswer.value.queryId)
  else
    messageInject.share.value.ids = messageInject.share.value.ids.filter(item => item !== currentAnswer.value.queryId)
}

watch(() => messageInject.share.value.isChecked, (val) => {
  if (!val) {
    check.value = false
  }
})

function onReference(item: ChatMessageReference) {
  uni.setClipboardData({
    data: item.url,
    showToast: false,
    success() {
      uni.showToast({
        title: '链接已复制',
        icon: 'none',
      })
    },
  })
}
function onRefresh() {
  if (chatStore.isReplying)
    return
  chatStore.isReplying = true
  const currentRunId = useUUID(32)
  const currentTemporaryMessageId = message.value.msgId
  websocketStore.sendMessage({ chatId: chatStore.currentChatId, runId: currentRunId, msgId: currentTemporaryMessageId, query: message.value.query }).then(() => {
    chatStore.currentRunId = currentRunId
    chatStore.currentTemporaryMessageId = currentTemporaryMessageId
    chatStore.pushTemporaryMessage(currentTemporaryMessageId)
  })
}
function onCopy() {
  let content = ''
  switch (currentLongPressType.value) {
    case 'response':
      content = markdownToPlainText(currentAnswer.value.response || '')
      break
    case 'step':
      content = currentAnswer.value.steps?.map(item => `${item.message}\n\n${markdownToPlainText(item.thinking || '')}`).join('\n') || ''
      break
    case 'user':
      content = message.value.query
      break
  }
  uni.setClipboardData({
    data: content,
    showToast: true,
  })
}

function openSharePopup() {
  messageInject.share.value.isChecked = true
}
function onPublish() {
  publishVisible.value = true
}
async function onFavorite() {
  if (currentAnswer.value.isCollect === Truth.FALSE) {
    const res = await api.addCollect({
      queryId: currentAnswer.value.queryId,
    })
    if (res.code === 200) {
      currentAnswer.value.isCollect = Truth.TRUE
    }
  }
  else {
    const res = await api.cancelCollect(currentAnswer.value.queryId)
    if (res.code === 200) {
      currentAnswer.value.isCollect = Truth.FALSE
    }
  }
}
function openTooltips(e: any, type: 'response' | 'step' | 'user') {
  messageToolRect.value.x = e.detail.x
  messageToolRect.value.y = e.detail.y
  messageToolVisible.value = true
  currentLongPressType.value = type
}

async function onMessageToolOperate(type: MessageToolOperateType) {
  switch (type) {
    case 'refresh':
      onRefresh()
      break
    case 'copy':
      onCopy()
      break
    case 'delete':
      messageBox.confirm({
        msg: '该对话内容将被删除无法恢复，若您之前主动分享过该对话，分享链接也将一并被删除',
        title: '提示',
      }).then(async () => {
        const res = await api.deleteChatMessageById(currentAnswer.value.queryId)
        if (res.code === 200) {
          if (currentAnswerIndex.value === 1) {
            chatStore.messages = chatStore.messages.filter(item => item.msgId !== message.value.msgId)
          }
          else {
            message.value.chatQueryAnswerList = message.value.chatQueryAnswerList.filter(item => item.queryId !== currentAnswer.value.queryId)
          }
          uni.showToast({
            title: '删除成功',
            icon: 'none',
          })
        }
      })
      break
    case 'voice': {
      const content = markdownToPlainText(currentAnswer.value.response || '').substring(0, 100)
      await textToSpeech(content)
      break
    }
    case 'stopVoice':
      stopTextToSpeech()
      break
    case 'excerptCopy':
      messageExcerptCopyPopupVisible.value = true
      break
    case 'publish':
      onPublish()
      break
    case 'share':
      check.value = true
      messageInject.share.value.ids.push(currentAnswer.value.queryId)
      openSharePopup()
      break
    default:
      break
  }
}
async function textToSpeech(content: string) {
  if (messageTextToSpeaking.value) {
    return
  }
  if (audioUrl.value && audioUrl.value.length > 0) {
    messageTextToSpeaking.value = true
    innerAudioContext.play()
    return
  }
  // 确保QCloudAIVoice已正确初始化
  const isInitialized = await initQCloudAIVoice()
  if (!isInitialized) {
    uni.showToast({
      title: '语音服务初始化失败',
      icon: 'error',
    })
    return
  }
  qCloudAIVoice.textToSpeech({
    content,
    voiceType: 0,
    success(data) {
      messageTextToSpeaking.value = true
      audioUrl.value = data.result.filePath // data.result.filePath返回的url有效期为1分钟，若需要播放，建议自行存储音频数据
      if (audioUrl.value && audioUrl.value.length > 0) {
        reset()
        start()
        innerAudioContext.autoplay = true
        innerAudioContext.src = audioUrl.value
      }
    },
    fail(error) {
      console.error('语音合成失败:', error)
      uni.showToast({
        title: '语音合成失败',
        icon: 'error',
      })
    },
  })
}
function stopTextToSpeech() {
  innerAudioContext.pause()
  reset()
  messageTextToSpeaking.value = false
}
</script>

<template>
  <view :class="cs.m('wrapper')">
    <wd-root-portal>
      <wd-toast />
      <wd-message-box />
    </wd-root-portal>
    <publish-popup v-model="publishVisible" :message="currentAnswer" />
    <message-excerpt-copy-popup v-model="messageExcerptCopyPopupVisible" :message="currentAnswer" :type="currentLongPressType" />
    <message-tool v-model:visible="messageToolVisible" :rect="messageToolRect" :operate-type="currentLongPressType" :message-text-to-speaking="messageTextToSpeaking" @operate="onMessageToolOperate" />

    <wd-checkbox
      v-model="check"
      shape="square"
      :disabled="!messageInject.share.value.isChecked"
      size="26px"
      :custom-class="[cs.m('checkbox-message'), cs.is('hidden', !messageInject.share.value.isChecked)].join(' ')"
      :custom-label-class="cs.m('checkbox-text')"
      :custom-shape-class="cs.m('checkbox-shape')"
      @change="changeCheckbox"
    >
      <view v-if="withAvatar" class="flex items-center gap-20rpx mb-10px">
        <wd-img :src="message.face" round mode="aspectFill" :width="26" :height="26" />
        <view>{{ message.nickName }}</view>
      </view>
      <view ref="userInstance" :class="cs.m('user')" @longpress="(e) => openTooltips(e, 'user')">
        {{ message.query }}
      </view>

      <view :class="cs.m('model')">
        <message-response-card
          enable-label
          :data="currentAnswer"
          @click-steps="currentAnswer.showSteps = !currentAnswer.showSteps"
          @long-press-content="openTooltips"
        />

        <view v-show="currentAnswer.isLoading" class="flex items-center gap-8px my-10px">
          <view class="i-line-md-loading-twotone-loop text-40rpx" />
          <text class="text-14px color-#333">
            正在生成...
          </text>
        </view>

        <template v-if="showMessageButtons">
          <wd-divider color="#cecece" custom-style="padding: 0" />

          <view :class="cs.e('operations')" class="flex items-center gap-14px">
            <!-- <view v-show="!messageTextToSpeaking" class="wave-icon size-28px bg-#00bf00" @click="stopTextToSpeech" /> -->
            <view :class="cs.e('icon-button')" @click="onRefresh">
              <view class="i-mdi-refresh icon" />
            </view>
            <view :class="cs.e('icon-button')" @click="onCopy">
              <view class="i-mingcute-copy-2-line icon" />
            </view>
            <view v-show="message.chatQueryAnswerList.length > 1" class="flex items-center text-14px gap-8px">
              <view class="size-26px flex items-center justify-center">
                <view class="i-material-symbols-arrow-back-ios-rounded text-16px" :class="[{ 'opacity-30': currentAnswerIndex === 1 }]" @click="currentAnswerIndex = currentAnswerIndex > 1 ? currentAnswerIndex -= 1 : 1" />
              </view>
              <view>
                {{ currentAnswerIndex }}/{{ message.chatQueryAnswerList.length }}
              </view>
              <view class="size-26px flex items-center justify-center">
                <view class="i-material-symbols-arrow-forward-ios-rounded text-16px" :class="[{ 'opacity-30': currentAnswerIndex === message.chatQueryAnswerList.length }]" @click="currentAnswerIndex = currentAnswerIndex < message.chatQueryAnswerList.length ? currentAnswerIndex += 1 : message.chatQueryAnswerList.length" />
              </view>
            </view>
            <view class="flex-1" />
            <view :class="cs.e('icon-button')" @click="onFavorite">
              <view v-show="currentAnswer.isCollect === Truth.FALSE" class="i-ic-round-star-border icon" />
              <view v-show="currentAnswer.isCollect === Truth.TRUE" class="i-ic-round-star icon color-[var(--hi-primary-color)]" />
            </view>
            <view :class="cs.e('icon-button')" @click="onPublish">
              <view class="i-material-symbols-upload-rounded icon" />
            </view>
            <view :class="cs.e('icon-button')" @click="openSharePopup">
              <view class="wechat-icon icon" />
            </view>
          </view>
        </template>
      </view>

      <view :class="cs.m('reference')">
        <view v-for="item, index in currentAnswer.reference" :key="index" :class="cs.e('reference-item')" @click="onReference(item)">
          <view class="next-level-icon size-16px mr-6px" />
          <text>{{ item.name }}</text>
        </view>
      </view>
    </wd-checkbox>
  </view>
</template>

<style lang='scss' scoped>
.hi-message-card--wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  transform: scaleY(-1);
  -webkit-transform: scaleY(-1);
  padding: 0 32rpx;
  width: 100%;
}
.hi-message-card--user {
  background: var(--hi-primary-color);
  color: #fff;
  // background-color: #fff;
  // color: #3a3a3a;
  padding: 10px 16px;
  font-size: 15px;
  border-radius: 12px 12px 2px 12px;
  width: fit-content;
  margin-bottom: 10px;
}
.hi-message-card--model {
  background-color: #f7f8f9;
  padding: 10px 16px;
  border-radius: 12px;
  width: 100%;
  font-size: 17px;
  color: #121212;
  line-height: 20px;
  margin-bottom: 10px;
  margin-right: auto;
}
.hi-message-card--reference {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #f7f8f9;
}
.hi-message-card__reference-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: rgba(102, 102, 102, 0.08);
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
}
.hi-message-card__icon-button {
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  .icon {
    font-size: 22px;
    width: 22px;
    height: 22px;
  }
}
</style>
