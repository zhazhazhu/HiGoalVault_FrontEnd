<script lang='ts' setup>
import type { ChatMessageAfter } from '@higoal/api'
import type { NavbarInstance } from '@/components/navbar'
import { nextTick, onMounted, ref } from 'vue'
import { api } from '@/api'
import { useUserStore } from '@/store'

const show = ref(false)
const navbarInstance = ref<NavbarInstance>()
const scrollViewRef = ref()
const scrollTop = ref(0)
const userStore = useUserStore()
const chatMessages = ref<ChatMessageAfter[]>([])

function handleClick() {
  show.value = !show.value
}

// 滚动到底部的函数
function scrollToBottom() {
  nextTick(() => {
    // 设置一个很大的值确保滚动到最底部
    scrollTop.value = 999999
  })
}

onMounted(async () => {
  const data = await api.getChatHistory({ userId: userStore.userInfo!.id })
  if (data.code === 200) {
    chatMessages.value = data.result.records.map((item) => {
      let reference
      try {
        reference = JSON.parse(item.reference)
      }
      catch {
        reference = []
      }

      return {
        ...item,
        reference,
      }
    })
    // 数据加载完成后滚动到底部
    await nextTick()
    scrollToBottom()
  }
})

// 暴露scrollToBottom函数供外部调用
defineExpose({
  scrollToBottom,
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
      <scroll-view
        ref="scrollViewRef"
        class="flex-1 h-full overflow-y-auto"
        :scroll-y="true"
        :scroll-top="scrollTop"
      >
        <messages :messages="chatMessages" />
      </scroll-view>
      <view class="px-32rpx">
        <converse />
      </view>
    </container>
  </view>
</template>

<style lang='css' scoped></style>
