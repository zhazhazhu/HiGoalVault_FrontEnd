<script lang='ts' setup>
import type { CommentResponse, ReplyResponse } from '@/api'
import { computed } from 'vue'
import { useMessage } from 'wot-design-uni'
import { api } from '@/api'
import { useUserStore } from '@/store'
import { formatCommentDate } from '@/utils'

defineProps<{
  comment: CommentResponse['comment']
}>()
const emit = defineEmits<{
  (e: 'replyClick', data: ReplyResponse): void
  (e: 'deleteReply', data: string[]): void
}>()
const data = defineModel('data', { type: Object as () => ReplyResponse, required: true })
const userStore = useUserStore()
const isSelf = computed(() => userStore.userInfo?.id === data.value.replierId)
const message = useMessage()

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
function onDeleteReply(data: ReplyResponse) {
  message.confirm({
    msg: '该回复内容将被删除无法恢复',
    title: '提示',
  }).then(async () => {
    const res = await api.deleteReplyById({
      replyId: data.id,
      commentId: data.commentId,
      parentReplyId: data.parentReplyId || undefined,
    })
    if (res.code === 200) {
      uni.showToast({
        title: '删除成功',
        icon: 'none',
      })
      emit('deleteReply', res.result)
    }
  })
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
        <view v-if="!isSelf" class="text-#333333 text-20rpx" @click="onReplyClick(data)">
          回复
        </view>
        <view v-else class="text-#333333 text-20rpx" @click="onDeleteReply(data)">
          删除
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
