<script lang='ts' setup>
import type { PublishMessageListResponse } from '@/api'
import { useClassesName } from '@higoal/hooks'

defineProps<{
  data: PublishMessageListResponse[]
  isLoading: boolean
  isFinish: boolean
}>()
const emit = defineEmits<{
  (e: 'load'): void
}>()
const cs = useClassesName('view')

function gotoDetail(item: PublishMessageListResponse) {
  uni.navigateTo({
    url: `/pages/index/detail?id=${item.id}`,
  })
}
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
    @scrolltolower="emit('load')"
  >
    <view v-for="item in data" :id="`view-${item.id}`" :key="item.id" :class="cs.m('card')" @click="gotoDetail(item)">
      <ViewCard :data="item" />
    </view>

    <view v-show="isLoading || isFinish" class="flex items-center justify-center py-20rpx loading-wrapper" :class="cs.m('loading')">
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
