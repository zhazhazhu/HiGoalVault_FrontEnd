<script lang='ts' setup>
import type { CommentResponse, ReplyResponse } from '@/api'
import { formatDate } from '@/utils'

defineProps<{ data: CommentResponse }>()

const emit = defineEmits<{
  (e: 'reply', comment: ReplyResponse): void
}>()

function onReplyComment(item: ReplyResponse) {
  emit('reply', item)
}
</script>

<template>
  <view class="flex flex-col gap-10rpx">
    <view class="flex justify-between">
      <view class="font-bold text-28rpx color-#666666">
        {{ data.comment.commenterUsername }}
      </view>
    </view>
    <view class="text-28rpx color-#666666">
      {{ data.comment.commentContent }}
    </view>
    <view class="color-#8E8E93 text-22rpx">
      发表于 {{ formatDate(data.comment.createTime) }}
    </view>

    <view v-if="data.replies.length" class="bg-#F1F1F1 rounded-20rpx p-20rpx">
      <view
        v-for="item in data.replies"
        :key="item.replierId"
        class="bg-#666666 rounded-20rpx p-20rpx"
      >
        <view>
          <view>{{ item.replierUsername }}</view>
          <view>{{ item.replyContent }}</view>
        </view>
        <view>
          {{ formatDate(item.createTime) }}
        </view>

        <view @click="onReplyComment(item)">
          回复
        </view>
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped></style>
