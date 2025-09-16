<script lang='ts' setup>
import type { ChatMessageAfter } from '@higoal/api'
import { useClassesName } from '@higoal/hooks'
import MessageCard from './MessageCard.vue'

withDefaults(defineProps<{
  messages?: ChatMessageAfter[]
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
