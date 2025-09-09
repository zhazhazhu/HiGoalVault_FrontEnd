<script lang='ts' setup>
import { api } from '@/api'
import { useUserStore } from '~/store'

const { auth } = useUserStore()

async function getPhoneNumber(e) {
  const res = await uni.login()
  const data = await api.autoLoginByPhone({ code: res.code, phoneCode: e.detail.code })
  if (data.code === 200) {
    auth.value = data.result
  }
}

async function handleRefresh() {
  if (!auth.value?.refreshToken) {
    return
  }
  console.log(auth.value.refreshToken)

  const data = await api.refreshToken(auth.value.refreshToken)
  if (data.code === 200) {
    auth.value = data.result
  }
}
</script>

<template>
  <button open-type="getPhoneNumber" class="bg-amber" @getphonenumber="getPhoneNumber">
    手机号一键登录
  </button>

  <button @click="handleRefresh">
    刷新Token
  </button>
</template>

<style lang='css' scoped></style>
