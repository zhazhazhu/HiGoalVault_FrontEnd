<script lang='ts' setup>
import type { Page } from '@higoal/api'
import type { ChatWithType } from '@/store'
import { useClassesName } from '@higoal/hooks'
import dayjs from 'dayjs'
import { onMounted } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { DateZhCN } from '@/constants'
import { useChatStore, useUserStore } from '@/store'

const cs = useClassesName('chat-list')
const chatStore = useChatStore()
const userStore = useUserStore()
const [page] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 20,
})

async function getChatList() {
  const data = await api.getChatList({
    ...page.value,
    userId: userStore.userInfo!.id,
  })
  if (data.code === 200) {
    chatStore.chats = data.result.records
  }
}
function formatTime(time: string, type: keyof ChatWithType) {
  return type === 'today' ? dayjs(time).format('HH:mm') : dayjs(time).format('YYYY/MM/DD')
}
async function onCreateNewChat() {
  await api.addChat()
}

onMounted(() => {
  getChatList()
})
</script>

<template>
  <view :class="cs.m('container')" class="mt-20px">
    <wd-button icon="add" plain block @click="onCreateNewChat">
      新对话
    </wd-button>
    <view v-for="chats, key of chatStore.chatWithType" :key="key" :class="cs.m('chat-type')">
      <view v-if="chats.length">
        <view :class="cs.m('key')">
          {{ DateZhCN[key] }}
        </view>
        <view v-for="item in chats" :key="item.chatId" :class="[cs.m('item-container'), cs.is('active', item.chatId === chatStore.currentChatId)]" @click="chatStore.currentChatId = item.chatId">
          <view :class="cs.m('title')">
            {{ item.title }}
          </view>
          <view :class="cs.m('username-time')">
            <view :class="cs.m('username')">
              {{ userStore.userInfo?.username }}
            </view>
            <view :class="cs.m('time')">
              {{ formatTime(item.updateTime || item.createTime, key) }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-chat-list--key {
  font-size: 11px;
  color: #666666;
  line-height: 18px;
  margin: 6px 0;
}
.hi-chat-list--item-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 13px 16px;
  box-sizing: border-box;
  border-radius: 10px;
  &.is-active {
    border: 1px solid var(--hi-primary-color);
    background-color: #fff4f3;
  }
  .hi-chat-list--title {
    font-size: 14px;
    color: #333333;
    line-height: 19px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  .hi-chat-list--username-time {
    font-size: 12px;
    color: #666666;
    line-height: 18px;
    display: flex;
    justify-content: space-between;
  }
}
</style>
