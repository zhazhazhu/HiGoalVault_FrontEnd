<script lang='ts' setup>
import type { PublishMessageListResponse } from '@higoal/api'
import { useClassesName } from '@higoal/hooks'
import { onMounted, ref } from 'vue'
import { api } from '@/api'

const cs = useClassesName('view')
const list = ref<PublishMessageListResponse[]>([])

onMounted(async () => {
  const data = await api.getPublishMessageList({ pageVO: { pageSize: 10, pageNumber: 1 } })
  if (data.code === 200) {
    list.value = data.result.records
  }
})
</script>

<template>
  <scroll-view
    scroll-into-view-alignment="end"
    enhanced
    enable-passive
    enable-flex
    :scroll-y="true"
    :show-scrollbar="false"
    class="h-full overflow-y-auto"
    :class="cs.m('container')"
  >
    <view v-for="item in list" :key="item.id" :class="cs.m('card')">
      <ViewCard :view="item" />
    </view>
  </scroll-view>
</template>

<style lang='scss' scoped>
.hi-view--card + .hi-view--card {
  margin-top: 40rpx;
}
</style>
