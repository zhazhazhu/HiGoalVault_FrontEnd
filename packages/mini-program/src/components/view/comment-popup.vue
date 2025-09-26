<script lang='ts' setup>
import type { CommentResponse, Page } from '@/api'
import { useClassesName } from '@higoal/hooks'
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'

const props = defineProps<{ contentId: string }>()
const model = defineModel({ type: Boolean, default: false })
const [page, reset] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 10,
  sort: 'createTime',
})
const cs = useClassesName('comment-popup')
const data = ref<CommentResponse[]>([])
const loading = ref(false)
const isFinish = ref(false)
const total = ref(0)
const commentContent = ref('')
const placeholder = ref('发表友善评论')
const textareaInstance = ref()
const isFocus = ref(false)

async function getData() {
  loading.value = true
  const res = await api.getCommentList({ contentId: props.contentId, ...page.value }).finally(() => {
    loading.value = false
  })
  if (res.code === 200) {
    total.value = res.result.total
    data.value.push(...res.result.records)
    isFinish.value = res.result.total <= data.value.length
  }
}

async function load() {
  if (loading.value || isFinish.value)
    return
  loading.value = true
  page.value.pageNumber!++
  getData()
}
const currentOperating = ref<number | null>(null)

function handleClose() {
  model.value = false
}
async function onConfirm() {
  if (currentOperating.value === null) {
    const res = await api.addComment({ commentContent: commentContent.value, contentId: props.contentId })
    if (res.code === 200) {
      commentContent.value = ''
    }
  }
  else {
    const res = await api.addCommentReply({
      commentId: data.value[currentOperating.value].comment.id,
      replyContent: commentContent.value,
      replyToUserId: data.value[currentOperating.value].comment.commenterId,
    })
    if (res.code === 200) {
      commentContent.value = ''
    }
  }
}
function onReplyComment(comment: CommentResponse['comment'], index: number) {
  debugger
  currentOperating.value = index
  placeholder.value = `@${comment.nickname || 'Unknown'}`
  isFocus.value = true
}

onMounted(() => {
  getData()
})
</script>

<template>
  <wd-popup
    v-model="model"
    position="bottom"
    custom-style="border-radius:32rpx;"
    safe-area-inset-bottom
    closable
    lock-scroll
    @close="handleClose"
  >
    <view class="h-1000rpx p-32rpx relative">
      <view class="h-50rpx">
        <text class="font-bold">
          评论
        </text>
        <text class="color-#666">
          {{ total }}
        </text>
      </view>

      <scroll-view
        scroll-y
        enhanced
        :show-scrollbar="false"
        class="max-h-800rpx overflow-y-auto pb-20rpx gap-20rpx py-30rpx"
      >
        <view-comment-card v-for="item, index in data" :key="item.comment.id" :data="item" @reply-comment="onReplyComment($event, index)" />
      </scroll-view>

      <view class="flex items-center absolute bottom-0 left-0 w-full px-32rpx box-border gap-30rpx min-h-100rpx">
        <view class="rounded-12px flex-1 overflow-hidden">
          <wd-textarea
            ref="textareaInstance"
            v-model="commentContent"
            clearable
            no-border
            show-word-limit
            hold-keyboard
            confirm-type="send"
            :focus="isFocus"
            :placeholder="placeholder"
            :auto-height="true"
            :cursor-spacing="120"
            :custom-textarea-class="cs.m('textarea')"
            :custom-class="cs.m('textarea-container')"
            :placeholder-class="cs.m('textarea-placeholder')"
            @focus="isFocus = true"
            @blur="isFocus = false"
            @confirm="onConfirm"
          />
        </view>
        <view class="text-28rpx color-#666666" @click="onConfirm">
          发表
        </view>
      </view>
    </view>
  </wd-popup>
</template>

<style lang='css' scoped></style>
