import type {
  AddCollectRequest,
  AddCommentRequest,
  Chat,
  ChatHistoryRequestQuery,
  ChatMessageWithPage,
  ChatRequestQuery,
  ChatWithPage,
  FollowUserRequest,
  LoginResult,
  PublishMessageListRequest,
  PublishMessageListResponse,
  PublishMessageListResponseWithPage,
  PublishMessageRequest,
  ShareMessageRequest,
  UpdateChat,
  UserInfo,
} from './types'
import { http } from './http'
import { API } from './url'

// 导出所有类型
export * from './types'

// 自动登录
function autoLoginByPhone(data: { code: string, phoneCode: string }) {
  return http(API.AUTO_LOGIN, { header: { ClientType: 'WECHAT_MP' } }).post<LoginResult>(data)
}

// 刷新令牌
function refreshToken(refreshToken: string) {
  return http(`${API.REFRESH_TOKEN}/${refreshToken}`).get<LoginResult>()
}

// 获取用户信息
function getUserInfo() {
  return http(API.USER_INFO).get<UserInfo>()
}

// 获取消息列表
function getMessageList(query: ChatHistoryRequestQuery) {
  return http(API.GET_MESSAGE_LIST).post<ChatMessageWithPage>(query)
}

// 获取聊天列表
function getChatList(query: ChatRequestQuery) {
  return http(API.GET_CHAT_LIST).post<ChatWithPage>(query)
}

// 添加聊天
function addChat(title?: string) {
  return http(API.ADD_CHAT).post<Chat>({ title })
}

// 添加收藏
function addCollect(query: AddCollectRequest) {
  return http(API.ADD_COLLECT).post<boolean>(query)
}

// 更新聊天
function updateChat(query: UpdateChat) {
  return http(API.UPDATE_CHAT).post<Chat>(query)
}

// 删除聊天
function deleteChat(chatId: string) {
  return http(API.DELETE_CHAT).post<boolean>({ chatId })
}

// 添加发布消息
function addPublishMessage(query: PublishMessageRequest) {
  return http(API.ADD_PUBLISH_MESSAGE).post<boolean>(query)
}

// 获取发布消息列表
function getPublishMessageList(query: PublishMessageListRequest) {
  return http(API.GET_PUBLISH_MESSAGE_LIST).post<PublishMessageListResponseWithPage>(query)
}

// 分享消息
function shareMessage(query: ShareMessageRequest) {
  return http(API.SHARE_MESSAGE).post<{ shareId: string }>(query)
}

// 获取分享消息列表
function getShareMessageList(shareId: string) {
  return http(`${API.GET_SHARE_MESSAGE_LIST}?id=${shareId}`).post<PublishMessageListResponse>()
}

// 获取公共消息详情
function getPublicMessageDetail(query: { contentId: string }) {
  return http(API.GET_PUBLIC_MESSAGE_DETAIL).post<PublishMessageListResponse>(query)
}

function followUser(query: FollowUserRequest) {
  return http(API.FOLLOW_USER).post<boolean>(query)
}

function addComment(query: AddCommentRequest) {
  return http(API.ADD_COMMENT).post<boolean>(query)
}

// 创建 API 实例对象，保持向后兼容
export const api = {
  autoLoginByPhone,
  refreshToken,
  getUserInfo,
  getMessageList,
  getChatList,
  addChat,
  addCollect,
  updateChat,
  deleteChat,
  addPublishMessage,
  getPublishMessageList,
  shareMessage,
  getShareMessageList,
  getPublicMessageDetail,
  followUser,
  addComment,
}
