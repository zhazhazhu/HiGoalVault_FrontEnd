<script lang='ts' setup>
import type { AnswerAfter } from '@/api'
import { computed } from 'vue'
import { useIntersectionObserver, useUUID } from '@/composables'
import Stock from '@/echarts/components/stock.vue'
import { renderMarkdown } from '@/modules'
import { formatCommentDate } from '@/utils'

const props = defineProps<{
  data: AnswerAfter
}>()

const parseSectionId = `view-card-parse-${useUUID(32)}-${props.data.id}`
const visible = useIntersectionObserver(`#${parseSectionId}`)
const responseContent = computed(() => renderMarkdown(`${props.data?.response?.substring(0, 200) || ''}...`))
</script>

<template>
  <view class="bg-white rounded-20rpx p-32rpx flex flex-col gap-20rpx mb-20rpx">
    <view class="flex items-center justify-between text-26rpx color-#8E8E93">
      <view class="flex items-center">
        <wd-img width="40rpx" height="40rpx" round mode="aspectFill" :src="data.face" />
        <text class="ml-16rpx color-#585858">
          {{ data.nickName }}
        </text>
      </view>

      <view class="flex items-center gap-16rpx">
        <view>{{ formatCommentDate(data.collectTime || '') }}</view>
      </view>
    </view>

    <view class="content">
      <view class="text-15px color-#2F2E33 word-wrap font-500">
        {{ data.query }}
      </view>
    </view>

    <view class="bg-#F5F7F9 p-15px rounded-10px relative min-h-130px">
      <view class="absolute z-99 top-0 left-0 w-full h-full flex items-end justify-center">
        <view class="flex items-center justify-between b-1 b-solid b-#D9D9D9 rounded-8px p-6px bg-#fff w-94% h-42px mb-16px shadow-button">
          <view class="text-14px flex items-center">
            <view class="star-info-icon mr-3px size-40rpx" />
            <text>智能投资助</text>
            <text class="color-#4362FF">
              手建议
            </text>
          </view>
          <view class="text-13px color-#4362FF flex items-center">
            <text>查看完整内容</text>
            <view class="i-material-symbols-arrow-forward-ios-rounded" />
          </view>
        </view>
      </view>
      <view>
        <wd-text :text="data.title" color="#121212" size="32rpx" bold />
      </view>

      <view :id="parseSectionId" class="min-h-20px">
        <template v-if="visible">
          <UvParse class="markdown-body" :content="responseContent" />
        </template>
      </view>
    </view>

    <!-- 标签区域 - 超出一行隐藏 -->
    <view v-if="data.label.length" class="flex flex-row gap-20rpx overflow-hidden">
      <Tag v-for="item, index in data?.label.slice(0, 3)" :key="index" class="flex-shrink-0">
        #{{ item }}
      </Tag>
    </view>

    <slot name="actions" />
  </view>
</template>

<style lang='css' scoped>
.content {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
