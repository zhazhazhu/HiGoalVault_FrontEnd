<script lang='ts' setup>
import type { ChatMessageAfter } from '@higoal/api'
import type { NavbarInstance } from '@/components/navbar'
import type { Share } from '@/composables/inject'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { getCurrentInstance, nextTick, onMounted, provide, ref, watch } from 'vue'
import { api } from '@/api'
import { chatInjectKey } from '@/composables/inject'
import { useUserStore } from '@/store'

const navbarInstance = ref<NavbarInstance>()
const scrollTop = ref(0)
const userStore = useUserStore()
const chatMessages = ref<ChatMessageAfter[]>([])
const share = ref<Share>({
  ids: [],
  isChecked: false,
})
const query = uni.createSelectorQuery().in(getCurrentInstance())
const scrollViewInstance = query.select('#scroll-view')

watch(() => share.value.isChecked, (newVal) => {
  if (!newVal) {
    share.value.ids = []
  }
})

/**
 * 当第一次分享时，组件Messages会切换，导致重新渲染
 * 当组件重新渲染时，滚动到上一次的位置
 */
watch(() => share.value.ids, (newVal) => {
  if (newVal.length === 1) {
    scrollViewInstance.scrollOffset((res) => {
      scrollView((res as unknown as UniApp.NodeInfo).scrollTop || 0)
    }).exec()
  }
}, { deep: true })

provide(chatInjectKey, {
  share,
})

// 滚动到底部的函数
function scrollView(value?: number) {
  nextTick(() => {
    scrollTop.value = value || 999999
  })
}

onMounted(async () => {
  const data = await api.getChatHistory({ userId: userStore.userInfo!.id })
  if (data.code === 200) {
    chatMessages.value = data.result.records.map((item) => {
      let reference
      try {
        reference = JSON.parse(item.reference)
      }
      catch {
        reference = []
      }

      return {
        ...item,
        reference,
      }
    })
    scrollView()
  }
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

defineExpose({
  scrollView,
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
        :scroll-y="true"
        :scroll-top="scrollTop"
      >
        <messages :messages="chatMessages" />
      </scroll-view>
      <view class="px-32rpx">
        <converse />
      </view>
    </container>
  </view>
</template>

<style lang='scss' scoped></style>
