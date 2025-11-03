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
  if (!model.value)
    return
  searchStore.addSearchHistory(model.value)
  emit('confirm', model.value)
}
function onClickSuggest(item: string) {
  model.value = item
  onConfirm()
}
</script>

<template>
  <view :class="cs.m('header')">
    <wd-icon name="thin-arrow-left" size="19px" @click="emit('back')" />
    <view :class="cs.m('input')">
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
      <view :class="cs.m('search-button')" @click="onConfirm">
        <wd-icon name="search" color="#fff" />
      </view>
      <view v-if="model && isFocus" :class="cs.m('suggest')">
        <template v-if="suggestList.length">
          <view v-for="item in suggestList" :key="item" class="py-8px flex justify-between items-center" @click="onClickSuggest(item)">
            <view class="flex items-center gap-12px flex-1">
              <view class="i-mingcute-search-line text-18px color-gray" />
              <view class="text-14px">
                {{ item }}
              </view>
            </view>
            <view class="i-material-symbols-arrow-insert-rounded text-18px color-gray" />
          </view>
        </template>
        <view v-else class="text-14px color-gray px-20px py-10px flex items-center justify-center">
          暂无匹配结果
        </view>
      </view>
    </view>
    <!-- <view class="i-uil-camera size-25px" /> -->
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
    border-radius: 70rpx;
    position: relative;
  }
  .hi-search-head--search-button {
    width: 120rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--hi-primary-color);
    border-radius: 60rpx;
    margin-left: 20rpx;
  }
  .hi-search-head--suggest {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: white;
    padding: 20rpx;
    box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.1);
    z-index: 1;
  }
}
</style>
