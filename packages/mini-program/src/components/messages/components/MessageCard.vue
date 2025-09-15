<script lang='ts' setup>
import type { ChatMessage } from '@higoal/api'
import { useClassesName } from '@higoal/hooks'
import hljs from 'highlight.js'
import MarkdownIt from 'markdown-it/dist/markdown-it.js'
import { computed, ref } from 'vue'

import 'highlight.js/styles/github.css'

const props = defineProps<{
  message: ChatMessage
}>()
const cs = useClassesName('message-card')
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
const viewDeepThink = ref(true)

const htmlContent = computed(() => {
  return md.render(props.message.response)
})
</script>

<template>
  <view :class="cs.m('wrapper')">
    <view :class="cs.m('user')">
      {{ message.query }}
    </view>

    <view :class="cs.m('model')">
      <view :class="cs.e('deep-think')">
        <view :class="cs.e('deep-think-title')" @click="viewDeepThink = !viewDeepThink">
          <text class="mr-10px">
            已深度思考 (用时x秒)
          </text>
          <view :class="viewDeepThink ? 'i-flowbite-angle-down-outline' : 'i-flowbite-angle-up-outline' " />
        </view>
        <view v-show="viewDeepThink" :class="cs.e('deep-think-content')" align="left">
          {{ message.message }}
        </view>
      </view>
      <view :class="cs.m('response')">
        <!-- 使用自定义组件渲染markdown内容，避免XSS攻击风险 -->
        <rich-text :class="cs.e('rich-text')" :nodes="htmlContent" space="ensp" />
      </view>
    </view>
  </view>
</template>

<style lang='scss' scoped>
.hi-message-card--wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.hi-message-card--user {
  background: linear-gradient(270deg, #ff3b30 0%, #fc6146 100%);
  color: #fff;
  padding: 10px 16px;
  font-size: 16px;
  border-radius: 12px 12px 0px 12px;
  width: fit-content;
  margin-bottom: 10px;
}
.hi-message-card--model {
  background-color: #fff;
  padding: 10px 16px;
  border-radius: 12px;
  width: fit-content;
  font-size: 16px;
  color: #121212;
  line-height: 20px;
  margin-bottom: 10px;
}
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
  line-height: 24px;
}
</style>
