<script lang='ts' setup>
import type { CommentResponse, Page } from '@/api'
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
const data = ref<CommentResponse[]>([])
const loading = ref(false)
const isFinish = ref(false)
const total = ref(0)

async function getData(commentId: string = '') {
  loading.value = true
  const res = await api.getCommentList({ contentId: props.contentId, commentId, ...page.value }).finally(() => {
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

function handleClose() {
  model.value = false
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
    closable
    lock-scroll
    @close="handleClose"
  >
    <view class="min-h-500rpx p-32rpx">
      <view>
        评论
        <text class="text-22rpx">
          {{ total }}
        </text>
      </view>

      <view class="flex flex-col gap-20rpx py-20rpx">
        <view-comment-card v-for="item in data" :key="item.comment.id" :data="item" />
      </view>
    </view>
  </wd-popup>
</template>

<style lang='css' scoped></style>
