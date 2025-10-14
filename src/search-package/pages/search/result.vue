<script lang='ts' setup>
import type { Page, PublishMessageListResponse } from '@/api'
import { onLoad } from '@dcloudio/uni-app'
import { onMounted, ref, watch } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'

const showSidebar = ref(false)
const isLoading = ref(false)
const isFinish = ref(false)
const data = ref<PublishMessageListResponse[]>([])
const [page, reset] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 10,
  sort: '',
  keyword: '',
})
const userId = ref('')
const isRefreshing = ref(false)
const keyword = ref('')

watch(keyword, (val) => {
  if (val === '') {
    uni.navigateBack()
  }
})

async function getData() {
  page.value.keyword = keyword.value
  if (!userId.value) {
    const res = await api.globalSearch({ ...page.value, searchSort: 'HOT' }).finally(() => {
      isLoading.value = false
    })
    if (res.code === 200) {
      res.result.records.forEach((item) => {
        data.value.push(item.memberContentForClientVO)
      })
      isFinish.value = res.result.total <= data.value.length
    }
  }
  else {
    const res = await api.userCenterSearch({ ...page.value, searchSort: 'HOT', userId: userId.value }).finally(() => {
      isLoading.value = false
    })
    if (res.code === 200) {
      res.result.records.forEach((item) => {
        data.value.push(item.memberContentForClientVO)
      })
      isFinish.value = res.result.total <= data.value.length
    }
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
  data.value = []
  reset()
  await getData()
  isRefreshing.value = false
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
function onConfirm() {
  reset()
  data.value = []
  getData()
}

onMounted(() => {
  reset()
  getData()
})

onLoad((options) => {
  keyword.value = options?.keyword || ''
  userId.value = options?.userId ? options?.userId : ''
})
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="onChangeChat">
    <Navbar @left-click="onNavbarLeftClick" />
    <Container custom-class="px-32rpx">
      <SearchHead v-model="keyword" @confirm="onConfirm" @back="onGotoBack" />

      <scroll-view
        scroll-y
        enhanced
        :show-scrollbar="false"
        :refresher-enabled="true"
        :refresher-triggered="isRefreshing"
        class="h-[calc(100%-80px)] mt-20px"
        @refresherrefresh="refreshData"
      >
        <ViewList :data="data" :is-loading="isLoading" :is-finish="isFinish" @load="loadData" />
      </scroll-view>
    </Container>
  </Layout>
</template>

<style lang='scss' scoped></style>
