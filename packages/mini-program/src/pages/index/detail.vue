<script lang='ts' setup>
import type { PublishMessageListResponse } from '@/api'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { useClassesName, useUUID } from '@higoal/hooks'
import dayjs from 'dayjs'
import { ref } from 'vue'
import { api } from '@/api'
import { useChatStore, useUserStore } from '@/store'

const data = ref<PublishMessageListResponse | null>(null)
const cs = useClassesName('detail')
const isFocus = ref(false)
const userStore = useUserStore()
const chatStore = useChatStore()

async function getData(id: string) {
  const res = await api.getPublicMessageDetail({ contentId: id })
  if (res.code === 200) {
    data.value = res.result
  }
}
function gotoBack() {
  uni.navigateBack()
}
function onConfirm() {

}
async function onFollowUser() {
  const res = await api.followUser({ followAction: true, followeeId: data.value!.userId, followerId: userStore.userInfo!.id })
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
    query: data.value!.title,
    chatId: chatStore.currentChatId,
    runId: useUUID(32),
  }
  uni.redirectTo({ url: '/pages/chat/index' })
}

onShareAppMessage(() => {
  return {
    title: data.value?.title,
    path: `/pages/index/detail?id=${data.value?.id}`,
  }
})

onLoad((options) => {
  getData(options?.id)
})
</script>

<template>
  <view>
    <Navbar title="详情" enable-left-slot>
      <template #left>
        <wd-icon name="thin-arrow-left" size="17px" @click="gotoBack" />
      </template>
    </Navbar>

    <Container>
      <scroll-view scroll-y class="h-full overflow-y-auto">
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

            <wd-button v-if="data?.userId !== userStore.userInfo?.id" icon="add" size="small" @click="onFollowUser">
              关注
            </wd-button>
          </view>

          <view class="text-26rpx color-#666 word-wrap">
            <text>{{ data?.content }}</text>
          </view>

          <view>
            <wd-tag v-for="item in data?.tags" :key="item.id">
              #{{ item.tagName }}
            </wd-tag>
          </view>

          <view class="text-22rpx color-#969696">
            <text>发表于 {{ dayjs(data?.createTime).format('YY/MM/DD HH:mm') }}</text>
          </view>
        </view>

        <view>
          messageContent
        </view>
      </scroll-view>

      <view class="h-200rpx bg-white px-32rpx pt-30rpx rounded-t-30rpx">
        <view class="flex items-center justify-between gap-10px">
          <button open-type="share" class="share-btn">
            <view class="wechat-icon bg-#666 size-70rpx" />
          </button>

          <view class="rounded-12px flex-1 overflow-hidden">
            <wd-textarea
              clearable
              no-border
              show-word-limit
              hold-keyboard
              placeholder="发表友善评论"
              confirm-type="send"
              :auto-height="true"
              :cursor-spacing="120"
              :custom-textarea-class="cs.m('textarea')"
              :custom-class="cs.m('textarea-container')"
              :placeholder-class="cs.m('textarea-placeholder')"
              @focus="isFocus = true"
              @blur="isFocus = false"
              @confirm="onConfirm"
            />
          </view>
          <view class="flex flex-col items-center">
            <view class="comment-icon size-60rpx" />
            <text class="text-22rpx color-gray-6 font-bold">
              {{ data?.commentCount }}
            </text>
          </view>
          <view class="flex flex-col items-center">
            <view class="thumb-up-icon size-60rpx" />
            <text class="text-22rpx color-gray-6 font-bold">
              {{ data?.likeCount }}
            </text>
          </view>
        </view>
      </view>
    </Container>
  </view>
</template>

<style lang='scss' scoped>
.share-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  padding: 0;
  &::after {
    display: none;
  }
}
</style>
