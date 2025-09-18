import type { ChatMessageBefore } from '@higoal/api'
import { useUserStore } from '@/store'
import { createUUID } from '@/utils'

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

export interface WsMessageData {
  chatId: string
  query: string
  runId?: string
  clientType?: ClientType
  accessToken?: string
}

export interface WsMessageResponse {
  id: string
  code: '200'
  type: 'message' | 'stream-end'
  data: ChatMessageBefore | null
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

let socketTask: UniApp.SocketTask | null = null
let messageCallback: ((data: WsMessageResponse) => void) | null = null

export function useWs() {
  function connect(clientType: ClientType = ClientType.WECHAT_MP) {
    if (socketTask)
      return

    const userStore = useUserStore()
    socketTask = uni.connectSocket({
      url: `${Protocol.WS}://218.108.203.90:8888/buyer/ai-chat-ws`,
      header: {
        'AccessToken': userStore.accessToken,
        'Content-type': 'application/json', // 默认值
        'ClientType': clientType,
      },
      success(res) {
        console.log('connectSocket success', res)
      },
      fail(err) {
        console.log('connectSocket fail', err)
      },
    })

    socketTask?.onMessage((res) => {
      try {
        const data = JSON.parse(res.data) as WsMessageResponseBefore
        const messageData = (data.body.data.sseMsgType === 'stream-end' ? null : JSON.parse(data.body.data.data!) as ChatMessageBefore)
        messageCallback?.({
          id: data.id,
          code: data.code,
          type: data.body.data.sseMsgType,
          data: messageData,
        })
      }
      catch (error) {
        console.log('error', error)
      }
    })
  }

  function send(data: WsMessageData) {
    const userStore = useUserStore()
    const message: WsMessage = {
      type: 'buyer',
      content: {
        body: {
          type: 'chat',
          code: '100007',
          data: {
            ...data,
            runId: createUUID(),
            clientType: data.clientType || ClientType.WECHAT_MP,
            accessToken: data.accessToken || userStore.accessToken,
          },
        },
      },
    }
    socketTask?.send({
      data: JSON.stringify(message),
    })
  }

  function onMessage(callback: (data: WsMessageResponse) => void) {
    messageCallback = callback
  }

  function close(options?: UniNamespace.CloseSocketOptions) {
    socketTask?.close(options || {})
    socketTask = null
    messageCallback = null
  }

  return {
    socketTask,
    send,
    close,
    connect,
    onMessage,
    onOpen: socketTask?.onOpen,
    onClose: socketTask?.onClose,
    onError: socketTask?.onError,
  }
}
