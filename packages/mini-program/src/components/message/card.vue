<script lang='ts' setup>
import type { ChatMessageAfter, ChatMessageReference } from '@/api'
import type { MessageToolOperateType } from '@/types'
import { useClassesName, useUUID } from '@higoal/hooks'
import { computed, ref, watch } from 'vue'
import { useCountDown } from 'wot-design-uni'
import { api, Truth } from '@/api'
import { useMessageInject } from '@/composables/inject'
import { useChatStore, useGlobalStore } from '@/store'
import { useWebsocketStore } from '@/store/websocket'
import { markdownToPlainText } from '@/utils'

const props = withDefaults(defineProps<{
  message: ChatMessageAfter & Record<string, any>
  readonly?: boolean
  withAvatar?: boolean
}>(), {
  readonly: false,
})

const messageInject = useMessageInject()
const cs = useClassesName('message-card')
const currentAnswerIndex = ref(props.message.chatQueryAnswerList.length)
const currentAnswer = computed(() => props.message.chatQueryAnswerList[currentAnswerIndex.value - 1])
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

watch(() => props.message.chatQueryAnswerList.length, (val) => {
  currentAnswerIndex.value = val
})

const userInstance = ref<Element>()
const check = ref(false)
const chatStore = useChatStore()
const websocketStore = useWebsocketStore()

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
    showToast: true,
  })
}

function onRefresh() {
  chatStore.currentRunId = useUUID(32)
  chatStore.currentTemporaryMessageId = props.message.msgId
  chatStore.isReplying = true
  websocketStore.sendMessage({ chatId: chatStore.currentChatId, runId: chatStore.currentRunId, msgId: props.message.msgId, query: props.message.query }).then(() => {
    chatStore.pushTemporaryMessage(props.message.msgId)
  })
}
function onCopy() {
  const response = markdownToPlainText(currentAnswer.value.response || '')
  uni.setClipboardData({
    data: `${currentAnswer.value.message}\n${response}`,
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
function openTooltips(e) {
  messageToolRect.value.x = e.detail.x
  messageToolRect.value.y = e.detail.y
  messageToolVisible.value = true
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
    <wd-toast />
    <publish-popup v-model="publishVisible" :message="currentAnswer" />
    <message-excerpt-copy-popup v-model="messageExcerptCopyPopupVisible" :message="currentAnswer" />
    <message-tool v-model:visible="messageToolVisible" :rect="messageToolRect" :message-text-to-speaking="messageTextToSpeaking" @operate="onMessageToolOperate" />

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
        <wd-img :src="message.face" round :width="26" :height="26" />
        <view>{{ message.nickName }}</view>
      </view>
      <view ref="userInstance" :class="cs.m('user')">
        {{ message.query }}
      </view>

      <view :class="cs.m('model')">
        <message-response-card :data="currentAnswer" @long-press-content="openTooltips" />

        <view v-show="currentAnswer.isLoading" class="i-eos-icons-three-dots-loading text-100rpx color-[var(--hi-primary-color)]" />

        <view v-show="!messageInject.share.value.isChecked && !readonly" :class="cs.e('operations')" class="flex items-center mt-18px gap-8px">
          <!-- <view v-show="!messageTextToSpeaking" class="wave-icon size-28px bg-#00bf00" @click="stopTextToSpeech" /> -->
          <view class="refresh-icon size-28px" @click="onRefresh" />
          <view class="copy-icon size-30px" @click="onCopy" />
          <view class="flex items-center text-14px gap-8px">
            <view class="size-30px flex items-center justify-center">
              <view class="i-material-symbols-arrow-back-ios-rounded text-34rpx" :class="[{ 'opacity-30': currentAnswerIndex === 1 }]" @click="currentAnswerIndex = currentAnswerIndex > 1 ? currentAnswerIndex - 1 : 1" />
            </view>
            <view>
              {{ currentAnswerIndex }}/{{ props.message.chatQueryAnswerList.length }}
            </view>
            <view class="size-30px flex items-center justify-center">
              <view class="i-material-symbols-arrow-forward-ios-rounded text-34rpx" :class="[{ 'opacity-30': currentAnswerIndex === props.message.chatQueryAnswerList.length }]" @click="currentAnswerIndex = currentAnswerIndex < props.message.chatQueryAnswerList.length ? currentAnswerIndex + 1 : props.message.chatQueryAnswerList.length" />
            </view>
          </view>
          <view class="flex-1" />
          <view v-show="currentAnswer.isCollect === Truth.FALSE" class="i-ic-round-star-border size-24px mx-4px" @click="onFavorite" />
          <view v-show="currentAnswer.isCollect === Truth.TRUE" class="i-ic-round-star size-24px color-[var(--hi-primary-color)] mx-4px" @click="onFavorite" />
          <view class="share-icon size-30px" @click="onPublish" />
          <view class="wechat-icon size-30px" @click="openSharePopup" />
        </view>
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
}
.hi-message-card--user {
  background: linear-gradient(270deg, #ff3b30 0%, #fc6146 100%);
  color: #fff;
  padding: 10px 16px;
  font-size: 16px;
  border-radius: 12px 12px 0px 12px;
  width: fit-content;
  margin-bottom: 10px;
}
.hi-message-card--model {
  background-color: #fff;
  padding: 10px 16px;
  border-radius: 12px;
  width: fit-content;
  font-size: 16px;
  color: #121212;
  line-height: 20px;
  margin-bottom: 10px;
}
.hi-message-card--reference {
  display: flex;
  flex-direction: column;
  width: 100%;
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
</style>
