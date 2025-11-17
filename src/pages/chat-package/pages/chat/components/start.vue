<script lang='ts' setup>
const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'question', value: string): void
}>()

const defineQuestion = [
  '秋天水果价格变化趋势',
  '九月份沥青2512价格',
  '平安最近股价',
]

function onQuestion(item: string) {
  if (props.disabled)
    return
  emit('question', item)
}
</script>

<template>
  <view class="pt-40rpx pb-20rpx">
    <view class="font-500 text-50rpx">
      Hi~ 我是黑狗
    </view>
    <view class="font-500 text-28rpx mt-20rpx color-#717171">
      你身边的智能助手，可以为你答疑解惑、尽情创作， 快来点击以下任一功能体验吧～
    </view>
    <wd-divider dashed custom-style="padding: 0" />
    <view class="text-24rpx font-500 color-#717171">
      你可以这样问
    </view>
    <view class="flex flex-col gap-20rpx mt-20rpx">
      <view
        v-for="item in defineQuestion" :key="item"
        class="w-fit px-20rpx py-14rpx bg-white rounded-12rpx color-#484848 font-500 text-28rpx flex items-center gap-10rpx"
        @click="onQuestion(item)"
      >
        <view class="i-mdi-arrow-right-bottom" />
        <text>{{ item }}</text>
      </view>
    </view>
  </view>
</template>

<style lang='css' scoped></style>
