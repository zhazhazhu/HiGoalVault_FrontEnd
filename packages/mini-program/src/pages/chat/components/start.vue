<script lang='ts' setup>
const emit = defineEmits<{
  (e: 'question', value: string): void
}>()

const defineQuestion = [
  '某股今日走势如何？',
  '这只股能买入吗？',
  '请分析最新财报。',
]
</script>

<template>
  <view class="pt-40rpx pb-20rpx">
    <view class="font-500 text-40rpx">
      Hi~ I'm HiGoal AI
    </view>
    <view class="font-500 text-26rpx mt-20rpx">
      你身边的智能助手，可以为你答疑解惑、尽情创作， 快来点击以下任一功能体验吧～
    </view>
    <wd-divider dashed />
    <view class="text-24rpx color-gray">
      你可以这样问
    </view>
    <view class="flex flex-col gap-20rpx mt-20rpx">
      <view v-for="item in defineQuestion" :key="item" class="w-fit px-20rpx py-10rpx bg-white rounded-12rpx color-green-7 font-500 text-26rpx" @click="emit('question', item)">
        {{ item }}
      </view>
    </view>
  </view>
</template>

<style lang='css' scoped></style>
