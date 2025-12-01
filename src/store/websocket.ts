import type { AnswerAfter } from '../api'
import { defineStore } from 'pinia'
import { useUUID } from '@/composables'
import { useUserStore } from './user'

// 定义 Pinia Store 的状态接口
interface Status {
  websocket: UniApp.SocketTask | null
  onMessage: ((data: WsMessageResponse) => void) | null
  onClose: (() => void) | null
  onError: (() => void) | null
  onOpen: (() => void) | null
  connecting: boolean
  disconnecting: boolean
  isSocketOpen: boolean
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
    connecting: false,
    disconnecting: false,
    onMessage: null,
    onClose: null,
    onError: null,
    onOpen: null,
    isSocketOpen: false,
  }),
  actions: {
    // 等待连接打开（带超时）
    waitUntilOpen(timeoutMs = 8000) {
      return new Promise<void>((resolve, reject) => {
        if (this.isSocketOpen) {
          resolve()
          return
        }
        const start = Date.now()
        const timer = setInterval(() => {
          if (this.isSocketOpen) {
            clearInterval(timer)
            resolve()
          }
          else if (Date.now() - start > timeoutMs) {
            clearInterval(timer)
            reject(new Error('WebSocket not open'))
          }
        }, 200)
      })
    },
    connectWebSocket(clientType: ClientType = ClientType.WECHAT_MP) {
      if (this.websocket && this.isSocketOpen) {
        console.log('WebSocket already open, skip reconnect.')
        return
      }
      if (this.websocket && !this.isSocketOpen) {
        try {
          this.websocket.close({ code: 1000, reason: 'Reconnect' })
        }
        catch {}
        this.websocket = null
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
        success: () => {
          console.log('connectSocket success')
        },
        fail: (err) => {
          console.error('connectSocket fail:', err)
        },
        complete: () => {
          this.connecting = false
        },
      })

      this.websocket.onOpen(() => {
        console.log('WebSocket connection opened.')
        this.isSocketOpen = true
        this.onOpen && this.onOpen()
      })

      this.websocket.onError((err) => {
        console.error('WebSocket error:', err)
        this.isSocketOpen = false
        this.onError && this.onError()
      })

      this.websocket.onClose((e) => {
        console.log('WebSocket connection closed.', e)
        uni.showToast({
          title: '连接错误，请联系管理员',
          icon: 'none',
        })
        this.isSocketOpen = false
        this.websocket = null
        this.onClose && this.onClose()
      })

      // 设置消息监听器，处理所有回调
      this.websocket.onMessage((res) => {
        if (this.onMessage) {
          try {
            const data = JSON.parse(res.data) as WsMessageResponseBefore
            const messageData = (data.body.data.sseMsgType === 'stream-end' ? data.body.data.data as any : JSON.parse(data.body.data.data!) as AnswerAfter)

            const response: WsMessageResponse = {
              id: data.id,
              code: data.code,
              type: data.body.data.sseMsgType,
              data: messageData,
            }

            this.onMessage(response)
          }
          catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }
      })
    },

    // 发送消息
    sendMessage(data: WsMessageData, options?: UniApp.SendSocketMessageOptions) {
      return new Promise<void>((resolve, reject) => {
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

        const send = () => new Promise((resolve, reject) => {
          this.websocket!.send({
            data: JSON.stringify(message),
            ...(options || {}),
            success(res) {
              resolve(res)
            },
            fail(err) {
              reject(err)
            },
          })
        })

        if (!this.websocket || !this.isSocketOpen) {
          this.connectWebSocket()
          this.waitUntilOpen().then(() => send().then(() => resolve()).catch(err => reject(err)))
        }
        else {
          send().then(() => resolve()).catch(err => reject(err))
        }
      })
    },

    // 关闭消息
    stopMessage(data: StopWsMessageData) {
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
      const send = () => new Promise((resolve, reject) => {
        this.websocket!.send({
          data: JSON.stringify(message),
          success(res) {
            resolve(res)
          },
          fail(err) {
            reject(err)
          },
        })
      })
      if (!this.websocket || !this.isSocketOpen) {
        this.connectWebSocket()
        return this.waitUntilOpen().then(() => send())
      }
      return send()
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

      const send = () => new Promise((resolve, reject) => {
        this.websocket!.send({
          data: JSON.stringify(message),
          success(res) {
            resolve(res)
          },
          fail(err) {
            reject(err)
          },
        })
      })
      if (!this.websocket || !this.isSocketOpen) {
        this.connectWebSocket()
        return this.waitUntilOpen().then(() => send())
      }
      return send()
    },

    // 关闭连接
    disconnectWebSocket() {
      return new Promise((resolve) => {
        if (this.websocket && !this.connecting && !this.disconnecting) {
          this.disconnecting = true
          this.websocket.close({
            code: 1000,
            reason: 'User closed',
            success(res) {
              console.log('disconnectSocket success', res)
            },
            complete: () => {
              this.disconnecting = false
              this.websocket = null
              this.onClose && this.onClose()
              resolve(true)
            },
          })
        }
      })
    },
  },
})
