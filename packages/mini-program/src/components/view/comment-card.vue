<script lang='ts' setup>
import type { CommentResponse } from '@/api'
import { formatDate } from '@/utils'

defineProps<{ data: CommentResponse }>()

const emit = defineEmits<{
  (e: 'replyComment', comment: CommentResponse['comment']): void
}>()
</script>

<template>
  <view class="flex flex-col gap-14rpx w-full">
    <view class="flex flex-col gap-14rpx">
      <view class="flex items-center gap-10rpx">
        <wd-img round :src="data.comment.face || 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'" width="52rpx" height="52rpx" />
        <view class="text-28rpx color-#666666">
          {{ data.comment.nickname || 'Unknown' }}
        </view>
      </view>

      <view class="text-#666666 text-26rpx">
        {{ data.comment.commentContent }}
      </view>

      <view class="flex justify-between">
        <view class="flex items-center gap-10rpx">
          <view class="text-#8E8E93 text-20rpx">
            发表于 {{ formatDate(data.comment.createTime) }}
          </view>
          <view class="text-#333333 text-20rpx" @click="emit('replyComment', data.comment)">
            回复
          </view>
        </view>

        <view class="flex items-center gap-6rpx">
          <view class="thumb-up-icon size-42rpx" :class="{ 'color-red': data.comment.isLike }" />
          <view>{{ data.comment.likeCount }}</view>
        </view>
      </view>
    </view>

    <view class="bg-#F1F1F1 rounded-14rpx">
      <view v-for="item in data.replies" :key="item.replierId">
        <view class="text-#666666 text-26rpx">
          {{ item.replyContent }}
        </view>
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped></style>
