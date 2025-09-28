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
  keyWord?: string
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
  query: string // 用户问题
  queryId: string // 问题id
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

export interface AddCollectRequest {
  chatId: string
  msgId: string
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
  isLiked: Truth // 是否点赞
  title: string // 标题
  shareCount: number // 分享数量
  viewCount: number // 阅读数量
  nickName: string // 发布人昵称
  memberId: string // 发布人id
  face: string // 发布人头像
  tags: Array<{ id: string, tagName: string }>
  chatQueryAnswerVO: AnswerBefore
}

export interface PublishMessageListResponseWithPage extends PageResult {
  records: PublishMessageListResponse[]
}

export interface ShareMessageRequest {
  queryIds: string[]
  userId: string
}

export interface FollowUserRequest {
  followAction: boolean //	操作类型：true-关注，false-取消关注
  followeeId: string //	被关注用户ID
  followerId: string //	关注用户ID
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
}

export interface GlobalSearchResultResponse extends PageResult {
  records: GlobalSearchResult[]
}

export interface GlobalSearchResult {
  chatQuery: ChatMessageBefore
  memberContentForClientVO: PublishMessageListResponse
}

export interface AddCommentReplyRequest {
  commentId: string // 评论ID
  replyContent: string //	回复内容
  parentReplyId?: string // 父回复ID（对回复进行回复时使用）
  replyToUserId?: string //	被回复用户ID
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
