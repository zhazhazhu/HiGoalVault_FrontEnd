<script lang='ts' setup>
import type { CommentResponse, Page, ReplyResponse } from '@/api'
import { computed, onMounted } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { formatCommentDate } from '@/utils'

const emit = defineEmits<{
  (e: 'replyComment', comment: CommentResponse['comment']): void
  (e: 'replyReply', reply: ReplyResponse): void
}>()

const data = defineModel('data', { type: Object as () => CommentResponse, required: true })

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

onMounted(() => {
  reset()
})
</script>

<template>
  <view class="flex flex-col gap-24rpx w-full mb-24rpx">
    <view class="flex flex-col gap-14rpx">
      <view class="flex items-center gap-10rpx">
        <wd-img round :src="data.comment.face || 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'" width="52rpx" height="52rpx" />
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
          <view class="text-#333333 text-20rpx" @click="emit('replyComment', data.comment)">
            回复
          </view>
        </view>

        <view class="flex items-center gap-6rpx color-#666" @click="onLikeComment(data.comment)">
          <view class="thumb-up-icon size-42rpx" :class="{ 'color-red': data.comment.isLike }" />
          <view>{{ data.comment.likeCount }}</view>
        </view>
      </view>
    </view>

    <view v-if="data.totalReplies > 0" class="bg-#F1F1F1 rounded-14rpx p-26rpx flex flex-col gap-40rpx">
      <ViewReplyCard v-for="item, index in data.replies" :key="item.id" :data="item" :comment="data.comment" @update:data="(val) => data.replies[index] = val" @reply-click="onReply" />

      <view v-if="data.totalReplies > data.replies.length" class="text-#333333 text-20rpx" @click="onLoadReply(data.comment)">
        展开{{ remainReplyTotal > 10 ? '10' : remainReplyTotal }}条
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped></style>
