<script lang='ts' setup>
import type { Page } from '@higoal/api'
import { useClassesName } from '@higoal/hooks'
import { onMounted } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
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

onMounted(() => {
  getChatList()
})
</script>

<template>
  <view :class="cs.m('container')">
    <view v-for="item in chatStore.chats" :key="item.chatId" :class="cs.m('item')">
      {{ item.title }}
    </view>
  </view>
</template>

<style lang='scss' scoped></style>
