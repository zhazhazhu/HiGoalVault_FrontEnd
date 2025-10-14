<script lang='ts' setup>
import type { AnswerAfter, PublishMessageListResponse } from '@/api'
import { computed } from 'vue'
import { api } from '@/api'
import { useClassesName } from '@/composables'
import { useUserStore } from '@/store'
import { formatCommentDate } from '@/utils'

const props = defineProps<{
  disableToUser?: boolean
}>()
const cs = useClassesName('view-card')
const data = defineModel('data', { type: Object as () => PublishMessageListResponse, required: true })
const userStore = useUserStore()
const stockData = computed<AnswerAfter['data']>(() => data.value.chatQueryAnswerVO?.data ? JSON.parse(data.value.chatQueryAnswerVO?.data) : [])

async function onThumbsUp() {
  if (!userStore.isLogin) {
    return
  }
  const res = await api.thumbsUp({
    contentId: data.value.id,
    likeAction: !data.value.isLike,
  })
  if (res.code === 200) {
    data.value.isLike = !data.value.isLike
    data.value.likeCount = data.value.isLike ? data.value.likeCount + 1 : data.value.likeCount - 1
  }
}
function gotoUser() {
  if (props.disableToUser) {
    return
  }
  uni.navigateTo({ url: `/user-package/pages/user/index?id=${data.value.memberId}` })
}
function onClickTag({ id }: { id: string }) {
  uni.navigateTo({ url: `/tag-package/pages/tag/index?id=${id}` })
}
</script>

<template>
  <view :class="cs.m('container')">
    <view class="flex items-center justify-between text-26rpx color-#8E8E93">
      <view class="flex items-center" @click="gotoUser">
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
    <view class="flex flex-row gap-20rpx overflow-hidden">
      <Tag v-for="item in data?.tags.slice(0, 3)" :key="item.id" :type="item.followStatus ? 'primary' : 'info'" class="flex-shrink-0" @tap.stop="onClickTag({ id: item.id })">
        #{{ item.tagName }}
      </Tag>
    </view>

    <stock v-if="stockData.length === 1" :data="stockData" preview />

    <view class="flex items-center color-#666 gap-30rpx">
      <button class="share-btn contents" open-type="share" :data-id="data.id" @tap.stop>
        <view class="wechat-icon bg-#666 size-50rpx" />
      </button>
      <view class="flex-1" />
      <view class="flex items-center">
        <view class="i-material-symbols-favorite-rounded color-#b1b1b1 size-38rpx mr-6rpx" :class="{ 'color-red': data.isLike }" @click.stop="onThumbsUp" />
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
