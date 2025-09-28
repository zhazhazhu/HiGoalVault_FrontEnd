<script lang='ts' setup>
import type { PublishMessageListResponse } from '@/api'
import { useClassesName } from '@higoal/hooks'
import { api } from '@/api'
import { useUserStore } from '@/store'
import { formatCommentDate } from '@/utils'

const cs = useClassesName('view-card')
const data = defineModel('data', { type: Object as () => PublishMessageListResponse, required: true })
const userStore = useUserStore()

async function onThumbsUp() {
  if (!userStore.isLogin) {
    return
  }
  const res = await api.thumbsUp({
    contentId: data.value.id,
    likeAction: !data.value.isLiked,
  })
  if (res.code === 200) {
    data.value.isLiked = !data.value.isLiked
    data.value.likeCount = data.value.isLiked ? data.value.likeCount + 1 : data.value.likeCount - 1
  }
}
</script>

<template>
  <view :class="cs.m('container')">
    <view class="flex items-center justify-between text-26rpx color-#8E8E93">
      <view class="flex items-center">
        <wd-img width="56rpx" height="56rpx" round mode="aspectFill" :src="data.face" />
        <text class="ml-16rpx">
          {{ data.nickName }}
        </text>
      </view>

      <view>
        {{ formatCommentDate(data.createTime) }}
      </view>
    </view>

    <view :class="cs.m('content')">
      <view class="text-26rpx color-#333 word-wrap font-500">
        {{ data.content }}
      </view>
    </view>

    <view>
      <wd-text :text="data.title" color="#121212" size="32rpx" bold />
    </view>

    <!-- 标签区域 - 超出一行隐藏 -->
    <view class="flex gap-20rpx overflow-hidden">
      <Tag v-for="item in data?.tags" :key="item.id" class="flex-shrink-0">
        #{{ item.tagName }}
      </Tag>
    </view>

    <view class="flex items-center color-#666 gap-30rpx">
      <view class="wechat-icon bg-#666 size-50rpx" @click.stop />
      <view class="flex-1" />
      <view class="flex items-center">
        <view class="thumb-up-icon bg-#666 size-46rpx" :class="{ 'bg-red': data.isLiked }" @click.stop="onThumbsUp" />
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
