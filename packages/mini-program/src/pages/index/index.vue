<script setup lang="ts">
import { useClassesName } from '@higoal/hooks'
import { ref } from 'vue'
import ViewList from './components/ViewList.vue'

const cs = useClassesName('home')
const showSidebar = ref(false)
const active = ref('view')

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

    <Container custom-class="px-32rpx">
      <tabs v-model="active" custom-content-class="mt-10px" :custom-nav-class="cs.m('tab-nav')" editable @edit="onClickSearch">
        <template #edit>
          <wd-icon name="search" />
        </template>
        <tabs-item name="view" label="发现">
          <ViewList />
        </tabs-item>
        <tabs-item name="follow" label="关注">
          关注
        </tabs-item>
      </tabs>
    </Container>
  </Layout>
</template>

<style lang="scss" scoped>
</style>
