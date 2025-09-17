import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export interface Share {
  ids: string[]
  isChecked: boolean
}

export interface ChatInject {
  share: Ref<Share>
}

export const chatInjectKey = Symbol('chat') as InjectionKey<ChatInject>

export function useChatInject() {
  const context = inject(chatInjectKey)
  if (!context) {
    throw new Error('useChatInject must be used within a ChatProvider')
  }
  return context
}
