<script lang='ts' setup>
import type { AnswerAfter } from '@/api'
import { useClassesName } from '@/composables'
import { renderMarkdown } from '@/modules'
import Stock from '@/subEcharts/echarts/components/stock.vue?async'
import { formatSeconds } from '@/utils'

defineProps<{
  data: AnswerAfter
  enableLabel?: boolean
}>()

const emit = defineEmits<{
  (e: 'longPressContent', val: any): void
  (e: 'clickSteps'): void
}>()

const cs = useClassesName('message-card')
</script>

<template>
  <view :class="cs.e('messages')">
    <view class="b-b-1px b-gray-2 pt-10px pb-20px flex justify-between items-center mb-10px" @click="emit('clickSteps')">
      <view class="color-#c36622 text-16px gap-6px flex items-center font-500">
        <view class="i-famicons-logo-react text-20px" />
        <view>
          深度思考
        </view>
        <view class="color-gray text-14px font-400">
          {{ formatSeconds(data.messageTimeLong / 1000) }}
        </view>
      </view>

      <view :class="data.showSteps ? 'i-flowbite-angle-down-outline' : 'i-flowbite-angle-up-outline' " />
    </view>

    <wd-transition :show="data.showSteps" name="fade">
      <wd-steps vertical>
        <wd-step
          v-for="item in data.steps"
          :key="item.node"
          :title="item.message"
          :status="item.finished ? 'finished' : 'process'"
        >
          <template #icon>
            <template v-if="item.finished">
              <wd-icon name="check-circle-filled" size="22px" color="var(--hi-primary-color)" />
            </template>
            <template v-else>
              <view class="i-line-md-loading-twotone-loop text-22px inline-block" />
            </template>
          </template>
          <template #description>
            <template v-if="item.finished && !item.thinking?.trim()">
              <text>完成</text>
            </template>
            <rich-text v-else class="markdown-body" :class="cs.e('rich-text')" :nodes="renderMarkdown(item.thinking || '')" space="ensp" />
          </template>
        </wd-step>
      </wd-steps>
    </wd-transition>
  </view>

  <Stock v-if="data.stockData?.length === 1" :data="data.stockData" />

  <view class="prose" :class="cs.m('response')" @longpress="(e) => emit('longPressContent', e)">
    <rich-text class="markdown-body" :class="cs.e('rich-text')" :nodes="renderMarkdown(data.response)" space="ensp" />
  </view>

  <view v-if="data.label?.length && enableLabel" class="flex flex-row flex-wrap gap-10rpx">
    <Tag v-for="item, index in data?.label" :key="index" type="primary" class="flex-shrink-0">
      #{{ item }}
    </Tag>
  </view>
</template>

<style lang='scss' scoped>
.hi-message-card__deep-think {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #666666;
  margin-bottom: 10px;
}
.hi-message-card__deep-think-title {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.hi-message-card__deep-think-content {
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e5e5e5;
  padding-left: 10px;
}
</style>
