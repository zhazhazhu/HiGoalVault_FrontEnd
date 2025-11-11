<script lang='ts' setup>
import type { ExtractPropTypes } from 'vue'
import type { ButtonProps } from 'wot-design-uni/components/wd-button/types'
import type { inputProps } from 'wot-design-uni/components/wd-input/types'
import type { popupProps } from 'wot-design-uni/components/wd-popup/types'
import type { TextareaProps } from 'wot-design-uni/components/wd-textarea/types'
import { computed } from 'vue'
import { api } from '@/api'
import { useClassesName } from '@/composables'

type PopupProps = ExtractPropTypes<typeof popupProps>

const props = withDefaults(defineProps<{
  placeholder?: string
  buttonText?: string
  inputType?: 'input' | 'textarea'
  popupOptions?: Partial<PopupProps>
  textareaOptions?: Partial<TextareaProps>
  inputOptions?: Partial<ExtractPropTypes<typeof inputProps>>
  buttonOptions?: Partial<ButtonProps>
  showTemplateButton?: boolean
  focus?: boolean
}>(), {
  placeholder: '说点什么...',
  buttonText: '发送',
  inputType: 'textarea',
})
const emit = defineEmits<{
  (e: 'blur'): void
  (e: 'confirm', value: string): void
}>()

const input = defineModel({ type: String, default: '' })
const cs = useClassesName('input-popup')
const textareaOptions = computed<Partial<TextareaProps>>(() => ({
  placeholder: props.placeholder || '',
  ...props.textareaOptions,
}))
const inputOptions = computed<Partial<ExtractPropTypes<typeof inputProps>>>(() => ({
  placeholder: props.placeholder || '',
  ...props.inputOptions,
}))
const buttonOptions = computed<Partial<ButtonProps>>(() => ({
  text: props.buttonText || '',
  ...props.buttonOptions,
}))
async function onConfirm() {
  const hasSensitive = await api.hasSensitiveWord(input.value)
  if (hasSensitive.result) {
    uni.showToast({
      title: '包含敏感词',
      icon: 'none',
    })
    return
  }
  emit('confirm', input.value)
}
function onBlur() {
  emit('blur')
}
</script>

<template>
  <view class="w-full flex items-center flex-1 bg-#F4F4F4 rounded-10px px-8px h-44px">
    <view class="flex-1">
      <wd-textarea
        v-if="inputType === 'textarea'"
        v-bind="{
          'modelValue': input,
          'noBorder': true,
          'focus': focus,
          'confirmType': 'send',
          'showConfirmBar': false,
          'autoHeight': true,
          'cursorSpacing': 100,
          'placeholder': placeholder,
          'customTextareaClass': cs.m('textarea'),
          'customClass': cs.m('textarea-container'),
          'placeholderClass': cs.m('textarea-placeholder'),
          'onUpdate:modelValue': (val) => {
            input = val
          },
          'onBlur': onBlur,
          'onConfirm': onConfirm,
          ...textareaOptions,
        }"
      />
      <wd-input
        v-else
        v-bind="{
          'modelValue': input,
          'noBorder': true,
          'focus': focus,
          'confirmType': 'send',
          'showConfirmBar': false,
          'autoHeight': true,
          'cursorSpacing': 100,
          'placeholder': placeholder,
          'customTextareaClass': cs.m('textarea'),
          'customClass': cs.m('textarea-container'),
          'placeholderClass': cs.m('textarea-placeholder'),
          'onUpdate:modelValue': (val) => {
            input = val
          },
          'onBlur': onBlur,
          'onConfirm': onConfirm,
          ...inputOptions,
        }"
      />
    </view>
    <wd-button v-show="showTemplateButton" v-bind="{ type: 'primary', size: 'small', round: false, disabled: !input.trim(), customClass: 'rounded-8px', customStyle: '--wot-button-small-height: 30px', onClick: onConfirm, ...buttonOptions }">
      {{ buttonText }}
    </wd-button>
  </view>
</template>

<style lang='css' scoped></style>
