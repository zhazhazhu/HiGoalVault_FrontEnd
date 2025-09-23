<script lang='ts' setup>
import { getCurrentInstance, nextTick, onMounted, onUpdated, ref } from 'vue'

defineProps<{
  title: string
  editIcon?: string
  data: string[]
}>()
const isExpanded = ref(false)
const isOverflowing = ref(false)

// 两行的高度，需要根据你的实际样式来调整
const twoRowsHeight = 90 // 假设每行50rpx，两行就是100rpx。这里可以根据实际值调整

function checkOverflow() {
  const instance = getCurrentInstance()
  if (!instance)
    return

  nextTick(() => {
    uni.createSelectorQuery()
      .in(instance)
      .select('.search-tags')
      .boundingClientRect((rect) => {
        if (rect && (rect as any).height > twoRowsHeight) {
          isOverflowing.value = true
        }
        else {
          isOverflowing.value = false
        }
      })
      .exec()
  })
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

// 在组件挂载和数据更新后检查是否溢出
onMounted(() => {
  checkOverflow()
})

onUpdated(() => {
  checkOverflow()
})
</script>

<template>
  <view class="container">
    <view class="flex items-center justify-between">
      <view class="text-30rpx font-bold">
        {{ title }}
      </view>
      <view :class="editIcon" class="text-34rpx" />
    </view>

    <view class="search-tags-container" :class="{ expanded: isExpanded }">
      <view class="search-tags flex flex-wrap gap-16rpx py-20rpx pr-60rpx">
        <view
          v-for="item in data"
          :key="item"
          class="text-26rpx color-#666 rounded-12rpx bg-#E4E4E4 py-16rpx px-30rpx"
        >
          {{ item }}
        </view>
      </view>
      <view
        v-if="!isExpanded && isOverflowing"
        class="i-solar-round-alt-arrow-up-bold rotate-180 text-48rpx text-#666 absolute top-120rpx right-0"
        @click="toggleExpand"
      />
    </view>
  </view>
</template>

<style lang='scss' scoped>
.search-tags-container {
  max-height: 180rpx; /* 限制为两行高度 */
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
  position: relative;
}

.search-tags-container.expanded {
  max-height: none; /* 展开后取消高度限制 */
}

.load-more-btn {
  text-align: center;
  padding: 20rpx;
  color: #007aff;
  font-size: 28rpx;
}
</style>
