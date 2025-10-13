<script lang='ts' setup>
import type { Page, PublishMessageListResponse } from '@/api'
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'

const data = ref<PublishMessageListResponse[]>([])
const total = ref<number>(0)
const isLoading = ref(false)
const isFinish = ref(false)
const [page, resetPage] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 10,
})
const isRefreshing = ref(false)

async function getData() {
  isLoading.value = true
  const res = await api.getInteractedLikedContentList({
    ...page.value,
  })
  if (res.code === 200) {
    data.value.push(...res.result.records)
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
  await getData()
  isRefreshing.value = false
}

onMounted(() => {
  resetPage()
  getData()
})

defineExpose({
  total,
  loadData,
  refreshData,
})
</script>

<template>
  <ViewList :data="data" :is-loading="isLoading" :is-finish="isFinish" />
</template>

<style lang='css' scoped></style>
