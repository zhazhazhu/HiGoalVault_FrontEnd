import type { InjectionKey, Ref } from 'vue'
import type { api } from '@/api'
import { inject } from 'vue'

export interface Share {
  ids: string[]
  isChecked: boolean
}

export interface ChatInject {
  share: Ref<Share>
  scrollIntoView: (messageId?: string) => void
  scrollHeight: () => void
  refreshMessage: () => void
}

export interface AppInject {
  api: typeof api
}

export const messageInjectKey = Symbol('message') as InjectionKey<ChatInject>
export const appInjectKey = Symbol('app') as InjectionKey<AppInject>

export function useMessageInject() {
  const context = inject(messageInjectKey)
  if (!context) {
    throw new Error('useMessageInject must be used within a MessageProvider')
  }
  return context
}

export function useAppInject() {
  const context = inject(appInjectKey)
  if (!context) {
    throw new Error('useAppInject must be used within an AppProvider')
  }
  return context
}
