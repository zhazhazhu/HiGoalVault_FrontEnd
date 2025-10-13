<script lang='ts' setup>
import { useClassesName } from '@/composables'

const model = defineModel({ type: Boolean, default: false })

const cs = useClassesName('source-action')

function close() {
  model.value = false
}
function onChooseImage(sourceType: 'album' | 'camera') {
  uni.chooseImage({
    sourceType: [sourceType],
    success(res) {
      console.log(res)
    },
    fail(res) {
      console.log(res)
    },
  })
}
function onChooseFile() {
  // #ifdef MP-WEIXIN
  uni.chooseMessageFile({
    count: 10,
    type: 'file',
    success(res) {
      console.log(res)
    },
  })
  // #endif
}
</script>

<template>
  <wd-popup
    v-model="model"
    :custom-class="cs.m('model')"
    :custom-header-class="cs.m('header')"
    position="bottom"
    root-portal
    safe-area-inset-bottom
    @close="close"
  >
    <view>
      <view class="p-20px pb-0 flex flex-wrap gap-20px">
        <button :class="cs.e('button')" @click="onChooseImage('album')">
          <view class="flex flex-col items-center" :class="cs.e('button-wrapper')">
            <view class="converse-picture-icon" :class="cs.e('icon')" />
            <text :class="cs.e('text')">
              图片
            </text>
          </view>
        </button>

        <button :class="cs.e('button')" @click="onChooseImage('camera')">
          <view class="flex flex-col items-center" :class="cs.e('button-wrapper')">
            <view class="converse-camera-icon" :class="cs.e('icon')" />
            <text :class="cs.e('text')">
              拍摄
            </text>
          </view>
        </button>

        <button :class="cs.e('button')" @click="onChooseFile">
          <view class="flex flex-col items-center" :class="cs.e('button-wrapper')">
            <view class="converse-file-icon" :class="cs.e('icon')" />
            <text :class="cs.e('text')">
              文件
            </text>
          </view>
        </button>
      </view>

      <view class="w-full h-1px bg-#F3F3F3 my-20px" />

      <view class="text-center mb-20px">
        <wd-text text="取消" size="18px" color="#121212" bold @click.stop="close" />
      </view>
    </view>
  </wd-popup>
</template>

<style lang='scss' scoped>
.hi-source-action__button {
  border-radius: 32rpx;
  width: 156rpx;
  height: 134rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f3f3;
  color: #3e3a39;
  margin: 0;
  .hi-source-action__icon {
    font-size: 28px;
  }
  .hi-source-action__text {
    font-size: 14px;
    line-height: 48rpx;
  }
  &::after {
    display: none;
  }
}
</style>
