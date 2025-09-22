import type { AnswerAfter } from '@higoal/api'
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
}

export interface WsMessageResponse {
  id: string
  code: '200'
  type: 'message' | 'stream-end'
  data: AnswerAfter | null
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
let closeCallback: (() => void) | null = null
let errorCallback: (() => void) | null = null
let openCallback: (() => void) | null = null

function clearSocketTask() {
  socketTask = null
  messageCallback = null
  closeCallback = null
  errorCallback = null
  openCallback = null
}

export function useWs() {
  function connect(clientType: ClientType = ClientType.WECHAT_MP) {
    if (socketTask)
      return

    const userStore = useUserStore()
    socketTask = uni.connectSocket({
      url: `ws://218.108.203.90:8888/buyer/ai-chat-ws`,
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
        const messageData = (data.body.data.sseMsgType === 'stream-end' ? null : JSON.parse(data.body.data.data!) as AnswerAfter)
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

    socketTask?.onOpen(() => {
      openCallback?.()
    })

    socketTask?.onClose(() => {
      closeCallback?.()
      clearSocketTask()
    })

    socketTask?.onError(() => {
      errorCallback?.()
    })
  }

  function send(data: WsMessageData, options?: UniApp.SendSocketMessageOptions) {
    const userStore = useUserStore()
    const message: WsMessage = {
      type: 'buyer',
      content: {
        body: {
          type: 'chat',
          code: '100007',
          data: {
            ...data,
            msgId: data.msgId || createUUID(32),
            runId: data.runId || createUUID(32),
            clientType: data.clientType || ClientType.WECHAT_MP,
            accessToken: data.accessToken || userStore.accessToken,
          },
        },
      },
    }

    return new Promise((resolve, reject) => {
      socketTask?.send({
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
  }

  function stop(data: StopWsMessageData) {
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

    return new Promise((resolve, reject) => {
      socketTask?.send({
        data: JSON.stringify(message),
        success(res) {
          resolve(res)
        },
        fail(err) {
          reject(err)
        },
      })
    })
  }

  function refresh(data: StopWsMessageData) {
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
      socketTask?.send({
        data: JSON.stringify(message),
        success(res) {
          resolve(res)
        },
        fail(err) {
          reject(err)
        },
      })
    })
  }

  function onMessage(callback: (data: WsMessageResponse) => void) {
    messageCallback = callback
  }
  function onOpen(callback: () => void) {
    openCallback = callback
  }
  function onClose(callback: () => void) {
    closeCallback = callback
  }
  function onError(callback: () => void) {
    errorCallback = callback
  }

  function close(options?: UniNamespace.CloseSocketOptions) {
    socketTask?.close(options || {})
  }

  return {
    socketTask,
    send,
    stop,
    refresh,
    close,
    connect,
    onMessage,
    onOpen,
    onClose,
    onError,
  }
}
