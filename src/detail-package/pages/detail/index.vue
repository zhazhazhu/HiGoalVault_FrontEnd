<script lang='ts' setup>
import type { AnswerAfter, PublishMessageListResponse } from '@/api'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { ref, watch } from 'vue'
import { api } from '@/api'
import { API } from '@/api/url'
import { useUUID } from '@/composables'
import { useResetRef } from '@/composables/useResetRef'
import { useChatStore, useUserStore } from '@/store'
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
const chatStore = useChatStore()
const isLoading = ref(true)

async function getData() {
  const res = await api.getPublicMessageDetail({ contentId: contentId.value }).finally(() => {
    isLoading.value = false
  })
  if (res.code === 200) {
    data.value = res.result
    if (res.result.chatQueryAnswerVO) {
      messageContent.value = { ...chatStore.transformAnswer(res.result.chatQueryAnswerVO), isPaused: false, showSteps: false }
    }
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
  const hasSensitive = await api.hasSensitiveWord(commentContent.value)
  if (hasSensitive.result) {
    uni.showToast({
      title: '包含敏感词',
      icon: 'none',
    })
    return
  }
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
async function onContinueTalk() {
  const res = await api.addChat()
  if (res.code === 200) {
    chatStore.currentChatId = res.result.chatId
  }
  chatStore.currentRunId = useUUID(32)
  chatStore.waitingMessageTask = {
    query: data.value!.title,
    chatId: chatStore.currentChatId,
    runId: chatStore.currentRunId,
  }
  uni.navigateTo({ url: '/chat-package/pages/chat/index' })
}

onShareAppMessage(() => {
  const imageUrl = `${API.SCREEN_SHOT}?id=${data.value?.id}`
  return {
    title: data.value?.title,
    path: `/detail-package/pages/detail/index?id=${data.value?.id}`,
    imageUrl,
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
    <ViewCommentPopup v-if="data" v-model="commentVisible" v-model:current-comment="currentComment" :content-id="data.id" :is-refreshing="isRefreshing" />

    <Navbar title="详情" enable-left-slot>
      <template #left>
        <wd-icon name="thin-arrow-left" size="17px" @click="gotoBack" />
      </template>
    </Navbar>

    <Container>
      <scroll-view
        scroll-y
        enhanced
        :show-scrollbar="false"
        :refresher-enabled="true"
        :refresher-triggered="isRefreshing"
        class="h-full overflow-y-auto pb-20rpx bg-#F7F8F9"
        @refresherrefresh="refreshData"
      >
        <view v-if="isLoading" class="h-100px flex items-center justify-center">
          <wd-loading />
        </view>
        <template v-else>
          <ViewDetailCard v-if="data" :data="data" />

          <view v-if="messageContent !== null" class="bg-#EDEFF2 mx-32rpx p-32rpx mt-10rpx border-1px border-solid border-#E5E5E7 rounded-16px">
            <view class="font-18px color-black">
              {{ messageContent.query }}
            </view>
            <view class="bg-white flex items-center justify-center rounded-8px w-fit px-12px py-4px my-10px gap-2px" @click="onContinueTalk">
              <view class="chat-star-icon size-22px" />
              <view class="text-14px color-#4362FF">
                继续问
              </view>
            </view>
            <MessageResponseCard :data="messageContent" @click-steps="messageContent.showSteps = !messageContent.showSteps" />
          </view>

          <view v-else class="mt-40px mx-32rpx">
            <wd-status-tip tip="内容已删除">
              <template #image>
                <view class="i-material-symbols-ink-eraser-off-outline-rounded text-100rpx" />
              </template>
            </wd-status-tip>
          </view>
        </template>
      </scroll-view>

      <view class="h-200rpx bg-white px-32rpx pt-30rpx">
        <view class="flex items-center justify-between gap-10px">
          <button open-type="share" class="share-btn contents">
            <view class="wechat-icon size-28px" />
          </button>

          <view class="rounded-8px flex-1 overflow-hidden">
            <input-popup
              v-model="commentContent"
              placeholder="发表友善评论"
              button-text="发表"
              :show-template-button="!!commentContent"
              @confirm="onConfirm"
            />
          </view>
          <template v-if="!commentContent">
            <view class="flex items-center min-w-30px h-30px relative" @click.stop="onThumbsUp">
              <view class="size-30px" :class="[data?.isLike ? 'color-red i-material-symbols-favorite-rounded' : 'color-#222 i-material-symbols-favorite-outline-rounded'] " />
              <view class="text-12px color-#222 absolute bottom-0 right-0 bg-white px-4px rounded-4px">
                {{ formatCommentOrThumbUpCount(data?.likeCount) }}
              </view>
            </view>
            <view class="flex items-center min-w-30px h-30px relative" @click="openCommentPopup">
              <view class="comment-icon size-30px" />
              <view class="text-12px color-#222 absolute bottom-0 right-0 bg-white px-4px rounded-4px">
                {{ formatCommentOrThumbUpCount(data?.commentCount) }}
              </view>
            </view>
          </template>
        </view>
      </view>
    </Container>
  </view>
</template>

<style lang='scss' scoped></style>
