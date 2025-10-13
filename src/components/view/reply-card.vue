<script lang='ts' setup>
import type { CommentResponse, ReplyResponse } from '@/api'
import { api } from '@/api'
import { formatCommentDate } from '@/utils'

defineProps<{
  comment: CommentResponse['comment']
}>()
const emit = defineEmits<{
  (e: 'replyClick', data: ReplyResponse): void
}>()
const data = defineModel('data', { type: Object as () => ReplyResponse, required: true })
function onReplyClick(data: ReplyResponse) {
  emit('replyClick', data)
}
async function onLikeReply(data: ReplyResponse) {
  const res = await api.thumbsUpReply({ replyId: data.id, likeAction: !data.isLike })
  if (res.code === 200) {
    data.isLike = !data.isLike
    data.likeCount = data.isLike ? data.likeCount + 1 : data.likeCount - 1
  }
}
</script>

<template>
  <view class="flex flex-col gap-14rpx w-full">
    <view class="flex items-center gap-14rpx text-26rpx font-500">
      <view class="flex items-center gap-14rpx">
        <view class="color-blue">
          {{ data.nickName }}
        </view>
        <view v-if="data.parentReplyId" class="color-#666">
          回复
        </view>
        <view v-if="data.parentReplyId" class="color-blue">
          {{ data.replyToNickName }} :
        </view>
      </view>

      <view class="text-#666666">
        {{ data.replyContent }}
      </view>
    </view>

    <view class="flex justify-between">
      <view class="flex items-center gap-10rpx">
        <view class="text-#8E8E93 text-20rpx">
          {{ formatCommentDate(data.createTime) }}
        </view>
        <view class="text-#333333 text-20rpx" @click="onReplyClick(data)">
          回复
        </view>
      </view>
      <view class="flex items-center gap-6rpx color-#666" @click="onLikeReply(data)">
        <view class="i-material-symbols-favorite-rounded color-#b1b1b1 size-38rpx mr-6rpx" :class="{ 'color-red': data.isLike }" />
        <view>{{ data.likeCount }}</view>
      </view>
    </view>
  </view>
</template>

<style lang='css' scoped></style>
