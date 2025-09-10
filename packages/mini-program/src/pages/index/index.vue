<script setup lang="ts">
import type { NavbarInstance } from '@/components/navbar'
import { ref, watch } from 'vue'

const show = ref(false)
const navbarInstance = ref<NavbarInstance>()

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
    <navbar ref="navbarInstance" title="首页">
      <template #left>
        <wd-icon name="arrow-left" />
      </template>
    </navbar>

    <wd-button @click="handleClick">
      Login
    </wd-button>

    <login-popup v-model="show" />
  </view>
</template>

<style lang="scss">
</style>
