<script lang='ts' setup>
import type { AfterPublishMessageListResponse, Page } from '@/api'
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { useChatStore } from '@/store'

const data = ref<AfterPublishMessageListResponse[]>([])
const total = ref<number>(0)
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
  const res = await api.getInteractedLikedContentList({
    ...page.value,
  })
  if (res.code === 200) {
    const records = res.result.records.map(item => ({
      ...item,
      chatQueryAnswerVO: chatStore.transformAnswer(item.chatQueryAnswerVO),
    }))
    data.value.push(...records)
    total.value = res.result.total
    isLoading.value = false
    isFinish.value = data.value.length <= total.value
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

async function updateContentById(id: string, type: 'add' | 'remove' | 'update') {
  const res = await api.getPublicMessageDetail({ contentId: id })
  const viewIndex = data.value.findIndex(item => item.id === id)
  switch (type) {
    case 'update':
      if (viewIndex !== -1) {
        data.value[viewIndex] = {
          ...res.result,
          chatQueryAnswerVO: chatStore.transformAnswer(res.result.chatQueryAnswerVO),
        }
      }
      break
    case 'remove':
      if (viewIndex !== -1) {
        data.value.splice(viewIndex, 1)
        total.value--
      }
      break
    case 'add':
      data.value.unshift({
        ...res.result,
        chatQueryAnswerVO: chatStore.transformAnswer(res.result.chatQueryAnswerVO),
      })
      total.value++
      break
  }
}

onMounted(() => {
  resetPage()
  getData()
})

defineExpose({
  total,
  loadData,
  refreshData,
  updateContentById,
})
</script>

<template>
  <ViewList :data="data" :is-loading="isLoading" :is-finish="isFinish" />
</template>

<style lang='css' scoped></style>
