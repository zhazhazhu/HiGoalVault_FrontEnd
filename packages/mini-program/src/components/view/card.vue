<script lang='ts' setup>
import type { PublishMessageListResponse } from '@higoal/api'
import { useClassesName } from '@higoal/hooks'
import dayjs from 'dayjs'

defineProps<{
  view: PublishMessageListResponse
}>()

const cs = useClassesName('view-card')
</script>

<template>
  <view :class="cs.m('container')">
    <view :class="cs.m('content')">
      <view class="text-26rpx color-#333">
        {{ view.content }}
      </view>
    </view>

    <view class="flex items-center justify-between text-26rpx color-#8E8E93">
      <view class="flex items-center">
        <!-- <wd-img width="52rpx" height="56rpx" round mode="aspectFill" :src="view.face" /> -->
        <text>
          {{ view.nickName }}
        </text>
      </view>

      <view>
        {{ dayjs(view.createTime).format('YY/MM/DD') }}
      </view>
    </view>

    <view>
      <wd-text :text="view.title" color="#121212" size="32rpx" bold />
    </view>

    <view class="flex items-center color-#666 gap-30rpx">
      <view class="wechat-icon bg-#666 size-50rpx" />
      <view class="flex-1" />
      <view class="flex items-center">
        <view class="thumb-up-icon bg-#666 size-46rpx" :class="{ 'bg-red': view.isLiked }" />
        <view class="text-26rpx">
          {{ view.likeCount }}
        </view>
      </view>
      <view class="flex items-center">
        <view class="comment-icon bg-#666 size-46rpx" />
        <view>{{ view.commentCount }}</view>
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-view-card--container {
  background: white;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>
