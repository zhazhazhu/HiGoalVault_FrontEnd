import type { AnswerAfter } from '../api'
import { defineStore } from 'pinia'
import { useUUID } from '@/composables'
import { useUserStore } from './user'

// 定义 Pinia Store 的状态接口
interface Status {
  websocket: UniApp.SocketTask | null
  messageCallback: ((data: WsMessageResponse) => void)[]
  connecting: boolean
}

export enum ClientType {
  WECHAT_MP = 'WECHAT_MP',
  PC = 'PC',
  APP = 'APP',
}

export enum Protocol {
  SSE = 'SSE',
  WS = 'WS',
  HTTP = 'HTTP',
  HTTPS = 'HTTPS',
}

export interface WsMessage {
  type: 'buyer'
  content: {
    body: {
      type: 'heater' | 'login' | 'auth' | 'chat'
      code: string
      data: WsMessageData
    }
  }
}

export interface StopWsMessage {
  type: 'buyer'
  content: {
    body: {
      type: 'heater' | 'login' | 'auth' | 'chat'
      code: string
      data: StopWsMessageData
    }
  }
}

export interface WsMessageData {
  chatId: string
  query?: string
  runId?: string
  msgId?: string
  clientType?: ClientType
  accessToken?: string
}

export interface StopWsMessageData extends Partial<Omit<WsMessageData, 'runId'>> {
  runId: string
  queryId?: string
}

export interface WsMessageResponse {
  id: string
  code: '200'
  type: 'message' | 'stream-end'
  data: (AnswerAfter & Record<string, any>) | null
}

export interface WsMessageResponseBefore {
  code: '200'
  id: string
  body: {
    code: '100008'
    data: {
      data: string
      sseMsgType: 'message' | 'stream-end'
      message?: string
      type: 'chat'
    }
  }
  message: string
}

export const useWebsocketStore = defineStore('websocket', {
  state: (): Status => ({
    websocket: null,
    messageCallback: [],
    connecting: false,
  }),
  actions: {
    // 核心函数：连接 WebSocket
    connectWebSocket(clientType: ClientType = ClientType.WECHAT_MP) {
      // 如果正在连接或已经连接，则直接返回
      if (this.websocket || this.connecting) {
        console.log('WebSocket is already connected or connecting. Skipping.')
        return
      }

      this.connecting = true

      const userStore = useUserStore()

      // 创建 WebSocket 连接实例
      this.websocket = uni.connectSocket({
        url: 'wss://higoall.com:9443/api/v1/buyer/ai-chat-ws',
        header: {
          'AccessToken': userStore.accessToken,
          'Content-type': 'application/json',
          'ClientType': clientType,
        },
        fail: (err) => {
          console.error('connectSocket fail:', err)
        },
        complete: () => {
          this.connecting = false
        },
      })

      // 监听连接成功事件
      this.websocket.onOpen(() => {
        console.log('WebSocket connection opened.')
      })

      // 监听连接关闭事件
      this.websocket.onClose(() => {
        console.log('WebSocket connection closed.')
        this.websocket = null
      })

      // 监听连接错误事件
      this.websocket.onError((err) => {
        console.error('WebSocket error:', err)
      })

      // 设置消息监听器，处理所有回调
      this.websocket.onMessage((res) => {
        console.log('WebSocket message received:', res)

        if (this.messageCallback.length > 0) {
          try {
            const data = JSON.parse(res.data) as WsMessageResponseBefore
            const messageData = (data.body.data.sseMsgType === 'stream-end' ? data.body.data.data as any : JSON.parse(data.body.data.data!) as AnswerAfter)

            const response: WsMessageResponse = {
              id: data.id,
              code: data.code,
              type: data.body.data.sseMsgType,
              data: messageData,
            }

            // 调用所有回调函数
            this.messageCallback.forEach(cb => cb(response))
          }
          catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }
      })
    },

    // 发送消息
    sendMessage(data: WsMessageData, options?: UniApp.SendSocketMessageOptions) {
      return new Promise((resolve, reject) => {
        if (!this.websocket) {
          console.error('WebSocket is not connected. Message not sent.')
          return reject(new Error('WebSocket is not connected.'))
        }
        const userStore = useUserStore()
        const message: WsMessage = {
          type: 'buyer',
          content: {
            body: {
              type: 'chat',
              code: '100007',
              data: {
                ...data,
                query: encodeURI(data.query || ''),
                msgId: data.msgId,
                runId: data.runId || useUUID(32),
                clientType: data.clientType || ClientType.WECHAT_MP,
                accessToken: data.accessToken || userStore.accessToken,
              },
            },
          },
        }

        this.websocket.send({
          data: JSON.stringify(message),
          ...options,
          success(res) {
            resolve(res)
          },
          fail(err) {
            reject(err)
          },
        })
      })
    },

    // 接收消息
    receiveMessage(callback: (data: WsMessageResponse) => void) {
      this.messageCallback = [callback]
    },

    // 关闭消息
    stopMessage(data: StopWsMessageData) {
      return new Promise((resolve, reject) => {
        const userStore = useUserStore()
        const message: StopWsMessage = {
          type: 'buyer',
          content: {
            body: {
              type: 'chat',
              code: '100009',
              data: {
                ...data,
                clientType: data.clientType || ClientType.WECHAT_MP,
                accessToken: data.accessToken || userStore.accessToken,
              },
            },
          },
        }
        this.websocket?.send({
          data: JSON.stringify(message),
          success(res) {
            resolve(res)
          },
          fail(err) {
            reject(err)
          },
        })
      })
    },

    // 重试消息
    refreshMessage(data: StopWsMessageData) {
      const userStore = useUserStore()
      const message: StopWsMessage = {
        type: 'buyer',
        content: {
          body: {
            type: 'chat',
            code: '100009',
            data: {
              ...data,
              clientType: ClientType.WECHAT_MP,
              accessToken: userStore.accessToken,
            },
          },
        },
      }

      return new Promise((resolve, reject) => {
        this.websocket?.send({
          data: JSON.stringify(message),
          success(res) {
            resolve(res)
          },
          fail(err) {
            reject(err)
          },
        })
      })
    },

    // 关闭连接
    disconnectWebSocket() {
      if (this.websocket) {
        this.websocket.close({ code: 1000, reason: 'User closed' })
        this.websocket = null
      }
    },
  },
})
