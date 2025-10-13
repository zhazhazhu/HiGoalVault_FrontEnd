import type { InjectionKey, Ref } from 'vue'
import { inject, ref } from 'vue'

export interface Share {
  ids: string[]
  isChecked: boolean
}

export interface ChatInject {
  share: Ref<Share>
  scrollToTop: () => void
}

export const messageInjectKey = Symbol('message') as InjectionKey<ChatInject>

export function useMessageInject() {
  const context = inject(messageInjectKey)
  if (!context) {
    console.error('useMessageInject must be used within a MessageProvider')
    return {
      share: ref({ ids: [], isChecked: false }),
      currentToolMessageId: ref(null),
      scrollToTop: () => {},
    } as ChatInject
  }
  return context
}
