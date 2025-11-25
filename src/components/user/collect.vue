<script lang='ts' setup>
import type { AnswerAfter, Page } from '@/api'
import { onMounted, ref } from 'vue'
import { api, Truth } from '@/api'
import { useClassesName } from '@/composables'
import { useResetRef } from '@/composables/useResetRef'
import { useChatStore, useUserStore } from '@/store'

const isLoading = ref(false)
const isFinish = ref(false)
const [page, resetPage] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 10,
  sort: 'createTime',
})
const total = ref(0)
const userStore = useUserStore()
const chatStore = useChatStore()
const data = ref<AnswerAfter[]>([])
const cs = useClassesName('collected-message-list')
const isRefreshing = ref(false)

async function getData() {
  isLoading.value = true
  const res = await api.getInteractedCollectedContentList({
    ...page.value,
    userId: userStore.userInfo!.id,
  })
  if (res.code === 200) {
    data.value.push(...res.result.records.map((item) => {
      const result = chatStore.transformAnswer(item)
      return {
        ...result,
        isCollect: Truth.TRUE,
      }
    }))
    total.value = res.result.total
    isLoading.value = false
    isFinish.value = data.value.length >= total.value
  }
}
async function collect(queryId: string, index: number) {
  const isCollect = data.value[index].isCollect === Truth.TRUE
  if (isCollect) {
    const res = await api.cancelCollect(queryId)
    if (res.code === 200) {
      data.value[index].isCollect = Truth.FALSE
    }
  }
  else {
    const res = await api.addCollect({ queryId })
    if (res.code === 200) {
      data.value[index].isCollect = Truth.TRUE
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
  resetPage()
  data.value = []
  await getData()
  isRefreshing.value = false
}
function onGotoMessage(item: AnswerAfter) {
  chatStore.currentChatId = item.chatId
  uni.navigateTo({ url: '/pages/chat-package/pages/chat/index' })
}

onMounted(() => {
  resetPage()
  getData()
})

defineExpose({
  total,
  loadData,
  refreshData,
})
</script>

<template>
  <view>
    <MessagePreview v-for="item, index in data" :key="item.queryId" :data="item" @tap="onGotoMessage(item)">
      <template #actions>
        <view class="flex items-center justify-between">
          <view class="text-24rpx font-500 color-#666" @click.stop="collect(item.queryId, index)">
            {{ item.isCollect === Truth.TRUE ? '取消收藏' : '收藏' }}
          </view>
          <button class="share-to-wechat" open-type="share" :data-id="item.queryId" @tap.stop>
            <view class="wechat-icon size-18px" />
            <text class="share-text">
              分享
            </text>
          </button>
        </view>
      </template>
    </MessagePreview>

    <view v-show="isLoading || isFinish" class="flex items-center justify-center py-20rpx loading-wrapper" :class="cs.m('loading')">
      <wd-loading v-if="!isFinish" color="#FC6146FF" :size="20" />
      <text class="ml-20rpx text-24rpx">
        {{ isFinish ? '没有更多了' : '加载中...' }}
      </text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.share-to-wechat {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #f5f7f9;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  color: #222222;
  font-weight: 500;
  overflow: hidden;
  &::after {
    display: none;
  }

  .share-text {
    flex-shrink: 0;
    font-size: 14px;
    color: #222222;
    font-weight: 500;
  }
}
</style>
