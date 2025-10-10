<script lang='ts' setup>
import type { AnswerAfter } from '@/api'
import { computed } from 'vue'
import { markdownToPlainText } from '@/utils'

const props = defineProps<{
  message: AnswerAfter
}>()
const model = defineModel({ type: Boolean, default: false })

const content = computed(() => markdownToPlainText(props.message.response))
</script>

<template>
  <wd-popup
    v-model="model"
    title="长按复制节选内容"
    position="bottom"
    root-portal
    safe-area-inset-bottom
    :close-on-click-modal="false"
    custom-style="border-radius: 20px;"
  >
    <view class="min-h-200rpx max-h-800rpx flex flex-col">
      <view class="w-full py-20px text-center">
        长按复制节选内容
      </view>
      <scroll-view
        scroll-into-view-alignment="end"
        enhanced
        :scroll-y="true"
        :show-scrollbar="false"
        class="h-[calc(100%-50rpx)] overflow-y-auto py-10px flex-1"
      >
        <view class="px-20px">
          <text :user-select="true">
            {{ content }}
          </text>
        </view>
      </scroll-view>
      <view class="w-full h-50rpx text-center b-t-1px b-solid b-gray-2 py-20rpx" @click="model = false">
        取 消
      </view>
    </view>
  </wd-popup>
</template>

<style lang='css' scoped></style>
