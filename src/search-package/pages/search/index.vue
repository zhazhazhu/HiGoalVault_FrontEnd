<script lang='ts' setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { useClassesName } from '@/composables'
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
  uni.redirectTo({ url: '/chat-package/pages/chat/index' })
}
function onConfirm() {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const method = currentPage.route === '/search-package/pages/search/result' ? uni.redirectTo : uni.navigateTo

  if (userId.value) {
    method({ url: `/search-package/pages/search/result?keyword=${searchText.value}&userId=${userId.value}` })
  }
  else {
    method({ url: `/search-package/pages/search/result?keyword=${searchText.value}` })
  }
  searchText.value = ''
  removeSearchHistoryVisible.value = false
}
function onGotoBack() {
  removeSearchHistoryVisible.value = false
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
  if (userId.value) {
    uni.navigateTo({ url: `/search-package/pages/search/result?keyword=${val}&userId=${userId.value}` })
  }
  else {
    uni.navigateTo({ url: `/search-package/pages/search/result?keyword=${val}` })
  }
}

onLoad((options) => {
  userId.value = options?.userId
})
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="onChangeChat">
    <Navbar @left-click="onNavbarLeftClick" />
    <Container>
      <view class="px-32rpx">
        <SearchHead v-model="searchText" :placeholder="userId ? '搜索用户内容' : '搜索'" @confirm="onConfirm" @back="onGotoBack" />

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
                <wd-button v-else type="primary" plain size="small">
                  完成
                </wd-button>
              </template>
            </SearchCard>
          </view>
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
