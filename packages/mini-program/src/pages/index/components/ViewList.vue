<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import { onMounted, ref } from 'vue'
import { api } from '@/api'

const mock = ref([
  {
    id: '1',
    title: '普通人怎样用Deepseek投资',
    userName: '发布者',
    userAvatar: 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
    replyContent: {},
    tips: ['标签一'],
    thumbUp: 3000,
    comment: 888,
  },
])

const cs = useClassesName('view')

onMounted(() => {
  api.getPublishMessageList({ pageVO: { pageSize: 10, pageNumber: 1 } })
})
</script>

<template>
  <view :class="cs.m('container')">
    <view v-for="item in mock" :key="item.id" :class="cs.m('card')">
      <view :class="cs.e('title')" class="mb-32rpx">
        <wd-text :text="item.title" color="#121212" size="32rpx" bold />
      </view>

      <view class="flex items-center">
        <wd-img width="56rpx" height="56rpx" round mode="aspectFill" :src="item.userAvatar" />
        <wd-text :text="item.userName" color="#333333" bold custom-class="ml-8px" />
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-view--card {
  background: white;
  border-radius: 20rpx;
  padding: 32rpx;
}
</style>
