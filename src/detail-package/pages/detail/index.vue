<script lang='ts' setup>
import type { AnswerAfter, AnswerBefore, ChatMessageReference, PublishMessageListResponse } from '@/api'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { ref, watch } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { useUserStore } from '@/store'
import { formatCommentOrThumbUpCount } from '@/utils'

const data = ref<PublishMessageListResponse | null>(null)
const commentContent = ref('')
const messageContent = ref<AnswerAfter | null>(null)
const commentVisible = ref(false)
const userStore = useUserStore()
const contentId = ref('')
const isRefreshing = ref(false)
const [currentComment, resetCurrentComment] = useResetRef<{ commentId: string, commentType: 1 | 2 | null }>({
  commentId: '',
  commentType: null,
})

async function getData() {
  const res = await api.getPublicMessageDetail({ contentId: contentId.value })
  if (res.code === 200) {
    data.value = res.result
    if (res.result.chatQueryAnswerVO) {
      messageContent.value = transformMessage(res.result.chatQueryAnswerVO)
    }
  }
}
function transformMessage(message: AnswerBefore): AnswerAfter {
  let reference: ChatMessageReference[] = []
  let data: any = null
  if (message.reference) {
    try {
      reference = JSON.parse(message.reference || '[]')
      data = JSON.parse(message.data || '{}')
    }
    catch (error) {
      console.log('transformMessage error', error)
    }
  }
  return {
    ...message,
    reference,
    data,
    isLoading: false,
  }
}
function gotoBack() {
  // 如果路由历史栈没有数据,返回首页
  if (getCurrentPages().length === 1) {
    uni.redirectTo({ url: '/pages/index/index' })
    return
  }
  // 如果是从消息列表进来的,返回消息列表
  uni.navigateBack()
}
async function onConfirm() {
  if (!commentContent.value)
    return
  const res = await api.addComment({ commentContent: commentContent.value, contentId: data.value!.id })
  if (res.code === 200) {
    commentContent.value = ''
    data.value!.commentCount++
  }
}
function openCommentPopup() {
  commentVisible.value = true
}
async function onThumbsUp() {
  if (!userStore.isLogin) {
    return
  }
  const res = await api.thumbsUp({
    contentId: data.value!.id,
    likeAction: !data.value!.isLike,
  })
  if (res.code === 200) {
    data.value!.isLike = !data.value!.isLike
    data.value!.likeCount = data.value!.isLike ? data.value!.likeCount + 1 : data.value!.likeCount - 1
  }
}
async function refreshData() {
  isRefreshing.value = true
  await getData()
  isRefreshing.value = false
}
watch(commentVisible, (val) => {
  if (!val) {
    resetCurrentComment()
    getData()
  }
})

onShareAppMessage(() => {
  return {
    title: data.value?.title,
    path: `/detail-package/pages/detail/index?id=${data.value?.id}`,
  }
})

onLoad((options) => {
  contentId.value = options?.id || ''
  currentComment.value.commentId = options?.commentId || ''
  currentComment.value.commentType = Number(options?.commentType) as (1 | 2) | null
  if (options?.commentId) {
    commentVisible.value = true
  }
  getData()
})
</script>

<template>
  <view>
    <ViewCommentPopup v-if="data" v-model="commentVisible" :content-id="data.id" :current-comment="currentComment" :is-refreshing="isRefreshing" />

    <Navbar title="详情" enable-left-slot>
      <template #left>
        <wd-icon name="thin-arrow-left" size="17px" @click="gotoBack" />
      </template>
    </Navbar>

    <Container v-if="data?.chatQueryAnswerVO !== null">
      <scroll-view
        scroll-y
        enhanced
        :show-scrollbar="false"
        :refresher-enabled="true"
        :refresher-triggered="isRefreshing"
        class="h-full overflow-y-auto pb-20rpx"
        @refresherrefresh="refreshData"
      >
        <template v-if="data && messageContent">
          <ViewDetailCard v-if="data" :data="data" />
          <view class="bg-white p-32rpx mt-10rpx">
            <MessageResponseCard :data="messageContent" />
          </view>
        </template>
      </scroll-view>

      <view class="h-200rpx bg-white px-32rpx pt-30rpx">
        <view class="flex items-center justify-between gap-10px">
          <button open-type="share" class="share-btn contents">
            <view class="wechat-icon bg-#666 size-70rpx" />
          </button>

          <view class="rounded-12px flex-1 overflow-hidden">
            <input-popup
              v-model="commentContent"
              placeholder="发表友善评论"
              @confirm="onConfirm"
            />
          </view>
          <view class="flex flex-col items-center" @click="openCommentPopup">
            <view class="comment-icon size-60rpx" />
            <text class="text-22rpx color-gray-6 font-bold">
              {{ formatCommentOrThumbUpCount(data?.commentCount) }}
            </text>
          </view>
          <view class="flex flex-col items-center" @click="onThumbsUp">
            <view class="i-material-symbols-favorite-rounded color-#b1b1b1 size-50rpx mb-4rpx" :class="{ 'color-red': data?.isLike }" />
            <text class="text-22rpx color-gray-6 font-bold">
              {{ formatCommentOrThumbUpCount(data?.likeCount) }}
            </text>
          </view>
        </view>
      </view>
    </Container>
    <wd-status-tip v-else tip="内容已删除">
      <template #image>
        <view class="i-material-symbols-content-paste-off text-100rpx" />
      </template>
    </wd-status-tip>
  </view>
</template>

<style lang='scss' scoped></style>
