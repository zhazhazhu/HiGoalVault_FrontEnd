<script lang='ts' setup>
import { computed, getCurrentInstance, inject, onBeforeUnmount, onMounted } from 'vue'
import { TABS_INJECTION_KEY } from './tabs'

defineOptions({
  name: 'TabItem',
})

const props = defineProps<{
  name?: string | number
  label?: string | number
  right?: boolean
}>()

const instance = getCurrentInstance()!
const parentInject = inject(TABS_INJECTION_KEY)
const show = computed(() => parentInject?.activeName.value === props.name)

onMounted(() => {
  parentInject && parentInject.registerChild(instance)
})

onBeforeUnmount(() => {
  parentInject && parentInject.unRegisterChild(instance)
})
</script>

<template>
  <view v-show="show" class="h-full">
    <slot />
  </view>
</template>

<style lang='css' scoped></style>
