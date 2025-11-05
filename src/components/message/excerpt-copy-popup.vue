<script lang='ts' setup>
import type { AnswerAfter } from '@/api'
import { computed } from 'vue'
import { markdownToPlainText } from '@/utils'

const props = defineProps<{
  message: AnswerAfter
  type?: 'response' | 'step'
}>()
const model = defineModel({ type: Boolean, default: false })

const content = computed(() => props.type === 'response' ? markdownToPlainText(props.message.response || '') : markdownToPlainText(props.message.steps?.map(item => `${item.message}\n\n${item.thinking || ''}`).join('\n\n') || ''))
</script>

<template>
  <wd-popup
    v-model="model"
    position="bottom"
    root-portal
    :close-on-click-modal="false"
    custom-class="rounded-t-20px;"
  >
    <view class="h-500px flex flex-col">
      <view class="w-full py-20px text-center">
        长按复制节选内容
      </view>
      <scroll-view
        scroll-into-view-alignment="end"
        enhanced
        :scroll-y="true"
        :show-scrollbar="false"
        class="h-[calc(500px-120px)]"
      >
        <view class="px-20px">
          <text :user-select="true">
            {{ content }}
          </text>
        </view>
      </scroll-view>
      <view class="w-full text-center b-t-1px b-solid b-gray-2 py-20rpx" @click="model = false">
        取 消
      </view>
    </view>
  </wd-popup>
</template>

<style lang='css' scoped></style>
