<script setup lang="ts">
import type { NavbarInstance } from '@/components/navbar'
import { ref, watch } from 'vue'
import { useUserStore } from '@/store'

const show = ref(false)
const navbarInstance = ref<NavbarInstance>()
const { isLogin } = useUserStore()

watch(show, (show) => {
  if (show) {
    navbarInstance.value?.changeBgColor('#FF3B30')
  }
  else {
    navbarInstance.value?.changeBgColor('#FFFFFF')
  }
})

function handleClick() {
  show.value = !show.value
}
</script>

<template>
  <view>
    <login-popup v-model="show" />

    <navbar ref="navbarInstance">
      <template #left>
        <view v-if="isLogin" class="i-uil-list-ul text-50rpx" />
        <view v-else class="flex items-center color-#3e3e3e" @click="handleClick">
          <view class="i-uil-user text-46rpx mr-6rpx" />
          <text class="text-24rpx" user-select="false">
            未登录
          </text>
        </view>
      </template>
    </navbar>

    <container>
      <tabs>
        <tabs-item :name="0" label="发现">
          发现
        </tabs-item>
        <tabs-item :name="1" label="关注">
          关注
        </tabs-item>
      </tabs>
    </container>
  </view>
</template>

<style lang="scss">
</style>
