import type { Launcher, Options, RequestResult } from '@higoal/api'
import { Api } from '@higoal/api'

export interface LauncherOptions extends Partial<UniApp.RequestOptions> {}

const baseUrl = 'http://192.168.1.106:8888'

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
        resolve(res.data as RequestResult<T>)
      },
      fail(err) {
        reject(err)
      },
    })
  })
}

const launcher: Launcher = (url, options) => {
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

export const api = new Api(launcher)
