<script lang='ts' setup>
import type { PropType } from 'vue'
import type { GlobalSearchRequest, UserCenterSearchRequest } from '@/api'
import { ref } from 'vue'
import { SearchActionRangeEnum, SearchSortEnum, SearchTimeRangeEnum } from '@/api'

defineProps<{
  disableSearchActionRange?: boolean
}>()
const emit = defineEmits<{
  (e: 'change'): void
  (e: 'sendMessage'): void
}>()
const page = defineModel({ type: Object as PropType<GlobalSearchRequest | UserCenterSearchRequest>, required: true })
const visible = ref(false)

function handleOpenWrapper(val?: boolean) {
  visible.value = val !== undefined ? val : !visible.value
}
function resetPage() {
  const { searchSort, searchTimeRange, searchActionRange } = page.value
  if (searchSort === 'SMART' && searchTimeRange === 'ALL' && searchActionRange === 'ALL') {
    return
  }
  page.value.searchSort = 'SMART'
  page.value.searchTimeRange = 'ALL'
  page.value.searchActionRange = 'ALL'
  emit('change')
}
function handleChangeSort<K extends 'searchSort' | 'searchTimeRange' | 'searchActionRange'>(key: K, value: GlobalSearchRequest[K]) {
  if (page.value[key] === value) {
    return
  }
  page.value[key] = value
  emit('change')
}
</script>

<template>
  <view class="relative">
    <view class="flex items-center justify-between py-4px text-14px w-full px-32rpx">
      <view class="flex items-center gap-4px" @click="handleOpenWrapper()">
        <view>全部</view>
        <view class="i-iconamoon-sorting-center-bold" />
      </view>

      <view class="flex items-center gap-4px" @click="emit('sendMessage')">
        <view class="chat-star-icon" />
        <view class="color-#4362FF">
          问一问
        </view>
      </view>
    </view>

    <view v-show="visible" class="absolute top-full left-0 w-full h-screen z-9">
      <view class="absolute w-full h-screen bg-#00000012 z-1" @click="handleOpenWrapper(false)" />
      <view class="absolute w-full bg-[var(--hi-bg-color)] rounded-b-20px px-32rpx pb-32rpx pt-16rpx z-2 text-14px">
        <view class="flex items-center">
          <view class="mr-10px color-#8A8F99">
            排序
          </view>
          <view class="grid grid-cols-3 items-center flex-1 gap-10px">
            <view
              v-for="item, key in SearchSortEnum"
              :key="key"
              class="text-center bg-#FAFAFA color-#3E3E40 rounded-4px p-6px"
              :class="[page.searchSort === key && 'color-#4362FF']"
              @click="() => handleChangeSort('searchSort', key)"
            >
              {{ item }}
            </view>
          </view>
        </view>

        <view class="flex items-center mt-12px">
          <view class="mr-10px color-#8A8F99">
            时间
          </view>
          <view class="grid grid-cols-3 items-center flex-1 gap-10px">
            <view
              v-for="item, key in SearchTimeRangeEnum"
              :key="key"
              class="text-center bg-#FAFAFA color-#3E3E40 rounded-4px p-6px"
              :class="[page.searchTimeRange === key && 'color-#4362FF']"
              @click="() => handleChangeSort('searchTimeRange', key)"
            >
              {{ item }}
            </view>
          </view>
        </view>

        <view v-if="!disableSearchActionRange" class="flex items-center mt-12px">
          <view class="mr-10px color-#8A8F99">
            范围
          </view>
          <view class="grid grid-cols-3 items-center flex-1 gap-10px">
            <view
              v-for="item, key in SearchActionRangeEnum"
              :key="key"
              class="text-center bg-#FAFAFA color-#3E3E40 rounded-4px p-6px"
              :class="[page.searchActionRange === key && 'color-#4362FF']"
              @click="() => handleChangeSort('searchActionRange', key)"
            >
              {{ item }}
            </view>
          </view>
        </view>

        <div class="h-1px bg-#E2E4E5 w-full my-12px" />

        <view class="flex items-center justify-between text-14px color-#1A1F28">
          <view class="flex items-center gap-4px" @click="handleOpenWrapper(false)">
            <view>收起</view>
            <view class="i-material-symbols-keyboard-arrow-up" />
          </view>

          <view class="color-#4362FF" @click="resetPage()">
            重置
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang='css' scoped></style>
