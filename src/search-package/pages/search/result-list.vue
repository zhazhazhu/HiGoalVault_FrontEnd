<script lang='ts' setup>
import type { GlobalSearchResult } from '@/api'
import { computed } from 'vue'
import { useClassesName } from '@/composables'
import { useChatStore } from '@/store'

const props = defineProps<{
  data: GlobalSearchResult[]
  isLoading: boolean
  isFinish: boolean
}>()
const cs = useClassesName('result-list')
const chatStore = useChatStore()
const transformData = computed(() => props.data.map((item) => {
  return {
    ...item,
    chatQueryAnswerVO: chatStore.transformAnswer(item.chatQueryAnswerVO),
    memberContentForClientVO: {
      ...item.memberContentForClientVO,
      chatQueryAnswerVO: chatStore.transformAnswer(item.memberContentForClientVO.chatQueryAnswerVO),
    },
  }
}))

function onClickContent(item: typeof transformData['value'][number]) {
  if (item.opType === 0) {
    uni.navigateTo({
      url: `/detail-package/pages/detail/index?id=${item.memberContentForClientVO.id}`,
    })
  }
  else {
    chatStore.currentChatId = item.chatId
    uni.navigateTo({ url: '/chat-package/pages/chat/index' })
  }
}
</script>

<template>
  <view>
    <view v-for="item in transformData" :key="item.chatId" :class="cs.m('container')" @click="onClickContent(item)">
      <ViewCard v-if="item.opType === 0" :data="item.memberContentForClientVO" />
      <MessagePreview v-else :data="item.chatQueryAnswerVO!" />
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
.hi-result-list--container + .hi-result-list--container {
  margin-top: 20rpx;
}
</style>
