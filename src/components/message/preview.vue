<script lang='ts' setup>
import type { AnswerAfter } from '@/api'
import StockPreview from '@/echarts/components/preview.vue?async'
import { renderMarkdown } from '@/modules'

defineProps<{
  data: AnswerAfter
}>()
</script>

<template>
  <view class="bg-white rounded-20rpx p-32rpx flex flex-col gap-20rpx mb-20rpx">
    <view>
      <view class="text-36rpx font-bold">
        {{ data.query }}
      </view>
      <view class="text-24rpx color-#696969 py-10rpx">
        {{ data.summary }}
      </view>
    </view>
    <view class="text-24rpx bg-[var(--hi-bg-color)] rounded-12rpx p-20rpx h-180rpx overflow-hidden">
      <UvParse class="markdown-body" :content="renderMarkdown(data.response || '')" />
    </view>

    <StockPreview v-if="data.stockData?.length" :data="data.stockData" />

    <slot name="actions" />
  </view>
</template>
