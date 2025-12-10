<script lang='ts' setup>
import type { MessageNotify, Page } from '@/api'
import { onMounted, ref } from 'vue'
import { api, MessageModuleEnum, MessageObjectTypeEnum, MessageTypeEnum } from '@/api'
import { useClassesName } from '@/composables'
import { useResetRef } from '@/composables/useResetRef'
import { formatCommentDate } from '@/utils'

const cs = useClassesName('user-message')
const isRefreshing = ref(false)
const data = ref<MessageNotify[]>([])
const isLoading = ref(false)
const isFinish = ref(false)
const [page, reset] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 20,
  sort: 'createTime',
})

async function getData() {
  const res = await api.getMessageNotify({ ...page.value, messageModule: MessageModuleEnum.SystemNotify }).finally(() => {
    isLoading.value = false
  })
  if (res.code === 200) {
    data.value.push(...res.result.records)
    isFinish.value = res.result.total <= data.value.length
  }
}
function gotoBack() {
  uni.navigateBack()
}
async function refreshData() {
  isRefreshing.value = true
  data.value = []
  reset()
  await getData()
  isRefreshing.value = false
}
async function load() {
  if (isLoading.value || isFinish.value)
    return
  isLoading.value = true
  page.value.pageNumber!++
  await getData()
}
function gotoContentDetail(item: MessageNotify) {
  switch (item.linkType) {
    case MessageObjectTypeEnum.Comment:
    case MessageObjectTypeEnum.ThumbsUpComment:
      // 评论跳转内容详情
      uni.navigateTo({ url: `/pages/detail-package/pages/detail/index?id=${item.contentId}&commentId=${item.objectId}&commentType=1` })
      break
    case MessageObjectTypeEnum.Reply:
    case MessageObjectTypeEnum.ThumbsUpReply:
      // 回复跳转评论详情
      uni.navigateTo({ url: `/pages/detail-package/pages/detail/index?id=${item.contentId}&commentId=${item.objectId}&commentType=2` })
      break
    case MessageObjectTypeEnum.Follow:
    case MessageObjectTypeEnum.User:
      // 关注跳转用户主页
      uni.navigateTo({ url: `/pages/user-package/pages/user/index?id=${item.objectId}` })
      break
    case MessageObjectTypeEnum.Content:
    case MessageObjectTypeEnum.ThumbsUpContent:
      // 点赞跳转内容详情
      uni.navigateTo({ url: `/pages/detail-package/pages/detail/index?id=${item.objectId}` })
      break
    default:
      break
  }
}

onMounted(() => {
  reset()
  getData()
})
</script>

<template>
  <view class="h-screen">
    <Navbar title="系统通知">
      <template #left>
        <view class="flex items-center gap-20rpx" @click="gotoBack">
          <view class="i-material-symbols-arrow-back-ios-new-rounded text-44rpx" />
        </view>
      </template>
    </Navbar>

    <Container>
      <scroll-view
        scroll-into-view-alignment="end"
        enhanced
        :scroll-y="true"
        :show-scrollbar="false"
        class="h-[calc(100vh-100px)] bg-white"
        :class="cs.m('container')"
        :lower-threshold="50"
        :refresher-enabled="true"
        :refresher-triggered="isRefreshing"
        @scrolltolower="load"
        @refresherrefresh="refreshData"
      >
        <view class="flex flex-col gap-20rpx py-32rpx">
          <view v-for="item, index in data" :key="index" class="flex flex-col gap-20rpx mx-32rpx py-20rpx border-b-2 border-gray-2 border-solid" @click="gotoContentDetail(item)">
            <view class="flex gap-10rpx text-12px flex-col">
              <view class="text-14px color-#333 font-500">
                {{ item.messageTitle }}
              </view>
              <view class="text-13px color-#333">
                {{ item.messageContent }}
              </view>
              <view class="text-12px color-#333 text-right mt-6px">
                {{ formatCommentDate(item.createTime) }}
              </view>
            </view>
          </view>
        </view>

        <view v-show="isLoading || isFinish" class="flex items-center justify-center py-20rpx loading-wrapper" :class="cs.m('loading')">
          <wd-loading v-if="!isFinish" :size="20" />
          <text class="ml-20rpx text-24rpx">
            {{ isFinish ? '没有更多了' : '加载中...' }}
          </text>
        </view>
      </scroll-view>
    </Container>
  </view>
</template>

<style lang='css' scoped></style>
