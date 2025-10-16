<script lang='ts' setup>
import type { CommentResponse, Page, ReplyResponse } from '@/api'
import dayjs from 'dayjs'
import { ref, watch } from 'vue'
import { api } from '@/api'
import { useClassesName, useUUID } from '@/composables'
import { useResetRef } from '@/composables/useResetRef'
import { useUserStore } from '@/store'
import { formatCommentOrThumbUpCount } from '@/utils'

const props = defineProps<{ contentId: string, currentComment?: {
  commentId: string
  commentType: 1 | 2 | null
}, isRefreshing?: boolean }>()
const model = defineModel({ type: Boolean, default: false })
const [page, reset] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 10,
  sort: 'createTime',
})
const cs = useClassesName('comment-popup')
const data = ref<CommentResponse[]>([])
const isLoading = ref(false)
const isFinish = ref(false)
const total = ref(0)
const commentContent = ref('')
const placeholder = ref('发表友善评论')
const textareaInstance = ref()
const isFocus = ref(false)
const userStore = useUserStore()
const refreshing = ref(false)

async function getCurrentCommentData() {
  if (props.currentComment?.commentId && props.currentComment.commentType !== null) {
    const commentRes = await api.getCommentOrReplyById(props.currentComment as any)
    if (commentRes.code === 200) {
      data.value.unshift(commentRes.result)
    }
  }
}
async function getData() {
  isLoading.value = true
  const res = await api.getCommentList({ contentId: props.contentId, ...page.value }).finally(() => {
    isLoading.value = false
  })
  if (res.code === 200) {
    total.value = res.result.total
    const list = res.result.records.filter(item => item.comment.id !== props.currentComment?.commentId)
    data.value.push(...list)
    isFinish.value = res.result.total <= data.value.length
  }
}

async function load() {
  if (isLoading.value || isFinish.value)
    return
  isLoading.value = true
  page.value.pageNumber!++
  getData()
}
async function refreshData() {
  refreshing.value = true
  data.value = []
  reset()
  await getCurrentCommentData()
  await getData()
  refreshing.value = false
}
const currentOperating = ref<number | null>(null)
const [currentReplying, resetCurrentReplying] = useResetRef<{
  type: 'comment' | 'reply'
  comment: CommentResponse['comment'] | null
  reply: ReplyResponse | null
}>({
  type: 'comment',
  comment: null,
  reply: null,
})

function handleClose() {
  model.value = false
}
function createTemporaryComment(): CommentResponse['comment'] {
  const content = commentContent.value.trim()
  return {
    commentContent: content,
    commenterId: userStore.userInfo!.id,
    commenterUsername: userStore.userInfo!.username,
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    id: useUUID(),
    isLike: false,
    likeCount: 0,
    commentUsername: userStore.userInfo!.username,
    nickName: userStore.userInfo!.nickName,
    face: userStore.userInfo!.face,
  }
}

function createTemporaryReply(type: 'comment' | 'reply'): ReplyResponse {
  return {
    id: useUUID(),
    commentId: currentReplying.value[type]!.id,
    contentId: props.contentId,
    isLike: false,
    likeCount: 0,
    replyStatus: true,
    replierId: userStore.userInfo!.id,
    face: userStore.userInfo!.face,
    replierUsername: userStore.userInfo!.username,
    nickName: userStore.userInfo!.nickName,
    replyContent: commentContent.value,
    replyToUserId: type === 'comment' ? currentReplying.value.comment!.commenterId : currentReplying.value.reply!.replierId,
    replyToUsername: type === 'comment' ? currentReplying.value.comment!.commenterUsername : currentReplying.value.reply!.replierUsername,
    replyToNickName: type === 'comment' ? currentReplying.value.comment!.nickName : currentReplying.value.reply!.nickName,
    replyToFace: type === 'comment' ? currentReplying.value.comment!.face : currentReplying.value.reply!.face,
    parentReplyId: currentReplying.value.reply?.id || null,
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  }
}
function putTemporaryComment(id: string) {
  if (currentOperating.value === null) {
    total.value++
    data.value.unshift({
      comment: {
        ...createTemporaryComment(),
        id,
      },
      replies: [],
      totalReplies: 0,
    })
  }
  else if (currentReplying.value.type === 'comment') {
    data.value[currentOperating.value].totalReplies++
    data.value[currentOperating.value].replies.unshift({
      ...createTemporaryReply('comment'),
      id,
    })
  }
  else if (currentReplying.value.type === 'reply') {
    data.value[currentOperating.value].totalReplies++
    data.value[currentOperating.value].replies.unshift({
      ...createTemporaryReply('reply'),
      parentReplyId: currentReplying.value.reply!.id,
      id,
    })
  }
  console.log('putTemporaryComment', data.value)
}
async function onConfirm() {
  try {
    if (currentOperating.value === null) {
      const res = await api.addComment({ commentContent: commentContent.value, contentId: props.contentId })
      if (res.code === 200) {
        putTemporaryComment(res.result.id)
      }
    }
    else if (currentReplying.value.type === 'comment') {
      const res = await api.addCommentReply({
        commentId: currentReplying.value.comment!.id,
        replyContent: commentContent.value.trim(),
        replyToUserId: currentReplying.value.comment!.commenterId,
      })
      if (res.code === 200) {
        putTemporaryComment(res.result.id)
      }
    }
    else if (currentReplying.value.type === 'reply') {
      const res = await api.addCommentReply({
        commentId: data.value[currentOperating.value].comment.id,
        replyContent: commentContent.value.trim(),
        replyToUserId: currentReplying.value.reply!.replierId,
        parentReplyId: currentReplying.value.reply!.id,
      })
      if (res.code === 200) {
        putTemporaryComment(res.result.id)
      }
    }
  }
  catch (error) {
    console.log(error)
  }
  resetComment()
}
function onReplyComment(comment: CommentResponse['comment'], index: number) {
  currentOperating.value = index
  placeholder.value = `回复 @${comment.nickName || 'Unknown'}`
  currentReplying.value = {
    type: 'comment',
    comment,
    reply: null,
  }
  isFocus.value = true
}
function onReplyReply(reply: ReplyResponse, index: number) {
  currentOperating.value = index
  placeholder.value = `回复 @${reply.nickName || 'Unknown'}`
  currentReplying.value = {
    type: 'reply',
    comment: null,
    reply,
  }
  isFocus.value = true
}
function resetComment() {
  currentOperating.value = null
  commentContent.value = ''
  isFocus.value = false
  placeholder.value = '发表友善评论'
  resetCurrentReplying()
}
function onBlur() {
  isFocus.value = false
}
function onDeleteComment(index: number) {
  data.value.splice(index, 1)
  total.value--
}

watch(() => [model.value, props.isRefreshing], ([model, isRefreshing]) => {
  if (model || isRefreshing) {
    refreshData()
  }
}, { immediate: true })
</script>

<template>
  <wd-popup
    v-model="model"
    position="bottom"
    custom-class="rounded-t-32px"
    safe-area-inset-bottom
    lock-scroll
    @close="handleClose"
  >
    <view class="h-1000rpx p-32rpx relative pb-130rpx">
      <view class="h-50rpx flex items-center justify-between">
        <view class="flex items-center gap-10rpx">
          <text class="font-bold">
            评论
          </text>
          <text class="color-#666">
            {{ formatCommentOrThumbUpCount(total) }}
          </text>
        </view>

        <view class="i-material-symbols-light-close-rounded text-50rpx color-#333" @click="handleClose" />
      </view>

      <scroll-view
        scroll-y
        enhanced
        :show-scrollbar="false"
        class="h-800rpx gap-20rpx py-32rpx box-border"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        @scrolltolower="load"
        @refresherrefresh="refreshData"
      >
        <view-comment-card
          v-for="item, index in data"
          :id="item.comment.id"
          :key="item.comment.id"
          :current-comment-id="currentComment?.commentId ? data[0].comment.id : ''"
          :data="item"
          @update:data="(val) => data[index] = val"
          @reply-comment="onReplyComment($event, index)"
          @reply-reply="onReplyReply($event, index)"
          @delete-comment="onDeleteComment(index)"
        />

        <view v-show="isLoading || isFinish" class="flex items-center justify-center py-20rpx loading-wrapper" :class="cs.m('loading')">
          <wd-loading v-if="!isFinish" color="#FC6146FF" :size="20" />
          <text class="ml-20rpx text-24rpx">
            {{ isFinish ? '没有更多了' : '加载中...' }}
          </text>
        </view>
      </scroll-view>

      <view class="flex items-center absolute bottom-0 left-0 w-full px-32rpx box-border gap-30rpx h-100rpx bg-white">
        <view class="rounded-12px flex-1 overflow-hidden">
          <wd-textarea
            ref="textareaInstance"
            v-model="commentContent"
            clearable
            no-border
            show-word-limit
            hold-keyboard
            confirm-type="send"
            :focus="isFocus"
            :placeholder="placeholder"
            :auto-height="true"
            :show-confirm-bar="false"
            :cursor-spacing="120"
            :custom-textarea-class="cs.m('textarea')"
            :custom-class="cs.m('textarea-container')"
            :placeholder-class="cs.m('textarea-placeholder')"
            @focus="isFocus = true"
            @blur="onBlur"
            @confirm="onConfirm"
          />
        </view>
        <view class="text-28rpx color-#666666 font-500" :class="{ 'text-#FC6146FF': commentContent.length > 0 }" @click="onConfirm">
          发表
        </view>
      </view>
    </view>
  </wd-popup>
</template>

<style lang='css' scoped></style>
