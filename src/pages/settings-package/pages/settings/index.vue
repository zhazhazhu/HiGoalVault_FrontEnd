<script lang='ts' setup>
import type { DatetimePickerInstance } from 'wot-design-uni/components/wd-datetime-picker/types'
import dayjs from 'dayjs'
import { ref } from 'vue'
import { useMessage } from 'wot-design-uni'
import { api } from '@/api'
import { useClassesName } from '@/composables'
import { useUserStore } from '@/store'

const user = useUserStore()
const cs = useClassesName('settings')
const message = useMessage()
const showSexOptions = ref(false)
const actions = [
  { name: '男', value: 1, icon: 'i-material-symbols-male' },
  { name: '女', value: 0, icon: 'i-material-symbols-female' },
]
const datePickerInstance = ref<DatetimePickerInstance>()
const birthday = ref(dayjs(user.userInfo?.birthday || '').valueOf())

function gotoHome() {
  uni.navigateBack()
}
function onLogout() {
  message
    .confirm({
      msg: '提示',
      title: '确认退出吗?',
    })
    .then(() => {
      user.logout()
      uni.reLaunch({ url: '/pages/index/index' })
    })
    .catch(() => {
    })
}
function openPrivacyPolicy() {
  uni.openPrivacyContract({
    success: (res) => {
      console.log('openPrivacyContract success', res)
    },
    fail: (err) => {
      console.log('openPrivacyContract fail', err)
    },
  })
}
async function onChooseAvatar(e) {
  const avatarUrl = e.detail.avatarUrl
  uni.uploadFile({
    url: api.getUploadUrl(),
    filePath: avatarUrl,
    name: 'file',
    header: {
      'Content-Type': 'multipart/form-data',
      'AccessToken': user.accessToken,
    },
    success: async (res) => {
      const data = JSON.parse(res.data)
      if (data.code === 200) {
        const res2 = await api.updateUserInfo({ face: data.result.originalUrl })
        if (res2.code === 200) {
          user.userInfo!.face = data.result.url
          uni.showToast({
            title: '上传头像成功',
            icon: 'none',
          })
        }
      }
      else {
        uni.showToast({
          title: '上传头像失败',
          icon: 'none',
        })
      }
    },
  })
}
function gotoChangeUsername() {
  uni.navigateTo({ url: '/pages/settings-package/pages/settings/username' })
}
async function handleSexSelect({ item }) {
  showSexOptions.value = false
  const res = await api.updateUserInfo({ sex: item.value })
  if (res.code === 200) {
    user.userInfo!.sex = item.value
    uni.showToast({
      title: '修改性别成功',
      icon: 'none',
    })
  }
}
function handleConfirmBirthday({ value }) {
  api.updateUserInfo({ birthday: dayjs(value).format('YYYY-MM-DD') }).then((res) => {
    if (res.code === 200) {
      user.userInfo!.birthday = dayjs(value).format('YYYY-MM-DD')
      uni.showToast({
        title: '修改生日成功',
        icon: 'none',
      })
    }
  })
}
</script>

<template>
  <wd-root-portal>
    <wd-message-box />
    <wd-popup v-model="showSexOptions" custom-class="rounded-t-32rpx" position="bottom">
      <view class="p-20px pb-40px">
        <view
          v-for="(action, index) in actions"
          :key="index"
          class="py-15px text-center text-28rpx color-#333 border-b border-#e5e5e5 last:border-0 flex items-center justify-center gap-10rpx"
          @click="handleSexSelect({ item: action })"
        >
          <view :class="[action.icon, action.value === 0 ? 'color-rose' : 'color-blue']" class="text-20px" />
          <view>{{ action.name }}</view>
        </view>
      </view>
    </wd-popup>
    <wd-datetime-picker ref="datePickerInstance" v-model="birthday" type="date" :with-cell="false" :min-date="dayjs('1900-1-1').valueOf()" @confirm="handleConfirmBirthday" />
  </wd-root-portal>
  <view>
    <Navbar enable-left-slot title="个人信息">
      <template #left>
        <view class="flex items-center gap-20rpx" @click="gotoHome">
          <view class="i-material-symbols-arrow-back-ios-new-rounded text-44rpx" />
        </view>
      </template>
    </Navbar>

    <Container custom-class="px-32rpx flex flex-col">
      <scroll-view
        scroll-y
        enhanced
        :show-scrollbar="false"
        class="h-full overflow-y-auto pb-20px"
      >
        <view class="flex items-center flex-col mb-10px">
          <button :class="cs.m('icon-btn')" open-type="chooseAvatar" class="relative w-100px h-100px" @chooseavatar="onChooseAvatar">
            <wd-img round mode="aspectFill" :src="user.userInfo?.face" width="100px" height="100px" />
            <view class="absolute bottom-0 right-0 rounded-full bg-#007eff w-24px h-24px flex items-center justify-center">
              <view class="i-material-symbols-android-camera text-14px color-white" />
            </view>
          </button>
          <text class="text-12px color-#989898 my-10px">
            点击更换头像
          </text>
        <!-- <view class="flex items-center">
          <view class=" mt-20rpx flex items-center gap-10rpx">
            <wd-input v-if="isUpdateNickname" v-model="userName" custom-class="hi-custom-input" :focus="isUpdateNickname" no-border :autofocus="true" type="nickname" confirm-type="done" @update:model-value="onConfirm(userName)" @blur="onConfirm(userName)" />
            <view v-else class="color-#333 text-32rpx font-bold" @click="onUpdateNickname">
              {{ userName }}
            </view>
            <view v-if="!isUpdateNickname" class="i-tabler-pencil-minus color-#333 text-36rpx" @click="onUpdateNickname" />
          </view>
        </view> -->
        </view>

        <view class="text-12px color-#989898 my-10px mx-20px">
          基本信息
        </view>
        <view class="flex flex-col px-24px rounded-20rpx bg-white">
          <view :class="cs.m('btn')" @click="gotoChangeUsername">
            <view>用户名</view>
            <view class="flex items-center gap-6px">
              <view>{{ user.userInfo?.nickName }}</view>
              <view class="i-material-symbols-arrow-forward-ios-rounded color-gray-4" />
            </view>
          </view>
          <view :class="cs.m('btn')" class="disabled">
            <view>手机号</view>
            <view class="value">
              {{ user.userInfo?.mobile }}
            </view>
          </view>
          <view :class="cs.m('btn')" class="disabled">
            <view>UID</view>
            <view class="value">
              {{ user.userInfo?.userUid }}
            </view>
          </view>
          <view :class="cs.m('btn')" @click="showSexOptions = true">
            <view>性别</view>
            <view class="flex items-center gap-6px">
              <view>{{ user.userInfo?.sex === 0 ? '女' : '男' }}</view>
              <view class="i-material-symbols-arrow-forward-ios-rounded color-gray-4" />
            </view>
          </view>
          <view :class="cs.m('btn')" @click="datePickerInstance?.open()">
            <view>生日</view>
            <view class="flex items-center gap-6px">
              <view>{{ user.userInfo?.birthday || '-' }}</view>
              <view class="i-material-symbols-arrow-forward-ios-rounded color-gray-4" />
            </view>
          </view>
          <view :class="cs.m('btn')" class="disabled">
            <view>注册时间</view>
            <view class="value">
              {{ dayjs(user.userInfo?.createTime).format('YYYY-MM-DD') }}
            </view>
          </view>
        </view>

        <view class="flex flex-col px-24px rounded-20rpx bg-white mt-10px">
          <button open-type="contact" :class="cs.m('btn')">
            联系我们
            <view class="i-material-symbols-arrow-forward-ios-rounded color-gray-4" />
          </button>
          <button :class="cs.m('btn')" @click="openPrivacyPolicy">
            隐私协议
            <view class="i-material-symbols-arrow-forward-ios-rounded color-gray-4" />
          </button>
          <button open-type="feedback" :class="cs.m('btn')">
            投诉建议
            <view class="i-material-symbols-arrow-forward-ios-rounded color-gray-4" />
          </button>
        </view>

        <view class="mt-10px">
          <wd-button type="info" block :round="false" size="large" @click="onLogout">
            退出登录
          </wd-button>
        </view>
      </scroll-view>
    </Container>
  </view>
</template>

<style lang='scss' scoped>
.hi-settings--btn {
  border-radius: 0;
  padding: 22rpx 20rpx;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  background-color: transparent;
  font-size: 26rpx;
  color: var(--hi-h2-color);
  height: 50px;
  &::after {
    display: none;
  }
  & + & {
    border-top: 1px solid #e5e5e5;
  }
  &.disabled .value {
    pointer-events: none;
    color: #999;
  }
}
.hi-settings--icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  &::after {
    display: none;
  }
}
</style>
