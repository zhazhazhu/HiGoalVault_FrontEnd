<script lang='ts' setup>
import type { ChatMessageStock, Page } from '@/api'
import type Converse from '@/components/converse/index.vue'
import type { NavbarInstance } from '@/components/navbar'
import type { Share } from '@/composables/inject'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { computed, onMounted, provide, ref, watch } from 'vue'
import { api } from '@/api'
import { useClassesName } from '@/composables'
import { messageInjectKey } from '@/composables/inject'
import { useResetRef } from '@/composables/useResetRef'
import { useTimeCount } from '@/composables/useTimeCount'
import { useUserStore } from '@/store'
import { useChatStore } from '@/store/chat'
import { useWebsocketStore } from '@/store/websocket'
import { useJsonParse } from '@/utils'
import Start from './components/start.vue'

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
const messages = computed(() => chatStore.messages)
const converseInstance = ref<InstanceType<typeof Converse>>()
const newMessageId = ref('')
const { start, reset, onChange } = useTimeCount()

onChange((count) => {
  chatStore.updateAnswerOfMessageByRunId(chatStore.currentRunId, {
    messageTimeLong: count,
  })
})

websocketStore.receiveMessage((data) => {
  console.log('onMessage', data)
  if (!chatStore.currentTemporaryMessage || !chatStore.currentRunId)
    return
  const currentMessage = chatStore.currentTemporaryMessage.chatQueryAnswerList.find(item => item.runId === chatStore.currentRunId)

  if (!currentMessage)
    return

  currentMessage.isLoading = true
  if (data.code === '200' && data.type === 'message') {
    newMessageId.value = data.data?.msg_id
    const currentNode = data.data?.node || ''
    const isNewNode = currentMessage.steps[currentMessage.steps.length - 1]?.node !== currentNode
    /**
     * 思考步骤阶段
     * 1. 添加新的步骤
     * 如果上一个node不同，则添加新的步骤
     * 2. 修改旧的步骤
     * 如果上一个node相同，则修改旧的步骤
     */
    if (data.data?.stage === 'thinking' || data.data?.stage === 'node begin') {
      start()
      if (isNewNode) {
        chatStore.updateAnswerOfMessageByRunId(chatStore.currentRunId, {
          showSteps: true,
          steps: [
            ...currentMessage.steps.map(item => ({ ...item, finished: true })),
            {
              node: data.data?.node,
              message: data.data?.message,
              thinking: data.data?.thinking || '',
              finished: false,
            },
          ],
        })
      }
      else {
        chatStore.updateAnswerOfMessageByRunId(chatStore.currentRunId, {
          steps: [
            ...currentMessage.steps.map((item) => {
              if (item.node === currentNode) {
                return {
                  ...item,
                  thinking: data.data?.thinking ? item.thinking + data.data?.thinking : item.thinking,
                }
              }
              return item
            }),
          ],
        })
      }
    }
    else if (data.data?.stage === 'stream') {
      chatStore.updateAnswerOfMessageByRunId(chatStore.currentRunId, {
        showSteps: !currentMessage.response,
      })
      reset()
      if (currentMessage.data) {
        const stockData = useJsonParse<[ChatMessageStock]>(currentMessage.data.analysis_data) || []
        chatStore.updateAnswerOfMessageByRunId(chatStore.currentRunId, {
          stockData,
        })
      }
      chatStore.updateAnswerOfMessageByRunId(chatStore.currentRunId, {
        ...data.data,
        steps: currentMessage.steps.map(item => ({
          ...item,
          finished: true,
        })),
        response: currentMessage.response += (data.data?.response || ''),
        reference: data.data?.reference,
        queryId: data.data?.query_id,
      })
    }
    else if (data.data?.stage === 'node end') {
      chatStore.updateAnswerOfMessageByRunId(chatStore.currentRunId, {
        ...data.data,
        data: data.data.data,
        response: currentMessage.response += (data.data?.response || ''),
        reference: data.data?.reference,
        queryId: data.data?.query_id,
      })
    }
  }
  if (data.type === 'stream-end') {
    reset()
    if (currentMessage.data) {
      const stockData = useJsonParse<[ChatMessageStock]>(currentMessage.data.analysis_data) || []
      chatStore.updateAnswerOfMessageByRunId(chatStore.currentRunId, {
        stockData,
      })
    }
    chatStore.updateAnswerOfMessageByRunId(chatStore.currentRunId, {
      showSteps: !currentMessage.response,
      steps: currentMessage.steps.map(item => ({
        ...item,
        finished: true,
      })),
      isLoading: false,
    })
    // 更新当前的messageID
    if (newMessageId.value) {
      const current = chatStore.messages.find(item => item.msgId === chatStore.currentTemporaryMessageId)!
      current.msgId = newMessageId.value
      chatStore.currentTemporaryMessageId = newMessageId.value
      newMessageId.value = ''
    }

    currentMessage.isLoading = false
    // 清空当前runId
    chatStore.currentRunId = ''
    chatStore.isReplying = false
    console.log('chatStore', chatStore.messages)
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
provide(messageInjectKey, {
  share,
  scrollToTop,
})

onMounted(() => {
  // 确保 WebSocket 连接已建立
  websocketStore.connectWebSocket()
  chatStore.messages = []
  getMessage()
  // uni.navigateTo({ url: '/chat-package/pages/chat/share?id=6abaa512-ec2e-4c36-9500-4111dae4856d' })
})

onShareAppMessage(async ({ from }) => {
  const result = {
    title: '快来看看我聊了啥～',
    path: '/chat-package/pages/chat/index',
  }
  if (from === 'button') {
    share.value.isChecked = false
    const data = await api.shareMessage({ queryIds: share.value.ids, userId: userStore.userInfo!.id })
    result.path = `/chat-package/pages/chat/share?id=${data.result.shareId}`
    share.value.ids = []
  }
  return result
})
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="refreshMessage">
    <SharePopup v-model="share.isChecked" />

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
        class="flex flex-1 h-full overflow-y-auto [scrollbar-width:none] transform"
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
        <view v-if="messages.length > 0" class="w-full">
          <MessageCard v-for="item in messages" :id="`message-${item.msgId}`" :key="`message-${item.msgId}`" :message="item" />

          <view v-show="loading || isFinish" class="flex items-center justify-center py-20rpx loading-wrapper" :class="cs.m('loading')">
            <wd-loading v-if="!isFinish" color="#FC6146FF" :size="20" />
            <text class="ml-20rpx text-24rpx">
              {{ isFinish ? '没有更多了' : '加载中...' }}
            </text>
          </view>
        </view>

        <view v-else :class="cs.m('wrapper')">
          <Start @question="(val) => converseInstance?.onConfirmMessage(val)" />
        </view>
      </scroll-view>

      <view class="px-32rpx">
        <converse ref="converseInstance" :disabled="chatStore.isReplying" />
      </view>
    </container>
  </Layout>
</template>

<style lang='scss' scoped>
.hi-messages--scroll-view {
  transform: scaleY(-1);
  -webkit-transform: scaleY(-1);
}
.hi-messages--wrapper {
  display: flex;
  flex-direction: column;
  transform: scaleY(-1);
  -webkit-transform: scaleY(-1);
  padding: 0 32rpx;
  width: 100%;
}
.hi-messages--loading {
  transform: scaleY(-1);
  -webkit-transform: scaleY(-1);
}
</style>
