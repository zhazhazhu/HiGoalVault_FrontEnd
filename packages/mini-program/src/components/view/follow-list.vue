<script lang='ts' setup>
import type { Page, PublishMessageListResponse } from '@/api'
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'

const isLoading = ref(false)
const isFinish = ref(false)
const data = ref<PublishMessageListResponse[]>([])
const [page, reset] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 10,
  sort: 'createTime',
})
async function getData() {
  const res = await api.getFollowingPublishMessageList({ ...page.value }).finally(() => {
    isLoading.value = false
  })
  if (res.code === 200) {
    data.value.push(...res.result.records)
    isFinish.value = res.result.total <= data.value.length
  }
}

function loadData() {
  if (isLoading.value || isFinish.value)
    return
  isLoading.value = true
  page.value.pageNumber!++
  getData()
}

onMounted(() => {
  reset()
  getData()
})
</script>

<template>
  <ViewList :data="data" :is-loading="isLoading" :is-finish="isFinish" @load="loadData" />
</template>

<style lang='scss' scoped>
</style>
