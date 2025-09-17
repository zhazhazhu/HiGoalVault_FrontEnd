<script lang='ts' setup>
import type { ChatMessageAfter } from '@higoal/api'
import { useClassesName } from '@higoal/hooks'
import { useChatInject } from '@/composables/inject'
import MessageCard from './MessageCard.vue'

withDefaults(defineProps<{
  messages?: ChatMessageAfter[]
}>(), {
  messages: () => [],
})

const cs = useClassesName('messages')
const { share } = useChatInject()!
</script>

<template>
  <view :class="cs.m('wrapper')" class="px-32rpx">
    <view v-show="share.isChecked">
      <wd-checkbox-group v-model="share.ids">
        <wd-checkbox
          v-for="item in messages"
          :key="item.id"
          shape="square"
          :model-value="item.id"
          :custom-label-class="cs.m('checkbox-text')"
          :custom-class="[cs.m('checkbox-message'), cs.is('hidden', !share.isChecked)].join(' ')"
          :custom-shape-class="cs.m('checkbox-shape')"
          size="20px"
        >
          <MessageCard :message="item" />
        </wd-checkbox>
      </wd-checkbox-group>
    </view>

    <view v-show="!share.isChecked">
      <MessageCard v-for="item, index in messages" :key="index" :message="item" />
    </view>
  </view>
</template>

<style lang='scss' scoped>
</style>
