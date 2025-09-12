import type { Launcher, Options, RequestResult } from '@higoal/api'
import { Api } from '@higoal/api'
import { useSse } from '@/api/wx'

export interface LauncherOptions extends Partial<UniApp.RequestOptions> {}

export const baseUrl = 'http://218.108.203.90:8888'

const defaultOptions: LauncherOptions = {
  header: {
    'Content-Type': 'application/json',
  },
}

function createRequest<T = UniApp.RequestSuccessCallbackResult['data']>(type: LauncherOptions['method'], url: string, options: Options, data?: LauncherOptions['data']): Promise<RequestResult<T>> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: baseUrl + url,
      method: type,
      data,
      ...options,
      success(res) {
        resolve(res.data as any)
      },
      fail(err) {
        reject(err)
      },
    })
  })
}

const launcherWx: Launcher = (url, options) => {
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

const launcherWeb: Launcher = (url, options) => {
  const _options = { ...defaultOptions, ...options } as any
  return {
    get() {
      return fetch(url, { ..._options, method: 'GET' }).then(res => res.json())
    },
    post(data) {
      return fetch(url, { ..._options, method: 'POST', body: JSON.stringify(data) }).then(res => res.json())
    },
    put() {
      return fetch(url, _options).then(res => res.json())
    },
    delete() {
      return fetch(url, _options).then(res => res.json())
    },
  }
}

let launcher: Launcher

// #ifdef MP-WEIXIN
launcher = launcherWx
// #endif

// #ifdef WEB
launcher = launcherWeb
// #endif

export const api = new Api(launcher)

export { useSse }
