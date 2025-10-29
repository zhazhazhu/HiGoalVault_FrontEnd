<script lang='ts' setup>
import type { ChatMessageStockData, GetFinanceBasicInfoResponse } from '@/api'
import { computed, onMounted, ref } from 'vue'
import { api } from '@/api'

const props = defineProps<{
  stockInfo: ChatMessageStockData
}>()
const isUp = computed(() => {
  return props.stockInfo.close > props.stockInfo.pre_close
})
const formattedChange = computed(() => {
  if (props.stockInfo?.close == null || props.stockInfo?.pre_close == null)
    return '-'
  return (props.stockInfo.close - props.stockInfo.pre_close).toFixed(2).replace(/\.?0+$/, '')
})
const formattedChangePercent = computed(() => {
  if (props.stockInfo?.close == null || props.stockInfo?.pre_close == null)
    return '-'
  return ((props.stockInfo.close / props.stockInfo.pre_close) * 100).toFixed(2)
})
// 如果金额是百亿级别就返回亿，如果是万级别就返回万，否则返回原始金额
function formatAmount(v: number | null) {
  if (v == null)
    return '-'
  if (v >= 1e10)
    return `${(v / 1e10).toFixed(2)}亿`
  if (v >= 1e8)
    return `${(v / 1e8).toFixed(2)}亿`
  if (v >= 1e4)
    return `${(v / 1e4).toFixed(2)}万`
  return v.toFixed(2)
}

const basicInfo = ref<GetFinanceBasicInfoResponse>()

onMounted(async () => {
  const res = await api.getFinanceBasicInfo(props.stockInfo.trans_code)
  basicInfo.value = res.result
})
</script>

<template>
  <view>
    <view class="color-#797979 mb-10px">
      <text class="text-14px mr-6px">
        {{ basicInfo?.name || '股票名称' }}
      </text>
      <text class="text-12px">
        {{ basicInfo?.transCode || '股票代码' }}
      </text>
    </view>
    <view class="grid grid-cols-4 gap-20px items-center">
      <view :style="{ color: isUp ? '#2bb552' : '#ec4242' }">
        <view class="text-24px font-500">
          {{ stockInfo.close }}
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
          <view class="font-500" :style="{ color: isUp ? '#2bb552' : '#ec4242' }">
            {{ stockInfo.high }}
          </view>
        </view>
        <view class="flex justify-between">
          <view>低</view>
          <view class="font-500" :style="{ color: isUp ? '#ec4242' : '#2bb552' }">
            {{ stockInfo.low }}
          </view>
        </view>
      </view>
      <view class="text-12px  flex flex-col gap-8px">
        <view class="flex justify-between">
          <view>开</view>
          <view class="font-500" :style="{ color: isUp ? '#2bb552' : '#ec4242' }">
            {{ stockInfo.open }}
          </view>
        </view>
        <view class="flex justify-between">
          <view>换</view>
          <view class="font-500">
            -
          </view>
        </view>
      </view>
      <view class="text-12px  flex flex-col gap-8px">
        <view class="flex justify-between">
          <view>量</view>
          <view class="font-500">
            {{ formatAmount(stockInfo.vol) }}
          </view>
        </view>
        <view class="flex justify-between">
          <view>额</view>
          <view class="font-500">
            {{ formatAmount(stockInfo.amount) }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
</style>
