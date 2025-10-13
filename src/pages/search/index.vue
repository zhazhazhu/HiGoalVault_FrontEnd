<script lang='ts' setup>
import { onLoad } from '@dcloudio/uni-app'
import { useClassesName } from '@/composables'
import { ref } from 'vue'
import { useSearchStore } from '@/store'

const cs = useClassesName('search')
const showSidebar = ref(false)
const searchStore = useSearchStore()
const removeSearchHistoryVisible = ref(false)
const searchText = ref('')
const userId = ref('')

function onNavbarLeftClick() {
  showSidebar.value = !showSidebar.value
}
function onChangeChat() {
  uni.navigateTo({ url: '/pages/chat/index' })
}
function onConfirm() {
  uni.navigateTo({ url: `/pages/search/result?keyWord=${searchText.value}&userId=${userId.value}` })
  searchText.value = ''
}
function onGotoBack() {
  uni.navigateBack({ delta: 999 })
}
function onOperate(type: 'delete') {
  switch (type) {
    case 'delete':
      removeSearchHistoryVisible.value = !removeSearchHistoryVisible.value
      break

    default:
      break
  }
}
function onCloseSearchHistory(index: number) {
  searchStore.removeSearchHistory(index)
}
function onTagClick(val: string) {
  searchStore.addSearchHistory(val)
  uni.navigateTo({ url: `/pages/search/result?keyWord=${val}&userId=${userId.value}` })
}

onLoad((options) => {
  userId.value = options?.userId
})
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="onChangeChat">
    <Navbar @left-click="onNavbarLeftClick" />
    <Container custom-class="px-32rpx">
      <SearchHead v-model="searchText" @confirm="onConfirm" @back="onGotoBack" />

      <view :class="cs.m('content')">
        <view :class="cs.m('lately-search')">
          <SearchCard
            title="最近搜索"
            :enable-close="removeSearchHistoryVisible"
            :data="searchStore.searchHistory"
            @edit-click="onOperate('delete')"
            @close="onCloseSearchHistory"
            @tag-click="onTagClick"
          >
            <template #edit>
              <view v-if="!removeSearchHistoryVisible" class="i-material-symbols-light-delete-outline" />
              <wd-button v-else type="primary" size="small">
                完成
              </wd-button>
            </template>
          </SearchCard>
        </view>
      </view>
    </Container>
  </Layout>
</template>

<style lang='scss' scoped>
.hi-search--content {
  margin-top: 60rpx;
}
</style>
