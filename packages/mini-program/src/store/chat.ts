import type { Chat, ChatMessageAfter, ChatMessageBefore, ChatMessageReference } from '@higoal/api'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import { useStoreRef } from '@/composables'
import { createUUID, isThisMonth, isThisWeek, isToday } from '@/utils'

interface State {
  chats: Chat[]
  currentChatId: Ref<string>
  messages: ChatMessageAfter[]
  currentTemporaryMessageId: Ref<string>
}

export interface ChatWithType {
  today: Chat[]
  thisWeek: Chat[]
  thisMonth: Chat[]
  furthermore: Chat[]
}

export const useChatStore = defineStore('chat', {
  state: (): State => ({
    chats: [],
    currentChatId: useStoreRef<string>('CURRENT_CHAT_ID', ''),
    messages: [],
    currentTemporaryMessageId: useStoreRef<string>('CURRENT_TEMPORARY_MESSAGE_ID', ''),
  }),
  getters: {
    currentChat: (state) => {
      return state.chats.find(item => item.chatId === state.currentChatId)
    },
    currentTemporaryMessage: (state) => {
      return state.messages.find(item => item.id === state.currentTemporaryMessageId)
    },
    chatWithType: (state) => {
      const result: ChatWithType = {
        today: [],
        thisWeek: [],
        thisMonth: [],
        furthermore: [],
      }
      state.chats.forEach((item) => {
        const date = item.updateTime || item.createTime
        if (isToday(date)) {
          result.today.push(item)
        }
        else if (isThisWeek(date)) {
          result.thisWeek.push(item)
        }
        else if (isThisMonth(date)) {
          result.thisMonth.push(item)
        }
        else {
          result.furthermore.push(item)
        }
      })
      return result
    },
  },
  actions: {
    transformMessage(message: ChatMessageBefore): ChatMessageAfter {
      let reference: ChatMessageReference[] = []
      if (message.reference) {
        try {
          reference = JSON.parse(message.reference)
        }
        catch (error) {
          console.log('transformMessage error', error)
        }
      }
      return {
        ...message,
        reference,
      }
    },
    createTemporaryMessage(message?: Partial<ChatMessageAfter>): ChatMessageAfter {
      const temp = {
        id: createUUID(),
        chatId: this.currentChatId || '',
        data: [],
        message: '',
        query: '',
        queryId: createUUID(),
        response: '',
        reference: [],
        ...message,
      } satisfies ChatMessageAfter
      this.messages.unshift(temp)
      this.currentTemporaryMessageId = temp.id
      return temp
    },

  },
})
