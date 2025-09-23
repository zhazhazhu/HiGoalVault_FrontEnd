<script lang='ts' setup>
import type { Page } from '@higoal/api'
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
function toggleSidebar() {
  showSidebar.value = !showSidebar.value
}

provide(messageInjectKey, {
  share,
  scrollToTop,
  refreshMessage,
  toggleSidebar,
})

onMounted(() => {
  getMessage()
})

watch(() => chatStore.messages, () => {
  console.log(chatStore.messages)
})

onShareAppMessage(({ from, target }) => {
  const result = {
    title: '快来看看我聊了啥～',
    path: '/pages/chat/index',
  }
  if (from === 'button') {
    result.path = `/pages/share_chat/index?ids=${target.dataset.ids}`
    share.value.ids = []
  }
  return result
})
</script>

<template>
  <Layout v-model="showSidebar">
    <share-popup v-model="share.isChecked" />

    <navbar ref="navbarInstance" :left-text="share.isChecked && '取消'" @left-click="onNavbarLeftClick">
      <template #title>
        <tabs>
          <tabs-item :name="0" label="黑狗" />
          <tabs-item :name="1" label="关注" />
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
