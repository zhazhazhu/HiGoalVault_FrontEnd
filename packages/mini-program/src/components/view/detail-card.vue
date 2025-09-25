<script lang='ts' setup>
import type { PublishMessageListResponse } from '@/api'
import { useUUID } from '@higoal/hooks'
import dayjs from 'dayjs'
import { api } from '@/api'
import { useChatStore, useUserStore } from '@/store'

const props = defineProps<{
  data: PublishMessageListResponse
}>()

const userStore = useUserStore()
const chatStore = useChatStore()

async function onFollowUser() {
  const res = await api.followUser({ followAction: true, followeeId: props.data!.memberId, followerId: userStore.userInfo!.id })
  if (res.code === 200) {
    console.log(res)
  }
}
async function onContinueTalk() {
  const res = await api.addChat()
  if (res.code === 200) {
    chatStore.currentChatId = res.result.chatId
  }
  chatStore.currentRunId = useUUID(32)
  chatStore.waitingMessageTask = {
    query: props.data!.title,
    chatId: chatStore.currentChatId,
    runId: useUUID(32),
  }
  uni.redirectTo({ url: '/pages/chat/index' })
}
</script>

<template>
  <view class="flex flex-col bg-white p-32rpx gap-20rpx">
    <view class="flex">
      <view class="flex-1 truncate">
        <wd-text :text="data?.title" color="#121212" size="32rpx" bold />
      </view>
      <wd-button type="primary" plain size="small" @click="onContinueTalk">
        继续提问
      </wd-button>
    </view>

    <view class="flex items-center justify-between text-26rpx color-#8E8E93">
      <view class="flex items-center">
        <wd-img width="52rpx" height="56rpx" round mode="aspectFill" :src="data?.face" />
        <text class="ml-16rpx">
          {{ data?.nickName }}
        </text>
      </view>

      <wd-button v-if="data?.memberId !== userStore.userInfo?.id" icon="add" size="small" @click="onFollowUser">
        关注
      </wd-button>
    </view>

    <view class="text-26rpx color-#666 word-wrap">
      <text>{{ data?.content }}</text>
    </view>

    <view>
      <Tag v-for="item in data?.tags" :key="item.id" custom-class="mr-20rpx">
        #{{ item.tagName }}
      </Tag>
    </view>

    <view class="text-22rpx color-#969696">
      <text>发表于 {{ dayjs(data?.createTime).format('YY/MM/DD HH:mm') }}</text>
    </view>
  </view>
</template>

<style lang='css' scoped></style>
