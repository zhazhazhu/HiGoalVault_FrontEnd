<script lang='ts' setup>
import type { CommentResponse } from '@/api'
import { formatDate } from '@/utils'

const props = defineProps<{ data: CommentResponse }>()
</script>

<template>
  <view class="flex flex-col gap-10rpx">
    <view class="flex justify-between">
      <view class="font-bold text-28rpx">
        {{ data.comment.commenterUsername }}
      </view>
      <view class="text-22rpx color-#8E8E93">
        {{ formatDate(data.comment.createTime) }}
      </view>
    </view>
    <view class="text-28rpx">
      {{ data.comment.commentContent }}
    </view>
  </view>
</template>

<style lang='css' scoped></style>
