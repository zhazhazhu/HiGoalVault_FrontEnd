<script lang='ts' setup>
import type { ChatMessageAfter, ChatMessageReference } from '@/api'
import { useClassesName, useUUID } from '@higoal/hooks'
import { computed, reactive, ref, watch } from 'vue'
import { api } from '@/api'
import { useMessageInject } from '@/composables/inject'
import { useChatStore } from '@/store'
import { useWebsocketStore } from '@/store/websocket'
import { markdownToText } from '@/utils'

const props = defineProps<{
  message: ChatMessageAfter
}>()

const messageInject = useMessageInject()
const cs = useClassesName('message-card')
const currentAnswerIndex = ref(props.message.chatQueryAnswerList.length)
const currentAnswer = computed(() => props.message.chatQueryAnswerList[currentAnswerIndex.value - 1])
const publishVisible = ref(false)
const messageToolRect = reactive({
  x: 0,
  y: 0,
})
const messageToolVisible = ref(false)

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
  const response = markdownToText(currentAnswer.value.response || '')
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
function onFavorite() {
  api.addCollect({
    chatId: props.message.chatId,
    queryId: currentAnswer.value.queryId,
    msgId: props.message.msgId,
  })
}
function openTooltips(e) {
  if (messageInject.currentToolMessageId.value === props.message.msgId)
    return
  messageInject.currentToolMessageId.value = props.message.msgId
  messageToolRect.x = e.detail.x
  messageToolRect.y = e.detail.y
  messageToolVisible.value = true
}
</script>

<template>
  <view :class="cs.m('wrapper')">
    <wd-toast />
    <publish-popup v-model="publishVisible" :message="currentAnswer" />

    <wd-checkbox
      v-model="check"
      shape="square"
      :disabled="!messageInject.share.value.isChecked"
      size="20px" :custom-class="[cs.m('checkbox-message'), cs.is('hidden', !messageInject.share.value.isChecked)].join(' ')"
      :custom-label-class="cs.m('checkbox-text')"
      :custom-shape-class="cs.m('checkbox-shape')"
      @change="changeCheckbox"
    >
      <view ref="userInstance" :class="cs.m('user')">
        {{ message.query }}
      </view>

      <view :class="cs.m('model')">
        <message-tool :id="message.msgId" :rect="messageToolRect" />

        <message-response-card :data="currentAnswer" @longpress="openTooltips" />

        <view v-show="!messageInject.share.value.isChecked" :class="cs.e('operations')" class="flex items-center mt-18px gap-14px">
          <view class="refresh-icon size-30px" @click="onRefresh" />
          <view class="copy-icon size-30px" @click="onCopy" />
          <view class="flex items-center text-14px gap-8px">
            <view class="i-material-symbols-arrow-back-ios-rounded size-30rpx" :class="[{ 'opacity-30': currentAnswerIndex === 1 }]" @click="currentAnswerIndex = currentAnswerIndex > 1 ? currentAnswerIndex - 1 : 1" />
            <view>
              {{ currentAnswerIndex }}/{{ props.message.chatQueryAnswerList.length }}
            </view>
            <view class="i-material-symbols-arrow-forward-ios-rounded size-30rpx" :class="[{ 'opacity-30': currentAnswerIndex === props.message.chatQueryAnswerList.length }]" @click="currentAnswerIndex = currentAnswerIndex < props.message.chatQueryAnswerList.length ? currentAnswerIndex + 1 : props.message.chatQueryAnswerList.length" />
          </view>
          <view class="flex-1" />
          <view class="favorite-icon size-30px" @click="onFavorite" />
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
