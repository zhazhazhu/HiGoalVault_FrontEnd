<script lang='ts' setup>
import type { Chat, Page } from '@higoal/api'
import type { ChatWithType } from '@/store'
import { useClassesName } from '@higoal/hooks'
import dayjs from 'dayjs'
import { onMounted, ref, watch } from 'vue'
import { useMessage } from 'wot-design-uni'
import { api } from '@/api'
import { useMessageInject } from '@/composables/inject'
import { useResetRef } from '@/composables/useResetRef'
import { DateZhCN } from '@/constants'
import { useChatStore, useUserStore } from '@/store'

defineProps<{
  isEdit: boolean
}>()

const cs = useClassesName('chat-list')
const { refreshMessage, toggleSidebar } = useMessageInject()!
const chatStore = useChatStore()
const userStore = useUserStore()
const [page] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 20,
  sort: 'createTime',
})
const message = useMessage()

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
  return type === 'today' ? dayjs(time).format('HH:mm') : dayjs(time).format('YY/MM/DD')
}
async function onCreateNewChat() {
  const data = await api.addChat()
  if (data.code === 200) {
    chatStore.currentChatId = data.result.chatId
  }
  toggleSidebar()
  await getChatList()
}
function onEditChat(item: Chat) {
  const input = ref(item.title)
  message.prompt({
    title: '编辑名称',
    inputValue: input.value,
  }).then(async ({ value }) => {
    await api.updateChat({
      chatId: item.chatId,
      title: value?.toString() || '',
    })
    getChatList()
  })
}
function onDeleteChat(item: Chat) {
  message.confirm({
    msg: '确认删除吗?',
    title: '提示',
  }).then(async () => {
    await api.deleteChat(item.chatId)
    getChatList()
  })
}

// 当前聊天切换时，关闭侧边栏，刷新消息
watch(() => chatStore.currentChatId, () => {
  toggleSidebar()
  refreshMessage()
})

onMounted(() => {
  getChatList()
})
</script>

<template>
  <view :class="cs.m('container')" class="mt-10px">
    <wd-message-box />

    <wd-button icon="add" plain block @click="onCreateNewChat">
      新对话
    </wd-button>
    <scroll-view
      id="scroll-view-chat-list"
      scroll-into-view-alignment="end"
      enhanced
      enable-passive
      enable-flex
      :scroll-y="true"
      :show-scrollbar="false"
      class="h-[calc(100vh-300px)] overflow-y-auto py-10px"
    >
      <view v-for="chats, key of chatStore.chatWithType" :key="key" :class="cs.m('chat-type')">
        <view v-if="chats.length">
          <view :class="cs.m('key')">
            {{ DateZhCN[key] }}
          </view>
          <view v-for="item in chats" :key="item.chatId" :class="[cs.m('item-container'), cs.is('active', item.chatId === chatStore.currentChatId)]" @click="chatStore.currentChatId = item.chatId">
            <view :class="cs.m('left')">
              <view :class="cs.m('title')">
                {{ item.title }}
              </view>
              <view :class="cs.m('username')">
                {{ userStore.userInfo?.username }}
              </view>
            </view>
            <view v-if="!isEdit" :class="cs.m('time')">
              {{ formatTime(item.updateTime || item.createTime, key) }}
            </view>
            <view v-else :class="cs.m('edit')">
              <view class="edit-chat-icon size-20px" @click.stop="onEditChat(item)" />
              <view class="delete-chat-icon size-20px bg-primary" @click.stop="onDeleteChat(item)" />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang='scss' scoped>
.hi-chat-list--key {
  font-size: 11px;
  color: var(--hi-h3-color);
  line-height: 18px;
  margin: 6px 0;
}
.hi-chat-list--item-container {
  display: flex;
  width: 100%;
  padding: 13px 16px;
  box-sizing: border-box;
  border-radius: 10px;
  &.is-active {
    border: 1px solid var(--hi-primary-color);
    background-color: #fff4f3;
  }
  .hi-chat-list--left {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .hi-chat-list--title {
    font-size: 14px;
    color: #333333;
    line-height: 19px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  .hi-chat-list--time {
    font-size: 12px;
    color: var(--hi-h3-color);
    line-height: 18px;
    display: flex;
    align-items: flex-end;
  }
  .hi-chat-list--username {
    font-size: 12px;
    color: var(--hi-h3-color);
  }
  .hi-chat-list--edit {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}
</style>
