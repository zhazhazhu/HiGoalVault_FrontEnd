<script lang='ts' setup>
import type { ChatMessage } from '@higoal/api'
import { useClassesName } from '@higoal/hooks'
import MessageCard from './components/MessageCard.vue'

withDefaults(defineProps<{
  messages?: ChatMessage[]
}>(), {
  messages: () => [],
})

const cs = useClassesName('messages')
</script>

<template>
  <view :class="cs.m('wrapper')" class="px-32rpx">
    <MessageCard v-for="item, i in messages" :key="i" :message="item" />
  </view>
</template>

<style lang='scss' scoped>
</style>
