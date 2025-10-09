<script lang='ts' setup>
import type { AnswerAfter } from '@/api'
import { useClassesName } from '@higoal/hooks'
import hljs from 'highlight.js'
import MarkdownIt from 'markdown-it/dist/markdown-it.js'
import { computed, ref } from 'vue'

import 'highlight.js/styles/github.css'

const props = defineProps<{
  data: AnswerAfter
}>()

const emit = defineEmits<{
  (e: 'longPressContent', val: any): void
}>()

const cs = useClassesName('message-card')
const viewDeepThink = ref(true)
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight(str, lang) {
    const html = hljs.highlight(str, { language: lang || 'txt', ignoreIllegals: true }).value
    return html
  },
})
const htmlContent = computed(() => {
  return md.render(props.data.response || '')
})
</script>

<template>
  <view :class="cs.e('deep-think')">
    <view :class="cs.e('deep-think-title')" @click="() => { viewDeepThink = !viewDeepThink }">
      <text class="mr-10px">
        已深度思考 (用时{{ props.data.messageTimeLong / 1000 }}秒)
      </text>
      <view :class="viewDeepThink ? 'i-flowbite-angle-down-outline' : 'i-flowbite-angle-up-outline' " />
    </view>
    <view v-if="viewDeepThink" :class="cs.e('deep-think-content')" align="left">
      {{ data.message }}
    </view>
  </view>

  <view :class="cs.m('response')" @longpress="(e) => emit('longPressContent', e)">
    <!-- 使用自定义组件渲染markdown内容，避免XSS攻击风险 -->
    <rich-text :class="cs.e('rich-text')" :nodes="htmlContent" space="ensp" />
  </view>

  <view v-if="data.data" :class="cs.m('stock')">
    <message-stock :data="data.data" />
  </view>
</template>

<style lang='scss' scoped>
.hi-message-card__deep-think {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #666666;
  margin-bottom: 10px;
}
.hi-message-card__deep-think-title {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.hi-message-card__deep-think-content {
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e5e5e5;
  padding-left: 10px;
}
.hi-message-card__rich-text {
  color: #333333;
  line-height: 48rpx;
}
</style>
