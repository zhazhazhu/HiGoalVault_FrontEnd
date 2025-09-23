<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import { ref } from 'vue'
import { useSearchStore } from '@/store'

const cs = useClassesName('search')
const showSidebar = ref(false)
const searchStore = useSearchStore()
const searchText = ref('')

function onNavbarLeftClick() {
  showSidebar.value = !showSidebar.value
}
function onChangeChat() {
  uni.navigateTo({ url: '/pages/chat/index' })
}
function onBackToHome() {
  uni.navigateTo({ url: '/pages/index/index' })
}
function onConfirm() {
  if (!searchText.value)
    return
  searchStore.addSearchHistory(searchText.value)
  searchText.value = ''
}
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="onChangeChat">
    <Navbar @left-click="onNavbarLeftClick" />
    <Container custom-class="px-32rpx">
      <view :class="cs.m('header')">
        <view class="i-uil-angle-left-b size-25px" @click="onBackToHome" />
        <view :class="cs.m('input')">
          <wd-input
            v-model="searchText"
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
      <view :class="cs.m('content')">
        <view :class="cs.m('lately-search')">
          <SearchCard title="最近搜索" edit-icon="i-material-symbols-light-delete-outline" :data="searchStore.searchHistory" />
        </view>
      </view>
    </Container>
  </Layout>
</template>

<style lang='scss' scoped>
.hi-search--header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  .hi-search--input {
    display: flex;
    align-items: center;
    flex: 1;
    padding: 14rpx 20rpx;
    background-color: white;
    border-radius: 70rpx;
  }
  .hi-search--search-button {
    width: 90rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--hi-primary-color);
    border-radius: 60rpx;
    margin-left: 20rpx;
  }
}
.hi-search--content {
  margin-top: 60rpx;
}
</style>
