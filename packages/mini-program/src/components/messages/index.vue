<script lang='ts' setup>
import type { ChatMessage } from '@higoal/api'
import { useClassesName } from '@higoal/hooks'
import MessageCard from './components/MessageCard.NOT.vue'

withDefaults(defineProps<{
  messages?: ChatMessage[]
}>(), {
  messages: () => [],
})

const cs = useClassesName('messages')
</script>

<template>
  <view :class="cs.m('wrapper')">
    <MessageCard v-for="item in messages" :key="item.chatId" :message="item" />
  </view>
</template>

<style lang='scss' scoped>
</style>
