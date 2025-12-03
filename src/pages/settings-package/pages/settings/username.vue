<script lang='ts' setup>
import { ref } from 'vue'
import { api } from '@/api'
import { useUserStore } from '@/store'

const user = useUserStore()
const userName = ref(user.userInfo?.nickName || '')

async function onConfirm(val: string) {
  if (val.trim() === '') {
    userName.value = user.userInfo?.nickName || ''
    uni.showToast({
      title: '昵称不能为空',
      icon: 'none',
    })
    return
  }
  else if (val.trim().length > 15) {
    uni.showToast({
      title: '昵称不能超过15个字符',
      icon: 'none',
    })
    return
  }
  else if (/[^\u4E00-\u9FA5\w-]/.test(val.trim())) {
    uni.showToast({
      title: '昵称只能包含中文、字母、数字、下划线和减号',
      icon: 'none',
    })
    return
  }
  else if (val.trim() === user.userInfo?.nickName) {
    uni.showToast({
      title: '昵称无变化',
      icon: 'none',
    })
    return
  }
  const res = await api.updateUserInfo({ nickName: val }).finally(() => {
  })
  if (res.code === 200) {
    userName.value = val
    user.userInfo!.nickName = val
    uni.showToast({
      title: '修改昵称成功',
      icon: 'none',
    })
  }
}
function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <view>
    <Navbar enable-left-slot title="修改用户名">
      <template #left>
        <view class="flex items-center gap-20rpx" @click="goBack">
          <view class="i-material-symbols-arrow-back-ios-new-rounded text-44rpx" />
        </view>
      </template>
    </Navbar>

    <Container custom-class="px-32rpx py-30px flex flex-col justify-between">
      <view class="w-full flex flex-col gap-10px">
        <wd-input
          v-model="userName"
          custom-class="hi-custom-input"
          no-border
          type="nickname"
          show-word-limit
          :autofocus="true"
          :maxlength="15"
          placeholder="请输入用户名..."
        />
        <text class="text-12px color-#a0a0a0">
          仅支持中英文、数字、下划线、减号，且长度不超过15个字符
        </text>
      </view>

      <wd-button type="primary" block :round="false" size="large" @click="onConfirm(userName)">
        提 交
      </wd-button>
    </Container>
  </view>
</template>

<style lang='css' scoped></style>
