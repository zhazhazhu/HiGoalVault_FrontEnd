export interface LoginResult {
  accessToken: string
  refreshToken: string
  accessTokenExpireTime: number
  refreshTokenExpireTime: number
}

export enum Sex {
  MAN = 1,
  WOMAN = 0,
}

export interface UserInfo {
  id: string
  birthday: string
  face: string
  sex: Sex
  nickname: string
  mobile: string
  username: string
}

export interface Page {
  pageSize?: number
  pageNumber?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface ChatHistoryRequestQuery extends Page {
  userId: string
}

export interface ChatMessage {
  chatId: string
  data: ChatMessageStockData[] // 股票图数据
  message: string // 深度思考内容
  query: string // 用户问题
  queryId: string // 问题id
  reference: ChatMessageReference[]
}

export interface ChatMessageStockData {

}

export interface ChatMessageReference {

}
