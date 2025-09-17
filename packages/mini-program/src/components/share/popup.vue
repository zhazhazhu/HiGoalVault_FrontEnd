<script lang='ts' setup>
import { inject } from 'vue'
import { chatInjectKey } from '@/composables/inject'

const model = defineModel({ type: Boolean, default: false })

const { share } = inject(chatInjectKey)!
</script>

<template>
  <wd-popup v-model="model" position="bottom" :modal="false" root-portal>
    <view class="p-20px h-100px">
      <button open-type="share" :data-ids="share.ids" @click="() => model = false">
        <view />
        <text>分享好友</text>
      </button>
    </view>
  </wd-popup>
</template>

<style lang='scss' scoped></style>
