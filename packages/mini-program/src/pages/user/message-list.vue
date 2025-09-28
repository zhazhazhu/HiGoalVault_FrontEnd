<script lang='ts' setup>
import type { AnswerBefore } from '@/api'
import { useClassesName } from '@higoal/hooks'
import hljs from 'highlight.js'
import MarkdownIt from 'markdown-it/dist/markdown-it.js'

import { computed } from 'vue'
import 'highlight.js/styles/github.css'

defineProps<{
  data: AnswerBefore[]
  isLoading: boolean
  isFinish: boolean
}>()
const emit = defineEmits<{
  (e: 'load'): void
}>()
const cs = useClassesName('collected-message-list')
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight(str, lang) {
    const html = hljs.highlight(str, { language: lang || 'txt', ignoreIllegals: true }).value
    return html
  },
})
</script>

<template>
  <scroll-view
    scroll-into-view-alignment="end"
    enhanced
    enable-passive
    enable-flex
    :scroll-y="true"
    :show-scrollbar="false"
    class="h-full overflow-y-auto"
    :class="cs.m('container')"
    :lower-threshold="50"
    @scrolltolower="emit('load')"
  >
    <view v-for="item in data" :key="item.queryId" :class="cs.m('card')">
      <view class="text-36rpx font-bold">
        {{ item.query }}
      </view>
      <view class="text-24rpx bg-[var(--hi-bg-color)] rounded-12rpx p-20rpx h-180rpx overflow-hidden">
        <rich-text :class="cs.e('rich-text')" :nodes="md.render(item.response || '')" space="ensp" />
      </view>
      <view class="flex items-center justify-between">
        <view class="text-24rpx font-500 color-#666">
          取消收藏
        </view>
        <view class="wechat-icon size-54rpx" />
      </view>
    </view>

    <view v-show="isLoading || isFinish" class="flex items-center justify-center py-20rpx loading-wrapper" :class="cs.m('loading')">
      <wd-loading v-if="!isFinish" color="#FC6146FF" :size="20" />
      <text class="ml-20rpx text-24rpx">
        {{ isFinish ? '没有更多了' : '加载中...' }}
      </text>
    </view>
  </scroll-view>
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
