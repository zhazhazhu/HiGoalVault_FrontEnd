<script lang='ts' setup>
import type { AnswerAfter } from '@/api'
import { useClassesName, useIntersectionObserver, useUUID } from '@/composables'
import Stock from '@/echarts/components/stock.vue?async'
import { renderMarkdown } from '@/modules'
import { formatSeconds } from '@/utils'

const props = defineProps<{
  data: AnswerAfter
  enableLabel?: boolean
}>()

const emit = defineEmits<{
  (e: 'longPressContent', val: any, type: 'response' | 'step'): void
  (e: 'clickSteps'): void
}>()

const cs = useClassesName('message-card')
const instanceId = `response-card-${useUUID()}-${props.data.queryId}`
const visible = useIntersectionObserver(`#${instanceId}`)

function handleLinkTap(attrs: any) {
  // 检查是否是引用链接
  if (attrs['data-action'] === 'copy-reference') {
    const index = attrs['data-index']
    const url = props.data.reference?.[index - 1]?.url
    if (!url) {
      uni.showToast({
        title: `链接不存在`,
        icon: 'none',
      })
      return
    }
    uni.setClipboardData({
      data: url,
      success: () => {
        uni.showToast({
          title: `已复制链接`,
          icon: 'none',
        })
      },
    })
  }
}
</script>

<template>
  <view :id="instanceId" :class="cs.e('messages')">
    <view class="b-b-1px b-gray-2 py-10px flex justify-between items-center mb-10px" @click="emit('clickSteps')">
      <view class="color-#565656 gap-6px flex items-center font-500">
        <!-- <view class="i-famicons-logo-react text-15px" /> -->
        <view class="text-14px">
          已深度思考
        </view>
        <view class="color-gray text-12px font-400">
          {{ formatSeconds(data.messageTimeLong / 1000) }}
        </view>
      </view>

      <view :class="data.showSteps ? 'i-flowbite-angle-up-outline' : 'i-flowbite-angle-down-outline' " />
    </view>

    <wd-transition :show="data.showSteps" name="fade" :duration="50">
      <wd-steps vertical @longpress="(e) => emit('longPressContent', e, 'step')">
        <wd-step
          v-for="item in data.steps"
          :key="item.node"
          :title="item.message"
          :status="item.finished ? 'finished' : 'process'"
        >
          <template #icon>
            <template v-if="item.finished">
              <view class="chat-star-icon size-26px translate-x-2px" />
            </template>
            <template v-else>
              <view class="i-line-md-loading-twotone-loop text-22px inline-block" />
            </template>
          </template>
          <template #description>
            <template v-if="item.finished && !item.thinking?.trim()">
              <text>完成</text>
            </template>
            <UvParse v-else class="markdown-body" :class="cs.e('rich-text')" :content="renderMarkdown(item.thinking || '')" container-style="overflow: hidden" @linktap="handleLinkTap" />
          </template>
        </wd-step>
      </wd-steps>
    </wd-transition>
  </view>

  <Stock v-if="data.stockParameter.code.length && visible" :params="data.stockParameter" />

  <view class="prose" :class="cs.m('response')" @longpress="(e) => emit('longPressContent', e, 'response')">
    <UvParse class="markdown-body" :class="cs.e('rich-text')" :content="renderMarkdown(data.response)" container-style="overflow: hidden" @linktap="handleLinkTap" />
  </view>

  <view v-if="data.label?.length && enableLabel" class="flex flex-row flex-wrap gap-10rpx">
    <Tag v-for="item, index in data?.label" :key="index" type="primary" class="flex-shrink-0">
      #{{ item }}
    </Tag>
  </view>

  <view v-if="data.isPaused">
    <view class="text-13px text-gray-7">
      已暂停生成
    </view>
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
