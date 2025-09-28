import type { Ref } from 'vue'
import type { AnswerAfter, Chat, ChatMessageAfter, ChatMessageBefore, ChatMessageReference } from '../api'
import { useUUID } from '@higoal/hooks'
import { defineStore } from 'pinia'
import { useStoreRef } from '@/composables'
import { isThisMonth, isThisWeek, isToday } from '@/utils'
import { Truth } from '../api'

interface WaitingMessageTask {
  query: string
  chatId: string
  runId: string
}

interface State {
  chats: Chat[]
  currentChatId: Ref<string>
  currentRunId: Ref<string>
  messages: ChatMessageAfter[]
  currentTemporaryMessageId: Ref<string>
  isReplying: boolean
  waitingMessageTask: WaitingMessageTask | null
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
    currentRunId: useStoreRef<string>('CURRENT_RUN_ID', ''),
    messages: [],
    currentTemporaryMessageId: useStoreRef<string>('CURRENT_TEMPORARY_MESSAGE_ID', ''),
    isReplying: false,
    waitingMessageTask: null,
  }),
  getters: {
    currentChat: (state) => {
      return state.chats.find(item => item.chatId === state.currentChatId)
    },
    currentTemporaryMessage: (state) => {
      return state.messages.find(item => item.msgId === state.currentTemporaryMessageId)
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
      const answerAfter = message.chatQueryAnswerList.map((item) => {
        let reference: ChatMessageReference[] = []
        let data: any = null
        if (item.reference) {
          try {
            reference = JSON.parse(item.reference)
            data = JSON.parse(item.data)
          }
          catch (error) {
            console.log('transformMessage error', error)
          }
        }
        return {
          ...item,
          reference,
          data,
        }
      })

      return {
        ...message,
        chatQueryAnswerList: answerAfter,
      }
    },
    createTemporaryMessage(message?: Partial<ChatMessageAfter>): ChatMessageAfter {
      const id = useUUID(32)
      const temp = {
        chatId: this.currentChatId || '',
        query: '',
        msgId: id,
        chatQueryAnswerList: [
          {
            data: [],
            message: '',
            reference: [],
            response: '',
            ts: '',
            runId: this.currentRunId,
            queryId: '',
            query: message?.query || '',
            isCollect: Truth.FALSE,
          },
        ],
        ...message,
      } satisfies ChatMessageAfter
      this.messages.unshift(temp)
      this.currentTemporaryMessageId = temp.msgId
      return temp
    },
    pushTemporaryMessage(msgId?: string) {
      const answer: AnswerAfter = {
        data: [],
        message: '',
        reference: [],
        response: '',
        ts: '',
        runId: this.currentRunId,
        queryId: '',
        query: '',
        isCollect: Truth.FALSE,
      }

      this.messages.find(item => item.msgId === (msgId || this.currentTemporaryMessageId))?.chatQueryAnswerList.push(answer)
    },
  },
})
