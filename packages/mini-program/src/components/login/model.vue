<script lang='ts' setup>
import { api } from '@/api'
import { useUserStore } from '~/store'

const model = defineModel({ type: Boolean, default: false })

function close() {
  model.value = false
}

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
  <wd-action-sheet v-model="model" title="请阅读并勾选下方协议" @close="close">
    <view class="flex flex-col gap-4 h-800rpx">
      <wd-button open-type="getPhoneNumber" class="bg-amber" @getphonenumber="getPhoneNumber">
        手机号一键登录
      </wd-button>

      <wd-button @click="handleRefresh">
        刷新Token
      </wd-button>
    </view>
  </wd-action-sheet>
</template>

<style lang='css' scoped></style>
