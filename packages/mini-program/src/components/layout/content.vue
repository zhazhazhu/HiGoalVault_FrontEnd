<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import { ref } from 'vue'
import { useUserStore } from '@/store'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'changeChat'): void
}>()
const cs = useClassesName('sidebar-content')
const active = ref('chat')
const userStore = useUserStore()
const isEdit = ref(false)

function onEditChatList() {
  isEdit.value = !isEdit.value
}
</script>

<template>
  <view class="pt-110px w-85% px-16px box-border h-full flex flex-col justify-between relative">
    <view class="i-material-symbols-light-close-rounded size-30px absolute top-60px left-14px" @click="emit('close')" />
    <tabs v-model="active" custom-class="flex-1" :custom-nav-class="cs.m('tab-nav')" :editable="active === 'chat'" @edit="onEditChatList">
      <template #edit>
        <wd-button v-if="!isEdit" type="text">
          编辑
        </wd-button>
        <wd-button v-else type="primary" :round="false" size="small">
          完成
        </wd-button>
      </template>
      <tabs-item name="browse" label="发现">
        TODO
      </tabs-item>
      <tabs-item name="chat" label="对话">
        <LayoutChatList :is-edit="isEdit" @change-chat="$emit('changeChat')" />
      </tabs-item>
    </tabs>

    <view :class="cs.m('bottom')">
      <view :class="cs.m('user')">
        <wd-img :src="userStore.userInfo?.face" round :width="26" :height="26" />
        <text class="text-16px font-bold text-h1-color ml-8px max-w-120px truncate">
          {{ userStore.userInfo?.username }}{{ userStore.userInfo?.username }}{{ userStore.userInfo?.username }}
        </text>
      </view>

      <view class="flex gap-10px text-48rpx text-h3-color w-80px justify-end">
        <view class="i-tabler-settings" />
        <view class="i-material-symbols-lightbulb-2-outline-sharp" />
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-sidebar-content--bottom {
  height: 40px;
  padding-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.hi-sidebar-content--user {
  display: flex;
  align-items: center;
}
</style>
