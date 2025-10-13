<script lang='ts' setup>
import type { ProfileStatistics, UserInfo } from '@/api'
import type { UserCollectInstance, UserCommentInstance, UserLikeInstance, UserPublishInstance } from '@/components/user'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { api } from '@/api'
import { useClassesName } from '@/composables'
import { useUserStore } from '@/store'

const cs = useClassesName('user')
const userStore = useUserStore()
const activeTab = ref<'published' | 'commented' | 'interacted'>('published')
const data = ref<ProfileStatistics>({} as ProfileStatistics)
const userId = ref<string>('')
const isFollowed = ref(false)
const userInfo = ref<UserInfo | null>(null)
const userPublish = ref<UserPublishInstance>()
const userComment = ref<UserCommentInstance>()
const userLike = ref<UserLikeInstance>()
const userCollect = ref<UserCollectInstance>()
const interactActiveTab = ref<'liked' | 'collected'>('liked')
const isRefreshing = ref(false)

async function getData() {
  if (userId.value) {
    const res = await api.getUserInfo(userId.value)
    if (res.code === 200) {
      userInfo.value = res.result
    }
  }
  else {
    userInfo.value = userStore.userInfo
  }
  const res2 = await api.getProfileStatistics(userId.value || userStore.userInfo!.id)
  if (res2.code === 200) {
    data.value = res2.result
  }
}

async function loadData() {
  switch (activeTab.value) {
    case 'published':
      userPublish.value?.loadData()
      break
    case 'commented':
      userComment.value?.loadData()
      break
    case 'interacted':
      userLike.value?.loadData()
      userCollect.value?.loadData()
      break
  }
}
async function refreshData() {
  isRefreshing.value = true
  await getData()
  await userPublish.value?.refreshData()
  await userComment.value?.refreshData()
  await userLike.value?.refreshData()
  await userCollect.value?.refreshData()
  isRefreshing.value = false
}
function onClickInteractTab(tab: 'liked' | 'collected') {
  interactActiveTab.value = tab
}

function gotoHome() {
  uni.navigateBack()
}
async function checkFollowUser() {
  if (!userId.value)
    return
  const res = await api.checkFollowUser(userId.value)
  if (res.code === 200) {
    isFollowed.value = res.result
  }
}
async function onFollowUser(followAction: 'follow' | 'unfollow') {
  const res = await api.followUser({ followAction: followAction === 'follow', followeeId: userId.value, followerId: userStore.userInfo!.id })
  if (res.code === 200) {
    isFollowed.value = followAction === 'follow'
  }
}
function gotoSearch() {
  uni.navigateTo({ url: `/pages/search/index?userId=${userId.value}` })
}
function gotoMessage() {
  uni.navigateTo({ url: '/pages/user/message' })
}

onShareAppMessage(({ target, from }) => {
  if (from === 'button') {
    return {
      title: '快来看看我聊了啥～',
      path: `/pages/chat/index?id=${target.dataset.id}`,
    }
  }
  else {
    return {
      title: '快来看看我聊了啥～',
      path: '/pages/chat/index',
    }
  }
})

onLoad((options) => {
  if (options?.id !== userStore.userInfo!.id) {
    userId.value = options?.id
  }
  checkFollowUser()
  getData()
})
</script>

<template>
  <view>
    <Navbar enable-left-slot>
      <template #left>
        <view class="flex items-center gap-20rpx" @click="gotoHome">
          <view class="i-material-symbols-arrow-back-ios-new-rounded text-44rpx" />
          <!-- <view class="i-material-symbols-home-outline-rounded text-46rpx" /> -->
        </view>
      </template>
    </Navbar>

    <scroll-view
      class="p-32rpx bg-[var(--hi-bg-color)] h-[calc(100vh-80px)] box-border"
      scroll-y
      enhanced
      :show-scrollbar="false"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @scrolltolower="loadData"
      @refresherrefresh="refreshData"
    >
      <view class="flex items-center justify-between gap-20rpx">
        <view class="flex items-center gap-10rpx">
          <wd-img :src="userInfo?.face" round :width="60" :height="60" mode="aspectFill" />
          <view class="text-35rpx font-bold ml-10rpx">
            {{ userInfo?.nickName }}
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
              <view class="user-search-icon" @click="gotoSearch" />
              <view v-if="!userId" class="user-message-icon" @click="gotoMessage" />
              <template v-else>
                <wd-button v-if="!isFollowed" icon="add" size="small" @click="onFollowUser('follow')">
                  关注
                </wd-button>
                <wd-button v-else plain size="small" @click="onFollowUser('unfollow')">
                  取消关注
                </wd-button>
              </template>
            </view>
          </template>
          <tabs-item name="published" :label="`发布${data?.contentCount || 0}`">
            <UserPublish ref="userPublish" :user-id="userId" />
          </tabs-item>
          <tabs-item v-if="!userId" name="commented" label="评论过">
            <UserComment ref="userComment" :user-id="userId" />
          </tabs-item>
          <tabs-item v-if="!userId" name="interacted" label="互动过">
            <view>
              <view class="flex flex-wrap gap-12rpx mb-20rpx">
                <Tag type="warning" :active="interactActiveTab === 'liked'" @tap="onClickInteractTab('liked')">
                  赞过{{ userLike?.total }}
                </Tag>
                <Tag type="warning" :active="interactActiveTab === 'collected'" @tap="onClickInteractTab('collected')">
                  收藏{{ userCollect?.total }}
                </Tag>
              </view>

              <UserLike v-show="interactActiveTab === 'liked'" ref="userLike" />
              <UserCollect v-show="interactActiveTab === 'collected'" ref="userCollect" />
            </view>
          </tabs-item>
        </tabs>
      </view>
    </scroll-view>
  </view>
</template>

<style lang='scss' scoped></style>
