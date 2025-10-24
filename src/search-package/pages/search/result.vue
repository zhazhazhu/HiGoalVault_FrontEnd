<script lang='ts' setup>
import type { SearchTab } from '.'
import type { GlobalSearchRequest, GlobalSearchResult, UserCenterSearchRequest } from '@/api'
import { onLoad } from '@dcloudio/uni-app'
import { ref, watch } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { SEARCH_TABS } from '.'
import ResultList from './result-list.vue'

const showSidebar = ref(false)
const isLoading = ref(false)
const isFinish = ref(false)
const data = ref<GlobalSearchResult[]>([])
const [page] = useResetRef<GlobalSearchRequest | UserCenterSearchRequest>({
  pageNumber: 1,
  pageSize: 10,
  keyword: '',
  searchContentRange: 'ALL',
  searchActionRange: 'ALL',
})
const userId = ref('')
const isRefreshing = ref(false)
const keyword = ref('')

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
  uni.navigateTo({ url: '/chat-package/pages/chat/index' })
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
function onTabChange({ name }: { name: SearchTab }) {
  data.value = []
  page.value.pageNumber = 1
  page.value.pageSize = 10
  switch (name) {
    case 'ALL':
      page.value.searchContentRange = 'ALL'
      break
    case 'CONTENT_PUBLISH':
      page.value.searchContentRange = 'CONTENT_PUBLISH'
      break
    case 'CONTENT_COMMENT':
      page.value.searchContentRange = 'CONTENT_COMMENT'
      break
    case 'CONTENT_LIKE':
      page.value.searchContentRange = 'ACTION'
      page.value.searchActionRange = 'CONTENT_LIKE'
      break
    case 'CHAT_COLLECT':
      page.value.searchContentRange = 'ACTION'
      page.value.searchActionRange = 'CHAT_COLLECT'
      break
  }
  getData()
}

onLoad((options) => {
  keyword.value = options?.keyword || ''
  userId.value = options?.userId ? options?.userId : ''
})
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="onChangeChat">
    <Navbar @left-click="onNavbarLeftClick" />

    <scroll-view
      scroll-into-view-alignment="end"
      scroll-y
      enhanced
      enable-passive
      class="px-32rpx pt-32rpx bg-[var(--hi-bg-color)] h-[calc(100vh-93px)] box-border"
      :show-scrollbar="false"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @scrolltolower="loadData"
      @refresherrefresh="refreshData"
    >
      <view>
        <view class="mb-10px sticky top-0 left-0 z-10 bg-[var(--hi-bg-color)]">
          <SearchHead v-model="keyword" @confirm="onConfirm" @back="onGotoBack" />

          <wd-tabs custom-class="wd-tabs-transparent" @change="onTabChange">
            <block v-for="item in SEARCH_TABS" :key="item.value">
              <wd-tab :title="item.name" :name="item.value" />
            </block>
          </wd-tabs>
        </view>

        <view>
          <ResultList :data="data" :is-loading="isLoading" :is-finish="isFinish" />
        </view>
      </view>
    </scroll-view>
  </Layout>
</template>

<style lang='scss' scoped></style>
