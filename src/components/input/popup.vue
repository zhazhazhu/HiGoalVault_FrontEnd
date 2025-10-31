<script lang='ts' setup>
import type { ExtractPropTypes } from 'vue'
import type { ButtonProps } from 'wot-design-uni/components/wd-button/types'
import type { popupProps } from 'wot-design-uni/components/wd-popup/types'
import type { TextareaProps } from 'wot-design-uni/components/wd-textarea/types'
import { computed, ref } from 'vue'
import { api } from '@/api'
import { useClassesName } from '@/composables'

type PopupProps = ExtractPropTypes<typeof popupProps>

const props = withDefaults(defineProps<{
  visible?: boolean
  placeholder?: string
  buttonText?: string
  popupOptions?: Partial<PopupProps>
  textareaOptions?: Partial<TextareaProps>
  buttonOptions?: Partial<ButtonProps>
}>(), {
  placeholder: '说点什么...',
  buttonText: '发送',
})

const emit = defineEmits<{
  (e: 'confirm', value: string): void
}>()
const input = defineModel({ type: String, default: '' })
const visible = defineModel('visible', { type: Boolean, default: false })
const cs = useClassesName('input-popup')
const isFocus = ref(false)
const textareaOptions = computed<Partial<TextareaProps>>(() => ({
  placeholder: props.placeholder || '',
  ...props.textareaOptions,
}))
const buttonOptions = computed<Partial<ButtonProps>>(() => ({
  text: props.buttonText || '',
  ...props.buttonOptions,
}))

function handleClose() {
  visible.value = false
}
function onVisualInput() {
  visible.value = true
}
function handleBeforeLeave() {
  isFocus.value = false
}
function handleAfterEnter() {
  isFocus.value = true
}
async function onConfirm() {
  const hasSensitive = await api.hasSensitiveWord(input.value)
  if (hasSensitive.result) {
    uni.showToast({
      title: '包含敏感词',
      icon: 'none',
    })
    return
  }
  visible.value = false
  emit('confirm', input.value)
}
function onBlur() {
  visible.value = false
}
</script>

<template>
  <view>
    <view @click="onVisualInput">
      <slot>
        <view class="bg-#f3f3f3 px-20rpx py-30rpx text-24rpx text-gray-3">
          {{ placeholder }}
        </view>
      </slot>
    </view>

    <wd-popup
      v-bind="{
        'modelValue': visible,
        'position': 'bottom',
        'lazyRender': true,
        'duration': 100,
        'onUpdate:modelValue': (value: boolean) => { visible = value },
        'onClose': handleClose,
        'onBefore-leave': handleBeforeLeave,
        'onAfter-enter': handleAfterEnter,
        ...popupOptions,
      }"
    >
      <view class="p-30rpx pb-40rpx flex items-center gap-20rpx">
        <view class="flex-1">
          <wd-textarea
            v-bind="{
              'modelValue': input,
              'noBorder': true,
              'focus': isFocus,
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
              'onConfirm': onConfirm,
              'onBlur': onBlur,
              ...textareaOptions,
            }"
          />
        </view>

        <wd-button v-bind="{ type: 'primary', size: 'small', round: false, customClass: 'rounded-8px', onClick: onConfirm, ...buttonOptions }">
          {{ buttonText }}
        </wd-button>
      </view>
    </wd-popup>
  </view>
</template>

<style lang='scss' scoped></style>
