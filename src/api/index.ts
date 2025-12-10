import type {
  AddCollectRequest,
  AddCommentReplyRequest,
  AddCommentRequest,
  Chat,
  ChatHistoryRequestQuery,
  ChatMessageWithPage,
  ChatMessageWithShareBefore,
  ChatRequestQuery,
  ChatWithPage,
  CommentListRequest,
  CommentListResponse,
  CommentResponse,
  CommentResponseRequired,
  DeleteReplyRequest,
  FollowTag,
  FollowUserRequest,
  GenerateStsTempKeyResponse,
  GetCommentOrReplyByIdRequest,
  GetFinanceBasicInfoResponse,
  GetFinanceDataRequest,
  GetFinanceDataResponse,
  GetPublishListByTagRequest,
  GlobalSearchRequest,
  GlobalSearchResultResponse,
  InteractedContentListRequest,
  InteractedContentListResponse,
  LikeCommentRequest,
  LikeContentRequest,
  LikeReplyRequest,
  LoginResult,
  MessageNotifyRequest,
  MessageNotifyResponse,
  MyCommentedRepliedListRequest,
  MyCommentedRepliedListResponseWithPage,
  Page,
  ProfileStatistics,
  PublishListRequest,
  PublishMessageListRequest,
  PublishMessageListResponse,
  PublishMessageListResponseWithPage,
  PublishMessageRequest,
  ReplyListRequest,
  ReplyListResponse,
  ShareMessageRequest,
  Tag,
  UpdateChat,
  UpdateUserInfoRequest,
  UserCenterSearchRequest,
  UserInfo,
} from './types'
import { baseUrl, http } from './http'
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
function getUserInfo(memberId?: string) {
  return http(API.USER_INFO).post<UserInfo>({ memberId })
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
function getShareMessageList(query: { shareId: string }) {
  return http(API.GET_SHARE_MESSAGE_LIST).post<ChatMessageWithShareBefore[]>(query)
}

// 获取公共消息详情
function getPublicMessageDetail(query: { contentId: string }) {
  return http(API.GET_PUBLIC_MESSAGE_DETAIL).post<PublishMessageListResponse>(query)
}

function followUser(query: FollowUserRequest) {
  return http(API.FOLLOW_USER).post<boolean>(query)
}

function addComment(query: AddCommentRequest) {
  return http(API.ADD_COMMENT).post<CommentResponseRequired>(query)
}

function getCommentList(query: CommentListRequest) {
  return http(API.GET_COMMENT_LIST).post<CommentListResponse>(query)
}

function globalSearch(query: GlobalSearchRequest) {
  return http(API.GLOBAL_SEARCH).post<GlobalSearchResultResponse>(query)
}

function addCommentReply(query: AddCommentReplyRequest) {
  return http(API.ADD_COMMENT_REPLY).post<CommentResponseRequired>(query)
}

function getFollowingPublishMessageList(query) {
  return http(API.GET_FOLLOWING_PUBLISH_MESSAGE_LIST).post<PublishMessageListResponseWithPage>(query)
}

function getCommentRepliesList(query: ReplyListRequest) {
  return http(API.GET_REPLIES_LIST).post<ReplyListResponse>(query)
}

// 获取用户统计信息
function getProfileStatistics(authorId: string = '') {
  return http(API.GET_PROFILE_STATISTICS).post<ProfileStatistics>({ authorId })
}

// 获取发布列表
function getPublishList(query: PublishListRequest) {
  return http(API.GET_PUBLISH_CONTENT_LIST).post<PublishMessageListResponseWithPage>(query)
}

// 获取评论过的内容列表
function getCommentedContentList(query: Page) {
  return http(API.GET_COMMENTED_CONTENT_LIST).post<PublishMessageListResponseWithPage>(query)
}

// 获取互动过的内容列表
function getInteractedLikedContentList(query: Page) {
  return http(API.GET_INTERACTED_LIKED_CONTENT_LIST).post<PublishMessageListResponseWithPage>(query)
}

// 获取收藏过的内容列表
function getInteractedCollectedContentList(query: InteractedContentListRequest) {
  return http(API.GET_INTERACTED_COLLECTED_CONTENT_LIST).post<InteractedContentListResponse>(query)
}

// 取消收藏
function cancelCollect(queryId: string) {
  return http(API.CANCEL_COLLECT).post<boolean>({ queryId })
}

// 点赞
function thumbsUp(query: LikeContentRequest) {
  return http(API.THUMBS_UP_CONTENT).post<boolean>(query)
}

// 点赞评论
function thumbsUpComment(query: LikeCommentRequest) {
  return http(API.THUMBS_UP_CONTENT_COMMENT).post<boolean>(query)
}

// 点赞回复
function thumbsUpReply(query: LikeReplyRequest) {
  return http(API.THUMBS_UP_CONTENT_REPLY).post<boolean>(query)
}

// 检查关注用户
function checkFollowUser(followeeId: string) {
  return http(`${API.CHECK_FOLLOW_USER}?followeeId=${followeeId}`).get<boolean>()
}

// 用户中心搜索
function userCenterSearch(query: UserCenterSearchRequest) {
  return http(API.USER_CENTER_SEARCH).post<GlobalSearchResultResponse>(query)
}

// 生成 STS 临时密钥
function generateStsTempKey() {
  return http(API.GENERATE_STS_TEMP_KEY).post<GenerateStsTempKeyResponse>()
}

// 修改用户信息
function updateUserInfo(query: UpdateUserInfoRequest) {
  return http(API.UPDATE_USER_INFO).post<boolean>(query)
}

// 分页获取评论我和回复我的聚合列表（带内容）
function getMyCommentedRepliedList(query: MyCommentedRepliedListRequest) {
  return http(API.GET_MY_COMMENTED_REPLIED_LIST).post<MyCommentedRepliedListResponseWithPage>(query)
}

// 获取热门标签
function getPopularTags() {
  return http(API.GET_POPULAR_TAGS).get<Tag[]>()
}

// 根据ID获取标签
function getTagById(tagId: string) {
  return http(`${API.GET_TAG_BY_ID}/${tagId}`).get<Tag>()
}

// 检查是否关注标签
function checkTagFollow(tagId: string) {
  return http(`${API.CHECK_TAG_FOLLOW}?tagId=${tagId}`).get<boolean>()
}

// 关注标签
function followTag(query: FollowTag) {
  return http(API.FOLLOW_TAG).post<boolean>(query)
}

// 获取发布列表（根据标签）
function getPublishListByTag(query: GetPublishListByTagRequest) {
  return http(API.GET_PUBLISH_BY_TAG).post<PublishMessageListResponseWithPage>(query)
}

// 删除聊天
function deleteChatMessageById(queryId: string) {
  return http(API.DELETE_CHAT_MESSAGE_BY_ID).post<boolean>({ queryId })
}

// 删除评论
function deleteCommentById(commentId: string) {
  return http(API.DELETE_COMMENT_BY_ID).post<boolean>({ commentId })
}

// 删除回复
function deleteReplyById(query: DeleteReplyRequest) {
  return http(API.DELETE_REPLY_BY_ID).post<string[]>(query)
}

// 根据ID获取评论或者回复
function getCommentOrReplyById(query: GetCommentOrReplyByIdRequest) {
  return http(API.GET_COMMENT_OR_REPLY_BY_ID).post<CommentResponse>(query)
}

// 根据ID删除发布内容
function deletePublishContentById(contentId: string) {
  return http(API.DELETE_PUBLISH_CONTENT_BY_ID).post<boolean>({ contentId })
}

// 获取金融数据
function getFinanceData(query: GetFinanceDataRequest) {
  return http(API.GET_FINANCE_DATA).post<GetFinanceDataResponse>(query)
}

// 获取金融基本信息
function getFinanceBasicInfo(transCode: string) {
  return http(API.GET_FINANCE_BASIC_INFO).post<GetFinanceBasicInfoResponse>({ transCode })
}

// 检查是否包含敏感词
function hasSensitiveWord(text: string) {
  return http(`${API.HAS_SENSITIVE_WORD}?text=${text}`, { retry: false }).get<boolean>()
}

// 搜索建议
function searchSuggest(prefix: string) {
  return http(`${API.SEARCH_SUGGEST}?prefix=${prefix}`, { retry: false }).get<string[]>()
}

function getUploadUrl() {
  return baseUrl + API.GET_UPLOAD_URL
}

// 获取消息通知
function getMessageNotify(query: MessageNotifyRequest) {
  return http(API.GET_MESSAGE_NOTIFY).post<MessageNotifyResponse>(query)
}

// 获取投诉类型列表
function getComplaintList(query: any) {
  return http(API.GET_COMPLAINT_LIST).post<any>(query)
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
  getCommentList,
  globalSearch,
  addCommentReply,
  getFollowingPublishMessageList,
  getCommentRepliesList,
  getProfileStatistics,
  getPublishList,
  getCommentedContentList,
  getInteractedLikedContentList,
  getInteractedCollectedContentList,
  cancelCollect,
  thumbsUp,
  thumbsUpComment,
  thumbsUpReply,
  checkFollowUser,
  userCenterSearch,
  generateStsTempKey,
  updateUserInfo,
  getMyCommentedRepliedList,
  getPopularTags,
  getTagById,
  checkTagFollow,
  followTag,
  getPublishListByTag,
  deleteChatMessageById,
  deleteCommentById,
  deleteReplyById,
  getCommentOrReplyById,
  deletePublishContentById,
  getFinanceData,
  getFinanceBasicInfo,
  hasSensitiveWord,
  searchSuggest,
  getUploadUrl,
  getMessageNotify,
  getComplaintList,
}
