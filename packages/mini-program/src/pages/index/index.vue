<script setup lang="ts">
import type { NavbarInstance } from '@/components/navbar'
import { useClassesName } from '@higoal/hooks'
import { ref, watch } from 'vue'
import { useUserStore } from '@/store'
import ViewList from './components/ViewList.vue'

const show = ref(false)
const navbarInstance = ref<NavbarInstance>()
const { isLogin } = useUserStore()
const cs = useClassesName('home')

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

    <navbar ref="navbarInstance" bg-color="#F3F3F3">
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

    <tabs :custom-nav-class="cs.m('tab-nav')">
      <template #navRight>
        <wd-input type="text" placeholder="A股又崩了" prefix-icon="search" no-border custom-class="w-420rpx rounded-42px px-10px py-4px" />
      </template>

      <tabs-item :name="0" label="发现">
        <ViewList />
      </tabs-item>
      <tabs-item :name="1" label="关注">
        关注
      </tabs-item>
    </tabs>
  </view>
</template>

<style lang="scss">
.hi-home--tab-nav {
  background-color: #f3f3f3;
}
</style>
