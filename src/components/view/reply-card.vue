<script lang='ts' setup>
import type { CommentResponse, ReplyResponse } from '@/api'
import { computed, ref } from 'vue'
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
const showOption = ref(false)

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
function handleOptions() {
  showOption.value = true
}
function handleLongpressOptions() {
  uni.vibrateShort()
  showOption.value = true
}
function handleReplyOption() {
  showOption.value = false
  emit('replyClick', data.value)
}
function handleCopyOption() {
  uni.setClipboardData({
    data: data.value.replyContent,
    success() {
      uni.showToast({
        title: '已复制到剪切板',
        icon: 'none',
      })
    },
  })
}
function handleDeleteOption() {
  showOption.value = false
  onDeleteReply(data.value)
}
function gotoReport() {
  showOption.value = false
  uni.navigateTo({ url: `/pages/report-package/pages/index?type=5&objectId=${data.value.id}` })
}
</script>

<template>
  <wd-root-portal>
    <wd-popup v-model="showOption" position="bottom" custom-class="rounded-t-32px">
      <view class="p-20px pb-40px">
        <view class="cell-item" @click="handleReplyOption">
          <view class="i-ic-baseline-reply icon" />
          <text>回复</text>
        </view>
        <view class="cell-item" @click="handleCopyOption">
          <view class="i-material-symbols-content-copy-outline-rounded icon" />
          <text>复制</text>
        </view>
        <view v-if="isSelf" class="cell-item" @click="handleDeleteOption">
          <view class="i-material-symbols-delete-outline-rounded icon" />
          <text>删除</text>
        </view>
        <view v-if="!isSelf" class="cell-item" @click="gotoReport">
          <view class="i-ic-baseline-warning-amber icon" />
          <text>举报该评论</text>
        </view>
      </view>
    </wd-popup>
  </wd-root-portal>
  <view class="flex flex-col gap-14rpx w-full">
    <view class="flex">
      <wd-img round mode="aspectFill" :src="data.face || 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'" width="18px" height="18px" />
      <view class="flex flex-col flex-1 ml-8px gap-4px" @click.stop="onReplyClick(data)" @longpress="handleLongpressOptions">
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
            <view class="color-#464646" @click.stop="onReplyClick(data)">
              回复
            </view>
          </view>

          <view class="flex items-center gap-14px">
            <view class="flex items-center gap-6rpx color-#919499" @click.stop="onLikeReply(data)">
              <view class="size-18px" :class="[data.isLike ? 'color-red i-material-symbols-favorite-rounded' : 'color-#919499 i-material-symbols-favorite-outline-rounded'] " />
              <view class="text-14px">
                {{ data.likeCount }}
              </view>
            </view>
            <view>
              <!-- <view class="i-ri-more-fill size-18px color-#919499" @click="handleOptions" /> -->
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.cell-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 14px;
  height: 44px;
  &.warning {
    color: #ff4d4f;
  }
  .icon {
    font-size: 18px;
  }
  text {
    font-size: 14px;
  }
}
</style>
