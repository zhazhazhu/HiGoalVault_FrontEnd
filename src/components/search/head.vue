<script lang='ts' setup>
import { useClassesName } from '@/composables'
import { useSearchStore } from '@/store'

const emit = defineEmits<{
  (e: 'confirm', value: string): void
  (e: 'back'): void
}>()
const model = defineModel({ type: String, required: true })
const cs = useClassesName('search-head')
const searchStore = useSearchStore()

function onConfirm() {
  if (!model.value)
    return
  searchStore.addSearchHistory(model.value)
  emit('confirm', model.value)
}
</script>

<template>
  <view :class="cs.m('header')">
    <wd-icon name="thin-arrow-left" size="19px" @click="emit('back')" />
    <view :class="cs.m('input')">
      <wd-input
        v-model="model"
        custom-class="w-full ml-20rpx"
        placeholder="搜索"
        clearable
        no-border
        @confirm="onConfirm"
      />
      <view :class="cs.m('search-button')" @click="onConfirm">
        <wd-icon name="search" color="#fff" />
      </view>
    </view>
    <view class="i-uil-camera size-25px" />
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
}
</style>
