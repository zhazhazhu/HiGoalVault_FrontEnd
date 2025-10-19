<script lang='ts' setup>
import type { StockInfo } from '@/echarts'

defineProps<{
  stockInfo: StockInfo
}>()
</script>

<template>
  <view class="stock-header">
    <view class="stock-title-section">
      <text class="stock-name">
        {{ stockInfo.name || '股票名称' }}
      </text>
      <text class="stock-code">
        {{ stockInfo.code || '000000' }}
      </text>
    </view>

    <view class="stock-price-section">
      <text class="current-price" :class="{ 'price-up': stockInfo.isUp, 'price-down': !stockInfo.isUp }">
        ¥{{ stockInfo.currentPrice }}
      </text>
      <view class="price-change">
        <text class="change-amount" :class="{ 'price-up': stockInfo.isUp, 'price-down': !stockInfo.isUp }">
          {{ stockInfo.isUp ? '+' : '' }}{{ stockInfo.change }}
        </text>
        <text class="change-percent" :class="{ 'price-up': stockInfo.isUp, 'price-down': !stockInfo.isUp }">
          {{ stockInfo.isUp ? '+' : '' }}{{ stockInfo.changePercent }}%
        </text>
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.stock-title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stock-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stock-code {
  font-size: 14px;
  color: #666;
}
.stock-price-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.current-price {
  font-size: 24px;
  font-weight: 700;
}

.price-change {
  display: flex;
  gap: 8px;
  align-items: center;
}

.change-amount,
.change-percent {
  font-size: 14px;
  font-weight: 500;
}

.price-up {
  color: #ec0000;
}

.price-down {
  color: #00da3c;
}
</style>
