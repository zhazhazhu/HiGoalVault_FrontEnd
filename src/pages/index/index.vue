<script setup lang="ts">
import type { AfterPublishMessageListResponse, Page } from '@/api'
import type Converse from '@/components/converse/index.vue'
import { onLoad, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import { API } from '@/api/url'
import { useResetRef } from '@/composables/useResetRef'
import { useChatStore, useGlobalStore, useUserStore } from '@/store'

interface Data {
  data: AfterPublishMessageListResponse[]
  isLoading: boolean
  isFinish: boolean
  page: Page
}
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
const navbarOpacity = ref(0)
const isRefreshPulling = ref(false)

function onScroll(event: any) {
  const scrollTop = event.detail.scrollTop
  const statusBarHeight = globalStore.windowInfo?.statusBarHeight || 0

  if (scrollTop <= statusBarHeight) {
    navbarOpacity.value = 0
  }
  else {
    navbarOpacity.value = Math.min((scrollTop - statusBarHeight) / statusBarHeight, 1)
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
function refresherpulling() {
  isRefreshPulling.value = true
}
function refresherreend() {
  isRefreshPulling.value = false
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
  scrollTop.value += 0.0001
}

function loadData() {
  if (active.value === 'view')
    loadViewData()
  else
    loadFollowData()
}

function onNavbarLeftClick() {
  if (!userStore.isLogin) {
    globalStore.showLoginPopup = true
    return
  }
  showSidebar.value = !showSidebar.value
}
function onChangeChat() {
  if (getCurrentPages().length > 9) {
    uni.redirectTo({ url: '/pages/chat-package/pages/chat/index' })
  }
  else {
    uni.navigateTo({ url: '/pages/chat-package/pages/chat/index' })
  }
}
function onClickSearch() {
  uni.navigateTo({ url: '/pages/search-package/pages/search/index' })
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
      path: `/pages/detail-package/pages/detail/index?id=${target.dataset.id}`,
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

onShow(async () => {
  chatStore.currentChatId = ''
  if (globalStore.shouldReloadAtHomePage) {
    resetData()
    getData()
    globalStore.shouldReloadAtHomePage = false
  }
  // 检查是否有需要更新的内容
  if (globalStore.needUpdateContentIds.size > 0) {
    const idsToUpdate = Array.from(globalStore.needUpdateContentIds)
    globalStore.needUpdateContentIds.clear()

    // 更新view列表中的数据
    for (const id of idsToUpdate) {
      const viewIndex = data.value.view.data.findIndex(item => item.id === id)
      if (viewIndex !== -1) {
        const res = await api.getPublicMessageDetail({ contentId: id })
        if (res.code === 200) {
          data.value.view.data[viewIndex] = {
            ...res.result,
            chatQueryAnswerVO: chatStore.transformAnswer(res.result.chatQueryAnswerVO),
          }
        }
      }

      // 更新follow列表中的数据
      const followIndex = data.value.follow.data.findIndex(item => item.id === id)
      if (followIndex !== -1) {
        const res = await api.getPublicMessageDetail({ contentId: id })
        if (res.code === 200) {
          data.value.follow.data[followIndex] = {
            ...res.result,
            chatQueryAnswerVO: chatStore.transformAnswer(res.result.chatQueryAnswerVO),
          }
        }
      }
    }
  }
})
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="onChangeChat">
    <LoginPopup v-model="globalStore.showLoginPopup" />

    <image src="@/static/home/image/home-background.png" class="absolute top-0 left-0 w-full" />

    <div class="bg-#F2F2F2 relative z-1" :style="{ opacity: isRefreshPulling ? 0 : navbarOpacity }">
      <view class="bg-#F2F2F2" :style="{ height: `${globalStore.windowInfo?.statusBarHeight}px` }" />

      <view class="grid grid-cols-3 items-center relative pb-8px px-20rpx">
        <view class="bg-#F2F2F2 absolute w-full h-full top-0 left-0 " :style="{ opacity: navbarOpacity }" />
        <view class="flex items-center gap-15px z-9">
          <view class="menu-icon" @tap="onNavbarLeftClick" />
          <view class="search-icon" @click="onClickSearch" />
        </view>
        <wd-tabs v-model="active" custom-class="hi-tabs" animated @change="onTabClick">
          <wd-tab title="发现" name="view" />
          <wd-tab title="关注" name="follow" :disabled="!userStore.isLogin" />
        </wd-tabs>
      </view>
    </div>

    <!-- <div class="bg-#F2F2F2 relative z-1" :style="{ height: `${globalStore.windowInfo?.statusBarHeight}px`, opacity: navbarOpacity }" /> -->

    <scroll-view
      class="bg-[var(--hi-bg-color)] h-[calc(100vh-170px)]"
      enhanced
      scroll-with-animation
      scroll-anchoring
      :scroll-y="true"
      :scroll-top="scrollTop"
      :show-scrollbar="false"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      :refresher-threshold="200"
      @scrolltolower="loadData"
      @scroll="onScroll"
      @refresherrefresh="refreshData"
      @refresherpulling="refresherpulling"
      @refresherrestore="refresherreend"
      @refresherabort="refresherreend"
    >
      <view class="grid grid-cols-3 items-center relative pb-8px px-20rpx">
        <view class="bg-#F2F2F2 absolute w-full h-full top-0 left-0 " :style="{ opacity: isRefreshPulling ? 0 : navbarOpacity }" />
        <view class="flex items-center gap-15px z-9">
          <view class="bg-#ffffff69 p-4px rounded-8px b-1px b-solid b-#ffffffe0" @tap="onNavbarLeftClick">
            <view class="menu-icon" />
          </view>
        </view>
        <wd-tabs v-model="active" custom-class="hi-tabs" animated @change="onTabClick">
          <wd-tab title="发现" name="view" />
          <wd-tab title="关注" name="follow" :disabled="!userStore.isLogin" />
        </wd-tabs>
        <view>
          <view class="search-icon float-right" @click="onClickSearch" />
        </view>
      </view>
      <view class="px-20rpx">
        <ViewList v-show="active === 'view'" v-model:data="data.view.data" :is-loading="data.view.isLoading" :is-finish="data.view.isFinish" />
        <ViewList v-show="active === 'follow'" v-model:data="data.follow.data" :is-loading="data.follow.isLoading" :is-finish="data.follow.isFinish" />
      </view>
    </scroll-view>

    <view class="fixed w-full bottom-0 left-0 bg-[var(--hi-bg-color)]">
      <Converse :disabled="!userStore.isLogin" @tap="onConverseTap" />
    </view>
  </Layout>
</template>

<style lang="scss" scoped>
</style>
