<script lang='ts' setup>
import type { StockInfo } from '.'
import { computed } from 'vue'

const props = defineProps<{
  stockInfo: StockInfo
}>()

// 定义数据项配置
const priceItems = computed(() => [
  {
    label: '开盘',
    value: props.stockInfo.open,
    class: 'value'
  },
  {
    label: '最高',
    value: props.stockInfo.high,
    class: 'value price-up'
  },
  {
    label: '最低',
    value: props.stockInfo.low,
    class: 'value price-down'
  },
  {
    label: '成交量',
    value: `${(props.stockInfo.totalVolume / 10000).toFixed(2)}万`,
    class: 'value'
  },
  {
    label: '持仓量',
    value: `${(props.stockInfo.openInterest / 10000).toFixed(2)}万`,
    class: 'value'
  }
])
</script>

<template>
  <view class="panel">
    <view v-for="(item, index) in priceItems" :key="index" class="item">
      <text class="label">
        {{ item.label }}
      </text>
      <text :class="item.class">
        {{ item.value }}
      </text>
    </view>
  </view>
</template>

<style scoped>
.panel {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 8px;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.label {
  font-size: 12px;
  color: #999;
}

.value {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.price-up {
  color: #ef4444;
}

.price-down {
  color: #22c55e;
}
</style>
