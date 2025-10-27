<script lang='ts' setup>
import type { StockInfo } from '@/echarts'
import { computed } from 'vue'

const props = defineProps<{
  stockInfo: StockInfo
}>()

const formattedChange = computed(() => {
  const value = Number(props.stockInfo.change)
  return Number.isNaN(value) ? props.stockInfo.change : value.toFixed(5).replace(/\.?0+$/, '')
})

const formattedChangePercent = computed(() => {
  const value = Number(props.stockInfo.changePercent)
  return Number.isNaN(value) ? props.stockInfo.changePercent : value.toFixed(5).replace(/\.?0+$/, '')
})
</script>

<template>
  <view class="flex justify-between items-start mb-32rpx pb-24rpx border-b-2rpx border-#f0f0f0">
    <view class="flex flex-col gap-8rpx">
      <text class="text-36rpx font-600 color-#333">
        {{ stockInfo.name || '股票名称' }}
      </text>
      <text class="text-28rpx color-#666">
        {{ stockInfo.code || '000000' }}
      </text>
    </view>

    <view class="flex flex-col items-end gap-8rpx">
      <text class="text-36rpx font-700" :class="[stockInfo.isUp ? 'color-#ec0000' : 'color-#00da3c']">
        ¥{{ stockInfo.currentPrice }}
      </text>
      <view class="flex gap-16rpx items-center">
        <text class="text-28rpx font-500" :class="[stockInfo.isUp ? 'color-#ec0000' : 'color-#00da3c']">
          {{ stockInfo.isUp ? '+' : '' }}{{ formattedChange }}
        </text>
        <text class="text-28rpx font-500" :class="[stockInfo.isUp ? 'color-#ec0000' : 'color-#00da3c']">
          {{ stockInfo.isUp ? '+' : '' }}{{ formattedChangePercent }}%
        </text>
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
</style>
