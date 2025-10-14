<script lang='ts' setup>
import type { Chat, Page } from '@/api'
import type { ChatWithType } from '@/store'
import dayjs from 'dayjs'
import { ref, watch } from 'vue'
import { useMessage } from 'wot-design-uni'
import { api } from '@/api'
import { useClassesName } from '@/composables'
import { useResetRef } from '@/composables/useResetRef'
import { DateZhCN } from '@/constants'
import { useChatStore, useUserStore } from '@/store'

const props = defineProps<{
  isEdit: boolean
  showSidebar: boolean
}>()

const emit = defineEmits(['changeChat'])
const cs = useClassesName('chat-list')
const chatStore = useChatStore()
const userStore = useUserStore()
const [page, reset] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 20,
  sort: 'createTime',
})
const message = useMessage()
const isLoading = ref(false)
const isFinish = ref(false)
const isRefreshing = ref(false)

watch(() => props.showSidebar, (val) => {
  if (val) {
    init()
  }
}, { immediate: true })

async function getData() {
  const data = await api.getChatList({
    ...page.value,
    userId: userStore.userInfo!.id,
  }).finally(() => {
    isLoading.value = false
  })
  if (data.code === 200) {
    chatStore.chats.push(...data.result.records)
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
  emit('changeChat')
  await getData()
}
function onEditChat(item: Chat) {
  const input = ref(item.title)
  message.prompt({
    title: '编辑名称',
    inputValue: input.value,
  }).then(({ value }) => {
    if (!value)
      return
    api.updateChat({
      chatId: item.chatId,
      title: value?.toString() || '',
    })
    item.title = value?.toString() || ''
  })
}
function onDeleteChat(item: Chat) {
  message.confirm({
    msg: '该对话内容将被删除无法恢复，若您之前主动分享过该对话，分享链接也将一并被删除',
    title: '提示',
  }).then(() => {
    api.deleteChat(item.chatId)
    if (chatStore.currentChatId === item.chatId) {
      chatStore.currentChatId = ''
      emit('changeChat')
    }
    chatStore.chats = chatStore.chats.filter(chat => chat.chatId !== item.chatId)
  })
}
function loadData() {
  if (isLoading.value || isFinish.value)
    return
  isLoading.value = true
  page.value.pageNumber!++
  getData()
}
async function refreshData() {
  isRefreshing.value = true
  chatStore.chats = []
  reset()
  await getData()
  isRefreshing.value = false
}
function init() {
  chatStore.chats = []
  reset()
  getData()
}
function onClickChat(item: Chat) {
  chatStore.currentChatId = item.chatId
  emit('changeChat')
}
</script>

<template>
  <view :class="cs.m('container')" class="mt-10px">
    <wd-root-portal>
      <wd-message-box />
    </wd-root-portal>

    <wd-button icon="add" plain block @click="onCreateNewChat">
      新对话
    </wd-button>
    <scroll-view
      id="scroll-view-chat-list"
      scroll-into-view-alignment="end"
      enhanced
      enable-passive
      enable-flex
      class="h-[calc(100vh-280px)] py-10px"
      :scroll-y="true"
      :show-scrollbar="false"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @scrolltolower="loadData"
      @refresherrefresh="refreshData"
    >
      <view v-for="chats, key of chatStore.chatWithType" :key="key" :class="cs.m('chat-type')">
        <view v-if="chats.length">
          <view :class="cs.m('key')">
            {{ DateZhCN[key] }}
          </view>
          <view v-for="item in chats" :key="item.chatId" :class="[cs.m('item-container'), cs.is('active', item.chatId === chatStore.currentChatId)]" @click="onClickChat(item)">
            <view :class="cs.m('left')">
              <view :class="cs.m('title')">
                {{ item.title }}
              </view>
              <view :class="cs.m('username')">
                {{ userStore.userInfo?.nickName }}
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
  padding: 16px;
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
    width: calc(100% - 50px);
  }
  .hi-chat-list--title {
    font-size: 14px;
    color: #333333;
    line-height: 19px;
    font-weight: bold;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hi-chat-list--time {
    width: 60px;
    font-size: 12px;
    color: var(--hi-h3-color);
    line-height: 18px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
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
