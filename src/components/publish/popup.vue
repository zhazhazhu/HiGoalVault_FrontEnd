<script lang='ts' setup>
import type { AnswerAfter, PublishMessageRequest } from '@/api'
import { ref, watch } from 'vue'
import { useToast } from 'wot-design-uni'
import { api, PublishContentType, Truth } from '@/api'
import { useClassesName } from '@/composables'
import { useResetRef } from '@/composables/useResetRef'
import { useGlobalStore } from '@/store'

const props = defineProps<{
  message: AnswerAfter
}>()
const model = defineModel({ type: Boolean, default: false })
const cs = useClassesName('publish-popup')
const toast = useToast()
const globalStore = useGlobalStore()
const isFocus = ref(false)

const [form, reset] = useResetRef<PublishMessageRequest>({
  queryId: '',
  title: '',
  content: '',
  privacy: Truth.FALSE,
  contentType: PublishContentType.Text,
})

watch(() => model.value, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      isFocus.value = true
    }, 300)
  }
  else {
    isFocus.value = false
  }
})

async function onPublish() {
  form.value.queryId = props.message.queryId
  form.value.title = props.message.query
  // 检查是否包含敏感词
  const hasSensitive = await api.hasSensitiveWord(form.value.content)
  if (hasSensitive.result) {
    uni.showToast({
      title: '包含敏感词，无法发送',
      icon: 'none',
    })
    return
  }
  try {
    const data = await api.addPublishMessage({ ...form.value, content: encodeURI(form.value.content) })
    if (data.code === 200) {
      model.value = false
      reset()
      toast.show('发布成功')
    }
    else {
      toast.show('发布失败')
    }
  }
  catch (e) {
    toast.show('发布失败')
    console.error(e)
  }
}

function handleClose() {
  console.log('hasKeyboard', globalStore.hasKeyboard)

  if (globalStore.hasKeyboard) {
    console.log('hideKeyboard')

    uni.hideKeyboard()
  }
  else {
    console.log('close')
    model.value = false
    reset()
  }
}
</script>

<template>
  <root-portal>
    <wd-toast />
  </root-portal>
  <wd-popup v-model="model" position="bottom" :close-on-click-modal="false" root-portal custom-class="rounded-t-20px" @click-modal="handleClose">
    <view class="p-20px pb-40px">
      <view class="rounded-12px overflow-hidden mb-20px">
        <wd-textarea
          v-model="form.content"
          clearable
          no-border
          show-word-limit
          hold-keyboard
          placeholder="说些什么..."
          focus-when-clear
          :auto-height="true"
          :focus="isFocus"
          :cursor-spacing="120"
          :maxlength="100"
          :show-confirm-bar="false"
          :custom-textarea-class="cs.m('textarea')"
          :custom-class="cs.m('textarea-container')"
          :placeholder-class="cs.m('textarea-placeholder')"
        />
      </view>

      <view class="flex items-center justify-between">
        <wd-checkbox v-model="form.privacy" :true-value="Truth.TRUE" :false-value="Truth.FALSE">
          仅自己可见
        </wd-checkbox>
        <view class="flex-1" />

        <wd-button type="primary" :round="false" :disabled="!form.content" @click="onPublish">
          发布
        </wd-button>
      </view>
    </view>
  </wd-popup>
</template>

<style lang='scss' scoped>

</style>
