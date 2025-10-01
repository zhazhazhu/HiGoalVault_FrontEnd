<script lang='ts' setup>
import type { PublishMessageListRequest, PublishMessageListResponse, Tag } from '@/api'
import { onLoad } from '@dcloudio/uni-app'
import { useClassesName } from '@higoal/hooks'
import { ref } from 'vue'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'
import { TagType } from '.'

const cs = useClassesName('tag-detail')
const tag = ref<Tag>()
const [params] = useResetRef<PublishMessageListRequest>({
  pageNumber: 1,
  pageSize: 10,
  tagId: '',
})
const data = ref<PublishMessageListResponse[]>([])
const isLoading = ref(false)
const isFinish = ref(false)
const activeTab = ref(TagType.synthesis)
const checkFollowTag = ref(false)

async function getTag(id: string) {
  const res = await api.getTagById(id)
  if (res.code === 200) {
    tag.value = res.result
  }
  const res2 = await api.checkTagFollow(id)
  if (res2.code === 200) {
    checkFollowTag.value = res2.result
  }
}
async function getData() {
  const res = await api.getPublishMessageList(params.value).finally(() => {
    isLoading.value = false
  })
  if (res.code === 200) {
    data.value.push(...res.result.records)
    isFinish.value = res.result.total <= data.value.length
  }
}
function load() {
  if (isLoading.value || isFinish.value)
    return
  isLoading.value = true
  params.value.pageNumber!++
  getData()
}
async function followTag(action: boolean) {
  checkFollowTag.value = action
  const res = await api.followTag({ tagId: params.value.tagId!, followAction: action })
  if (res.code !== 200) {
    checkFollowTag.value = !action
    uni.showToast({ title: res.message, icon: 'none' })
  }
}

function gotoBack() {
  uni.navigateBack()
}

onLoad((option) => {
  if (!option?.id)
    return

  params.value.tagId = option.id
  getTag(option.id)
  getData()
})
</script>

<template>
  <view>
    <Navbar>
      <template #left>
        <view class="flex items-center gap-20rpx" @click="gotoBack">
          <view class="i-material-symbols-arrow-back-ios-new-rounded text-44rpx" />
        </view>
      </template>
    </Navbar>

    <scroll-view
      scroll-into-view-alignment="end"
      enhanced
      enable-passive
      scroll-y
      class="h-[calc(100vh-100px)] bg-[var(--hi-bg-color)] px-32rpx py-20rpx box-border"
      :lower-threshold="50"
      :show-scrollbar="false"
      @scrolltolower="load"
    >
      <view class="flex items-start justify-between">
        <view>
          <view class="text-36rpx font-500 color-#333">
            # {{ tag?.tagName }}
          </view>
          <view class="text-22rpx color-#666 font-500 mt-10rpx">
            {{ tag?.useCount }}个讨论
          </view>
        </view>

        <wd-button v-if="checkFollowTag" type="primary" plain size="small" @click="followTag(false)">
          取消关注
        </wd-button>
        <wd-button v-else type="primary" icon="add" size="small" @click="followTag(true)">
          关注
        </wd-button>
      </view>

      <view class="flex items-center gap-50rpx mt-40rpx">
        <view v-for="item, key in TagType" :key="key" class="text-28rpx font-500 color-#909090" :class="[activeTab === item && 'color-#333']">
          {{ item }}
        </view>
      </view>

      <view v-for="item, index in data" :id="`view-${item.id}`" :key="item.id" class="my-30rpx">
        <ViewCard :data="item" @update:data="(newData) => data[index] = newData" />
      </view>

      <view v-show="isLoading || isFinish" class="flex items-center justify-center py-20rpx loading-wrapper" :class="cs.m('loading')">
        <wd-loading v-if="!isFinish" color="#FC6146FF" :size="20" />
        <text class="ml-20rpx text-24rpx">
          {{ isFinish ? '没有更多了' : '加载中...' }}
        </text>
      </view>
    </scroll-view>
  </view>
</template>

<style lang='css' scoped></style>
