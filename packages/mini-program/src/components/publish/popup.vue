<script lang='ts' setup>
import type { AnswerAfter, PublishMessageRequest } from '@higoal/api'
import { PublishContentType, Truth } from '@higoal/api'
import { useClassesName } from '@higoal/hooks'
import { useToast } from 'wot-design-uni'
import { api } from '@/api'
import { useResetRef } from '@/composables/useResetRef'

const props = defineProps<{
  message: AnswerAfter
}>()
const model = defineModel({ type: Boolean, default: false })
const cs = useClassesName('publish-popup')
const toast = useToast()

const [form, reset] = useResetRef<PublishMessageRequest>({
  queryId: props.message.queryId,
  title: props.message.query,
  content: '',
  privacy: Truth.TRUE,
  contentType: PublishContentType.Text,
})

async function onPublish() {
  try {
    const data = await api.addPublishMessage(form.value)
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
</script>

<template>
  <root-portal>
    <wd-toast />
  </root-portal>
  <wd-popup v-model="model" position="bottom" root-portal custom-style="border-radius: 20px;">
    <view class="p-20px pb-40px">
      <view class="rounded-12px overflow-hidden mb-20px">
        <wd-textarea
          v-model="form.content"
          clearable
          no-border
          show-word-limit
          placeholder="说些什么..."
          :maxlength="100"
          :custom-textarea-class="cs.m('textarea')"
          :custom-class="cs.m('textarea-container')"
          placeholder-class="text-gray-400 text-14px lh-14px"
        />
      </view>

      <view class="flex items-center justify-between">
        <wd-checkbox v-model="form.privacy" :true-value="Truth.TRUE" :false-value="Truth.FALSE">
          仅自己可见
        </wd-checkbox>

        <wd-button type="primary" :round="false" :disabled="!form.content" @click="onPublish">
          发布
        </wd-button>
      </view>
    </view>
  </wd-popup>
</template>

<style lang='scss' scoped>

</style>
