<script lang='ts' setup>
import type { PublishMessageListResponse } from '@/api'
import { useClassesName } from '@higoal/hooks'

defineProps<{
  isLoading: boolean
  isFinish: boolean
}>()
const data = defineModel('data', { type: Array as () => PublishMessageListResponse[], required: true })
const cs = useClassesName('view')

function gotoDetail(item: PublishMessageListResponse) {
  uni.navigateTo({
    url: `/pages/index/detail?id=${item.id}`,
  })
}
</script>

<template>
  <view>
    <view v-for="item, index in data" :id="`view-${item.id}`" :key="index" :class="cs.m('card')" @click="gotoDetail(item)">
      <ViewCard :data="item" @update:data="(newData) => data[index] = newData" />
    </view>

    <view v-show="isLoading || isFinish" class="flex items-center justify-center py-20rpx loading-wrapper" :class="cs.m('loading')">
      <wd-loading v-if="!isFinish" color="#FC6146FF" :size="20" />
      <text class="ml-20rpx text-24rpx">
        {{ isFinish ? '没有更多了' : '加载中...' }}
      </text>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-view--card + .hi-view--card {
  margin-top: 20rpx;
}
</style>
