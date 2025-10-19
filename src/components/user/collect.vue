<script lang='ts' setup>
import type { AnswerAfter, Page } from '@/api'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import typescript from 'highlight.js/lib/languages/typescript'
import MarkdownIt from 'markdown-it/dist/markdown-it.min.js'
import { onMounted, ref } from 'vue'
import { api, Truth } from '@/api'
import { useClassesName } from '@/composables'
import { useResetRef } from '@/composables/useResetRef'
import { useUserStore } from '@/store'

import 'highlight.js/styles/github.css'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)

const isLoading = ref(false)
const isFinish = ref(false)
const [page, resetPage] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 10,
  sort: 'createTime',
})
const total = ref(0)
const userStore = useUserStore()
const data = ref<AnswerAfter[]>([])
const cs = useClassesName('collected-message-list')
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight(str, lang) {
    const html = hljs.highlight(str, { language: lang || 'txt', ignoreIllegals: true }).value
    return html
  },
})
const isRefreshing = ref(false)

async function getData() {
  isLoading.value = true
  const res = await api.getInteractedCollectedContentList({
    ...page.value,
    userId: userStore.userInfo!.id,
  })
  if (res.code === 200) {
    data.value.push(...res.result.records.map((item) => {
      const data = JSON.parse(item.data || '') || []
      return { ...item, isCollect: Truth.TRUE, data, isLoading: false, reference: JSON.parse(item.reference) || [] } as AnswerAfter
    }))
    total.value = res.result.total
    isLoading.value = false
    isFinish.value = data.value.length >= total.value
  }
}
async function collect(queryId: string, index: number) {
  const isCollect = data.value[index].isCollect === Truth.TRUE
  if (isCollect) {
    const res = await api.cancelCollect(queryId)
    if (res.code === 200) {
      data.value[index].isCollect = Truth.FALSE
    }
  }
  else {
    const res = await api.addCollect({ queryId })
    if (res.code === 200) {
      data.value[index].isCollect = Truth.TRUE
    }
  }
}
function loadData() {
  if (isLoading.value || isFinish.value)
    return
  isLoading.value = true
  page.value.pageNumber!++
  getData()
}
async function refreshData() {
  isRefreshing.value = true
  resetPage()
  data.value = []
  await getData()
  isRefreshing.value = false
}

onMounted(() => {
  resetPage()
  getData()
})

defineExpose({
  total,
  loadData,
  refreshData,
})
</script>

<template>
  <view>
    <view v-for="item, index in data" :key="item.queryId" :class="cs.m('card')">
      <view class="text-36rpx font-bold">
        {{ item.query }}
      </view>
      <view class="text-24rpx bg-[var(--hi-bg-color)] rounded-12rpx p-20rpx h-180rpx overflow-hidden">
        <rich-text :class="cs.e('rich-text')" :nodes="md.render(item.response || '')" space="ensp" />
      </view>

      <StockPreview v-if="item.data.length === 1" :data="item.data" />

      <view class="flex items-center justify-between">
        <view class="text-24rpx font-500 color-#666" @click="collect(item.queryId, index)">
          {{ item.isCollect === Truth.TRUE ? '取消收藏' : '收藏' }}
        </view>
        <button open-type="share" class="share-btn contents" :data-id="item.queryId">
          <view class="wechat-icon size-54rpx" />
        </button>
      </view>
    </view>

    <view v-show="isLoading || isFinish" class="flex items-center justify-center py-20rpx loading-wrapper" :class="cs.m('loading')">
      <wd-loading v-if="!isFinish" color="#FC6146FF" :size="20" />
      <text class="ml-20rpx text-24rpx">
        {{ isFinish ? '没有更多了' : '加载中...' }}
      </text>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-collected-message-list--card {
  background-color: white;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.hi-collected-message-list--card + .hi-collected-message-list--card {
  margin-top: 20rpx;
}
</style>
