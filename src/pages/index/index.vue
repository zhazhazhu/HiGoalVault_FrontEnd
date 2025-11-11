<script setup lang="ts">
import type { AfterPublishMessageListResponse, Page } from '@/api'
import type Converse from '@/components/converse/index.vue'
import { onLoad, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import { getCurrentInstance, onMounted, ref } from 'vue'
import { api } from '@/api'
import { API } from '@/api/url'
import { useClassesName } from '@/composables'
import { useResetRef } from '@/composables/useResetRef'
import { useChatStore, useGlobalStore, useUserStore } from '@/store'

interface Data {
  data: AfterPublishMessageListResponse[]
  isLoading: boolean
  isFinish: boolean
  page: Page
}
const cs = useClassesName('home')
const showSidebar = ref(false)
const refreshing = ref(false)
const active = ref('view')
const scrollTop = ref(0.0001) // 设置0无效，需设置一个很小的值
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
const instance = getCurrentInstance()
const query = uni.createSelectorQuery().in(instance)
const navbarOpacity = ref(0)

function onScroll(event: any) {
  const scrollTop = event.detail.scrollTop
  const statusBarHeight = globalStore.windowInfo?.statusBarHeight || 0

  // 当滚动距离超过状态栏高度时开始显示背景
  if (scrollTop <= statusBarHeight) {
    navbarOpacity.value = 0
  }
  else {
    // 滚动距离超过状态栏高度后，在接下来的100px内逐渐显示
    const progress = Math.min((scrollTop - statusBarHeight) / statusBarHeight, 1)
    navbarOpacity.value = progress
  }
}

async function getData() {
  await Promise.all(userStore.isLogin ? [getViewData(), getFollowData()] : [getViewData()])
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
    const records = res.result.records.map(item => ({
      ...item,
      chatQueryAnswerVO: chatStore.transformAnswer(item.chatQueryAnswerVO),
    }))
    data.value.view.data.push(...records)
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
    const records = res.result.records.map(item => ({
      ...item,
      chatQueryAnswerVO: chatStore.transformAnswer(item.chatQueryAnswerVO),
    }))
    data.value.follow.data.push(...records)
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
  scrollTop.value += 0.0001
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
  if (getCurrentPages().length > 9) {
    uni.redirectTo({ url: '/chat-package/pages/chat/index' })
  }
  else {
    uni.navigateTo({ url: '/chat-package/pages/chat/index' })
  }
}
function onClickSearch() {
  uni.navigateTo({ url: '/search-package/pages/search/index' })
}
function onConverseTap() {
  if (!userStore.isLogin) {
    globalStore.showLoginPopup = true
  }
}

onShareAppMessage(({ target, from }) => {
  if (from === 'button') {
    const imageUrl = `${API.SCREEN_SHOT}?id=${target.dataset.id}`
    return {
      title: '我发布了最新的行情，快来看看吧',
      path: `/detail-package/pages/detail/index?id=${target.dataset.id}`,
      imageUrl,
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
})

onLoad((options) => {
  if (options?.active) {
    active.value = String(options.active)
  }
})

onShow(() => {
  chatStore.currentChatId = ''
  if (globalStore.shouldReloadAtHomePage) {
    resetData()
    getData()
    globalStore.shouldReloadAtHomePage = false
  }
})
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="onChangeChat">
    <image src="@/static/home/image/home-background.png" class="absolute top-0 left-0 w-full" />
    <scroll-view
      class="bg-[var(--hi-bg-color)] h-100vh box-border"
      :style="{ paddingBottom: `${converseHeight}px` }"
      scroll-y
      enhanced
      scroll-with-animation
      :scroll-top="scrollTop"
      :show-scrollbar="false"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @scrolltolower="loadData"
      @scroll="onScroll"
      @refresherrefresh="refreshData"
    >
      <view>
        <view class="h-90rpx" />

        <view class="navbar mb-20rpx sticky top-0 left-0 z-9999">
          <view class="bg-#F2F2F2" :style="{ height: `${globalStore.windowInfo?.statusBarHeight}px`, opacity: navbarOpacity }" />

          <view class="grid grid-cols-3 items-center relative pb-8px px-20rpx">
            <view class="bg-#F2F2F2 absolute w-full h-full top-0 left-0 " :style="{ opacity: navbarOpacity }" />
            <view class="flex items-center gap-15px">
              <view class="i-uil-list-ul text-54rpx" @click="onNavbarLeftClick" />
              <view v-show="navbarOpacity === 1" class="i-iconamoon-search-bold text-22px" @click="onClickSearch" />
            </view>
            <wd-tabs v-model="active" custom-class="hi-tabs" animated>
              <wd-tab title="发现" name="view" />
              <wd-tab title="关注" name="follow" />
            </wd-tabs>
            <view>
              <view v-show="navbarOpacity !== 1" class="i-iconamoon-search-bold text-22px float-right" @click="onClickSearch" />
            </view>
          </view>
        </view>

        <view class="px-20rpx ">
          <ViewList v-show="active === 'view'" v-model:data="data.view.data" :is-loading="data.view.isLoading" :is-finish="data.view.isFinish" />
          <ViewList v-show="active === 'follow'" v-model:data="data.follow.data" :is-loading="data.follow.isLoading" :is-finish="data.follow.isFinish" />
        </view>
      </view>
    </scroll-view>

    <view class="fixed w-full bottom-0 left-0 bg-[var(--hi-bg-color)]">
      <Converse :disabled="!userStore.isLogin" @resize="handleResize" @tap="onConverseTap" />
    </view>
  </Layout>
</template>

<style lang="scss" scoped>
</style>
