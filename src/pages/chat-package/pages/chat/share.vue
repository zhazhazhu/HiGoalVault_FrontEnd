<script lang='ts' setup>
import type { ChatMessageAfter } from '@/api'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { api } from '@/api'
import { useClassesName } from '@/composables'
import { useChatStore } from '@/store'

const chatStore = useChatStore()
const cs = useClassesName('share')
const data = ref<ChatMessageAfter[]>([])
async function getData(shareId: string = '') {
  if (!shareId) {
    uni.showToast({
      title: '查询不到分享',
      icon: 'none',
    })
    return
  }
  const res = await api.getShareMessageList({ shareId })
  if (res.code === 200) {
    const _messages = res.result.map(chatStore.transformMessage)
    data.value = [..._messages]
  }
}

function gotoHome() {
  uni.redirectTo({ url: '/pages/index/index' })
}
function gotoChat() {
  uni.redirectTo({ url: '/pages/chat-package/pages/chat/index' })
}

onLoad((options) => {
  getData(options?.id || '')
})
</script>

<template>
  <view>
    <Navbar title="分享" enable-left-slot>
      <template #left>
        <view class="flex items-center gap-20rpx" @click="gotoHome">
          <view class="i-material-symbols-home-outline-rounded text-46rpx" />
        </view>
      </template>
    </Navbar>

    <Container custom-class="px-24rpx relative">
      <scroll-view
        id="scroll-view"
        class="h-[calc(100vh-100px)] pt-10px pb-20px"
        enhanced
        :scroll-y="true"
        :show-scrollbar="false"
        :lower-threshold="50"
        :class="cs.m('scroll-view')"
      >
        <view :class="cs.m('wrapper')" class="w-full box-border">
          <MessageCard v-for="item in data" :id="`message-${item.msgId}`" :key="item.msgId" with-avatar readonly :message="item" />
        </view>
      </scroll-view>

      <view class="absolute bottom-0 left-0 w-full h-100px bg-gradient-to-t from-#c7c7c7 to-transparent flex items-center justify-center">
        <wd-button size="large" type="primary" custom-style="--wot-button-large-height: 55px;--wot-button-primary-bg-color: #212121;--wot-button-info-color: white;" @click="gotoChat">
          开始对话
        </wd-button>
      </view>
    </Container>
  </view>
</template>

<style lang='scss' scoped></style>
