<script lang='ts' setup>
import type { ChatMessage } from '@higoal/api'
import { useClassesName } from '@higoal/hooks'

defineProps<{
  message: ChatMessage
}>()
const cs = useClassesName('message-card')
</script>

<template>
  <view :class="cs.m('wrapper')">
    hello
  </view>
</template>

<style lang='css' scoped></style>
