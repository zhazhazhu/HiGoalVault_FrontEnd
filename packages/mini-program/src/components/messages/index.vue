<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'

const cs = useClassesName('messages')
</script>

<template>
  <view :class="cs.m('wrapper')">
    messages
  </view>
</template>

<style lang='css' scoped></style>
