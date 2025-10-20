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
  nickName: string
  mobile: string
  username: string
}

export interface Page {
  keyword?: string
  pageSize?: number
  pageNumber?: number
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: any
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

export interface ChatMessageWithShareBefore extends ChatMessageBefore {
  face: string
  nickName: string
}

export interface AnswerBefore {
  data: string | null // 股票图数据
  message: string // 深度思考内容
  query: string // 用户问题
  queryId: string // 问题id
  reference: string // 引用
  response: string // 回答问题
  ts: string // 时间
  runId: string
  isCollect: Truth // 是否收藏
  messageTimeLong: number // 消息时间 毫秒级
  chatId: string
}

export interface AnswerAfter extends Omit<AnswerBefore, 'reference' | 'data'> {
  reference: ChatMessageReference[]
  data: [ChatMessageStock] | [] // 股票图数据
  isLoading: boolean // 是否正在加载中
}

export interface ChatMessageAfter extends Omit<ChatMessageBefore, 'chatQueryAnswerList'> {
  chatQueryAnswerList: AnswerAfter[]
}

export interface ChatMessageWithShare extends Omit<ChatMessageWithShareBefore, 'chatQueryAnswerList'> {
  chatQueryAnswerList: AnswerAfter[]
}

export interface ChatMessageWithPage extends PageResult {
  records: ChatMessageBefore[]
}

export interface ChatMessageWithShareWithPage extends PageResult {
  records: ChatMessageWithShareBefore[]
}

/**
 * 聊天消息中的股票数据结构
 */
export interface ChatMessageStock {
  /** 股票数据元信息 */
  metadata: ChatMessageStockMetadata
  /** 股票交易数据列表 */
  data: ChatMessageStockData[]
  /** 数据名称标识 */
  name: string
}

/**
 * 股票数据元信息
 */
export interface ChatMessageStockMetadata {
  /** 股票代码列表 */
  symbol: string[]
  /** 数据生成时间 */
  generated_at: string
  /** 用户查询内容 */
  query: string
  /** 时间粒度（秒） */
  time_granularity_seconds: number
  /** 时间粒度标签 */
  time_granularity_label: string
}

/**
 * 股票交易数据
 */
export interface ChatMessageStockData {
  /** 成交额 */
  amount: number
  /** 创建时间 */
  create_time: string
  /** 交易日期 */
  trade_date: string
  /** 是否删除标识 */
  is_delete: number
  /** 更新时间 */
  update_time: string
  /** 最高价 */
  high: number
  /** 成交量 */
  vol: number
  /** 股票代码 */
  ts_code: string
  /** 最低价 */
  low: number
  /** 更新者 */
  updated_by: string
  /** 持仓量 */
  oi: number
  /** 收盘价 */
  close: number
  /** 开盘价 */
  open: number
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

export interface AddCollectRequest {
  queryId: string
}

export interface UpdateChat {
  chatId: string
  title: string
}

export enum Truth {
  TRUE = 1,
  FALSE = 0,
}

export enum PublishContentType {
  Text = 1,
  Image = 2,
  Video = 3,
  File = 4,
}

export interface PublishMessageRequest {
  title: string
  content: string
  queryId: string
  privacy: Truth
  contentType: PublishContentType
}

export interface PublishMessageListRequest extends Page {
  authorId?: string
  keyword?: string
  tagId?: string
}

export interface PublishMessageListResponse {
  id: string
  attachments: null
  commentCount: number // 评论数量
  contentType: PublishContentType // 内容类型
  content: string // 内容
  createTime: string // 发布时间
  likeCount: number // 点赞数量
  privacy: Truth // 是否公开
  queryId: string // 问题id
  isLike: boolean // 是否点赞
  title: string // 标题
  shareCount: number // 分享数量
  viewCount: number // 阅读数量
  nickName: string // 发布人昵称
  memberId: string // 发布人id
  face: string // 发布人头像
  tags: Array<Tag>
  chatQueryAnswerVO: AnswerBefore // 问题回答
  isFollowed: boolean // 是否关注
}

export interface PublishMessageListResponseWithPage extends PageResult {
  records: PublishMessageListResponse[]
}

export interface ShareMessageRequest {
  queryIds: string[]
  userId: string
}

export interface FollowUserRequest {
  // 操作类型：true-关注，false-取消关注
  followAction: boolean
  // 被关注用户ID
  followeeId: string
  // 关注用户ID
  followerId: string
}

export interface AddCommentRequest {
  commentContent: string
  contentId: string
}

export interface CommentResponseRequired {
  id: string
}

export interface CommentListRequest extends Page {
  contentId: string
  commentId?: string
  memberId?: string
}

export interface ReplyListRequest extends Page {
  commentId: string
}

export interface CommentListResponse extends PageResult {
  records: CommentResponse[]
}

export interface ReplyListResponse extends PageResult {
  records: ReplyResponse[]
}

export interface CommentResponse {
  comment: {
    commentContent: string // 评论内容
    commenterId: string // 评论人id
    commenterUsername: string // 评论人昵称
    createTime: string
    id: string
    isLike: boolean
    likeCount: number
    commentUsername: string // 评论人昵称
    nickName: string // 评论人昵称
    face: string // 评论人头像
  }
  replies: ReplyResponse[]
  totalReplies: number // 回复数量
}

export interface ReplyResponse {
  id: string
  commentId: string // 评论id
  contentId: string // 帖子id
  isLike: boolean // 是否点赞
  likeCount: number // 点赞数量
  replierId: string // 回复人id
  replierUsername: string // 回复人昵称
  nickName: string // 回复人昵称
  face: string // 回复人头像
  replyContent: string // 回复内容
  replyStatus: boolean // 回复状态
  replyToUserId: string // 被回复人id
  replyToUsername: string // 被回复人昵称
  replyToNickName: string // 被回复人昵称
  replyToFace: string // 被回复人头像
  parentReplyId: string | null // 父回复ID（对评论进行回复时使用）
  createTime: string
}

export interface GlobalSearchRequest extends Page {
  userId?: string
  searchSort: 'SMART' | 'LAST' | 'HOT'
}

export interface GlobalSearchResultResponse extends PageResult {
  records: GlobalSearchResult[]
}

export interface GlobalSearchResult {
  chatQuery: ChatMessageBefore
  memberContentForClientVO: PublishMessageListResponse
}

export interface AddCommentReplyRequest {
  // 评论ID
  commentId: string
  // 回复内容
  replyContent: string
  // 父回复ID（对回复进行回复时使用）
  parentReplyId?: string
  // 被回复用户ID
  replyToUserId?: string
}

export interface ProfileStatistics {
  contentCount: number // 发布内容数量
  followerCount: number // 粉丝数量
  followingCount: number // 关注数量
  followingTagCount: number // 关注标签数量
  statisticsTime: string // 统计时间
  totalCommentCount: number // 总评论数量
  totalLikeCount: number // 总点赞数量
  totalShareCount: number // 总分享数量
  totalViewCount: number // 总阅读数量
}

export interface PublishListRequest extends Page {
  authorId?: string
}

export interface InteractedContentListRequest extends Page {
  userId: string
}

export interface InteractedContentListResponse extends PageResult {
  records: AnswerBefore[]
}

export interface LikeContentRequest {
  contentId: string
  likeAction: boolean // 操作类型：true-点赞，false-取消点赞
}

export interface LikeCommentRequest {
  commentId: string
  likeAction: boolean // 操作类型：true-点赞，false-取消点赞
}

export interface LikeReplyRequest {
  replyId: string
  likeAction: boolean // 操作类型：true-点赞，false-取消点赞
}

export interface UserCenterSearchRequest extends Page {
  userId?: string
  searchSort: 'SMART' | 'LAST' | 'HOT'
}

export interface GenerateStsTempKeyResponse {
  expiredTime: number // 过期时间
  tmpSecretId: string // STS 临时密钥
  tmpSecretKey: string // STS 临时密钥
  token: string // STS 临时密钥
}

export interface UpdateUserInfoRequest {
  birthday?: string // 生日
  face?: string // 头像
  sex?: Sex // 性别
  nickName?: string // 昵称
}

export interface MyCommentedRepliedListRequest extends Page {
  memberId?: string
}

export interface MyCommentedRepliedListResponseWithPage extends PageResult {
  records: MyCommentedRepliedListResponse[]
}

export interface MyCommentedRepliedListResponse {
  commentContent: string // 评论内容
  commentId: string // 评论id
  contentId: string // 帖子id
  content: string // 帖子内容
  commentStatus: boolean// 评论状态
  commentType: 1 | 2 // 评论类型 1 评论 2 回复
  face: string // 发帖人头像
  commenterId: string // 发帖人id
  nickName: string // 发帖人昵称
  isLike: boolean // 是否点赞
  likeCount: number // 点赞数量
  title: string // 帖子标题
  createTime: string // 创建时间
}

export interface Tag {
  id: string
  createBy: string
  createTime: string
  tagName: string
  tagColor: string
  tagDescription: string
  useCount: number
  followStatus: boolean
}

export interface FollowTag {
  followAction: boolean
  tagId: string
}

export interface GetPublishListByTagRequest extends Page {
  tagId: string
  searchSort: 'SMART' | 'LAST' | 'HOT'
}

export interface DeleteReplyRequest {
  commentId?: string
  replyId?: string
  parentReplyId?: string
}

export interface GetCommentOrReplyByIdRequest {
  commentId: string
  commentType: 1 | 2 // 评论类型 1 评论 2 回复
}
