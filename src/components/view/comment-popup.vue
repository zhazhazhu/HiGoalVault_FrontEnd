<script lang='ts' setup>
import type { CommentResponse, Page, ReplyResponse } from '@/api'
import dayjs from 'dayjs'
import { ref, watch } from 'vue'
import { api } from '@/api'
import { useClassesName, useUUID } from '@/composables'
import { useResetRef } from '@/composables/useResetRef'
import { useUserStore } from '@/store'
import { formatCommentOrThumbUpCount } from '@/utils'

const props = defineProps<{ contentId: string, isRefreshing?: boolean }>()
const model = defineModel({ type: Boolean, default: false })
const currentComment = defineModel('currentComment', { type: Object as () => { commentId: string, commentType: 1 | 2 | null } | undefined, default: undefined })
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
const isFocus = ref(false)
const userStore = useUserStore()
const refreshing = ref(false)

async function getCurrentCommentData() {
  if (currentComment.value?.commentId && currentComment.value.commentType !== null) {
    const commentRes = await api.getCommentOrReplyById(currentComment.value as any)
    if (commentRes.code === 200) {
      data.value.unshift(commentRes.result)
      currentComment.value.commentId = commentRes.result.comment.id
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
    const list = res.result.records.filter(item => item.comment.id !== currentComment.value?.commentId)
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
  const content = commentContent.value.trim()
  if (!content)
    return
  try {
    if (currentOperating.value === null) {
      const res = await api.addComment({ commentContent: encodeURI(content), contentId: props.contentId })
      if (res.code === 200) {
        putTemporaryComment(res.result.id)
      }
    }
    else if (currentReplying.value.type === 'comment') {
      const res = await api.addCommentReply({
        commentId: currentReplying.value.comment!.id,
        replyContent: encodeURI(content),
        replyToUserId: currentReplying.value.comment!.commenterId,
      })
      if (res.code === 200) {
        putTemporaryComment(res.result.id)
      }
    }
    else if (currentReplying.value.type === 'reply') {
      const res = await api.addCommentReply({
        commentId: data.value[currentOperating.value].comment.id,
        replyContent: encodeURI(content),
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
function onDeleteComment(index: number) {
  data.value.splice(index, 1)
  total.value--
}
function handleInputBlur() {
  if (!commentContent.value) {
    resetComment()
  }
}
function handleAfterLeave() {
  currentComment.value = {
    commentId: '',
    commentType: null,
  }
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
    @after-leave="handleAfterLeave"
    @close="handleClose"
  >
    <view class="h-1000rpx p-32rpx relative pb-130rpx">
      <view class="h-50rpx grid grid-cols-3 items-center mb-20rpx">
        <view />

        <view class="text-center color-#222222 text-14px">
          <text class="font-500">
            {{ formatCommentOrThumbUpCount(total) }} 评论
          </text>
        </view>

        <view class="flex justify-end color-#222222">
          <view class="i-material-symbols-close-small-outline-rounded text-50rpx" @click="handleClose" />
        </view>
      </view>

      <scroll-view
        scroll-y
        enhanced
        :show-scrollbar="false"
        class="h-800rpx gap-20rpx pb-32rpx box-border"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        @scrolltolower="load"
        @refresherrefresh="refreshData"
      >
        <view-comment-card
          v-for="item, index in data"
          :id="item.comment.id"
          :key="item.comment.id"
          :current-comment-id="currentComment?.commentId"
          :data="item"
          @update:data="(val) => data[index] = val"
          @reply-comment="onReplyComment($event, index)"
          @reply-reply="onReplyReply($event, index)"
          @delete-comment="onDeleteComment(index)"
        />

        <view v-show="isLoading || isFinish" class="flex items-center justify-center py-20rpx loading-wrapper" :class="cs.m('loading')">
          <wd-loading v-if="!isFinish" color="#FC6146FF" :size="20" />
          <text class="ml-20rpx text-13px color-#ABABAB">
            {{ isFinish ? '没有更多了' : '加载中...' }}
          </text>
        </view>
      </scroll-view>

      <view class="flex items-center w-full box-border gap-30rpx h-100rpx bg-white">
        <view class="rounded-12px flex-1 overflow-hidden">
          <input-model
            v-model="commentContent"
            :placeholder="placeholder"
            :focus="isFocus"
            :show-template-button="true"
            :textarea-options="{ adjustPosition: true }"
            @confirm="onConfirm"
            @blur="handleInputBlur"
          />
        </view>
      </view>
    </view>
  </wd-popup>
</template>

<style lang='css' scoped></style>
