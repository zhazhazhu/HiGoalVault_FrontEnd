<script lang='ts' setup>
import type { StockData } from '@/echarts'
import { computed } from 'vue'

const props = defineProps<{
  data: StockData
}>()

// 定义数据项配置
const dataItems = computed(() => [
  [
    {
      label: '日期',
      value: props.data?.date || '--',
      class: 'value',
    },
    {
      label: '开盘',
      value: props.data?.open || '--',
      class: `value ${props.data?.open > props.data?.close ? 'price-up' : 'price-down'}`,
    },
    {
      label: '收盘',
      value: props.data?.close || '--',
      class: `value ${props.data?.close > props.data?.open ? 'price-up' : 'price-down'}`,
    },
    {
      label: '最高',
      value: props.data?.high || '--',
      class: 'value',
    },
    {
      label: '最低',
      value: props.data?.low || '--',
      class: 'value',
    },
  ],
  [
    {
      label: '成交量',
      value: props.data?.vol || '--',
      class: 'value',
    },
    {
      label: 'MA5',
      value: props.data?.ma5 || '--',
      class: 'value ma-blue',
    },
    {
      label: 'MA10',
      value: props.data?.ma10 || '--',
      class: 'value ma-yellow',
    },
    {
      label: 'MA20',
      value: props.data?.ma20 || '--',
      class: 'value ma-purple',
    },
    {
      label: 'MA30',
      value: props.data?.ma30 || '--',
      class: 'value ma-cyan',
    },
  ],
])
</script>

<template>
  <view class="panel" @click.stop>
    <view class="grid">
      <view v-for="(row, rowIndex) in dataItems" :key="rowIndex" class="row">
        <view v-for="(item, itemIndex) in row" :key="itemIndex" class="item">
          <text class="label">
            {{ item.label }}
          </text>
          <text :class="item.class">
            {{ item.value }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.panel {
  margin-top: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 12px;
}

.grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row {
  display: flex;
  justify-content: space-between;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.label {
  font-size: 10px;
  color: #9ca3af;
}

.value {
  font-size: 10px;
  color: #1f2937;
  font-weight: 500;
}

.price-up {
  color: #ef4444;
}

.price-down {
  color: #22c55e;
}

.ma-blue {
  color: #3b82f6;
}

.ma-yellow {
  color: #eab308;
}

.ma-purple {
  color: #a855f7;
}

.ma-cyan {
  color: #06b6d4;
}
</style>
