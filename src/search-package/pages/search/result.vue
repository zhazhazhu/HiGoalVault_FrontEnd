<script lang='ts' setup>
import type { SearchTab } from '.'
import type { GlobalSearchRequest, GlobalSearchResult, UserCenterSearchRequest } from '@/api'
import { onLoad } from '@dcloudio/uni-app'
import { onMounted, ref, watch } from 'vue'
import { api } from '@/api'
import { useUUID } from '@/composables'
import { useResetRef } from '@/composables/useResetRef'
import { useChatStore } from '@/store'
import ResultList from './result-list.vue'
import Sort from './sort.vue'

const showSidebar = ref(false)
const isLoading = ref(false)
const isFinish = ref(false)
const data = ref<GlobalSearchResult[]>([])
const [page] = useResetRef<GlobalSearchRequest | UserCenterSearchRequest>({
  pageNumber: 1,
  pageSize: 10,
  keyword: '',
  searchSort: 'SMART',
  searchActionRange: 'ALL',
  searchTimeRange: 'ALL',
})
const userId = ref('')
const isRefreshing = ref(false)
const keyword = ref('')
const chatStore = useChatStore()

watch(keyword, (val) => {
  if (val === '') {
    uni.navigateBack()
  }
})

async function getData() {
  page.value.keyword = keyword.value
  if (!userId.value) {
    const res = await api.globalSearch({ ...page.value, searchSort: 'HOT' }).finally(() => {
      isLoading.value = false
    })
    if (res.code === 200) {
      res.result.records.forEach((item) => {
        data.value.push(item)
      })
      isFinish.value = res.result.total <= data.value.length
    }
    else {
      uni.showToast({
        title: res.message,
        icon: 'none',
      })
    }
  }
  else {
    const res = await api.userCenterSearch({ ...page.value, searchSort: 'HOT', userId: userId.value }).finally(() => {
      isLoading.value = false
    })
    if (res.code === 200) {
      res.result.records.forEach((item) => {
        data.value.push(item)
      })
      isFinish.value = res.result.total <= data.value.length
    }
    else {
      uni.showToast({
        title: res.message,
        icon: 'none',
      })
    }
  }
}
function loadData() {
  if (isLoading.value || isFinish.value)
    return
  isLoading.value = true
  page.value.pageNumber!++
  getData()
}
async function refreshData() {
  isRefreshing.value = true
  data.value = []
  page.value.pageNumber = 1
  page.value.pageSize = 10
  await getData()
  isRefreshing.value = false
}
function onNavbarLeftClick() {
  showSidebar.value = !showSidebar.value
}
function onChangeChat() {
  if (getCurrentPages().length > 9) {
    uni.redirectTo({ url: '/chat-package/pages/chat/index' })
  }
  else {
    uni.navigateTo({ url: '/chat-package/pages/chat/index' })
  }
}
function onGotoBack() {
  uni.navigateBack()
}
function onConfirm() {
  page.value.pageNumber = 1
  page.value.pageSize = 10
  data.value = []
  getData()
}
function changeSort() {
  data.value = []
  page.value.pageNumber = 1
  page.value.pageSize = 10
  getData()
}
async function handleSendMessage() {
  if (!keyword.value)
    return
  const res = await api.addChat()
  if (res.code === 200) {
    chatStore.currentChatId = res.result.chatId
  }
  chatStore.currentRunId = useUUID(32)
  chatStore.waitingMessageTask = {
    query: keyword.value,
    chatId: chatStore.currentChatId,
    runId: chatStore.currentRunId,
  }
  uni.navigateTo({ url: '/chat-package/pages/chat/index' })
}

onLoad((options) => {
  keyword.value = options?.keyword || ''
  userId.value = options?.userId ? options?.userId : ''
})

onMounted(() => {
  if (!userId.value) {
    data.value = []
    page.value.pageNumber = 1
    page.value.pageSize = 10
    getData()
  }
})
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="onChangeChat">
    <Navbar @left-click="onNavbarLeftClick" />

    <view class="bg-[var(--hi-bg-color)]">
      <SearchHead v-model="keyword" @confirm="onConfirm" @back="onGotoBack" />

      <Sort v-model="page" @change="changeSort" @send-message="handleSendMessage" />
    </view>

    <scroll-view
      scroll-into-view-alignment="end"
      scroll-y
      enhanced
      enable-passive
      class="bg-[var(--hi-bg-color)] h-[calc(100vh-93px)] box-border"
      :show-scrollbar="false"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @scrolltolower="loadData"
      @refresherrefresh="refreshData"
    >
      <view class="px-32rpx pt-10px">
        <ResultList :data="data" :is-loading="isLoading" :is-finish="isFinish" />
      </view>
    </scroll-view>
  </Layout>
</template>

<style lang='scss' scoped></style>
