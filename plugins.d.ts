declare global {
  type PluginName = 'QCloudAIVoice'

  type EngineModelType = '16k_zh' | '16k_en' | '16k_ca' | '16k_ko' | '16k_zh-TW'

  type VoiceFormat = 1 | 8 // 1 为 pcm, 8为 mp3, 目前仅支持mp3和pcm

  interface QCloudAIVoiceSpeechRecognizerManagerStartParams {
    secretkey: string
    secretid: string
    appid: number // 腾讯云账号appid（非微信appid）
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
    [key: string]: any
  }

  function QCloudAIVoiceTextToSpeechSuccessCallback(res: { result: { filePath: string } }): void

  function QCloudAIVoiceTextToSpeechFailCallback(error: any): void

  interface QCloudAIVoiceTextToSpeechParams {
    content: string
    speed?: number // 语速，范围：[-2，2]，分别对应不同语速：-2代表0.6倍，-1代表0.8倍，0代表1.0倍（默认），1代表1.2倍，2代表1.5倍。如果需要更细化的语速，可以保留小数点后一位，例如0.5 1.1 1.8等。
    volume?: number // 音量大小，范围：[0，10]，分别对应11个等级的音量，默认为0，代表正常音量。没有静音选项。输入除以上整数之外的其他参数不生效，按默认值处理。
    projectId?: number // 项目id，默认0
    voiceType: number // 音色
    language?: 0 | 1 // 主语言类型：1-中文（默认)，2-英文
    sampleRate?: number // 采样率，范围：[8000, 16000]，默认16000
    emotionCategory?: string // 控制合成音频的情感，仅支持多情感音色使用。取值: neutral(中性)、sad(悲伤)、happy(高兴)、angry(生气)、fear(恐惧)、news(新闻)、story(故事)、radio(广播)、poetry(诗歌)、call(客服)。
    emotionIntensity?: number // 控制合成音频情感程度，取值范围为[50,200],默认为100；只有emotionCategory不为空时生效。
    success: QCloudAIVoiceTextToSpeechSuccessCallback // 成功回调
    fail: QCloudAIVoiceTextToSpeechFailCallback // 失败回调
  }

  type QCloudAIVoiceSpeechRecognizerManagerStart = (params: QCloudAIVoiceSpeechRecognizerManagerStartParams, voiceId?: string) => void

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

  interface QCloudAIVoiceRealtimeRecognition {
    start: QCloudAIVoiceSpeechRecognizerManagerStart
    stop: () => void
    write: (data: Uint8Array) => void
    OnRecognitionStart: (res) => void
    OnRecognitionResultChange: (res) => void
    OnSentenceBegin: (res) => void
    OnSentenceEnd: (res) => void
    OnRecognitionComplete: (res) => void
    OnError: (res) => void
  }

  interface QCloudAIVoice {
    speechRecognizerManager: () => QCloudAIVoiceSpeechRecognizerManager
    realtimeRecognition: () => QCloudAIVoiceRealtimeRecognition
    setQCloudSecret: (appid: number, secretid: string, secretkey: string, openConsole?: boolean, token?: string) => void
    textToSpeech: (params: QCloudAIVoiceTextToSpeechParams) => void
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
