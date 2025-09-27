<script lang='ts' setup>
import type { PublishMessageListResponse } from '@/api'
import { useClassesName } from '@higoal/hooks'
import dayjs from 'dayjs'

defineProps<{
  data: PublishMessageListResponse
}>()

const cs = useClassesName('view-card')
</script>

<template>
  <view :class="cs.m('container')">
    <view class="flex items-center justify-between text-26rpx color-#8E8E93">
      <view class="flex items-center">
        <wd-img width="52rpx" height="56rpx" round mode="aspectFill" :src="data.face" />
        <text class="ml-16rpx">
          {{ data.nickName }}
        </text>
      </view>

      <view>
        {{ dayjs(data.createTime).format('YY/MM/DD') }}
      </view>
    </view>

    <view :class="cs.m('content')">
      <view class="text-26rpx color-#333 word-wrap">
        {{ data.content }}
      </view>
    </view>

    <view>
      <wd-text :text="data.title" color="#121212" size="32rpx" bold />
    </view>

    <view class="flex gap-20rpx">
      <Tag v-for="item in data?.tags" :key="item.id">
        #{{ item.tagName }}
      </Tag>
    </view>

    <view class="flex items-center color-#666 gap-30rpx">
      <view class="wechat-icon bg-#666 size-50rpx" @click.stop />
      <view class="flex-1" />
      <view class="flex items-center">
        <view class="thumb-up-icon bg-#666 size-46rpx" :class="{ 'bg-red': data.isLiked }" @click.stop />
        <view class="text-26rpx">
          {{ data.likeCount }}
        </view>
      </view>
      <view class="flex items-center">
        <view class="comment-icon bg-#666 size-46rpx" />
        <view class="text-26rpx">
          {{ data.commentCount }}
        </view>
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
