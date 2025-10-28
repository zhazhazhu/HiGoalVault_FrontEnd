<script lang='ts' setup>
import type { StockInfo } from '@/echarts'
import { computed } from 'vue'

const props = defineProps<{
  stockInfo: StockInfo
}>()

const formattedChange = computed(() => {
  const value = Number(props.stockInfo.change)
  return Number.isNaN(value) ? props.stockInfo.change : value.toFixed(2).replace(/\.?0+$/, '')
})

const formattedChangePercent = computed(() => {
  const value = Number(props.stockInfo.changePercent)
  return Number.isNaN(value) ? props.stockInfo.changePercent : value.toFixed(2).replace(/\.?0+$/, '')
})
</script>

<template>
  <view>
    <view class="text-14px color-#797979 mb-10px">
      {{ stockInfo.code || '股票代码' }}
    </view>
    <view class="grid grid-cols-3 gap-20px items-center">
      <view :style="{ color: stockInfo.isUp ? '#2bb552' : '#ec4242' }">
        <view class="text-24px font-500">
          {{ stockInfo.currentPrice }}
        </view>
        <view class="flex gap-6px">
          <view class="text-12px">
            {{ formattedChange }}
          </view>
          <view class="text-12px">
            {{ formattedChangePercent }}%
          </view>
        </view>
      </view>
      <view class="text-12px flex flex-col gap-8px">
        <view class="flex justify-between">
          <view>高</view>
          <view class="font-500" :style="{ color: stockInfo.isUp ? '#2bb552' : '#ec4242' }">
            {{ stockInfo.high }}
          </view>
        </view>
        <view class="flex justify-between">
          <view>低</view>
          <view class="font-500" :style="{ color: stockInfo.isUp ? '#ec4242' : '#2bb552' }">
            {{ stockInfo.low }}
          </view>
        </view>
      </view>
      <view class="text-12px  flex flex-col gap-8px">
        <view class="flex justify-between">
          <view>开盘</view>
          <view class="font-500" :style="{ color: stockInfo.isUp ? '#2bb552' : '#ec4242' }">
            {{ stockInfo.open }}
          </view>
        </view>
        <view class="flex justify-between">
          <view>成交量</view>
          <view class="font-500">
            {{ stockInfo.vol }}万
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
</style>
