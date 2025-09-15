<script lang='ts' setup>
import type { ChatMessage } from '@higoal/api'
import type { NavbarInstance } from '@/components/navbar'
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import { useUserStore } from '@/store'

const show = ref(false)
const navbarInstance = ref<NavbarInstance>()
const userStore = useUserStore()
const chatMessages = ref<ChatMessage[]>([])

function handleClick() {
  show.value = !show.value
}

onMounted(async () => {
  const data = await api.getChatHistory({ userId: userStore.userInfo!.id })
  if (data.code === 200) {
    chatMessages.value = data.result
  }
})
</script>

<template>
  <view>
    <login-popup v-model="show" />

    <navbar ref="navbarInstance" bg-color="#F3F3F3">
      <template #left>
        <view v-if="userStore.isLogin" class="i-uil-list-ul text-50rpx" />
        <view v-else class="flex items-center color-#3e3e3e" @click="handleClick">
          <view class="i-uil-user text-46rpx mr-6rpx" />
          <text class="text-24rpx" user-select="false">
            未登录
          </text>
        </view>
      </template>

      <template #title>
        <tabs>
          <tabs-item :name="0" label="黑狗" />
          <tabs-item :name="1" label="关注" />
        </tabs>
      </template>
    </navbar>

    <container>
      <view class="flex-1">
        <messages :messages="chatMessages" />
      </view>
      <view>
        <converse />
      </view>
    </container>
  </view>
</template>

<style lang='css' scoped></style>
