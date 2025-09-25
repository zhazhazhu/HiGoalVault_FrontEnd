<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import { ref } from 'vue'
import { ViewType } from '@/constants'

const cs = useClassesName('follow-list')
const activeViewType = ref(ViewType.Question)
const list = ref([])
</script>

<template>
  <view class="h-full" :class="cs.m('container')">
    <view class="flex items-center">
      <view v-for="item in ViewType" :key="item" :class="cs.m('view-type')">
        {{ item }}
      </view>
    </view>

    <scroll-view
      enhanced
      enable-passive
      enable-flex
      :scroll-y="true"
      :show-scrollbar="false"
      class="h-full overflow-y-auto"
      scroll-into-view-alignment="end"
      :class="cs.m('container')"
      :lower-threshold="50"
    >
      <!-- <view v-for="item in list" :id="`view-${item.id}`" :key="item.id" :class="cs.m('card')">
        <ViewCard :data="item" />
      </view> -->
    </scroll-view>
  </view>
</template>

<style lang='scss' scoped>
.hi-follow-list--view-type {
  background-color: #e4e4e4;
  color: #666666;
  padding: 14rpx 24rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  & + & {
    margin-left: 20rpx;
  }
}
.hi-follow-list--card + .hi-follow-list--card {
  margin-top: 40rpx;
}
</style>
