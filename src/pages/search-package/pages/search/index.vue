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
  if (getCurrentPages().length > 9) {
    uni.redirectTo({ url: '/pages/chat-package/pages/chat/index' })
  }
  else {
    uni.navigateTo({ url: '/pages/chat-package/pages/chat/index' })
  }
}
function onConfirm() {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const method = currentPage.route === '/pages/search-package/pages/search/result' ? uni.redirectTo : uni.navigateTo

  if (userId.value) {
    method({ url: `/pages/search-package/pages/search/result?keyword=${searchText.value}&userId=${userId.value}` })
  }
  else {
    method({ url: `/pages/search-package/pages/search/result?keyword=${searchText.value}` })
  }
  searchText.value = ''
  removeSearchHistoryVisible.value = false
}
function onGotoBack() {
  removeSearchHistoryVisible.value = false
  uni.navigateBack({ delta: 999 })
}
function onCloseSearchHistory(index: number) {
  searchStore.removeSearchHistory(index)
}
function onTagClick(val: string) {
  searchStore.addSearchHistory(val)
  if (userId.value) {
    uni.navigateTo({ url: `/pages/search-package/pages/search/result?keyword=${val}&userId=${userId.value}` })
  }
  else {
    uni.navigateTo({ url: `/pages/search-package/pages/search/result?keyword=${val}` })
  }
}
function onEnableDelete() {
  removeSearchHistoryVisible.value = true
}
function onCloseDelete() {
  removeSearchHistoryVisible.value = false
}
function onDeleteAll() {
  searchStore.clearSearchHistory()
}

onLoad((options) => {
  userId.value = options?.userId
})
</script>

<template>
  <Layout v-model="showSidebar" @change-chat="onChangeChat">
    <Navbar @left-click="onNavbarLeftClick" />
    <Container>
      <SearchHead v-model="searchText" :placeholder="userId ? '搜索用户内容' : '搜索'" @confirm="onConfirm" @back="onGotoBack" />

      <view :class="cs.m('content')">
        <view :class="cs.m('lately-search')">
          <SearchCard
            title="历史搜索"
            :enable-close="removeSearchHistoryVisible"
            :data="searchStore.searchHistory"
            @close="onCloseSearchHistory"
            @tag-click="onTagClick"
          >
            <template #edit>
              <view v-if="!removeSearchHistoryVisible" class="i-material-symbols-delete-outline" @click="onEnableDelete" />
              <view v-else class="flex gap-10px">
                <wd-button type="info" size="small" :round="false" custom-style="--wot-button-info-bg-color: white" @click="onDeleteAll">
                  清空
                </wd-button>
                <wd-button type="primary" size="small" :round="false" @click="onCloseDelete">
                  完成
                </wd-button>
              </view>
            </template>
          </SearchCard>
        </view>
      </view>
    </Container>
  </Layout>
</template>

<style lang='scss' scoped>
.hi-search--content {
  margin-top: 20px;
  padding: 0 32rpx;
}
</style>
