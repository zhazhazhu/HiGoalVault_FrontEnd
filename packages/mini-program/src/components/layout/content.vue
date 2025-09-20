<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import { ref } from 'vue'

const cs = useClassesName('sidebar-content')
const active = ref('chat')
</script>

<template>
  <view class="mt-220rpx w-85% px-16px box-border">
    <tabs v-model="active" :custom-nav-class="cs.m('tab-nav')">
      <tabs-item name="browse" label="发现">
        TODO
      </tabs-item>
      <tabs-item name="chat" label="对话">
        <LayoutChatList />
      </tabs-item>
    </tabs>
  </view>
</template>

<style lang='scss' scoped></style>
