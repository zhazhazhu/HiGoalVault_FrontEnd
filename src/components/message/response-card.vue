<script lang='ts' setup>
import type { AnswerAfter } from '@/api'
import { useClassesName } from '@/composables'
import { renderMarkdown } from '@/modules'
import Stock from '@/subEcharts/echarts/components/stock.vue?async'

defineProps<{
  data: AnswerAfter
}>()

const emit = defineEmits<{
  (e: 'longPressContent', val: any): void
}>()

const cs = useClassesName('message-card')
</script>

<template>
  <view :class="cs.e('messages')">
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
          <template v-if="item.finished && !item.thinking">
            <text>完成</text>
          </template>
          <rich-text v-else class="markdown-body" :class="cs.e('rich-text')" :nodes="renderMarkdown(item.thinking || '')" space="ensp" />
        </template>
      </wd-step>
    </wd-steps>
  </view>

  <view class="prose" :class="cs.m('response')" @longpress="(e) => emit('longPressContent', e)">
    <rich-text class="markdown-body" :class="cs.e('rich-text')" :nodes="renderMarkdown(data.response)" space="ensp" />
  </view>

  <Stock v-if="data?.data?.length === 1" :data="data?.data" />
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
