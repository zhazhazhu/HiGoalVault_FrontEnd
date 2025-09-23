<script setup lang="ts">
import { useClassesName } from '@higoal/hooks'
import { ref } from 'vue'
import ViewList from './components/ViewList.vue'

const cs = useClassesName('home')
const showSidebar = ref(false)

function onNavbarLeftClick() {
  showSidebar.value = !showSidebar.value
}
</script>

<template>
  <Layout v-model="showSidebar">
    <navbar @left-click="onNavbarLeftClick" />

    <Container>
      <tabs :custom-nav-class="cs.m('tab-nav')" editable>
        <template #edit>
          <wd-icon name="search" />
        </template>
        <tabs-item :name="0" label="发现">
          <ViewList />
        </tabs-item>
        <tabs-item :name="1" label="关注">
          关注
        </tabs-item>
      </tabs>
    </Container>
  </Layout>
</template>

<style lang="scss">
.hi-home--tab-nav {
  background-color: #f3f3f3;
}
</style>
