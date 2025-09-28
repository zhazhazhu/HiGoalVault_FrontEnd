<script lang='ts' setup>
import type { Page } from '@/api'
import type { NavbarInstance } from '@/components/navbar'
import type { Share } from '@/composables/inject'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { useClassesName } from '@higoal/hooks'
import { onMounted, provide, ref, watch } from 'vue'
import { api } from '@/api'
import { messageInjectKey } from '@/composables/inject'
import { useResetRef } from '@/composables/useResetRef'
import { useUserStore } from '@/store'
import { useChatStore } from '@/store/chat'
import { useWebsocketStore } from '@/store/websocket'

const navbarInstance = ref<NavbarInstance>()
const cs = useClassesName('messages')
const userStore = useUserStore()
const share = ref<Share>({
  ids: [],
  isChecked: false,
})
const chatStore = useChatStore()
const [page, resetPage] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 20,
  sort: 'createTime',
})
const scrollTop = ref(0)
const showSidebar = ref(false)
const isFinish = ref(false)
const websocketStore = useWebsocketStore()

websocketStore.receiveMessage((data) => {
  console.log('onMessage', data)
  if (!chatStore.currentTemporaryMessage || !chatStore.currentRunId)
    return
  const currentMessage = chatStore.currentTemporaryMessage.chatQueryAnswerList.find(item => item.runId === chatStore.currentRunId)
  if (!currentMessage)
    return

  currentMessage.isLoading = true
  if (data.code === '200') {
    data.data?.response && (currentMessage.response += data.data?.response)
    data.data?.message && (currentMessage.message += data.data?.message)
    data.data?.reference && (currentMessage.reference = data.data?.reference)
    scrollToTop()
  }
  if (data.type === 'stream-end') {
    currentMessage.isLoading = false
    // 清空当前runId
    chatStore.currentRunId = ''
    chatStore.isReplying = false
  }
})

watch(() => share.value.isChecked, (newVal) => {
  if (!newVal) {
    share.value.ids = []
  }
})

function scrollToTop() {
  scrollTop.value = 0
}
const loading = ref(false)

async function getMessage() {
  if (!chatStore.currentChatId)
    return
  const data = await api.getMessageList({ userId: userStore.userInfo!.id, chatId: chatStore.currentChatId, ...page.value })
  if (data.code === 200) {
    const _messages = data.result.records.map(chatStore.transformMessage)
    chatStore.messages.push(..._messages)
    isFinish.value = data.result.total <= chatStore.messages.length
    loading.value = false
  }
}
function refreshMessage() {
  chatStore.messages = []
  resetPage()
  getMessage()
}
async function loadMessage() {
  if (loading.value || isFinish.value)
    return
  loading.value = true
  page.value.pageNumber!++
  await getMessage()
}
function onNavbarLeftClick() {
  if (share.value.isChecked) {
    share.value.isChecked = false
    return
  }
  showSidebar.value = !showSidebar.value
}
function onTabChange(e: number) {
  if (e === 1) {
    uni.redirectTo({ url: '/pages/index/index' })
  }
}
const currentToolMessageId = ref<string | null>(null)

provide(messageInjectKey, {
  share,
  currentToolMessageId,
  scrollToTop,
})

onMounted(() => {
  // 确保 WebSocket 连接已建立
  websocketStore.connectWebSocket()
  getMessage()
  // uni.navigateTo({ url: '/pages/chat/share?id=d55d1548-e18b-4d7d-acfa-c890a0d63985' })
})

onShareAppMessage(async ({ from }) => {
  const result = {
    title: '快来看看我聊了啥～',
    path: '/pages/chat/index',
  }
  if (from === 'button') {
    const data = await api.shareMessage({ queryIds: share.value.ids, userId: userStore.userInfo!.id })
    result.path = `/pages/chat/share?id=${data.result.shareId}`
    share.value.ids = []
  }
  return result
})
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="refreshMessage" @tap="currentToolMessageId = null">
    <navbar ref="navbarInstance" :left-text="share.isChecked && '取消'" @left-click="onNavbarLeftClick">
      <template #title>
        <tabs @tab-change="onTabChange($event as any)">
          <tabs-item :name="0" label="黑狗" />
          <tabs-item :name="1" label="发现" />
        </tabs>
      </template>
    </navbar>

    <container>
      <scroll-view
        id="scroll-view"
        class="flex flex-1 h-full overflow-y-auto transform"
        scroll-into-view-alignment="end"
        enhanced
        enable-passive
        enable-flex
        :scroll-y="true"
        :show-scrollbar="false"
        :lower-threshold="50"
        :scroll-top="scrollTop"
        :class="cs.m('scroll-view')"
        @scrolltolower="loadMessage"
      >
        <view :class="cs.m('wrapper')" class="px-32rpx w-full">
          <share-popup v-model="share.isChecked" />

          <MessageCard v-for="item in chatStore.messages" :id="`message-${item.msgId}`" :key="item.msgId" :message="item" />

          <view v-show="loading || isFinish" class="flex items-center justify-center py-20rpx loading-wrapper" :class="cs.m('loading')">
            <wd-loading v-if="!isFinish" color="#FC6146FF" :size="20" />
            <text class="ml-20rpx text-24rpx">
              {{ isFinish ? '没有更多了' : '加载中...' }}
            </text>
          </view>
        </view>
      </scroll-view>

      <view class="px-32rpx">
        <converse />
      </view>
    </container>
  </Layout>
</template>

<style lang='scss' scoped>
.hi-messages--scroll-view {
  transform: scaleY(-1);
  -webkit-transform: scaleY(-1);
}
.hi-message-card--wrapper {
  display: flex;
  flex-direction: column;
  transform: scaleY(-1);
  -webkit-transform: scaleY(-1);
}
.hi-messages--loading {
  transform: scaleY(-1);
  -webkit-transform: scaleY(-1);
}
</style>
