<script lang='ts' setup>
import type { ExtractPropTypes } from 'vue'
import type { ButtonProps } from 'wot-design-uni/components/wd-button/types'
import type { inputProps } from 'wot-design-uni/components/wd-input/types'
import type { popupProps } from 'wot-design-uni/components/wd-popup/types'
import type { TextareaProps } from 'wot-design-uni/components/wd-textarea/types'
import { computed, ref } from 'vue'
import { api } from '@/api'

type PopupProps = ExtractPropTypes<typeof popupProps>

const props = withDefaults(defineProps<{
  modelValue?: string
  visible?: boolean
  placeholder?: string
  buttonText?: string
  inputType?: 'input' | 'textarea'
  popupOptions?: Partial<PopupProps>
  textareaOptions?: Partial<TextareaProps>
  inputOptions?: Partial<ExtractPropTypes<typeof inputProps>>
  buttonOptions?: Partial<ButtonProps>
  showTemplateButton?: boolean
  disableTemplate?: boolean
}>(), {
  placeholder: '说点什么...',
  buttonText: '发送',
  inputType: 'textarea',
})

const emit = defineEmits<{
  (e: 'confirm', value: string): void
  (e: 'afterLeave'): void
}>()
const input = defineModel({ type: String, default: '' })
const visible = defineModel('visible', { type: Boolean, default: undefined })
const isFocus = ref(false)
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

function handleClose() {
  visible.value = false
}
function onVisualInput() {
  if (!props.disableTemplate || visible.value === undefined) {
    return
  }
  visible.value = true
}
function handleBeforeLeave() {
  isFocus.value = false
}
function handleAfterEnter() {
  isFocus.value = true
}
function handleAfterLeave() {
  input.value = props.modelValue || ''
  emit('afterLeave')
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
  await emit('confirm', input.value)
  visible.value = false
}
function onBlur() {
  visible.value = false
  emit('afterLeave')
}

defineExpose({
  open() {
    visible.value = true
  },
})
</script>

<template>
  <view>
    <view @click="onVisualInput">
      <slot>
        <InputModel
          v-model="input"
          :focus="isFocus"
          :placeholder="placeholder"
          :button-text="buttonText"
          :input-type="inputType"
          :textarea-options="{ disabled: disableTemplate, ...textareaOptions }"
          :input-options="{ disabled: disableTemplate, ...inputOptions }"
          :button-options="{ disabled: disableTemplate || !input.trim(), ...buttonOptions }"
          :show-template-button="showTemplateButton"
          @blur="onBlur"
          @confirm="onConfirm"
        />
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
        'onAfterLeave': handleAfterLeave,
        'onAfter-enter': handleAfterEnter,
        ...popupOptions,
      }"
    >
      <view class="p-30rpx">
        <InputModel
          v-model="input"
          :focus="isFocus"
          :placeholder="placeholder"
          :button-text="buttonText"
          :input-type="inputType"
          :textarea-options="{ ...textareaOptions }"
          :input-options="{ ...inputOptions }"
          :button-options="{ disabled: !input.trim(), ...buttonOptions }"
          :show-template-button="true"
          @blur="onBlur"
          @confirm="onConfirm"
        />
      </view>
    </wd-popup>
  </view>
</template>

<style lang='scss' scoped></style>
