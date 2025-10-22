<script lang='ts' setup>
import type { AnswerAfter, ChatMessageStock, PublishMessageListResponse } from '@/api'
import { computed } from 'vue'
import { useMessage } from 'wot-design-uni'
import { api } from '@/api'
import { useClassesName } from '@/composables'
import { useUserStore } from '@/store'
import StockPreview from '@/subEcharts/echarts/components/preview.vue?async'
import { formatCommentDate, formatCommentOrThumbUpCount, useJsonParse } from '@/utils'

const props = defineProps<{
  disableToUser?: boolean
  enableDelete?: boolean
}>()

const emit = defineEmits<{
  (e: 'delete', id: string): void
}>()

const cs = useClassesName('view-card')
const data = defineModel('data', { type: Object as () => PublishMessageListResponse, required: true })
const userStore = useUserStore()
const stockData = computed(() => {
  const _data: AnswerAfter['data'] = data.value.chatQueryAnswerVO?.data ? JSON.parse(data.value.chatQueryAnswerVO?.data) : { analysis_data: '' }
  const stockData = useJsonParse<[ChatMessageStock] | []>(_data.analysis_data || '[]') || []
  return stockData
})
const message = useMessage()

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
function onDelete() {
  message.confirm({
    msg: '删除之后将无法恢复',
    title: '提示',
  }).then(async () => {
    const res = await api.deletePublishContentById(data.value.id)
    if (res.code === 200) {
      emit('delete', data.value.id)
      uni.showToast({
        title: '删除成功',
        icon: 'none',
      })
    }
  })
}
</script>

<template>
  <wd-root-portal>
    <wd-message-box />
  </wd-root-portal>

  <view :class="cs.m('container')">
    <view class="flex items-center justify-between text-26rpx color-#8E8E93">
      <view class="flex items-center" @click="gotoUser">
        <wd-img width="56rpx" height="56rpx" round mode="aspectFill" :src="data.face" />
        <text class="ml-16rpx">
          {{ data.nickName }}
        </text>
      </view>

      <view class="flex items-center gap-16rpx">
        <view>{{ formatCommentDate(data.createTime) }}</view>
        <view v-if="enableDelete" class="flex items-center justify-center color-#ff756d w-30px h-24px bg-#fff0f0 rounded-4px" @click.stop="onDelete">
          <view class="i-material-symbols-delete-outline-rounded text-30rpx" />
        </view>
      </view>
    </view>

    <view :class="cs.m('content')">
      <view class="text-26rpx color-#333 word-wrap font-500">
        {{ data.content }}
      </view>
    </view>

    <view>
      <wd-text :text="data.title" color="#121212" size="32rpx" bold />
      <view class="text-24rpx color-#696969 py-10rpx">
        {{ data.chatQueryAnswerVO?.summary }}
      </view>
    </view>

    <!-- 标签区域 - 超出一行隐藏 -->
    <view v-if="data.tags.length" class="flex flex-row gap-20rpx overflow-hidden">
      <Tag v-for="item in data?.tags.slice(0, 3)" :key="item.id" :type="item.followStatus ? 'primary' : 'info'" class="flex-shrink-0" @tap.stop="onClickTag({ id: item.id })">
        #{{ item.tagName }}
      </Tag>
    </view>

    <StockPreview v-if="stockData.length === 1" :data="stockData" />

    <view class="flex items-center color-#666 gap-30rpx">
      <button class="share-btn contents" open-type="share" :data-id="data.id" @tap.stop>
        <view class="wechat-icon bg-#666 size-50rpx" />
      </button>
      <view class="flex-1" />
      <view class="flex items-center">
        <view class="i-material-symbols-favorite-rounded color-#b1b1b1 size-38rpx mr-6rpx" :class="{ 'color-red': data.isLike }" @click.stop="onThumbsUp" />
        <view class="text-26rpx">
          {{ formatCommentOrThumbUpCount(data.likeCount) }}
        </view>
      </view>
      <view class="flex items-center">
        <view class="comment-icon bg-#666 size-46rpx" />
        <view class="text-26rpx">
          {{ formatCommentOrThumbUpCount(data.commentCount) }}
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
  border: 1px solid #ffaeae26;
}
</style>
