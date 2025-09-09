<script setup lang="ts">
import { ref } from 'vue'

const show = ref(false)

function handleClick() {
  show.value = !show.value
}
</script>

<template>
  <view>
    <wd-button :round="false" @click="handleClick">
      Login
    </wd-button>

    <login-model v-model="show" />
  </view>
</template>

<style lang="css">
</style>
