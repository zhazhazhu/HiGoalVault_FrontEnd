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
  steps: string
  summary: string
  label: string | null // 标签
  isPaused: boolean // 是否暂停
}

export interface AnswerAfter extends Omit<AnswerBefore, 'reference' | 'data' | 'steps' | 'label'> {
  reference: ChatMessageReference[]
  data: {
    analysis_data: string // 股票图数据
    resolved_params: {
      parameters: ResolvedParam[]
    }
  }
  isLoading: boolean // 是否正在加载中
  steps: ChatSteps[]
  stockData: [ChatMessageStock] | [] // 股票图数据
  stockParameter: DateParameterOfStock // 获取股票参数
  showSteps: boolean // 是否显示步骤
  label: string[]
}

export interface ResolvedParam {
  name: string
  value: any
}

export interface DateParameterOfStock {
  fromdate: string
  todate: string
  name: string
  code: string
}

export interface ChatSteps {
  node: string
  message: string
  thinking: string | null
  finished: boolean
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
  /** 交易时间 */
  trade_time: string
  /** 是否删除标识 */
  is_delete: number
  /** 更新时间 */
  update_time: string
  /** 交易代码（新增） */
  trans_code: string
  /** 交易所代码（新增） */
  exchange_code: string
  /** 时区（新增） */
  time_zone: string
  /** 品种代码（新增） */
  variety_code: string
  /** 合约/期货类型（新增） */
  fut_type: string
  /** 前收盘价（新增） */
  pre_close: number
  /** 前结算价（新增） */
  pre_settle: number | null
  /** 最高价 */
  high: number
  /** 成交量 */
  vol: number
  /** 最低价 */
  low: number
  /** 更新者 */
  updated_by: string
  /** 持仓量 */
  oi: number
  /** 持仓变化量（新增） */
  oi_chg: number
  /** 收盘价 */
  close: number
  /** 开盘价 */
  open: number
  /** 结算价（新增） */
  settle: number
  /** 涨跌额1（新增） */
  change1: number | null
  /** 涨跌额2（新增） */
  change2: number | null
  /** 涨跌幅（新增） */
  change_rate: number
  /** 交割结算价（新增） */
  delv_settle: number
  /** 涨停价（新增） */
  up_limit: number | null
  /** 跌停价（新增） */
  down_limit: number | null
  /** 保证金比例（新增） */
  m_ratio: number | null
  /** 经纪商（新增） */
  broker: string
  /** 成交量变化（新增） */
  vol_chg: number
  /** 多头持仓（新增） */
  long_hld: number
  /** 多头变化（新增） */
  long_chg: number
  /** 空头持仓（新增） */
  short_hld: number
  /** 空头变化（新增） */
  short_chg: number
  /** 换手率 */
  turnover_rate: number | null
  /** 振幅率 */
  price_swing: number | null
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
  summary: string // 内容摘要
  shareCount: number // 分享数量
  viewCount: number // 阅读数量
  nickName: string // 发布人昵称
  memberId: string // 发布人id
  face: string // 发布人头像
  tags: Array<Tag>
  chatQueryAnswerVO: AnswerBefore // 问题回答
  isFollowed: boolean // 是否关注
}

export interface AfterPublishMessageListResponse extends Omit<PublishMessageListResponse, 'chatQueryAnswerVO'> {
  chatQueryAnswerVO: AnswerAfter
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
  searchSort?: 'SMART' | 'LAST' | 'HOT'
  searchContentRange?: 'ALL' | 'CONTENT_PUBLISH' | 'CONTENT_COMMENT' | 'ACTION'
  searchActionRange?: 'ALL' | 'CONTENT_LIKE' | 'CONTENT_TAG_FAV' | 'CONTENT_USER_FAV'
  searchTimeRange?: 'ALL' | 'LAST_ONE_DAY' | 'LAST_SEVEN_DAY' | 'LAST_HALF_YEAR'
}

export enum SearchSortEnum {
  SMART = '全部',
  LAST = '最新发布',
  HOT = '热度最高',
}

export enum SearchTimeRangeEnum {
  ALL = '不限',
  LAST_ONE_DAY = '最近一天',
  LAST_SEVEN_DAY = '最近七天',
}

export enum SearchActionRangeEnum {
  CONTENT_LIKE = '赞过',
  CONTENT_TAG_FAV = '关注标签',
  CONTENT_USER_FAV = '关注用户',
}

export interface GlobalSearchResultResponse extends PageResult {
  records: GlobalSearchResult[]
}

export interface GlobalSearchResult {
  chatId: string
  chatQueryAnswerVO: AnswerBefore
  memberContentForClientVO: PublishMessageListResponse
  opType: 0 | 1 // 操作类型：0-内容，1-对话问答
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

export interface UserCenterSearchRequest extends GlobalSearchRequest {}

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
  contentAuthorId: string // 帖子作者id
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

export interface GetFinanceDataRequest extends Page {
  startDateTime: string
  endDateTime: string
  transCode: string
  timeGranularity: TimeGranularity
}

export enum TimeGranularity {
  '1MINS' = '1MINS',
  '5MINS' = '5MINS',
  '30MINS' = '30MINS',
  '1HOUR' = '1HOUR',
  'DAILY' = 'DAILY',
  '5DAILY' = '5DAILY',
  'WEEKLY' = 'WEEKLY',
  'MONTHLY' = 'MONTHLY',
  'YEAR' = 'YEAR',
}

export interface GetFinanceDataResponse extends PageResult {
  records: ChatMessageStockData[]
}

export interface GetFinanceBasicInfoResponse {
  transCode: string
  exchange: string
  symbol: string
  name: string
  dataType: 'FUTURES' | 'STOCK'
}
