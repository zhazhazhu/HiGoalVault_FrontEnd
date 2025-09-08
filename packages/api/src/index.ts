export interface RequestResult<T> {
  code: number
  msg: string
  data: T
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
  post: <T>(data: any) => Promise<RequestResult<T>>
  put: <T>(data: any) => Promise<RequestResult<T>>
  delete: <T>(data: any) => Promise<RequestResult<T>>
}

export class Api {
  private launcher: Launcher
  constructor(launcher: Launcher) {
    this.launcher = launcher
  }

  public login(data: { code: string, phoneCode: string }) {
    return this.launcher<'uni'>('/buyer/passport/connect/miniProgram/phone/once').post<{ accessToken: string, refreshToken: string }>(data)
  }
}
