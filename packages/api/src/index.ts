import type { LoginResult } from './index.d'
import { API } from './url'

export * from './index.d'

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

export interface Options {
  uni: UniOptions
  test: TestOptions
}

export type Launcher = <K extends Key = 'uni'>(url: string, options?: Options[K]) => {
  get: <T>() => Promise<RequestResult<T>>
  post: <T>(data?: any) => Promise<RequestResult<T>>
  put: <T>(data?: any) => Promise<RequestResult<T>>
  delete: <T>(data?: any) => Promise<RequestResult<T>>
}
export class Api {
  private launcher: Launcher
  constructor(launcher: Launcher) {
    this.launcher = launcher
  }

  public autoLoginByPhone(data: { code: string, phoneCode: string }) {
    return this.launcher<'uni'>(API.AUTO_LOGIN, { header: { ClientType: 'WECHAT_MP' } }).post<LoginResult>(data)
  }

  public refreshToken(refreshToken: string) {
    return this.launcher<'uni'>(`${API.REFRESH_TOKEN}/${refreshToken}`).get<LoginResult>()
  }
}
