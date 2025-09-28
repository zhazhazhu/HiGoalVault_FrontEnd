<script lang='ts' setup>
import type { AnswerAfter, AnswerBefore, ChatMessageReference, PublishMessageListResponse } from '@/api'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { useClassesName } from '@higoal/hooks'
import { ref } from 'vue'
import { api } from '@/api'
import { useUserStore } from '@/store'

const data = ref<PublishMessageListResponse | null>(null)
const cs = useClassesName('detail')
const isFocus = ref(false)
const commentContent = ref('')
const messageContent = ref<AnswerAfter | null>(null)
const commentVisible = ref(false)
const userStore = useUserStore()

async function getData(id: string) {
  const res = await api.getPublicMessageDetail({ contentId: id })
  if (res.code === 200) {
    data.value = res.result
    messageContent.value = transformMessage(res.result.chatQueryAnswerVO)
  }
}
function transformMessage(message: AnswerBefore): AnswerAfter {
  let reference: ChatMessageReference[] = []
  let data: any = null
  if (message.reference) {
    try {
      reference = JSON.parse(message.reference)
      data = JSON.parse(message.data)
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
  uni.navigateBack()
}
async function onConfirm() {
  const res = await api.addComment({ commentContent: commentContent.value, contentId: data.value!.id })
  if (res.code === 200) {
    commentContent.value = ''
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
    likeAction: !data.value!.isLiked,
  })
  if (res.code === 200) {
    data.value!.isLiked = !data.value!.isLiked
    data.value!.likeCount = data.value!.isLiked ? data.value!.likeCount + 1 : data.value!.likeCount - 1
  }
}

onShareAppMessage(() => {
  return {
    title: data.value?.title,
    path: `/pages/index/detail?id=${data.value?.id}`,
  }
})

onLoad((options) => {
  getData(options?.id)
})
</script>

<template>
  <view>
    <ViewCommentPopup v-if="data" v-model="commentVisible" :content-id="data.id" />

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
        class="h-full overflow-y-auto pb-20rpx"
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
            <wd-textarea
              v-model="commentContent"
              clearable
              no-border
              show-word-limit
              hold-keyboard
              placeholder="发表友善评论"
              confirm-type="send"
              :auto-height="true"
              :cursor-spacing="120"
              :custom-textarea-class="cs.m('textarea')"
              :custom-class="cs.m('textarea-container')"
              :placeholder-class="cs.m('textarea-placeholder')"
              @focus="isFocus = true"
              @blur="isFocus = false"
              @confirm="onConfirm"
            />
          </view>
          <view class="flex flex-col items-center" @click="openCommentPopup">
            <view class="comment-icon size-60rpx" />
            <text class="text-22rpx color-gray-6 font-bold">
              {{ data?.commentCount }}
            </text>
          </view>
          <view class="flex flex-col items-center" @click="onThumbsUp">
            <view class="thumb-up-icon size-60rpx" :class="{ 'bg-red': data?.isLiked }" />
            <text class="text-22rpx color-gray-6 font-bold">
              {{ data?.likeCount }}
            </text>
          </view>
        </view>
      </view>
    </Container>
  </view>
</template>

<style lang='scss' scoped></style>
