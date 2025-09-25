<script setup lang="ts">
import type Converse from '@/components/converse/index.vue'
import { useClassesName } from '@higoal/hooks'
import { onMounted, ref } from 'vue'
import { useChatStore } from '@/store'

const cs = useClassesName('home')
const showSidebar = ref(false)
const active = ref('view')
const converseInstance = ref<InstanceType<typeof Converse>>()
const chatStore = useChatStore()

function onNavbarLeftClick() {
  showSidebar.value = !showSidebar.value
}
function onChangeChat() {
  uni.navigateTo({ url: '/pages/chat/index' })
}
function onClickSearch() {
  uni.navigateTo({ url: '/pages/search/index' })
}
onMounted(() => {
  chatStore.currentChatId = ''
  uni.navigateTo({ url: '/pages/index/detail?id=1971044791038980097' })
})
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="onChangeChat">
    <navbar @left-click="onNavbarLeftClick" />

    <Container custom-class="px-24rpx">
      <tabs
        v-model="active"
        editable
        class="overflow-hidden"
        custom-content-class="mt-10px"
        :custom-nav-class="cs.m('tab-nav')"
        :style="{ height: `calc(100% - ${140}px)` }"
        @edit="onClickSearch"
      >
        <template #edit>
          <wd-icon name="search" size="18" />
        </template>
        <tabs-item name="view" label="发现">
          <ViewList />
        </tabs-item>
        <tabs-item name="follow" label="关注">
          关注
        </tabs-item>
      </tabs>

      <Converse ref="converseInstance" />
    </Container>
  </Layout>
</template>

<style lang="scss" scoped>
</style>
