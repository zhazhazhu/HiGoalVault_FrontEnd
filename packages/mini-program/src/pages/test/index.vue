<script lang='ts' setup>
import { ref } from 'vue'

const showSidebar = ref(false)

function onNavbarLeftClick() {
  showSidebar.value = true
}
</script>

<template>
  <LayoutCopy v-model="showSidebar">
    <Navbar title="测试" @left-click="onNavbarLeftClick" />

    <scroll-view
      class="content"
      scroll-y
      enhanced
      enable-passive
      :show-scrollbar="false"
    >
      <view class="h-500px w-full bg-gray-200">
        占位1
      </view>
      <message-stock :data="[] as any" />
      <view class="h-1200px w-full bg-gray-200">
        占位2
      </view>
    </scroll-view>

    <view class="bottom">
      <Converse />
    </view>
  </LayoutCopy>
</template>

<style lang='scss' scoped>
.content {
  z-index: 1;
  height: 100vh;
}
.bottom {
  position: sticky;
  position: -webkit-sticky;
  bottom: 0;
  background-color: white;
  padding: 0 32rpx;
  z-index: 99;
}
</style>
