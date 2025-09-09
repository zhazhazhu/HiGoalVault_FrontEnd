<script setup lang="ts">
import { ref } from 'vue'

const show = ref(false)

function handleClick() {
  show.value = !show.value
}
</script>

<template>
  <view>
    <wd-button @click="handleClick">
      Login
    </wd-button>

    <login-popup v-model="show" />
  </view>
</template>

<style lang="scss">
</style>
