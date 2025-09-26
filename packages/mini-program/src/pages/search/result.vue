<script lang='ts' setup>
import type { Page, PublishMessageListResponse } from '@/api'
import { onMounted, ref, watch } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { useSearchStore } from '@/store'

const showSidebar = ref(false)
const searchStore = useSearchStore()
const latestSearchText = ref(searchStore.searchHistory[0])
const isLoading = ref(false)
const isFinish = ref(false)
const data = ref<PublishMessageListResponse[]>([])
const [page, reset] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 10,
  sort: 'createTime',
  keyWord: latestSearchText.value,
})

watch(latestSearchText, (val) => {
  if (val === '') {
    uni.navigateBack()
  }
})

async function getData() {
  const res = await api.globalSearch({ ...page.value }).finally(() => {
    isLoading.value = false
  })
  if (res.code === 200) {
    res.result.records.forEach((item) => {
      data.value.push(item.memberContentForClientVO)
    })
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

function onNavbarLeftClick() {
  showSidebar.value = !showSidebar.value
}
function onChangeChat() {
  uni.navigateTo({ url: '/pages/chat/index' })
}
function onGotoBack() {
  uni.navigateBack()
}

onMounted(() => {
  reset()
  getData()
})
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="onChangeChat">
    <Navbar @left-click="onNavbarLeftClick" />
    <Container custom-class="px-32rpx">
      <SearchHead v-model="latestSearchText" @back="onGotoBack" />

      <view class="h-[calc(100%-190px)] mt-20px">
        <ViewList :data="data" :is-loading="isLoading" :is-finish="isFinish" @load="loadData" />
      </view>

      <Converse />
    </Container>
  </Layout>
</template>

<style lang='scss' scoped></style>
