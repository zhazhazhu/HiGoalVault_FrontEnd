declare global {
  type PluginName = 'QCloudAIVoice'

  type EngineModelType = '16k_zh' | '16k_en' | '16k_ca' | '16k_ko' | '16k_zh-TW'

  type VoiceFormat = 1 | 8 // 1 为 pcm, 8为 mp3, 目前仅支持mp3和pcm

  type QCloudAIVoiceSpeechRecognizerManagerStart = (params: {
    secretkey: string
    secretid: string
    appid: string // 腾讯云账号appid（非微信appid）
    token?: string // 选填参数，若密钥为临时密钥，需传此参数。
    // 实时识别接口参数
    engine_model_type: EngineModelType
    voice_format: VoiceFormat // 1 为 pcm, 8为 mp3, 目前仅支持mp3和pcm
    // 以下为非必填参数，可跟据业务自行修改
    hotword_id?: string
    needvad?: number
    filter_dirty?: number
    filter_modal?: number
    filter_punc?: number
    convert_num_mode?: number
    word_info?: number
    vad_silence_time?: number
  }) => void

  interface QCloudAIVoiceSpeechRecognizerManager {
    start: QCloudAIVoiceSpeechRecognizerManagerStart
    stop: () => void
    OnRecognitionStart: (res) => void
    OnSentenceBegin: (res) => void
    OnRecognitionResultChange: (res) => void
    OnSentenceEnd: (res) => void
    OnRecognitionComplete: (res) => void
    OnError: (res) => void
    OnRecorderStop: (res) => void
  }

  interface QCloudAIVoice {
    speechRecognizerManager: () => QCloudAIVoiceSpeechRecognizerManager
  }

  interface RequirePluginReturn {
    QCloudAIVoice: QCloudAIVoice
  }

  /**
   * 加载插件
   * @param name 插件名称
   * @returns 插件实例
   */
  function requirePlugin<T extends PluginName>(name: T): RequirePluginReturn[T]
}

export {}
