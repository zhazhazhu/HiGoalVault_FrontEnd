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

export interface PageResult {
  current: number
  pages: number
  size: number
  total: number
}

export interface ChatHistoryRequestQuery extends Page {
  userId: string
  chatId?: string
}

export interface ChatMessageBefore {
  chatId: string
  query: string // 用户问题
  msgId: string
  chatQueryAnswerList: AnswerBefore[]
}

export interface AnswerBefore {
  data: string // 股票图数据
  message: string // 深度思考内容
  query?: string // 用户问题
  queryId?: string // 问题id
  reference: string // 引用
  response: string // 回答问题
  ts: string // 时间
  runId: string
}

export interface AnswerAfter extends Omit<AnswerBefore, 'reference' | 'data'> {
  reference: ChatMessageReference[]
  data: ChatMessageStockData // 股票图数据
}

export interface ChatMessageAfter extends Omit<ChatMessageBefore, 'chatQueryAnswerList'> {
  chatQueryAnswerList: AnswerAfter[]
}

export interface ChatMessageWithPage extends PageResult {
  records: ChatMessageBefore[]
}

export interface ChatMessageStockData {

}

export interface ChatMessageReference {
  name: string
  url: string
}

export interface ChatRequestQuery extends Page {
  userId: string
}

export interface ChatWithPage extends PageResult {
  records: Chat[]
}

export interface Chat {
  chatId: string
  title: string
  userId: string
  createTime: string
  updateTime: string
}
