<script lang='ts' setup>
import type { PublishMessageListResponse } from '@/api'
import { useUUID } from '@higoal/hooks'
import dayjs from 'dayjs'
import { onMounted } from 'vue'
import { api } from '@/api'
import { useChatStore, useUserStore } from '@/store'

const props = defineProps<{
  data: PublishMessageListResponse
}>()

const userStore = useUserStore()
const chatStore = useChatStore()

async function checkFollowUser() {
  const res = await api.checkFollowUser(props.data!.memberId)
  if (res.code === 200) {
    props.data!.isFollowed = res.result
  }
}
async function onFollowUser(followAction: 'follow' | 'unfollow') {
  const res = await api.followUser({ followAction: followAction === 'follow', followeeId: props.data!.memberId, followerId: userStore.userInfo!.id })
  if (res.code === 200) {
    props.data!.isFollowed = followAction === 'follow'
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
function onClickTag({ id }: { id: string }) {
  uni.navigateTo({ url: `/pages/tag/index?id=${id}` })
}
function gotoUser() {
  uni.navigateTo({ url: `/pages/user/index?id=${props.data!.memberId}` })
}

onMounted(() => {
  checkFollowUser()
})
</script>

<template>
  <view class="flex flex-col bg-white p-32rpx gap-20rpx">
    <view class="flex">
      <view class="flex-1 truncate">
        <wd-text :text="data?.title" color="#121212" size="32rpx" bold />
      </view>
      <wd-button type="success" plain size="small" @click="onContinueTalk">
        继续提问
      </wd-button>
    </view>

    <view class="flex items-center justify-between text-26rpx color-#8E8E93">
      <view class="flex items-center" @click="gotoUser">
        <wd-img width="56rpx" height="56rpx" round mode="aspectFill" :src="data?.face" />
        <text class="ml-16rpx">
          {{ data?.nickName }}
        </text>
      </view>

      <template v-if="data?.memberId !== userStore.userInfo?.id">
        <wd-button v-if="!data?.isFollowed" icon="add" size="small" @click="onFollowUser('follow')">
          关注
        </wd-button>
        <wd-button v-else plain size="small" @click="onFollowUser('unfollow')">
          取消关注
        </wd-button>
      </template>
    </view>

    <view class="text-26rpx color-#666 word-wrap font-500">
      <text>{{ data?.content }}</text>
    </view>

    <view class="flex flex-wrap gap-20rpx">
      <Tag v-for="item in data?.tags" :key="item.id" @tap.stop="onClickTag(item)">
        #{{ item.tagName }}
      </Tag>
    </view>

    <view class="text-22rpx color-#969696">
      <text>发表于 {{ dayjs(data?.createTime).format('YY/MM/DD HH:mm') }}</text>
    </view>
  </view>
</template>

<style lang='css' scoped></style>
