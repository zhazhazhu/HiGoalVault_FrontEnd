<script lang='ts' setup>
import type { CommentResponse, Page, ReplyResponse } from '@/api'
import { computed, onMounted, ref } from 'vue'
import { useMessage } from 'wot-design-uni'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { useUserStore } from '@/store'
import { formatCommentDate } from '@/utils'

const props = defineProps<{
  currentCommentId?: string
}>()

const emit = defineEmits<{
  (e: 'replyComment', comment: CommentResponse['comment']): void
  (e: 'replyReply', reply: ReplyResponse): void
  (e: 'deleteComment', comment: CommentResponse['comment']): void
}>()

const userStore = useUserStore()
const message = useMessage()
const data = defineModel('data', { type: Object as () => CommentResponse, required: true })
const commentId = ref(props.currentCommentId || '')
const isSelf = computed(() => userStore.userInfo?.id === data.value.comment.commenterId)

const remainReplyTotal = computed(() => data.value.totalReplies - data.value.replies.length)
const [page, reset] = useResetRef<Page>({
  pageNumber: 2,
  pageSize: 10,
  sort: 'createTime',
})

async function onLoadReply(comment: CommentResponse['comment']) {
  const res = await api.getCommentRepliesList({ commentId: comment.id, ...page.value })
  if (res.code === 200) {
    data.value.totalReplies = res.result.total
    data.value.replies.push(...res.result.records)
  }
}
async function onLikeComment(comment: CommentResponse['comment']) {
  const res = await api.thumbsUpComment({ commentId: comment.id, likeAction: !comment.isLike })
  if (res.code === 200) {
    comment.isLike = !comment.isLike
    comment.likeCount = comment.isLike ? comment.likeCount + 1 : comment.likeCount - 1
  }
}

function onReply(reply: ReplyResponse) {
  emit('replyReply', reply)
}
function commentIdCounter() {
  if (data.value.comment.id === commentId.value) {
    setTimeout(() => {
      commentId.value = ''
    }, 500)
  }
}
function onDeleteComment() {
  message.confirm({
    msg: '该评论内容将被删除无法恢复',
    title: '提示',
  }).then(async () => {
    const res = await api.deleteCommentById(data.value.comment.id)
    if (res.result === true) {
      uni.showToast({
        title: '删除成功',
        icon: 'none',
      })
      emit('deleteComment', data.value.comment)
    }
  })
}
function onDeleteReply(ids: string[], index: number) {
  data.value.replies.splice(index, 1)
  data.value.replies = data.value.replies.filter(item => !ids.includes(item.id))
  data.value.totalReplies -= ids.length
}

onMounted(() => {
  reset()
  commentIdCounter()
})
</script>

<template>
  <wd-root-portal>
    <wd-message-box />
  </wd-root-portal>
  <view class="flex flex-col gap-24rpx w-full mb-24rpx">
    <view class="flex flex-col gap-14rpx p-14rpx rounded-20rpx comment-card" :class="{ active: data.comment.id === commentId }">
      <view class="flex items-center gap-10rpx">
        <wd-img round mode="aspectFill" :src="data.comment.face || 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'" width="52rpx" height="52rpx" />
        <view class="text-28rpx color-#666666">
          {{ data.comment.nickName || 'Unknown' }}
        </view>
      </view>

      <view class="text-#666666 text-26rpx">
        {{ data.comment.commentContent }}
      </view>

      <view class="flex justify-between">
        <view class="flex items-center gap-10rpx">
          <view class="text-#8E8E93 text-20rpx">
            发表于 {{ formatCommentDate(data.comment.createTime) }}
          </view>
          <view v-if="!isSelf" class="text-#333333 text-20rpx" @click="emit('replyComment', data.comment)">
            回复
          </view>
          <view v-else class="text-#333333 text-20rpx" @click="onDeleteComment">
            删除
          </view>
        </view>

        <view class="flex items-center gap-6rpx color-#666" @click="onLikeComment(data.comment)">
          <view class="i-material-symbols-favorite-rounded color-#b1b1b1 size-38rpx mr-6rpx" :class="{ 'color-red': data.comment.isLike }" />
          <view>{{ data.comment.likeCount }}</view>
        </view>
      </view>
    </view>

    <view v-if="data.totalReplies > 0" class="bg-#F1F1F1 rounded-14rpx p-26rpx flex flex-col gap-40rpx">
      <ViewReplyCard v-for="item, index in data.replies" :key="item.id" :data="item" :comment="data.comment" @update:data="(val) => data.replies[index] = val" @reply-click="onReply" @delete-reply="onDeleteReply($event, index)" />

      <view v-if="data.totalReplies > data.replies.length" class="text-#333333 text-20rpx" @click="onLoadReply(data.comment)">
        展开{{ remainReplyTotal > 10 ? '10' : remainReplyTotal }}条
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.comment-card {
  background-color: white;
}
.comment-card.active {
  background-color: #e4e9f5a8;
}
.comment-card {
  transition: background-color 1s;
}
</style>
