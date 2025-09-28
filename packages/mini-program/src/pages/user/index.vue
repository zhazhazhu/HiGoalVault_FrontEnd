<script lang='ts' setup>
import type { ProfileStatistics, PublishMessageListResponse } from '@/api'
import { useClassesName } from '@higoal/hooks'
import { onMounted, ref, watch } from 'vue'
import { api } from '@/api'
import { useUserStore } from '@/store'

const cs = useClassesName('user')
const userStore = useUserStore()
const activeTab = ref('publish')
const data = ref<ProfileStatistics>({} as ProfileStatistics)
const publishList = ref<PublishMessageListResponse[]>([])
const isLoading = ref(false)
const isFinish = ref(false)

async function getData() {
  const res = await api.getProfileStatistics(userStore.userInfo!.id)
  if (res.code === 200) {
    data.value = res.result
  }
}

watch(() => activeTab.value, (val) => {
  switch (val) {
    case 'publish':
      getPublishList()
      break
    case 'like':
      break
  }
}, { immediate: true })

async function getPublishList() {
  isLoading.value = true
  const res = await api.getPublishList({
    authorId: userStore.userInfo!.id,
  })
  if (res.code === 200) {
    publishList.value = res.result.records
    isLoading.value = false
    isFinish.value = res.result.records.length <= res.result.size
  }
}

function gotoHome() {
  uni.redirectTo({ url: '/pages/index/index' })
}

onMounted(() => {
  getData()
})
</script>

<template>
  <view>
    <Navbar enable-left-slot>
      <template #left>
        <view class="flex items-center gap-20rpx" @click="gotoHome">
          <wd-icon name="thin-arrow-left" size="16px" />
          <wd-icon name="home" size="22px" />
        </view>
      </template>
    </Navbar>

    <scroll-view
      class="px-32rpx pt-32rpx bg-[var(--hi-bg-color)] h-[calc(100vh-100px)] overflow-y-auto box-border"
      scroll-y
      enhanced
      :show-scrollbar="false"
    >
      <view class="flex items-center justify-between gap-20rpx">
        <view class="flex items-center gap-10rpx">
          <wd-img :src="userStore.userInfo!.face" round :width="60" :height="60" mode="aspectFill" />
          <view class="text-35rpx font-bold ml-10rpx">
            {{ userStore.userInfo!.nickName }}
          </view>
        </view>

        <view class="flex items-center gap-20rpx font-500">
          <view class="flex flex-col items-center justify-center gap-5rpx">
            <view class="text-32rpx">
              {{ data?.totalLikeCount || 0 }}
            </view>
            <view class="color-#666 text-24rpx">
              获赞
            </view>
          </view>

          <wd-divider vertical custom-style="--wot-divider-vertical-height: 36px" />

          <view class="flex flex-col items-center justify-center gap-5rpx">
            <view class="text-32rpx">
              {{ data?.followerCount || 0 }}
            </view>
            <view class="color-#666 text-24rpx">
              粉丝
            </view>
          </view>
        </view>
      </view>

      <view class="pt-45rpx">
        <tabs
          v-model="activeTab"
          class="overflow-hidden"
          custom-content-class="mt-10px"
          editable
          :custom-class="cs.m('tabs')"
          :custom-nav-class="cs.m('tab-nav')"
        >
          <template #edit>
            <view class="flex items-center gap-30rpx">
              <view class="user-search-icon" />
              <view class="user-message-icon" />
            </view>
          </template>
          <tabs-item name="publish" :label="`发布${data?.contentCount || 0}`">
            <ViewList :data="publishList" :is-loading="isLoading" :is-finish="isFinish" />
          </tabs-item>
          <tabs-item name="comment" label="评论过">
            评论过
          </tabs-item>
          <tabs-item name="interact" label="互动过">
            互动过
          </tabs-item>
        </tabs>
      </view>
    </scroll-view>
  </view>
</template>

<style lang='css' scoped></style>
