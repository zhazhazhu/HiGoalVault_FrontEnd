<script lang='ts' setup>
import type { AfterPublishMessageListResponse, Page } from '@/api'
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { useChatStore } from '@/store'

const data = ref<AfterPublishMessageListResponse[]>([])
const isLoading = ref(false)
const isFinish = ref(false)
const [page, resetPage] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 10,
  sort: 'createTime',
})
const isRefreshing = ref(false)
const chatStore = useChatStore()

async function getData() {
  isLoading.value = true
  const res = await api.getCommentedContentList({
    ...page.value,
  })
  if (res.code === 200) {
    const records = res.result.records.map(item => ({
      ...item,
      chatQueryAnswerVO: chatStore.transformAnswer(item.chatQueryAnswerVO),
    }))
    data.value.push(...records)
    isLoading.value = false
    isFinish.value = res.result.records.length <= res.result.size
  }
}

function loadData() {
  if (isLoading.value || isFinish.value)
    return
  isLoading.value = true
  page.value.pageNumber!++
  getData()
}
async function refreshData() {
  isRefreshing.value = true
  resetPage()
  data.value = []
  await getData()
  isRefreshing.value = false
}

async function updateContentById(id: string) {
  const viewIndex = data.value.findIndex(item => item.id === id)
  if (viewIndex !== -1) {
    const res = await api.getPublicMessageDetail({ contentId: id })
    if (res.code === 200) {
      data.value[viewIndex] = {
        ...res.result,
        chatQueryAnswerVO: chatStore.transformAnswer(res.result.chatQueryAnswerVO),
      }
    }
  }
}

onMounted(() => {
  resetPage()
  getData()
})

defineExpose({
  loadData,
  refreshData,
  updateContentById,
})
</script>

<template>
  <ViewList :data="data" :is-loading="isLoading" :is-finish="isFinish" />
</template>

<style lang='css' scoped></style>
