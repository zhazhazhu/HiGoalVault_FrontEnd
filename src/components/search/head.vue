<script lang='ts' setup>
import { ref } from 'vue'
import { api } from '@/api'
import { useClassesName } from '@/composables'
import { watchDebounced } from '@/composables/watchDebounced'
import { useSearchStore } from '@/store'

withDefaults(defineProps<{ placeholder?: string }>(), { placeholder: '搜索' })
const emit = defineEmits<{
  (e: 'confirm', value: string): void
  (e: 'back'): void
}>()
const model = defineModel({ type: String, required: true })
const cs = useClassesName('search-head')
const searchStore = useSearchStore()
const suggestList = ref<string[]>([])
const isFocus = ref(false)

watchDebounced(model, async (newValue) => {
  if (!newValue) {
    return
  }
  const res = await api.searchSuggest(newValue)
  if (res.code === 200) {
    suggestList.value = res.result || []
  }
}, { delay: 300 })

function onConfirm() {
  const text = model.value?.trim()
  if (!text)
    return
  emit('confirm', text)
  setTimeout(() => {
    searchStore.addSearchHistory(text)
  }, 500)
}
function onClickSuggest(item: string) {
  model.value = item
  onConfirm()
}
</script>

<template>
  <view class="relative h-50px z-99 px-32rpx">
    <view :class="cs.m('header')">
      <wd-icon name="thin-arrow-left" size="16px" @click="emit('back')" />
      <view :class="cs.m('input')">
        <view class="search-icon bg-#7d7d7d" />
        <wd-input
          v-model="model"
          custom-class="w-full ml-20rpx"
          :placeholder="placeholder"
          clearable
          no-border
          @focus="isFocus = true"
          @blur="isFocus = false"
          @confirm="onConfirm"
        />
      </view>
      <view class="text-15px font-500 color-#1A1F28" @click="onConfirm">
        搜索
      </view>
    </view>

    <view v-show="isFocus && model" :class="cs.m('suggest')">
      <template v-if="suggestList.length">
        <view v-for="item in suggestList" :key="item" class="py-15px flex justify-between items-center border-b-1px border-solid border-#E2E4E5" @click="onClickSuggest(item)">
          <view class="flex items-center gap-12px flex-1">
            <view class="search-icon bg-#7D8699 size-20px" />
            <view class="text-14px color-#3E3E40">
              {{ item }}
            </view>
          </view>
          <wd-icon name="arrow-right" size="16px" color="#1A1F28" />
        </view>
      </template>
      <view v-else class="text-14px color-gray px-20px py-10px flex items-center justify-center">
        暂无匹配结果
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-search-head--header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  .hi-search-head--input {
    display: flex;
    align-items: center;
    flex: 1;
    padding: 14rpx 20rpx;
    background-color: white;
    border-radius: 10px;
    position: relative;
    height: 44px;
  }
}

.hi-search-head--suggest {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: var(--hi-bg-color);
  padding: 20rpx;
  z-index: 1;
  height: calc(100vh - 150px);
}
</style>
