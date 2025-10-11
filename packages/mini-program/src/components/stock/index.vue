<script lang='ts' setup>
import type { StockData } from '.'
import type { ChatMessageStock } from '@/api'
import { computed, ref } from 'vue'
import echarts from '@/echarts'
import { useStockChart } from '.'
import { StockShowType } from './config'

const props = defineProps<{
  data: [ChatMessageStock]
}>()

const current = ref(StockShowType.DAY_K)
const activeData = ref<StockData | null>(null)
const { store, config } = useStockChart(props.data)
const stockInfo = computed(() => store.data.value.stockInfo)

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width,
    height,
    devicePixelRatio: dpr, // 像素比
  })
  canvas.setChart(chart)
  chart.on('click', (params) => {
    if (params.componentType === 'series') {
      activeData.value = store.getStockData(params.dataIndex)
    }
  })
  chart.setOption(config)
  return chart
}
function onClickContainer(e) {
  if (e.target.id === 'stock-chart-bar')
    return
  activeData.value = null
}
const ec = {
  onInit: initChart,
}
</script>

<template>
  <view class="stock-chart-container" @click="onClickContainer">
    <!-- 股票基本信息 -->
    <view v-if="stockInfo" class="stock-header">
      <view class="stock-title-section">
        <text class="stock-name">
          {{ props.data?.[0]?.metadata?.symbol?.[0] || '股票名称' }}
        </text>
        <text class="stock-code">
          {{ props.data?.[0]?.metadata?.symbol?.[1] || '000000' }}
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

    <!-- 价格信息面板 -->
    <view v-if="stockInfo" class="price-info-panel">
      <view class="price-item">
        <text class="label">
          开盘
        </text>
        <text class="value">
          {{ stockInfo.open }}
        </text>
      </view>
      <view class="price-item">
        <text class="label">
          最高
        </text>
        <text class="value price-up">
          {{ stockInfo.high }}
        </text>
      </view>
      <view class="price-item">
        <text class="label">
          最低
        </text>
        <text class="value price-down">
          {{ stockInfo.low }}
        </text>
      </view>
      <view class="price-item">
        <text class="label">
          成交量
        </text>
        <text class="value">
          {{ (stockInfo.totalVolume / 10000).toFixed(2) }}万
        </text>
      </view>
      <view class="price-item">
        <text class="label">
          持仓量
        </text>
        <text class="value">
          {{ (stockInfo.openInterest / 10000).toFixed(2) }}万
        </text>
      </view>
    </view>

    <!-- 时间周期选择器 -->
    <view class="period-selector">
      <wd-segmented v-model:value="current" :options="Object.values(StockShowType)" />
    </view>

    <!-- 点击数据显示区域 -->
    <view v-if="activeData" class="selected-data-panel" @click.stop>
      <view class="data-grid">
        <view class="data-row">
          <view class="data-item">
            <text class="data-label">
              日期
            </text>
            <text class="data-value">
              {{ activeData?.date || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              开盘
            </text>
            <text class="data-value" :class="activeData?.open > activeData?.close ? 'price-down' : 'price-up'">
              {{ activeData?.open || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              收盘
            </text>
            <text class="data-value" :class="activeData?.close > activeData?.open ? 'price-up' : 'price-down'">
              {{ activeData?.close || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              最高
            </text>
            <text class="data-value">
              {{ activeData?.high || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              最低
            </text>
            <text class="data-value">
              {{ activeData?.low || '--' }}
            </text>
          </view>
        </view>
        <view class="data-row">
          <view class="data-item">
            <text class="data-label">
              成交量
            </text>
            <text class="data-value">
              {{ activeData?.vol || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              MA5
            </text>
            <text class="data-value" style="color: #1E90FF;">
              {{ activeData?.ma5 || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              MA10
            </text>
            <text class="data-value" style="color: #FFD700;">
              {{ activeData?.ma10 || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              MA20
            </text>
            <text class="data-value" style="color: #9370DB;">
              {{ activeData?.ma20 || '--' }}
            </text>
          </view>
          <view class="data-item">
            <text class="data-label">
              MA30
            </text>
            <text class="data-value" style="color: #00CED1;">
              {{ activeData?.ma30 || '--' }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 图表容器 -->
    <view class="chart-wrapper">
      <ec-canvas id="stock-chart-bar" :canvas-id="`stock-chart-${Date.now()}`" :ec="ec" type="2d" />
    </view>
  </view>
</template>

<style lang='scss' scoped>
.stock-chart-container {
  background-color: #fff;
  overflow: hidden;
  margin: 12px 0;
}

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

.period-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.period-label {
  background-color: #f5f5f5;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
}

.price-info-panel {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 8px;
}

.price-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.price-item .label {
  font-size: 12px;
  color: #999;
}

.price-item .value {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.chart-wrapper {
  height: 300px;
  width: 100%;
  overflow: hidden;
  margin-top: 16px;
  position: relative;
}

// 点击数据显示区域样式
.selected-data-panel {
  margin-top: 16px;
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .panel-title {
      font-size: 12px;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      font-size: 16px;
      color: #999;
      cursor: pointer;
      padding: 2px;
      line-height: 1;

      &:hover {
        color: #666;
      }
    }
  }

  .data-grid {
    .data-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;

      &:last-child {
        margin-bottom: 0;
      }

      .data-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        flex: 1;

        .data-label {
          font-size: 10px;
          color: #999;
        }

        .data-value {
          font-size: 10px;
          color: #333;
          font-weight: 500;

          &.price-up {
            color: #ec0000;
          }

          &.price-down {
            color: #00da3c;
          }
        }
      }
    }
  }
}

.chart-name {
  text-align: center;
}
</style>
