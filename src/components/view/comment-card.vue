<script lang='ts' setup>
import type { CommentResponse, Page, ReplyResponse } from '@/api'
import { computed, onMounted, ref } from 'vue'
import { useMessage } from 'wot-design-uni'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { useUserStore } from '@/store'
import { formatCommentDate } from '@/utils'

const props = defineProps<{
  currentCommentId?: string
}>()

const emit = defineEmits<{
  (e: 'replyComment', comment: CommentResponse['comment']): void
  (e: 'replyReply', reply: ReplyResponse): void
  (e: 'deleteComment', comment: CommentResponse['comment']): void
}>()

const userStore = useUserStore()
const message = useMessage()
const data = defineModel('data', { type: Object as () => CommentResponse, required: true })
const commentId = ref(props.currentCommentId || '')
const isSelf = computed(() => userStore.userInfo?.id === data.value.comment.commenterId)
const showOption = ref(false)

const remainReplyTotal = computed(() => data.value.totalReplies - data.value.replies.length)
const [page, reset] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 5,
  sort: 'createTime',
})

async function onLoadReply(comment: CommentResponse['comment']) {
  const res = await api.getCommentRepliesList({ commentId: comment.id, ...page.value })
  if (res.code === 200) {
    data.value.totalReplies = res.result.total
    data.value.replies.push(...res.result.records)
    page.value.pageNumber!++
  }
}
async function onLikeComment(comment: CommentResponse['comment']) {
  const res = await api.thumbsUpComment({ commentId: comment.id, likeAction: !comment.isLike })
  if (res.code === 200) {
    comment.isLike = !comment.isLike
    comment.likeCount = comment.isLike ? comment.likeCount + 1 : comment.likeCount - 1
  }
}

function onReply(reply: ReplyResponse) {
  emit('replyReply', reply)
}
function commentIdCounter() {
  if (data.value.comment.id === commentId.value) {
    setTimeout(() => {
      commentId.value = ''
    }, 1000)
  }
}
function onDeleteComment() {
  showOption.value = false
  message.confirm({
    msg: '该评论内容将被删除无法恢复',
    title: '提示',
  }).then(async () => {
    const res = await api.deleteCommentById(data.value.comment.id)
    if (res.result === true) {
      uni.showToast({
        title: '删除成功',
        icon: 'none',
      })
      emit('deleteComment', data.value.comment)
    }
  })
}
function onDeleteReply(ids: string[], index: number) {
  data.value.replies.splice(index, 1)
  data.value.replies = data.value.replies.filter(item => !ids.includes(item.id))
  data.value.totalReplies -= ids.length
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
  emit('replyComment', data.value.comment)
}
function handleCopy() {
  uni.setClipboardData({
    data: data.value.comment.commentContent,
    success: () => {
      uni.showToast({
        title: '已复制到剪切板',
        icon: 'none',
      })
    },
  })
}
function gotoReport() {
  showOption.value = false
  uni.navigateTo({ url: `/pages/report-package/pages/index?type=4&objectId=${data.value.comment.id}` })
}

onMounted(() => {
  reset()
  commentIdCounter()
})
</script>

<template>
  <wd-root-portal>
    <wd-message-box />
    <wd-popup v-model="showOption" position="bottom" custom-class="rounded-t-32px">
      <view class="p-20px pb-40px">
        <view class="cell-item" @click="handleReplyOption">
          <view class="i-ic-baseline-reply icon" />
          <text>回复</text>
        </view>
        <view class="cell-item" @click="handleCopy">
          <view class="i-material-symbols-content-copy-outline-rounded icon" />
          <text>复制</text>
        </view>
        <view v-if="isSelf" class="cell-item warning" @click="onDeleteComment">
          <view class="i-material-symbols-delete-outline-rounded icon" />
          <text>删除</text>
        </view>
        <view class="cell-item warning" @click="gotoReport">
          <view class="i-ic-baseline-warning-amber icon" />
          <text>举报该评论</text>
        </view>
      </view>
    </wd-popup>
  </wd-root-portal>
  <view class="flex flex-col w-full mb-24rpx">
    <view class="flex p-7px rounded-20rpx comment-card" :class="{ active: data.comment.id === commentId }">
      <wd-img round mode="aspectFill" :src="data.comment.face || 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'" width="30px" height="30px" />

      <view class="flex flex-col flex-1 ml-8px gap-4px" @click.stop="emit('replyComment', data.comment)" @longpress="handleLongpressOptions">
        <view class="text-12px color-#ABABAB">
          {{ data.comment.nickName || 'Unknown' }}
        </view>

        <view class="text-#333 text-14px">
          {{ data.comment.commentContent }}
        </view>

        <view class="flex justify-between">
          <view class="flex items-center gap-8px text-12px color-#919499">
            <view>
              {{ formatCommentDate(data.comment.createTime) }}
            </view>
            <view class="color-#464646" @click.stop="emit('replyComment', data.comment)">
              回复
            </view>
            <!-- <view v-if="isSelf" class="font-500" @click.stop="onDeleteComment">
              删除
            </view> -->
          </view>

          <view class="flex items-center gap-14px">
            <view class="flex items-center gap-6rpx color-#919499" @click.stop="onLikeComment(data.comment)">
              <view class="size-18px" :class="[data.comment.isLike ? 'color-red i-material-symbols-favorite-rounded' : 'color-#919499 i-material-symbols-favorite-outline-rounded'] " />
              <view class="text-14px">
                {{ data.comment.likeCount }}
              </view>
            </view>
            <view>
              <view class="i-ri-more-fill size-18px color-#919499" @click.stop="handleOptions" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="data.totalReplies > 0" class="rounded-14rpx p-7px pl-45px flex flex-col gap-14px">
      <ViewReplyCard
        v-for="item, index in data.replies"
        :key="item.id"
        :data="item"
        :comment="data.comment"
        @update:data="(val) => data.replies[index] = val"
        @reply-click="onReply"
        @delete-reply="onDeleteReply($event, index)"
      />

      <view v-if="data.totalReplies > data.replies.length" class="font-500 text-12px" @click="onLoadReply(data.comment)">
        展开{{ remainReplyTotal > 5 ? '5' : remainReplyTotal }}条
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.comment-card {
  background-color: white;
}
.comment-card.active {
  background-color: #e4e9f5a8;
}
.comment-card {
  transition: background-color 1s;
}
.cell-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 14px;
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
