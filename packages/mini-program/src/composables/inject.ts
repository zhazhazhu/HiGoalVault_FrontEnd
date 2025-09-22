import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export interface Share {
  ids: string[]
  isChecked: boolean
}

export interface ChatInject {
  share: Ref<Share>
  scrollToTop: () => void
  refreshMessage: () => void
  toggleSidebar: () => void
}

export const messageInjectKey = Symbol('message') as InjectionKey<ChatInject>

export function useMessageInject() {
  const context = inject(messageInjectKey)
  if (!context) {
    throw new Error('useMessageInject must be used within a MessageProvider')
  }
  return context
}
