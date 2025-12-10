<script lang='ts' setup>
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref, watch } from 'vue'
import { useMessage } from 'wot-design-uni'
import { api } from '@/api'
import { useUserStore } from '@/store'

const message = useMessage()
const parentReportOptions = ref<{ label: string, value: number }[]>([])
const userStore = useUserStore()
const firstViolationModule = ref<number | null>(null)
const formData = ref<any>({
  complaintUserId: userStore.userInfo?.id || '',
  objectId: '',
  violationDesc: '',
  violationModule: undefined,
  violationType: undefined,
})
watch(formData, (newVal) => {
  console.log(newVal)
}, { deep: true })
const showDescription = computed(() => {
  return Number(formData.value.violationType) === formData.value.violationModule * 100
})
const contentData = ref<any>(null)
const userData = ref<any>(null)

watch(() => firstViolationModule.value, (violationModule) => {
  if (!violationModule) {
    return
  }
  const arr = [
    { label: '用户举报', value: 3 },
  ]
  if (violationModule === 1) {
    arr.push({ label: '内容举报', value: 1 })
    api.getPublicMessageDetail({ contentId: formData.value.objectId }).then((res) => {
      if (res.code === 200) {
        contentData.value = res.result
      }
    })
  }
  else if (violationModule === 4) {
    arr.push({ label: '评论举报', value: 4 })
  }
  else if (violationModule === 5) {
    arr.push({ label: '评论举报', value: 5 })
  }
  else {
    api.getUserInfo(formData.value.objectId as string).then((res) => {
      debugger
      if (res.code === 200) {
        userData.value = res.result
      }
    })
  }

  parentReportOptions.value = arr
}, { immediate: true })
watch(() => formData.value.violationModule, (violationModule) => {
  if (!violationModule) {
    return
  }
  getData()
  formData.value.violationType = undefined
}, { immediate: true })

const childReportOptions = ref<{ label: string, value: number }[]>([])

async function getData() {
  const res = await api.getComplaintList({ parentCode: formData.value.violationModule })
  if (res.code === 200) {
    childReportOptions.value = res.result.map(item => ({
      label: item.violationName,
      value: Number(item.violationCode),
    }))
  }
}
function gotoBack() {
  uni.navigateBack()
}
function handleSubmitReport() {
  if (!formData.value.violationModule) {
    uni.showToast({ title: '请选择举报内容', icon: 'none' })
    return
  }
  if (!formData.value.violationType) {
    uni.showToast({ title: '请选择举报原因', icon: 'none' })
    return
  }
  if (showDescription.value && !formData.value.violationDesc) {
    uni.showToast({ title: '请填写详细描述', icon: 'none' })
    return
  }
  message.confirm({
    title: '提示',
    msg: '确认提交举报？',
  }).then(async () => {
    const res = await api.submitComplaint(formData.value)
    if (res.code === 200) {
      uni.showToast({
        title: '举报提交成功，我们会尽快处理',
        icon: 'none',
      })
      uni.navigateBack()
    }
  }).catch(() => {
  })
}

onLoad((options) => {
  firstViolationModule.value = Number(options?.type) || 1
  formData.value.violationModule = firstViolationModule.value
  formData.value.objectId = options?.objectId
})
</script>

<template>
  <wd-root-portal>
    <wd-message-box />
  </wd-root-portal>
  <view class="h-screen">
    <Navbar title="举报">
      <template #left>
        <view class="flex items-center gap-20rpx" @click="gotoBack">
          <view class="i-material-symbols-arrow-back-ios-new-rounded text-44rpx" />
        </view>
      </template>
    </Navbar>

    <Container>
      <scroll-view
        scroll-into-view-alignment="end"
        enhanced
        :scroll-y="true"
        :show-scrollbar="false"
        class="h-[calc(100vh-100px)] bg-#F7F8F9"
        :lower-threshold="50"
        :refresher-enabled="true"
      >
        <view class="p-32rpx">
          <view class="report-card">
            <view class="title">
              举报内容
            </view>
            <view>
              <wd-radio-group v-model="formData.violationModule" custom-class="justify-end!">
                <wd-radio
                  v-for="item in parentReportOptions"
                  :key="item.value"
                  :value="item.value"
                  class="py-10px justify-end! b-b-1px b-solid b-#f1f1f1 last:b-0px"
                  shape="dot"
                  icon-placement="left"
                >
                  {{ item.label }}
                </wd-radio>
              </wd-radio-group>
            </view>
          </view>

          <view class="report-card">
            <template v-if="formData.violationModule === 3">
              <view class="title">
                举报用户
              </view>
              <view v-if="firstViolationModule === 1" class="flex items-center gap-20rpx">
                <wd-img width="80rpx" height="80rpx" round mode="aspectFill" :src="contentData?.face" />
                <view class="flex flex-col gap-10rpx">
                  <view class="text-14px font-500">
                    {{ contentData?.nickName }}
                  </view>
                  <view class="text-12px color-#666">
                    {{ contentData?.userUid }}
                  </view>
                </view>
              </view>
              <view v-else class="flex items-center gap-20rpx">
                <wd-img width="80rpx" height="80rpx" round mode="aspectFill" :src="userData?.face" />
                <view class="flex flex-col gap-10rpx">
                  <view class="text-14px font-500">
                    {{ userData?.nickName }}
                  </view>
                  <view class="text-12px color-#666">
                    uid: {{ userData?.userUid }}
                  </view>
                </view>
              </view>
            </template>
            <template v-else-if="formData.violationModule === 1">
              <view class="title">
                举报内容
              </view>
              <view class="description">
                {{ contentData?.nickName }}： {{ contentData?.content }}
              </view>
            </template>
            <template v-else-if="formData.violationModule === 4 || formData.violationModule === 5">
              <view class="title">
                举报评论
              </view>
            </template>
          </view>

          <view class="report-card">
            <view class="title">
              请选择举报原因
            </view>
            <view>
              <wd-radio-group v-model="formData.violationType" custom-class="justify-end!">
                <wd-radio
                  v-for="item in childReportOptions"
                  :key="item.value"
                  :value="item.value"
                  class="py-10px justify-end! b-b-1px b-solid b-#f1f1f1 last:b-0px"
                  shape="dot"
                  icon-placement="left"
                >
                  {{ item.label }}
                </wd-radio>
              </wd-radio-group>
            </view>
          </view>

          <view v-if="showDescription" class="report-card">
            <view class="title">
              详细描述
            </view>
            <view class="px-10px">
              <wd-textarea
                v-model="formData.violationDesc"
                no-border
                placeholder="请详细描述您的举报内容，便于我们更好地处理"
                auto-height
                show-word-limit
                required
                custom-textarea-class="hi-textarea"
                custom-class="hi-textarea-container"
                placeholder-class="hi-textarea-placeholder"
                :maxlength="400"
              />
            </view>
          </view>

          <wd-button type="primary" block class="mt-40rpx" :round="false" @click="handleSubmitReport">
            提交举报
          </wd-button>
        </view>
      </scroll-view>
    </Container>
  </view>
</template>

<style lang='scss' scoped>
.report-card {
  background-color: white;
  border-radius: 8px;
  padding: 20rpx;
  & + & {
    margin-top: 20rpx;
  }
  .title {
    font-size: 14px;
    margin-bottom: 20rpx;
    color: #4e5a65;
  }
  .description {
    font-size: 14px;
    color: #333;
  }
  .cell {
    padding: 20rpx 0;
    border-bottom: 1px solid #f5f5f5;
    &:last-child {
      border-bottom: none;
    }
    .cell__hd {
      margin-right: 20rpx;
    }
    .cell__bd {
      font-size: 14px;
      color: #333;
    }
  }
}
</style>
