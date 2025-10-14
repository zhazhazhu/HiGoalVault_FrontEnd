<script setup lang="ts">
import type { Page, PublishMessageListResponse } from '@/api'
import type Converse from '@/components/converse/index.vue'
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import { useClassesName } from '@/composables'
import { useResetRef } from '@/composables/useResetRef'
import { useChatStore, useGlobalStore, useUserStore } from '@/store'

interface Data {
  data: PublishMessageListResponse[]
  isLoading: boolean
  isFinish: boolean
  page: Page
}
const cs = useClassesName('home')
const showSidebar = ref(false)
const refreshing = ref(false)
const active = ref('view')
const [data, resetData] = useResetRef<Record<'view' | 'follow', Data>>({
  view: {
    data: [],
    isLoading: false,
    isFinish: false,
    page: {
      pageNumber: 1,
      pageSize: 20,
      sort: 'createTime',
    },
  },
  follow: {
    data: [],
    isLoading: false,
    isFinish: false,
    page: {
      pageNumber: 1,
      pageSize: 20,
      sort: 'createTime',
    },
  },
})
const userStore = useUserStore()
const chatStore = useChatStore()
const globalStore = useGlobalStore()
const converseHeight = ref(0)

async function getData() {
  const viewPromise = getViewData()
  const followPromise = getFollowData()
  await Promise.all([viewPromise, followPromise])
}
async function refreshData() {
  refreshing.value = true
  resetData()
  await getData()
  refreshing.value = false
}
async function getViewData() {
  const res = await api.getPublishMessageList({ ...data.value.view.page }).finally(() => {
    data.value.view.isLoading = false
  })
  if (res.code === 200) {
    data.value.view.data.push(...res.result.records)
    data.value.view.isFinish = res.result.total <= data.value.view.data.length
  }
}
function loadViewData() {
  if (data.value.view.isLoading || data.value.view.isFinish)
    return
  data.value.view.isLoading = true
  data.value.view.page.pageNumber!++
  getViewData()
}
async function getFollowData() {
  const res = await api.getFollowingPublishMessageList({ ...data.value.follow.page }).finally(() => {
    data.value.follow.isLoading = false
  })
  if (res.code === 200) {
    data.value.follow.data.push(...res.result.records)
    data.value.follow.isFinish = res.result.total <= data.value.follow.data.length
  }
}
function loadFollowData() {
  if (data.value.follow.isLoading || data.value.follow.isFinish)
    return
  data.value.follow.isLoading = true
  data.value.follow.page.pageNumber!++
  getFollowData()
}

function onTabClick() {
  if (!userStore.isLogin) {
    globalStore.showLoginPopup = true
    return false
  }
}

function loadData() {
  if (active.value === 'view')
    loadViewData()
  else
    loadFollowData()
}
function handleResize(height: number) {
  converseHeight.value = height
}

function onNavbarLeftClick() {
  showSidebar.value = !showSidebar.value
}
function onChangeChat() {
  uni.navigateTo({ url: '/pages/chat/index' })
}
function onClickSearch() {
  uni.navigateTo({ url: '/search-package/pages/search/index' })
}

onShareAppMessage(({ target, from }) => {
  if (from === 'button') {
    return {
      title: '我发布了最新的行情，快来看看吧',
      path: `/pages/index/detail?id=${target.dataset.id}`,
    }
  }
  return {
    title: '分享',
    path: '/pages/index/index',
  }
})

onShareTimeline(() => {
  return {
    title: 'HiGoal AI',
    path: '/pages/index/index',
  }
})

onMounted(() => {
  resetData()
  getData()
  // uni.navigateTo({ url: '/pages/chat/index' })
  // uni.navigateTo({ url: '/pages/index/detail?id=1972913302560460801' })
  // uni.navigateTo({ url: '/user-package/pages/user/message' })
})

onShow(() => {
  chatStore.currentChatId = ''
})
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="onChangeChat">
    <navbar @left-click="onNavbarLeftClick" />

    <scroll-view
      class="px-32rpx pt-32rpx bg-[var(--hi-bg-color)] h-[calc(100vh-80px)] box-border"
      :style="{ paddingBottom: `${converseHeight + 10}px` }"
      scroll-y
      enhanced
      :show-scrollbar="false"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @scrolltolower="loadData"
      @refresherrefresh="refreshData"
    >
      <view>
        <tabs
          v-model="active"
          editable
          custom-content-class="mt-10px"
          :custom-nav-class="cs.m('tab-nav')"
          :tab-click="onTabClick"
          @edit="onClickSearch"
        >
          <template #edit>
            <wd-icon name="search" size="18" />
          </template>
          <tabs-item name="view" label="发现">
            <ViewList v-model:data="data.view.data" :is-loading="data.view.isLoading" :is-finish="data.view.isFinish" />
          </tabs-item>
          <tabs-item name="follow" label="关注">
            <ViewList v-model:data="data.follow.data" :is-loading="data.follow.isLoading" :is-finish="data.follow.isFinish" />
          </tabs-item>
        </tabs>
      </view>
    </scroll-view>

    <view class="fixed w-full bottom-0 left-0 bg-[var(--hi-bg-color)] px-32rpx">
      <Converse @resize="handleResize" />
    </view>
  </Layout>
</template>

<style lang="scss" scoped>
</style>
