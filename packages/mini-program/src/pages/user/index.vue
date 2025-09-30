<script lang='ts' setup>
import type { AnswerBefore, Page, ProfileStatistics, PublishMessageListResponse, UserInfo } from '@/api'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { useClassesName } from '@higoal/hooks'
import { ref, watch } from 'vue'
import { api, Truth } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { useUserStore } from '@/store'
import MessageList from './message-list.vue'

const cs = useClassesName('user')
const userStore = useUserStore()
const activeTab = ref<'published' | 'commented' | 'interacted'>('published')
const data = ref<ProfileStatistics>({} as ProfileStatistics)
const publishList = ref<PublishMessageListResponse[]>([])
const commentedContentList = ref<PublishMessageListResponse[]>([])
const isLoading = ref(false)
const isFinish = ref(false)
const [page, resetPage] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 10,
})
const interactActiveTab = ref<'liked' | 'collected'>('liked')
const interactedLikedContent = ref<{ total: number, data: PublishMessageListResponse[] }>({
  total: 0,
  data: [],
})
const interactedCollectedContent = ref<{ total: number, data: AnswerBefore[] }>({
  total: 0,
  data: [],
})
const userId = ref<string>('')
const isFollowed = ref(false)
const userInfo = ref<UserInfo | null>(null)

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
function resetData() {
  resetPage()
  publishList.value = []
  commentedContentList.value = []
  interactedLikedContent.value = {
    total: 0,
    data: [],
  }
  interactedCollectedContent.value = {
    total: 0,
    data: [],
  }
}

watch(() => activeTab.value, () => {
  resetData()
  getListData()
})

async function getListData() {
  switch (activeTab.value) {
    case 'published':
      getPublishList()
      break
    case 'commented':
      getCommentedContentList()
      break
    case 'interacted':
      getInteractedLikedContentList()
      getInteractedCollectedContentList()
      break
  }
}

function loadData() {
  if (isLoading.value || isFinish.value)
    return
  isLoading.value = true
  page.value.pageNumber!++
  getListData()
}

async function getPublishList() {
  isLoading.value = true
  const res = await api.getPublishList({
    authorId: userId.value || userStore.userInfo!.id,
    ...page.value,
  })
  if (res.code === 200) {
    publishList.value.push(...res.result.records)
    isLoading.value = false
    isFinish.value = res.result.records.length <= res.result.size
  }
}

async function getCommentedContentList() {
  isLoading.value = true
  const res = await api.getCommentedContentList({
    ...page.value,
  })
  if (res.code === 200) {
    commentedContentList.value.push(...res.result.records)
    isLoading.value = false
    isFinish.value = res.result.records.length <= res.result.size
  }
}
async function getInteractedLikedContentList() {
  isLoading.value = true
  const res = await api.getInteractedLikedContentList({
    ...page.value,
  })
  if (res.code === 200) {
    interactedLikedContent.value = {
      total: res.result.total,
      data: [...interactedLikedContent.value.data, ...res.result.records],
    }
    isLoading.value = false
    isFinish.value = res.result.records.length <= res.result.size
  }
}
async function getInteractedCollectedContentList() {
  isLoading.value = true
  const res = await api.getInteractedCollectedContentList({
    ...page.value,
    userId: userStore.userInfo!.id,
  })
  if (res.code === 200) {
    interactedCollectedContent.value = {
      total: res.result.total,
      data: [...interactedCollectedContent.value.data, ...res.result.records].map(item => ({ ...item, isCollect: Truth.TRUE })),
    }
    isLoading.value = false
    isFinish.value = res.result.records.length <= res.result.size
  }
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
  userId.value = options?.id
  checkFollowUser()
  getData()
  getListData()
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
      class="px-32rpx pt-32rpx bg-[var(--hi-bg-color)] h-[calc(100vh-110px)] [scrollbar-width:none] box-border"
      scroll-y
      enhanced
      :show-scrollbar="false"
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
            <ViewList :data="publishList" :is-loading="isLoading" :is-finish="isFinish" @load="loadData" />
          </tabs-item>
          <tabs-item v-if="!userId" name="commented" label="评论过">
            <ViewList :data="commentedContentList" :is-loading="isLoading" :is-finish="isFinish" @load="loadData" />
          </tabs-item>
          <tabs-item v-if="!userId" name="interacted" label="互动过">
            <view>
              <view class="flex flex-wrap gap-12rpx mb-20rpx">
                <Tag type="warning" :active="interactActiveTab === 'liked'" @tap="onClickInteractTab('liked')">
                  赞过{{ interactedLikedContent.total }}
                </Tag>
                <Tag type="warning" :active="interactActiveTab === 'collected'" @tap="onClickInteractTab('collected')">
                  收藏{{ interactedCollectedContent.total }}
                </Tag>
              </view>

              <ViewList v-if="interactActiveTab === 'liked'" :data="interactedLikedContent.data" :is-loading="isLoading" :is-finish="isFinish" @load="loadData" />
              <MessageList v-else v-model:data="interactedCollectedContent.data" :is-loading="isLoading" :is-finish="isFinish" @load="loadData" />
            </view>
          </tabs-item>
        </tabs>
      </view>
    </scroll-view>
  </view>
</template>

<style lang='scss' scoped></style>
