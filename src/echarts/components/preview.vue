<script lang='ts' setup>
import type { ChatMessageStock } from '@/api'
import { getStockInfo } from '@/echarts'
import StockHeader from './header.vue'

const props = defineProps<{
  data: [ChatMessageStock]
}>()

const stockInfo = getStockInfo(props.data[0].data)
</script>

<template>
  <view v-if="stockInfo" class="stock-chart-container">
    <!-- 股票基本信息 -->
    <StockHeader :stock-info="stockInfo" />
  </view>
</template>

<style lang='scss' scoped>
.stock-chart-container {
  background-color: #fff;
  overflow: hidden;
}
</style>
