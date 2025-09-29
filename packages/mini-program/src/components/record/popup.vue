<script lang='ts' setup>
import { useClassesName } from '@higoal/hooks'
import { computed, getCurrentInstance, ref } from 'vue'

const props = defineProps<{
  focusedButton: 'cancel' | 'microphone' | 'text' | null
}>()
const model = defineModel({ type: Boolean, default: false })
const cs = useClassesName('record')
const currentDecibel = ref(0)
const instance = getCurrentInstance()
const query = uni.createSelectorQuery().in(instance)
const recordContainer = query.select('.hi-record--container')
const text = computed(() => {
  if (props.focusedButton === 'cancel') {
    return '松手取消'
  }
  else if (props.focusedButton === 'microphone') {
    return '松开发送'
  }
  return '松开编辑文字'
})

function handleClose() {
  model.value = false
}

defineExpose({
  recordContainer,
})
</script>

<template>
  <wd-popup
    v-model="model"
    position="bottom"
    custom-style="height: 250px; border-radius: 16px; margin: 20px;"
    lazy-render
    lock-scroll
    root-portal
    transition="zoom-in"
    @close="handleClose"
  >
    <view :class="cs.m('container')">
      <view :class="cs.e('decibel')">
        <RecordWave :decibel="currentDecibel" :is-recording="model" />
      </view>

      <text :class="cs.e('description')">
        {{ text }}
      </text>

      <view id="button-group" :class="cs.e('button-group')">
        <view class="transition-all" :class="[cs.e('cancel'), cs.e('secund-button'), { focus: focusedButton === 'cancel' }]">
          <view class="i-weui-close-filled icon text-28px" />
        </view>

        <view
          class="transition-all"
          :class="[cs.e('microphone'), { focus: focusedButton === 'microphone' }]"
        >
          <view class="i-iconamoon-microphone text-40px color-#333" />
        </view>

        <view class="transition-all" :class="[cs.e('text'), cs.e('secund-button'), { focus: focusedButton === 'text' }]">
          <text class="icon text-20px">
            文
          </text>
        </view>
      </view>
    </view>
  </wd-popup>
</template>

<style lang='scss' scoped>
.hi-record--container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  overflow: hidden;
}

.hi-record__decibel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.hi-record__description {
  font-size: 12px;
  color: #666666;
  line-height: 18px;
  text-align: center;
  margin: 20px 0;
}

.hi-record__button-group {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
}
.hi-record__microphone {
  width: 72px;
  height: 72px;
  background-color: #ff3b301f;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  &.focus {
    background-color: #ff3b3042;
  }
}
.hi-record__secund-button {
  width: 46px;
  height: 46px;
  background: #f3f3f3;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .icon {
    color: #333333;
  }
}
.hi-record__secund-button.hi-record__cancel.focus {
  background-color: #ff5555;
  .icon {
    color: white;
  }
}
.hi-record__secund-button.hi-record__text.focus {
  background-color: #04b578ff;
  .icon {
    color: white;
  }
}
</style>
