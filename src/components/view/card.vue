<script lang='ts' setup>
import type { AfterPublishMessageListResponse } from '@/api'
import { computed } from 'vue'
import { useMessage } from 'wot-design-uni'
import { api } from '@/api'
import { useClassesName, useIntersectionObserver, useUUID } from '@/composables'
import Stock from '@/echarts/components/stock.vue?async'
import { renderMarkdown } from '@/modules'
import { useGlobalStore, useUserStore } from '@/store'
import { formatCommentDate, formatCommentOrThumbUpCount } from '@/utils'

const props = defineProps<{
  disableToUser?: boolean
  enableDelete?: boolean
}>()

const emit = defineEmits<{
  (e: 'delete', id: string): void
}>()

const cs = useClassesName('view-card')
const data = defineModel('data', { type: Object as () => AfterPublishMessageListResponse, required: true })
const globalStore = useGlobalStore()
const userStore = useUserStore()
const message = useMessage()
const responseContent = computed(() => renderMarkdown(`${data.value.chatQueryAnswerVO?.response?.substring(0, 200) || ''}...`))
const parseSectionId = `view-card-parse-${useUUID(32)}-${data.value.id}`
const visible = useIntersectionObserver(`#${parseSectionId}`)

async function onThumbsUp() {
  if (!userStore.isLogin) {
    globalStore.showLoginPopup = true
    return
  }
  const res = await api.thumbsUp({
    contentId: data.value.id,
    likeAction: !data.value.isLike,
  })
  if (res.code === 200) {
    data.value.isLike = !data.value.isLike
    data.value.likeCount = data.value.isLike ? data.value.likeCount + 1 : data.value.likeCount - 1
  }
}
function gotoUser() {
  if (props.disableToUser) {
    return
  }
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage.route !== 'user-package/pages/user/index') {
    uni.navigateTo({ url: `/user-package/pages/user/index?id=${data.value.memberId}` })
  }
}
function onClickTag({ id }: { id: string }) {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const currentPageId = (currentPage as any)?.options?.id
  if (id === currentPageId) {
    return
  }
  if (currentPage.route === 'tag-package/pages/tag/index') {
    uni.redirectTo({ url: `/tag-package/pages/tag/index?id=${id}` })
  }
  uni.navigateTo({ url: `/tag-package/pages/tag/index?id=${id}` })
}
function onDelete() {
  message.confirm({
    msg: '删除之后将无法恢复',
    title: '提示',
  }).then(async () => {
    const res = await api.deletePublishContentById(data.value.id)
    if (res.code === 200) {
      globalStore.shouldReloadAtHomePage = true
      emit('delete', data.value.id)
      uni.showToast({
        title: '删除成功',
        icon: 'none',
      })
    }
  })
}
</script>

<template>
  <wd-root-portal>
    <wd-message-box />
  </wd-root-portal>

  <view :class="cs.m('container')">
    <view class="flex items-center justify-between text-26rpx color-#8E8E93">
      <view class="flex items-center" @click.stop="gotoUser">
        <wd-img width="40rpx" height="40rpx" round mode="aspectFill" :src="data.face" />
        <text class="ml-16rpx color-#585858">
          {{ data.nickName }}
        </text>
      </view>

      <view class="flex items-center gap-16rpx">
        <view>{{ formatCommentDate(data.createTime) }}</view>
        <view v-if="enableDelete" class="flex items-center justify-center color-#ff756d w-30px h-24px bg-#fff0f0 rounded-4px" @click.stop="onDelete">
          <view class="i-material-symbols-delete-outline-rounded text-30rpx" />
        </view>
      </view>
    </view>

    <view :class="cs.m('content')">
      <view class="text-15px color-#2F2E33 word-wrap font-500">
        {{ data.content }}
      </view>
    </view>

    <view class="bg-#F5F7F9 p-15px rounded-10px relative min-h-130px">
      <view class="absolute z-99 top-0 left-0 w-full h-full flex items-end justify-center">
        <view class="flex items-center justify-between b-1 b-solid b-#D9D9D9 rounded-8px p-6px bg-#fff w-94% h-42px mb-16px shadow-button">
          <view class="text-14px flex items-center">
            <view class="star-info-icon mr-3px size-40rpx" />
            <text>智能投资助</text>
            <text class="color-#4362FF">
              手建议
            </text>
          </view>
          <view class="text-13px color-#4362FF flex items-center">
            <text>查看完整内容</text>
            <view class="i-material-symbols-arrow-forward-ios-rounded" />
          </view>
        </view>
      </view>
      <view>
        <wd-text :text="data.title" color="#121212" size="32rpx" bold />
        <!-- <view class="text-24rpx color-#696969 py-10rpx">
          {{ data.chatQueryAnswerVO?.summary }}
        </view> -->
      </view>

      <view :id="parseSectionId" class="min-h-20px">
        <template v-if="visible">
          <Stock v-if="data.chatQueryAnswerVO?.stockParameter?.code" :data="data.chatQueryAnswerVO?.stockData?.[0]?.data" :params="data.chatQueryAnswerVO?.stockParameter" preview />
          <UvParse v-else class="markdown-body" :class="cs.e('rich-text')" :content="responseContent" />
        </template>
      </view>
    </view>

    <!-- 标签区域 - 超出一行隐藏 -->
    <view v-if="data.tags.length" class="flex flex-row gap-20rpx overflow-hidden">
      <Tag v-for="item in data?.tags.slice(0, 3)" :key="item.id" :active="item.followStatus" class="flex-shrink-0" @tap.stop="onClickTag({ id: item.id })">
        #{{ item.tagName }}
      </Tag>
    </view>

    <view class="flex items-center color-#666 gap-32px">
      <view class="flex items-center min-w-30px h-30px gap-4px" @click.stop="onThumbsUp">
        <view class="  size-22px mr-6rpx" :class="[data.isLike ? 'color-red i-material-symbols-favorite-rounded' : 'color-#222 i-material-symbols-favorite-outline-rounded'] " />
        <view class="text-16px color-#222">
          {{ formatCommentOrThumbUpCount(data.likeCount) }}
        </view>
      </view>
      <view class="flex items-center min-w-30px h-30px gap-4px">
        <view class="comment-icon bg-#222 size-22px" />
        <view class="text-16px color-#222">
          {{ formatCommentOrThumbUpCount(data.commentCount) }}
        </view>
      </view>
      <view class="flex-1" />
      <button class="share-to-wechat" open-type="share" :data-id="data.id" @tap.stop>
        <view class="wechat-icon size-18px" />
        <text class="share-text">
          分享
        </text>
      </button>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-view-card--container {
  background: white;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.hi-view-card--content {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
.shadow-button {
  box-shadow: 0px -13px 20px 10px white;
}
.share-to-wechat {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #f5f7f9;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  color: #222222;
  font-weight: 500;
  overflow: hidden;
  &::after {
    display: none;
  }

  .share-text {
    flex-shrink: 0;
    font-size: 14px;
    color: #222222;
    font-weight: 500;
  }
}
</style>
