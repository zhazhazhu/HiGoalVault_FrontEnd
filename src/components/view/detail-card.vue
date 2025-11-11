<script lang='ts' setup>
import type { PublishMessageListResponse } from '@/api'
import { watch } from 'vue'
import { api } from '@/api'
import { useUserStore } from '@/store'
import { formatCommentDate } from '@/utils'

const props = defineProps<{
  data: PublishMessageListResponse
}>()

const userStore = useUserStore()

async function checkFollowUser() {
  const res = await api.checkFollowUser(props.data!.memberId)
  if (res.code === 200) {
    props.data!.isFollowed = res.result
  }
}
async function onFollowUser(followAction: 'follow' | 'unfollow') {
  const res = await api.followUser({ followAction: followAction === 'follow', followeeId: props.data!.memberId, followerId: userStore.userInfo!.id })
  if (res.code === 200) {
    props.data!.isFollowed = followAction === 'follow'
  }
}
function onClickTag({ id }: { id: string }) {
  uni.navigateTo({ url: `/tag-package/pages/tag/index?id=${id}` })
}
function gotoUser() {
  uni.navigateTo({ url: `/user-package/pages/user/index?id=${props.data!.memberId}` })
}

watch(() => props.data, () => {
  checkFollowUser()
}, { immediate: true })
</script>

<template>
  <view class="flex flex-col p-32rpx gap-20rpx">
    <view class="flex items-center justify-between text-26rpx color-#8E8E93">
      <view class="flex items-center" @click="gotoUser">
        <wd-img width="40px" height="40px" round mode="aspectFill" :src="data?.face" />
        <view class="ml-6px font-400">
          <view class="color-#5E5C66 text-14px">
            {{ data?.nickName }}
          </view>
          <view class="color-#ABABAB text-12px">
            {{ formatCommentDate(data?.createTime) }}
          </view>
        </view>
      </view>

      <template v-if="data?.memberId !== userStore.userInfo?.id">
        <wd-button v-if="!data?.isFollowed" size="small" :round="false" @click="onFollowUser('follow')">
          <view class="flex items-center">
            <view class="i-material-symbols-add text-14px" />
            关注
          </view>
        </wd-button>
        <wd-button v-else size="small" type="info" :round="false" @click="onFollowUser('unfollow')">
          已关注
        </wd-button>
      </template>
    </view>

    <view class="text-15px color-#2F2E33 word-wrap font-500">
      <text>{{ data?.content }}</text>
    </view>

    <view class="flex flex-wrap gap-20rpx">
      <Tag v-for="item in data?.tags" :key="item.id" :active="item.followStatus" @tap.stop="onClickTag(item)">
        #{{ item.tagName }}
      </Tag>
    </view>
  </view>
</template>

<style lang='css' scoped></style>
