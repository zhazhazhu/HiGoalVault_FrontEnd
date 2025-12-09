import type { Ref } from 'vue'
import type { AnswerAfter, AnswerBefore, Chat, ChatMessageAfter, ChatMessageBefore, ChatMessageReference, ChatMessageStock, ChatSteps, DateParameterOfStock, ResolvedParam } from '../api'
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
  showSidebar: boolean
  isResetScroll: boolean
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
    showSidebar: false,
    isResetScroll: false,
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
    currentAnswer: (state) => {
      for (const element of state.messages) {
        for (const answer of element.chatQueryAnswerList) {
          if (answer.runId === state.currentRunId) {
            return answer
          }
        }
      }
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
      if (!answer) {
        return {} as AnswerAfter
      }

      let reference: ChatMessageReference[] = []
      let data: AnswerAfter['data'] = { analysis_data: '', resolved_params: { parameters: [] } }
      let stockData: [ChatMessageStock] | [] = []
      let steps: ChatSteps[] = []
      let label: string[] = []
      const stockParameter: DateParameterOfStock = {
        fromdate: '',
        todate: '',
        code: [],
      }
      if (answer.data) {
        data = useJsonParse(answer.data) || { analysis_data: '', resolved_params: { parameters: [] } }
        stockData = useJsonParse(data.analysis_data) || []
        const dateList = data.resolved_params.parameters.find(item => item.name === 'date_list')?.value?.[0]
        const code = data.resolved_params.parameters.find(item => (item.name === 'future_symbol' || item.name === 'stock_symbol'))?.value
        if (dateList) {
          stockParameter.fromdate = dateList.fromdate
          stockParameter.todate = dateList.todate
        }
        if (code) {
          stockParameter.code = code
        }
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
        stockParameter,
        steps,
        label,
        isLoading: false,
        showSteps: !answer.response,
        isPaused: answer.isPaused || false,
      }
    },
    createTemporaryMessage(message?: Partial<ChatMessageAfter>): ChatMessageAfter {
      this.isResetScroll = false
      const id = useUUID(32)
      const temp = {
        chatId: this.currentChatId || '',
        query: '',
        msgId: id,
        chatQueryAnswerList: [
          {
            id: '',
            message: '',
            data: { analysis_data: '', resolved_params: { parameters: [] } },
            stockParameter: { fromdate: '', todate: '', code: [] },
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
            isPaused: false,
            collectTime: '',
          },
        ],
        ...message,
      } satisfies ChatMessageAfter
      this.messages.push(temp)
      this.currentTemporaryMessageId = temp.msgId
      return temp
    },
    pushTemporaryMessage(msgId?: string) {
      const answer: AnswerAfter = {
        id: '',
        data: { analysis_data: '', resolved_params: { parameters: [] } },
        stockParameter: { fromdate: '', todate: '', code: [] },
        stockData: [],
        steps: [],
        reference: [],
        response: '',
        ts: '',
        runId: this.currentRunId,
        queryId: '',
        query: '',
        isCollect: Truth.FALSE,
        isLoading: true,
        messageTimeLong: 0,
        chatId: '',
        message: '',
        summary: '',
        showSteps: false,
        label: [],
        isPaused: false,
        collectTime: '',
      }

      this.messages.find(item => item.msgId === (msgId || this.currentTemporaryMessageId))?.chatQueryAnswerList.push(answer)
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
