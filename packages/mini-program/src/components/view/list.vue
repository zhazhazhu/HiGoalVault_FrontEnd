<script lang='ts' setup>
import type { Page, PublishMessageListResponse } from '@/api'
import { useClassesName } from '@higoal/hooks'
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'

const cs = useClassesName('view')
const list = ref<PublishMessageListResponse[]>([])
const loading = ref(false)
const isFinish = ref(false)
const [page, reset] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 10,
})

async function getData() {
  const data = await api.getPublishMessageList({ pageVO: page.value }).finally(() => {
    loading.value = false
  })
  if (data.code === 200) {
    list.value.push(...data.result.records)
    isFinish.value = data.result.total <= list.value.length
  }
}
function load() {
  if (loading.value || isFinish.value)
    return
  loading.value = true
  page.value.pageNumber!++
  getData()
}
function gotoDetail(item: PublishMessageListResponse) {
  uni.navigateTo({
    url: `/pages/index/detail?id=${item.id}`,
  })
}

onMounted(() => {
  reset()
  getData()
})
</script>

<template>
  <scroll-view
    scroll-into-view-alignment="end"
    enhanced
    enable-passive
    enable-flex
    :scroll-y="true"
    :show-scrollbar="false"
    class="h-full overflow-y-auto"
    :class="cs.m('container')"
    :lower-threshold="50"
    @scrolltolower="load"
  >
    <view v-for="item in list" :id="`view-${item.id}`" :key="item.id" :class="cs.m('card')" @click="gotoDetail(item)">
      <ViewCard :data="item" />
    </view>

    <view v-show="loading || isFinish" class="flex items-center justify-center py-20rpx loading-wrapper" :class="cs.m('loading')">
      <wd-loading v-if="!isFinish" color="#FC6146FF" :size="20" />
      <text class="ml-20rpx text-24rpx">
        {{ isFinish ? '没有更多了' : '加载中...' }}
      </text>
    </view>
  </scroll-view>
</template>

<style lang='scss' scoped>
.hi-view--card + .hi-view--card {
  margin-top: 40rpx;
}
</style>
