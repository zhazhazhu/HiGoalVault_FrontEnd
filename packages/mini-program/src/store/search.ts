import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import { useStoreRef } from '@/composables'

interface Status {
  searchHistory: Ref<string[]>
}

const MAX_SEARCH_HISTORY_COUNT = 12

export const useSearchStore = defineStore('search', {
  state: (): Status => ({
    searchHistory: useStoreRef('SEARCH_HISTORY', []),
  }),
  actions: {
    addSearchHistory(keyword: string) {
      const searchHistory = this.searchHistory
      if (searchHistory.includes(keyword)) {
        searchHistory.splice(searchHistory.indexOf(keyword), 1)
      }
      searchHistory.unshift(keyword)
      if (searchHistory.length > MAX_SEARCH_HISTORY_COUNT) {
        searchHistory.pop()
      }
    },
    removeSearchHistory(index: number) {
      this.searchHistory.splice(index, 1)
    },
  },
})
