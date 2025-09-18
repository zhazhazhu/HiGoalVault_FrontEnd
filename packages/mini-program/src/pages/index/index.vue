<script setup lang="ts">
import { useClassesName } from '@higoal/hooks'
import ViewList from './components/ViewList.vue'

const cs = useClassesName('home')
</script>

<template>
  <view>
    <navbar />

    <tabs :custom-nav-class="cs.m('tab-nav')">
      <tabs-item :name="0" label="发现">
        <ViewList />
      </tabs-item>
      <tabs-item :name="1" label="关注">
        关注
      </tabs-item>
      <tabs-item right icon="search" />
    </tabs>
  </view>
</template>

<style lang="scss">
.hi-home--tab-nav {
  background-color: #f3f3f3;
}
</style>
