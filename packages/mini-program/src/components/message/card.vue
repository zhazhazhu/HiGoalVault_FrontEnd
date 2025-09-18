<script lang='ts' setup>
import type { ChatMessageAfter, ChatMessageReference } from '@higoal/api'
import { useClassesName } from '@higoal/hooks'
import hljs from 'highlight.js'
import MarkdownIt from 'markdown-it/dist/markdown-it.js'
import { computed, ref } from 'vue'
import { useToast } from 'wot-design-uni'

import { useMessageInject } from '@/composables/inject'
import { markdownToText } from '@/utils'
import 'highlight.js/styles/github.css'

const props = defineProps<{
  message: ChatMessageAfter
}>()

const { share } = useMessageInject()!
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
const toast = useToast()
const userInstance = ref<Element>()

const htmlContent = computed(() => {
  return md.render(props.message.response)
})

function onReference(item: ChatMessageReference) {
  uni.setClipboardData({
    data: item.url,
    showToast: true,
  })
}

function onRefresh() {}
function onCopy() {
  const response = markdownToText(props.message.response)
  uni.setClipboardData({
    data: `${props.message.message}\n${response}`,
    success() {
      toast.show('复制成功')
    },
  })
}

function openSharePopup() {
  share.value.isChecked = true
  share.value.ids.push(props.message.id)
}

function onShareToMall() {}
</script>

<template>
  <view :class="cs.m('wrapper')">
    <wd-toast />
    <view ref="userInstance" :class="cs.m('user')">
      {{ message.query }}
    </view>

    <view :class="cs.m('model')">
      <view :class="cs.e('deep-think')">
        <view :class="cs.e('deep-think-title')" @click="() => { viewDeepThink = !viewDeepThink }">
          <text class="mr-10px">
            已深度思考 (用时x秒)
          </text>
          <view :class="viewDeepThink ? 'i-flowbite-angle-down-outline' : 'i-flowbite-angle-up-outline' " />
        </view>
        <view v-if="viewDeepThink" :class="cs.e('deep-think-content')" align="left">
          {{ message.message }}
        </view>
      </view>

      <view :class="cs.m('response')">
        <!-- 使用自定义组件渲染markdown内容，避免XSS攻击风险 -->
        <rich-text :class="cs.e('rich-text')" :nodes="htmlContent" space="ensp" />
      </view>

      <view v-show="!share.isChecked" :class="cs.e('operations')" class="flex items-center mt-18px gap-14px">
        <view class="chat-icon size-30px" @click="onRefresh" />
        <view class="copy-icon size-30px" @click="onCopy" />
        <view class="flex-1" />
        <view class="like-backup size-30px" />
        <view class="favorite-icon size-30px" @click="onShareToMall" />
        <view class="wechat-icon size-30px" @click="openSharePopup" />
      </view>
    </view>

    <view :class="cs.m('reference')">
      <view v-for="item, index in message.reference" :key="index" :class="cs.e('reference-item')" @click="onReference(item)">
        <view class="next-level size-16px mr-6px" />
        <text>{{ item.name }}</text>
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
.hi-message-card--reference {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.hi-message-card__reference-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: rgba(102, 102, 102, 0.08);
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
}
</style>
