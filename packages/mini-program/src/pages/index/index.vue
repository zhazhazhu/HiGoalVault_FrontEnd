<script setup lang="ts">
import type Converse from '@/components/converse/index.vue'
import { useClassesName } from '@higoal/hooks'
import { computed, ref } from 'vue'
import ViewList from './components/ViewList.vue'

const cs = useClassesName('home')
const showSidebar = ref(false)
const active = ref('view')
const converseInstance = ref<InstanceType<typeof Converse>>()
const converseInstanceHeight = computed(() => converseInstance.value?.height || 0)

function onNavbarLeftClick() {
  showSidebar.value = !showSidebar.value
}
function onChangeChat() {
  uni.navigateTo({ url: '/pages/chat/index' })
}
function onClickSearch() {
  uni.navigateTo({ url: '/pages/search/index' })
}
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
        :style="{ height: `calc(100% - ${converseInstanceHeight}px)` }"
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
