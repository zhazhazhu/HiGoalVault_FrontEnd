<script lang='ts' setup>
import type { ChatMessageStock } from '@/api'
import { computed } from 'vue'
import { useStockChart } from '.'

const props = defineProps<{
  data: [ChatMessageStock]
}>()

const { store } = useStockChart(props.data)
const stockInfo = computed(() => store.data.value.stockInfo)
</script>

<template>
  <view v-if="stockInfo" class="stock-chart-container">
    <!-- 股票基本信息 -->
    <StockHeader :stock-info="stockInfo" />
    <!-- 价格信息面板 -->
    <StockPriceInfo :stock-info="stockInfo" />
  </view>
</template>

<style lang='scss' scoped>
.stock-chart-container {
  background-color: #fff;
  overflow: hidden;
  margin: 12px 0;
}
</style>
