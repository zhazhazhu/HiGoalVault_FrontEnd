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

function createRequestPromiseFactory<T>(type: LauncherOptions['method'], url: string, options: UniOptions, data?: LauncherOptions['data']): () => Promise<RequestResult<T>> {
  // 返回一个函数，每次调用都会生成一个新的 Promise（即发起一个新的请求）
  return () => {
    return new Promise((resolve, reject) => {
      uni.request({
        url: baseUrl + url,
        method: type,
        data,
        ...options,
        success(res) {
          if (res.statusCode >= 400) {
            uni.showToast({
              title: String((res.data as any).message || '请求失败'),
              icon: 'none',
            })
          }
          resolve(res.data as any)
        },
        fail(err) {
          // uni.request 的 fail 只会在网络错误/超时等情况下触发
          console.error('uni.request fail:', err)
          reject(err) // 此时触发重试
        },
      })
    })
  }
}

function createRequest<T = UniApp.RequestSuccessCallbackResult['data']>(type: LauncherOptions['method'], url: string, options: UniOptions, data?: LauncherOptions['data']): Promise<RequestResult<T>> {
  const requestFactory = createRequestPromiseFactory<T>(type, url, options, data)

  return retry(requestFactory, { retryCount: 20, retryDelay: 3000 })
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

interface RetryOptions {
  retryCount?: number
  retryDelay?: number
}
/**
 * 重试函数，接收一个返回 Promise 的函数 (Promise Factory)
 * @param promiseFactory 每次调用都会发起一个新的 uni.request 请求
 * @param options 重试选项
 */
function retry<T>(promiseFactory: () => Promise<RequestResult<T>>, options: RetryOptions = {}): Promise<RequestResult<T>> {
  return retryPromise(promiseFactory, options)
}
function retryPromise<T>(promiseFactory: () => Promise<RequestResult<T>>, options: RetryOptions = {}): Promise<RequestResult<T>> {
  return promiseFactory()
    .then((res) => {
      return res
    })
    .catch((err) => {
      if (options.retryCount && options.retryCount > 0) {
        return new Promise((resolve) => {
          setTimeout(() => {
            console.warn(`请求失败，正在重试（剩余 ${options.retryCount} 次）...`)
            // 递归调用，并传入递减的重试次数
            resolve(retryPromise(promiseFactory, {
              retryCount: options.retryCount ? options.retryCount - 1 : undefined,
              retryDelay: options.retryDelay,
            }))
          }, options.retryDelay || 1000)
        })
      }
      else {
        console.error('请求达到最大重试次数，最终失败。', err)
        throw err
      }
    })
}

export { http, retry }
