<script setup lang="ts">
import type { Page, PublishMessageListResponse } from '@/api'
import type Converse from '@/components/converse/index.vue'
import { useClassesName } from '@higoal/hooks'
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { useChatStore } from '@/store'

const cs = useClassesName('home')
const showSidebar = ref(false)
const active = ref('view')
const converseInstance = ref<InstanceType<typeof Converse>>()
const chatStore = useChatStore()
const isLoading = ref(false)
const isFinish = ref(false)
const data = ref<PublishMessageListResponse[]>([])
const [page, reset] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 10,
  sort: 'createTime',
})
async function getData() {
  const res = await api.getPublishMessageList({ ...page.value }).finally(() => {
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

function onNavbarLeftClick() {
  showSidebar.value = !showSidebar.value
}
function onChangeChat() {
  uni.navigateTo({ url: '/pages/chat/index' })
}
function onClickSearch() {
  uni.navigateTo({ url: '/pages/search/index' })
}
onMounted(() => {
  chatStore.currentChatId = ''
  reset()
  getData()
  // uni.navigateTo({ url: '/pages/index/detail?id=1971470547623776257' })
})
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="onChangeChat">
    <navbar @left-click="onNavbarLeftClick" />

    <Container custom-class="px-24rpx">
      <tabs
        v-model="active"
        editable
        class="overflow-hidden"
        custom-content-class="mt-10px"
        :custom-nav-class="cs.m('tab-nav')"
        :style="{ height: `calc(100% - ${140}px)` }"
        @edit="onClickSearch"
      >
        <template #edit>
          <wd-icon name="search" size="18" />
        </template>
        <tabs-item name="view" label="发现">
          <ViewList v-model:data="data" :is-loading="isLoading" :is-finish="isFinish" @load="loadData" />
        </tabs-item>
        <tabs-item name="follow" label="关注">
          <ViewFollowList />
        </tabs-item>
      </tabs>

      <Converse ref="converseInstance" />
    </Container>
  </Layout>
</template>

<style lang="scss" scoped>
</style>
