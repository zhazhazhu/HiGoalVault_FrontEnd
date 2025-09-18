<script lang='ts' setup>
import type { Page } from '@higoal/api'
import type { NavbarInstance } from '@/components/navbar'
import type { Share } from '@/composables/inject'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { useClassesName } from '@higoal/hooks'
import { getCurrentInstance, onMounted, provide, ref, watch } from 'vue'
import { api } from '@/api'
import { messageInjectKey } from '@/composables/inject'
import { useResetRef } from '@/composables/useResetRef'
import { useUserStore } from '@/store'
import { useChatStore } from '@/store/chat'

const navbarInstance = ref<NavbarInstance>()
const query = uni.createSelectorQuery().in(getCurrentInstance())
const cs = useClassesName('messages')
const userStore = useUserStore()
const share = ref<Share>({
  ids: [],
  isChecked: false,
})
const chatStore = useChatStore()
const [page] = useResetRef<Page>({
  pageNumber: 1,
  pageSize: 3,
  sort: 'createTime',
})
const scrollTop = ref(0)

watch(() => share.value.isChecked, (newVal) => {
  if (!newVal) {
    share.value.ids = []
  }
})

function scrollToButton() {
  const messageWrapper = query.select('.hi-messages--wrapper')
  messageWrapper.boundingClientRect((res) => {
    scrollTop.value = (res as UniApp.NodeInfo).height || 0
  }).exec()
}
const loading = ref(false)

async function getMessage() {
  const data = await api.getMessageList({ userId: userStore.userInfo!.id, ...page.value })
  if (data.code === 200) {
    const _messages = data.result.records.map(chatStore.transformMessage).reverse()
    chatStore.messages.unshift(..._messages)
    loading.value = false
  }
}
function refreshMessage() {
  chatStore.messages = []
  getMessage()
}
async function loadMessage() {
  if (loading.value)
    return
  loading.value = true
  page.value.pageNumber!++
  await getMessage()
}

provide(messageInjectKey, {
  share,
  scrollToButton,
  refreshMessage,
})

onMounted(async () => {
  await getMessage()
  scrollToButton()
})

onShareAppMessage(({ from, target }) => {
  const result = {
    title: '快来看看我聊了啥～',
    path: '/pages/chat/index',
  }
  if (from === 'button') {
    result.path = `/pages/share_chat/index?ids=${target.dataset.ids}`
    share.value.ids = []
  }
  return result
})
</script>

<template>
  <view>
    <share-popup v-model="share.isChecked" />

    <navbar ref="navbarInstance" :left-text="share.isChecked && '取消'" @left-click="share.isChecked = false">
      <template #title>
        <tabs>
          <tabs-item :name="0" label="黑狗" />
          <tabs-item :name="1" label="关注" />
        </tabs>
      </template>
    </navbar>

    <container>
      <scroll-view
        id="scroll-view"
        class="flex-1 h-full overflow-y-auto"
        scroll-into-view-alignment="end"
        enhanced
        enable-passive
        :scroll-y="true"
        :scroll-into-view-offset="20"
        :show-scrollbar="false"
        :scroll-top="scrollTop"
        @scrolltoupper="loadMessage"
      >
        <view :class="cs.m('wrapper')" class="px-32rpx">
          <view v-show="loading" class="flex items-center justify-center py-20rpx">
            <wd-loading color="#FC6146FF" :size="20" />
            <text class="ml-20rpx text-24rpx">
              加载中...
            </text>
          </view>

          <view v-show="share.isChecked">
            <wd-checkbox-group v-model="share.ids">
              <wd-checkbox
                v-for="item in chatStore.messages"
                :key="item.id"
                shape="square"
                size="20px"
                :model-value="item.id"
                :custom-label-class="cs.m('checkbox-text')"
                :custom-class="cs.m('checkbox-message')"
                :custom-shape-class="cs.m('checkbox-shape')"
              >
                <MessageCard :id="`message-check-${item.id}`" :message="item" />
              </wd-checkbox>
            </wd-checkbox-group>
          </view>

          <view v-show="!share.isChecked">
            <MessageCard v-for="item, index in chatStore.messages" :id="`message-${item.id}`" :key="index" :message="item" />
          </view>
        </view>
      </scroll-view>
      <view class="px-32rpx">
        <converse />
      </view>
    </container>
  </view>
</template>

<style lang='scss' scoped></style>
