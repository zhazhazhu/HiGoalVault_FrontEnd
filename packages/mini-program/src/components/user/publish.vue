<script lang='ts' setup>
import type { Page, PublishMessageListResponse } from '@/api'
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { useUserStore } from '@/store'

const props = defineProps<{
  userId: string
}>()

const userStore = useUserStore()
const data = ref<PublishMessageListResponse[]>([])
const isLoading = ref(false)
const isFinish = ref(false)
const [page, resetPage] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 10,
})
const isRefreshing = ref(false)

async function getData() {
  isLoading.value = true
  const res = await api.getPublishList({
    authorId: props.userId || userStore.userInfo!.id,
    ...page.value,
  }).finally(() => {
    isLoading.value = false
  })
  if (res.code === 200) {
    data.value.push(...res.result.records)
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

onMounted(() => {
  resetPage()
  getData()
})

defineExpose({
  loadData,
  refreshData,
})
</script>

<template>
  <ViewList :data="data" :is-loading="isLoading" :is-finish="isFinish" />
</template>

<style lang='css' scoped></style>
