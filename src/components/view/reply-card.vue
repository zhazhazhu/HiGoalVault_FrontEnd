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
    <view class="flex">
      <wd-img round mode="aspectFill" :src="data.face || 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'" width="18px" height="18px" />
      <view class="flex flex-col flex-1 ml-8px gap-4px" @click.stop="onReplyClick(data)">
        <view class="flex items-center gap-14rpx text-12px color-#ABABAB">
          <view>
            {{ data.nickName }}
          </view>
          <template v-if="data.parentReplyId">
            <view class="i-material-symbols-play-arrow-rounded" />
            <view>
              {{ data.replyToNickName }}
            </view>
          </template>
        </view>

        <view class="text-#333 text-14px">
          {{ data.replyContent }}
        </view>

        <view class="flex justify-between">
          <view class="flex items-center gap-8px text-12px color-#919499">
            <view>
              {{ formatCommentDate(data.createTime) }}
            </view>
            <view class="font-500" @click.stop="onReplyClick(data)">
              回复
            </view>
            <view v-if="isSelf" class="font-500" @click.stop="onDeleteReply(data)">
              删除
            </view>
          </view>

          <view class="flex items-center gap-6rpx color-#919499" @click.stop="onLikeReply(data)">
            <view class="size-18px" :class="[data.isLike ? 'color-red i-material-symbols-favorite-rounded' : 'color-#919499 i-material-symbols-favorite-outline-rounded'] " />
            <view class="text-14px">
              {{ data.likeCount }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang='css' scoped></style>
