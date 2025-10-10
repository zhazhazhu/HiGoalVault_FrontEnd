export interface LauncherOptions extends Partial<UniApp.RequestOptions> {}

export enum Code {
  SUCCESS = 200,
}

export interface RequestResult<T> {
  code: Code
  message: string
  result: T
}

export type Key = 'uni' | 'test'

export type UniOptions = Partial<UniApp.RequestOptions>

export type TestOptions = Partial<{ js: string }>

export const baseUrl = 'https://higoall.com:9443/api/v1'

const defaultOptions: LauncherOptions = {
  header: {
    'Content-Type': 'application/json',
  },
}

function createRequest<T = UniApp.RequestSuccessCallbackResult['data']>(type: LauncherOptions['method'], url: string, options: UniOptions, data?: LauncherOptions['data']): Promise<RequestResult<T>> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: baseUrl + url,
      method: type,
      data,
      ...options,
      success(res) {
        if (res.statusCode === 400) {
          uni.showToast({
            title: String((res.data as any).message || '请求失败'),
            icon: 'none',
          })
        }
        resolve(res.data as any)
      },
      fail(err) {
        console.log('request', err)
        reject(err)
      },
    })
  })
}

export type Launcher = (url: string, options?: UniOptions) => {
  get: <T>() => Promise<RequestResult<T>>
  post: <T>(data?: any) => Promise<RequestResult<T>>
  put: <T>(data?: any) => Promise<RequestResult<T>>
  delete: <T>(data?: any) => Promise<RequestResult<T>>
}

const http: Launcher = (url, options) => {
  const _options = { ...defaultOptions, ...options } as any

  function get<T>() {
    return createRequest<T>('GET', url, _options)
  }
  function post<T>(data: LauncherOptions['data']) {
    return createRequest<T>('POST', url, _options, data)
  }
  function put<T>(data: LauncherOptions['data']) {
    return createRequest<T>('PUT', url, _options, data)
  }
  function deleteRequest<T>(data: LauncherOptions['data']) {
    return createRequest<T>('DELETE', url, _options, data)
  }

  return {
    get,
    post,
    put,
    delete: deleteRequest,
  }
}

export { http }
