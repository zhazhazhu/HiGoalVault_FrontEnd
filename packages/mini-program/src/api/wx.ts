import { useUserStore } from '@/store'
import { baseUrl } from '.'

export enum ClientType {
  WECHAT_MP = 'WECHAT_MP',
  PC = 'PC',
  APP = 'APP',
}

export interface SseRequestBody {
  chatId: string
  clientType: ClientType
  query: string
}

export function useSse<D = any>(data: SseRequestBody) {
  const { accessToken } = useUserStore()

  const task = wx.request({
    url: `${baseUrl}/buyer/chat/sse/ai-proxy/send-query-combined`,
    header: {
      'AccessToken': String(accessToken.value),
      'content-type': 'application/json', // 默认值
    },
    method: 'POST',
    data,
    // @ts-expect-error
    enableChunked: true,
    responseType: 'text',
  })

  function onChunkReceived(callback: (data: D) => void) {
    (task as unknown as any).onChunkReceived((res) => {
      const text = new TextDecoder().decode(res.data)
      console.log('text', text)
      try {
        callback(JSON.parse(text))
      }
      catch (error) {
        console.log('error', error)
      }
    })
  }

  return {
    task,
    onChunkReceived,
    offChunkReceived: () => task.abort(),
  }
}
