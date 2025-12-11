<script lang='ts' setup>
import type { ChatMessageStockData, GetFinanceBasicInfoResponse } from '@/api'
import { computed, onMounted, ref } from 'vue'
import { api } from '@/api'

const props = defineProps<{
  stockInfo?: ChatMessageStockData | null
  preview?: boolean
  code: string[]
}>()
const model = defineModel({ type: Number, required: true })
const stockInfo = computed(() => {
  return props.stockInfo || {
    close: 0,
    pre_close: 0,
    high: 0,
    low: 0,
    open: 0,
    change: 0,
  } as ChatMessageStockData
})

const isUp = computed(() => {
  return stockInfo.value?.close > stockInfo.value?.pre_close
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
const currentCode = computed(() => props.code[model.value])
const showToggle = computed(() => props.code.length > 1 && !props.preview)

function handlePrev() {
  if (model.value > 0) {
    model.value--
    getData()
  }
}
function handleNext() {
  if (model.value < props.code.length - 1) {
    model.value++
    getData()
  }
}

async function getData() {
  if (!currentCode.value)
    return
  const res = await api.getFinanceBasicInfo(currentCode.value)
  basicInfo.value = res.result
}

onMounted(() => {
  getData()
})
</script>

<template>
  <view>
    <view class="grid grid-cols-2 mb-10px">
      <view class="font-400 flex-1">
        <view class="flex items-center">
          <view v-if="showToggle" class="i-material-symbols-play-arrow-rounded rotate-180" :class="[model === 0 && 'color-gray']" @click="handlePrev" />
          <view class="text-14px">
            {{ basicInfo?.name || '股票名称' }}
          </view>
          <view v-if="showToggle" class="i-material-symbols-play-arrow-rounded rotate-0" :class="[model === (code.length - 1) && 'color-gray']" @click="handleNext" />
        </view>
        <view class="text-13px">
          {{ basicInfo?.transCode || '股票代码' }}
        </view>
      </view>

      <view class="text-right" :style="{ color: isUp ? '#FF193D' : '#25B230' }">
        <view class="text-18px font-500">
          {{ stockInfo.close }}
        </view>
        <view class="flex justify-end gap-6px">
          <view class="text-13px">
            {{ stockInfo.change }}
          </view>
          <view class="text-13px">
            {{ stockInfo.pct_chg }}%
          </view>
        </view>
      </view>
    </view>
    <template v-if="!preview">
      <template v-if="basicInfo?.dataType === 'STOCK'">
        <view class="grid grid-cols-3 gap-20px items-center font-300">
          <view class="text-12px flex flex-col gap-8px">
            <view class="flex justify-between">
              <view>最高</view>
              <view class="font-400" :style="{ color: isUp ? '#FF193D' : '#25B230' }">
                {{ stockInfo.high }}
              </view>
            </view>
            <view class="flex justify-between">
              <view>最低</view>
              <view class="font-400" :style="{ color: isUp ? '#FF193D' : '#25B230' }">
                {{ stockInfo.low }}
              </view>
            </view>
          </view>
          <view class="text-12px  flex flex-col gap-8px">
            <view class="flex justify-between">
              <view>开盘</view>
              <view class="font-400" :style="{ color: isUp ? '#FF193D' : '#25B230' }">
                {{ stockInfo.open }}
              </view>
            </view>
            <view class="flex justify-between">
              <view>换</view>
              <view class="font-400">
                {{ stockInfo.turnover_rate }}%
              </view>
            </view>
          </view>
          <view class="text-12px  flex flex-col gap-8px">
            <view class="flex justify-between">
              <view>量</view>
              <view class="font-400">
                {{ formatAmount(stockInfo.vol) }}
              </view>
            </view>
            <view class="flex justify-between">
              <view>额</view>
              <view class="font-400">
                {{ formatAmount(stockInfo.amount) }}
              </view>
            </view>
          </view>
        </view>
      </template>
      <template v-else>
        <view class="grid grid-cols-3 gap-20px items-center font-300">
          <view class="text-12px flex flex-col gap-8px">
            <view class="flex justify-between">
              <view>最高</view>
              <view class="font-400" :style="{ color: isUp ? '#FF193D' : '#25B230' }">
                {{ stockInfo.high }}
              </view>
            </view>
            <view class="flex justify-between">
              <view>最低</view>
              <view class="font-400" :style="{ color: isUp ? '#FF193D' : '#25B230' }">
                {{ stockInfo.low }}
              </view>
            </view>
            <view class="flex justify-between">
              <view>开盘</view>
              <view class="font-400" :style="{ color: isUp ? '#FF193D' : '#25B230' }">
                {{ stockInfo.open }}
              </view>
            </view>
          </view>
          <view class="text-12px  flex flex-col gap-8px">
            <view class="flex justify-between">
              <view>振幅</view>
              <view class="font-400">
                {{ stockInfo.price_swing || '-' }}%
              </view>
            </view>
            <view class="flex justify-between">
              <view>昨结</view>
              <view class="font-400">
                {{ stockInfo.pre_settle || '-' }}
              </view>
            </view>
            <view class="flex justify-between">
              <view>今结</view>
              <view class="font-400">
                {{ stockInfo.settle || '-' }}
              </view>
            </view>
          </view>
          <view class="text-12px  flex flex-col gap-8px">
            <view class="flex justify-between">
              <view>量</view>
              <view class="font-400">
                {{ formatAmount(stockInfo.vol) }}
              </view>
            </view>
            <view class="flex justify-between">
              <view>持仓</view>
              <view class="font-400">
                {{ stockInfo.oi || '-' }}
              </view>
            </view>
            <view class="flex justify-between">
              <view>日增</view>
              <view class="font-400">
                {{ stockInfo.oi_chg || '-' }}
              </view>
            </view>
          </view>
        </view>
      </template>
    </template>
  </view>
</template>

<style lang='scss' scoped>
</style>
