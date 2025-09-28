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
const [page] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 10,
  sort: '',
  keyWord: '',
})
const userId = ref('')

watch(() => page.value.keyWord, (val) => {
  if (val === '') {
    uni.navigateBack()
  }
})

async function getData() {
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
  getData()
})

onLoad((options) => {
  page.value.keyWord = options?.keyWord || ''
  userId.value = options?.userId || ''
})
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="onChangeChat">
    <Navbar @left-click="onNavbarLeftClick" />
    <Container custom-class="px-32rpx">
      <SearchHead v-model="page.keyWord!" @back="onGotoBack" />

      <view class="h-[calc(100%-190px)] mt-20px">
        <ViewList :data="data" :is-loading="isLoading" :is-finish="isFinish" @load="loadData" />
      </view>

      <Converse />
    </Container>
  </Layout>
</template>

<style lang='scss' scoped></style>
