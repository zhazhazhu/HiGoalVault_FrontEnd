import type { Chat, ChatMessageAfter, ChatMessageBefore, ChatMessageReference } from '@higoal/api'
import { defineStore } from 'pinia'
import { createUUID } from '@/utils'

interface State {
  chat: Chat[]
  currentChatId: string
  messages: ChatMessageAfter[]
  currentTemporaryMessageId: string
}

export const useChatStore = defineStore('chat', {
  state: (): State => ({
    chat: [],
    currentChatId: '',
    messages: [],
    currentTemporaryMessageId: '',
  }),
  getters: {
    currentChat: (state) => {
      return state.chat.find(item => item.chatId === state.currentChatId)
    },
    currentTemporaryMessage: (state) => {
      return state.messages.find(item => item.id === state.currentTemporaryMessageId)
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
