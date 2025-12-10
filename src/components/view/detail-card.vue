<script lang='ts' setup>
import type { PublishMessageListResponse } from '@/api'
import { ref, watch } from 'vue'
import { api } from '@/api'
import { useUserStore } from '@/store'
import { formatCommentDate } from '@/utils'

const props = defineProps<{
  data: PublishMessageListResponse
}>()

const userStore = useUserStore()
const showOption = ref(false)

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
  uni.navigateTo({ url: `/pages/tag-package/pages/tag/index?id=${id}` })
}
function gotoUser() {
  uni.navigateTo({ url: `/pages/user-package/pages/user/index?id=${props.data!.memberId}` })
}
function handleShare() {
  showOption.value = false
}
function gotoReport() {
  uni.navigateTo({ url: `/pages/report-package/pages/index?type=content&sourceId=${props.data!.id}` })
}

watch(() => props.data, () => {
  checkFollowUser()
}, { immediate: true })
</script>

<template>
  <wd-root-portal>
    <wd-popup v-model="showOption" position="bottom" custom-class="rounded-t-32px">
      <view class="p-20px pb-40px">
        <button open-type="share" class="cell-item" @click="handleShare">
          <view class="wechat-icon icon" />
          <text>分享</text>
        </button>
        <view class="cell-item warning" @click="gotoReport">
          <view class="i-ic-baseline-warning-amber icon" />
          <text>举报内容</text>
        </view>
      </view>
    </wd-popup>
  </wd-root-portal>
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

      <view class="flex gap-10px">
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
        <wd-button size="small" type="info" :round="false" @click="showOption = true">
          <view class="i-ri-more-fill text-14px" />
        </wd-button>
      </view>
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

<style lang='scss' scoped>
.cell-item {
  background-color: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 14px;
  &::after {
    display: none;
  }
  &.warning {
    color: #ff4d4f;
  }
  .icon {
    font-size: 18px;
    width: 18px;
    height: 18px;
  }
  text {
    font-size: 14px;
  }
}
</style>
