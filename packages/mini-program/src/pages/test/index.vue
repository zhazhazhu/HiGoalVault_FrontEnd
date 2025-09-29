<script lang='ts' setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const qCloudAIVoice = requirePlugin('QCloudAIVoice')
const speechRecognizerManager = qCloudAIVoice.speechRecognizerManager()
const status = ref<number>(0)
const intervalTimer = ref<number>(0)
const time = ref<number>(0)

onLoad(() => {
  speechRecognizerManager.OnRecognitionStart = (res) => { // 表示链接建立成功，收到此回调才能调用stop方法关闭录音和识别链接
    console.log('开始识别', res)
    status.value = 1
  }
  speechRecognizerManager.OnRecognitionResultChange = (res) => {
    console.log('识别变化时', res)
  }
  // 一句话结束
  speechRecognizerManager.OnSentenceEnd = (res) => {
    console.log('一句话结束', res)
  }
  // 识别结束
  speechRecognizerManager.OnRecognitionComplete = (res) => {
    console.log('识别结束', res)
    status.value = 2
  }
  speechRecognizerManager.OnError = (res) => {
  // code为6001时，国内站用户请检查是否使用境外代理，如果使用请关闭。境外调用需开通国际站服务
    console.log('识别失败', res)
  }
  speechRecognizerManager.OnRecorderStop = (res) => {
    console.log('录音结束', res)
  }
})

function gotoHome() {
  uni.navigateTo({
    url: '/pages/index/index',
  })
}

function start() {
  clearInterval(intervalTimer.value)
  timeCounter()
  speechRecognizerManager.start({
    secretkey: 'mwtADgGIgPholyT+2Aeb7pNkWg0zO6SkNr13AlYY57c=',
    secretid: 'AKIDd_1DVZmH9gbmfdDSMZEFaB1NFMzk47uhj5QShLYubuGAqrRlQZTpdRhVoOP7GbSz',
    appid: '1308154027', // 腾讯云账号appid（非微信appid）
    token: 'XIRjwtpGZr6pNe6J9xCOcM0W3HxDri0aa30e9a2913013cd64e6052d1961179eePo5Q48whmjv4fm-Fp6U1OAcGqiDSyRgb5aNudfAbzErdGwNR-iwluVshHCNMBhsWD-UXsYnNni8tLtuLse6xE4ll063R3DY6yY-fkze1CsbiVC12gsp4erg9AaUL6yw6NuOfmjMTbdB2P-ZaM18aNh2aY-A8tVkoz3YWgmUIyieZ_N4-1EuGWPZB_fMdFFgUpA73GK5Ly98S0-O8JB575CwE-oJeLw3BnpvmqTjFNTqMHLNzDh6hkeApTK6UfH8iLsyNpFBN9jSYqibaB6vFrdp1J5ipjXagLvliPZlbPAlsMEtBCe-GnP8yik6jqeOk', // 选填参数，若密钥为临时密钥，需传此参数。
    engine_model_type: '16k_zh',
    voice_format: 1, // 1 为 pcm, 8为 mp3, 目前仅支持mp3和pcm
  })
}

function stop() {
  speechRecognizerManager.stop()
}
function timeCounter(t?: number) {
  if (t === undefined) {
    intervalTimer.value = setInterval(() => { // 设定一个计时器ID。按照指定的周期（以毫秒计）来执行注册的回调函数
      time.value += 1 // 每秒钟计时+1
    }, 1000)
  }
  else {
    clearInterval(intervalTimer.value) // 取消计时
    console.log('暂停计时')
  }
}
</script>

<template>
  <view class="flex items-center justify-center h-100vh w-100vw">
    <button @click="gotoHome">
      回主页
    </button>
    <button @click="start">
      开始识别
    </button>
    <button @click="stop">
      停止识别
    </button>
  </view>
</template>

<style lang='css' scoped></style>
