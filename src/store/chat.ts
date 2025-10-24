import type { Ref } from 'vue'
import type { AnswerAfter, AnswerBefore, Chat, ChatMessageAfter, ChatMessageBefore, ChatMessageReference, ChatMessageStock, ChatSteps } from '../api'
import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { useStoreRef, useUUID } from '@/composables'
import { isThisMonth, isThisWeek, isToday, useJsonParse } from '@/utils'
import { Truth } from '../api'
import { useUserStore } from './user'

interface WaitingMessageTask {
  query: string
  chatId: string
  runId: string
}

interface State {
  chats: Chat[]
  currentChatId: string
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
    currentChatId: '',
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
      const answerAfter = message.chatQueryAnswerList.map(item => this.transformAnswer(item))

      return {
        ...message,
        chatQueryAnswerList: answerAfter,
      }
    },
    transformAnswer(answer: AnswerBefore): AnswerAfter {
      let reference: ChatMessageReference[] = []
      let data: AnswerAfter['data'] = { analysis_data: '' }
      let stockData: [ChatMessageStock] | [] = []
      let steps: ChatSteps[] = []
      let label: string[] = []
      if (answer.data) {
        data = useJsonParse(answer.data) || { analysis_data: '' }
        stockData = useJsonParse(data.analysis_data) || []
      }
      if (answer.reference) {
        reference = useJsonParse(answer.reference) || []
      }
      if (answer.steps) {
        steps = useJsonParse(answer.steps) || []
        steps = steps.map((answer) => {
          return {
            ...answer,
            finished: true,
          }
        })
      }
      if (answer.label) {
        label = useJsonParse(answer.label) || []
      }
      return {
        ...answer,
        reference,
        data,
        stockData,
        steps,
        label,
        isLoading: false,
        showSteps: false,
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
            message: '',
            data: { analysis_data: '' },
            steps: [],
            reference: [],
            response: '',
            ts: '',
            runId: this.currentRunId,
            queryId: '',
            query: message?.query || '',
            isCollect: Truth.FALSE,
            isLoading: true,
            messageTimeLong: 0,
            chatId: '',
            summary: '',
            stockData: [],
            showSteps: false,
            label: [],
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
        data: { analysis_data: '' },
        stockData: [],
        steps: [],
        reference: [],
        response: '',
        ts: '',
        runId: this.currentRunId,
        queryId: '',
        query: '',
        isCollect: Truth.FALSE,
        isLoading: false,
        messageTimeLong: 0,
        chatId: '',
        message: '',
        summary: '',
        showSteps: false,
        label: [],
      }

      this.messages.find(item => item.msgId === (msgId || this.currentTemporaryMessageId))?.chatQueryAnswerList.push(answer)
    },
    updateAnswerOfMessageByRunId(runId: string, answer: Partial<AnswerAfter>) {
      for (let i = 0; i < this.messages.length; i++) {
        for (let j = 0; j < this.messages[i].chatQueryAnswerList.length; j++) {
          if (this.messages[i].chatQueryAnswerList[j].runId === runId) {
            this.messages[i].chatQueryAnswerList[j] = {
              ...this.messages[i].chatQueryAnswerList[j],
              ...answer,
            }
            break
          }
        }
      }
    },
    putTemporaryChat(chatId: string) {
      const userStore = useUserStore()
      this.chats.unshift({
        chatId,
        title: '新对话',
        userId: userStore.userInfo?.id || '',
        createTime: dayjs().format('YYYY/MM/DD HH:mm:ss'),
        updateTime: dayjs().format('YYYY/MM/DD HH:mm:ss'),
      })
    },
  },
})
