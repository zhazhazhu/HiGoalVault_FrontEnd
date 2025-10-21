<script lang='ts' setup>
import type { Tag } from '@/api'
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import { useClassesName } from '@/composables'
import { useChatStore, useUserStore } from '@/store'

defineProps<{
  showSidebar: boolean
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'changeChat'): void
}>()
const cs = useClassesName('sidebar-content')
const active = ref('browse')
const userStore = useUserStore()
const chatStore = useChatStore()
const isEdit = ref(false)
const popularTags = ref<Tag[]>([])

async function getData() {
  const res = await api.getPopularTags()
  if (res.code === 200) {
    popularTags.value = res.result
  }
}
function onEditChatList() {
  isEdit.value = !isEdit.value
}
function gotoSettings() {
  uni.navigateTo({ url: '/settings-package/pages/settings/index' })
}
function gotoUser() {
  uni.navigateTo({ url: '/user-package/pages/user/index' })
}
function onClickTag(tag: Tag) {
  uni.navigateTo({ url: `/tag-package/pages/tag/index?id=${tag.id}` })
}

onMounted(() => {
  getData()
})
</script>

<template>
  <view class="pt-110px w-85% px-16px box-border h-full flex flex-col justify-between relative">
    <view class="i-material-symbols-light-close-rounded size-30px absolute top-60px left-14px" @click="emit('close')" />
    <tabs v-model="active" custom-class="flex-1" :sticky="false" :custom-nav-class="cs.m('tab-nav')" :editable="active === 'chat'" @edit="onEditChatList">
      <template #edit>
        <template v-if="chatStore.chats.length > 0">
          <wd-button v-if="!isEdit" type="text">
            编辑
          </wd-button>
          <wd-button v-else type="primary" :round="false" size="small">
            完成
          </wd-button>
        </template>
      </template>
      <tabs-item name="browse" label="发现">
        <view class="flex flex-col gap-10px mt-10px">
          <view class="text-34rpx font-bold text-h1-color">
            热门
          </view>
          <view v-if="popularTags?.length > 0" class="flex flex-col gap-10px ml-10px">
            <view v-for="item in popularTags" :key="item.id" class="text-30rpx text-h2-color" @click="onClickTag(item)">
              {{ item.tagName }}
            </view>
          </view>
          <view v-else>
            <view class="text-26rpx color-gray-6">
              暂无热门标签
            </view>
          </view>
        </view>
      </tabs-item>
      <tabs-item name="chat" label="对话">
        <LayoutChatList :show-sidebar="showSidebar" :is-edit="isEdit" @change-chat="$emit('changeChat')" />
      </tabs-item>
    </tabs>

    <view :class="cs.m('bottom')">
      <view :class="cs.m('user')" @click="gotoUser">
        <wd-img :src="userStore.userInfo?.face" round mode="aspectFill" :width="30" :height="30" />
        <text class="text-16px font-bold text-h1-color ml-8px max-w-120px truncate">
          {{ userStore.userInfo?.nickName }}
        </text>
      </view>

      <view class="flex gap-10px text-48rpx text-h3-color w-80px justify-end">
        <view class="i-tabler-settings" @click="gotoSettings" />
        <button open-type="feedback" class="share-btn contents">
          <view class="i-material-symbols-lightbulb-2-outline-sharp color-h3-color size-44rpx" />
        </button>
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-sidebar-content--bottom {
  padding-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.hi-sidebar-content--user {
  display: flex;
  align-items: center;
}
</style>
