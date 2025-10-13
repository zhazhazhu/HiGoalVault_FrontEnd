<script lang='ts' setup>
import type { MyCommentedRepliedListResponse, Page } from '@/api'
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import { useClassesName } from '@/composables'
import { useResetRef } from '@/composables/useResetRef'
import { useUserStore } from '@/store'
import { formatCommentDate } from '@/utils'

const cs = useClassesName('user-message')
const data = ref<MyCommentedRepliedListResponse[]>([])
const isLoading = ref(false)
const isFinish = ref(false)
const [page, reset] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 20,
})
const userStore = useUserStore()
const isRefreshing = ref(false)

async function getData() {
  const res = await api.getMyCommentedRepliedList({ ...page.value }).finally(() => {
    isLoading.value = false
  })
  if (res.code === 200) {
    data.value.push(...res.result.records)
    isFinish.value = res.result.total <= data.value.length
  }
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
async function onThumbsUp(item: MyCommentedRepliedListResponse, index: number) {
  if (!userStore.isLogin) {
    return
  }
  const res = await api.thumbsUp({
    contentId: item.contentId,
    likeAction: !item.isLike,
  })
  if (res.code === 200) {
    data.value[index].isLike = !item.isLike
    data.value[index].likeCount = data.value[index].isLike ? data.value[index].likeCount + 1 : data.value[index].likeCount - 1
  }
}
function gotoContentDetail(item: MyCommentedRepliedListResponse) {
  uni.navigateTo({ url: `/pages/index/detail?id=${item.contentId}` })
}
function gotoUser(id: string) {
  uni.navigateTo({ url: `/pages/user/index?id=${id}` })
}
function gotoContentComment(item: MyCommentedRepliedListResponse) {
  uni.navigateTo({ url: `/pages/index/detail?id=${item.contentId}&commentId=${item.commentId}` })
}
function gotoBack() {
  uni.navigateBack()
}

onMounted(() => {
  reset()
  getData()
})
</script>

<template>
  <view>
    <Navbar title="收到的评论和@">
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
        class="h-[calc(100vh-100px)]"
        :class="cs.m('container')"
        :lower-threshold="50"
        :refresher-enabled="true"
        :refresher-triggered="isRefreshing"
        @scrolltolower="load"
        @refresherrefresh="refreshData"
      >
        <view class="bg-white flex flex-col gap-20rpx py-32rpx">
          <view v-for="item, index in data" :key="index" class="flex flex-col gap-20rpx mx-32rpx py-20rpx border-b-2 border-gray-2 border-solid" @click="gotoContentDetail(item)">
            <view class="flex gap-10rpx">
              <wd-img :src="item.face" mode="aspectFill" round width="64rpx" height="64rpx" @click.stop="gotoUser(item.commenterId)" />
              <view class="flex flex-col gap-4rpx">
                <view class="flex items-center gap-10rpx" @click.stop="gotoUser(item.commenterId)">
                  <view class="text-34rpx color-#333 font-500">
                    {{ item.nickName }}
                  </view>
                  <view class="text-22rpx color-#8E8E93">
                    作者
                  </view>
                </view>
                <view class="text-22rpx color-gray-4">
                  回复了你的评论 {{ formatCommentDate(item.createTime) }}
                </view>

                <view class="font-500 text-28rpx color-#333 mt-6px">
                  {{ item.commentContent }}
                </view>
              </view>
            </view>

            <view class="bg-[var(--hi-bg-color)] p-20rpx rounded-12rpx">
              <view class="text-40rpx font-500">
                {{ item.title }}
              </view>
            </view>

            <view class="flex justify-end gap-50rpx ">
              <view class="flex items-center gap-6rpx" @click.stop="gotoContentComment(item)">
                <view class="comment-icon bg-#666 size-46rpx" />
                <view class="text-24rpx color-#666">
                  回复评论
                </view>
              </view>

              <view class="flex items-center gap-6rpx">
                <view class="i-material-symbols-favorite-rounded color-#b1b1b1 size-38rpx mr-4rpx" :class="{ 'color-red': item?.isLike }" @click.stop="onThumbsUp(item, index)" />
                <view class="text-24rpx color-#666">
                  {{ item.likeCount }}
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-show="isLoading || isFinish" class="flex items-center justify-center py-20rpx loading-wrapper" :class="cs.m('loading')">
          <wd-loading v-if="!isFinish" color="#FC6146FF" :size="20" />
          <text class="ml-20rpx text-24rpx">
            {{ isFinish ? '没有更多了' : '加载中...' }}
          </text>
        </view>
      </scroll-view>
    </Container>
  </view>
</template>

<style lang='css' scoped></style>
