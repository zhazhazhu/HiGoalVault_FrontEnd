export const SEARCH_TABS = [
  {
    name: '全部',
    value: 'ALL',
  },
  {
    name: '发布',
    value: 'CONTENT_PUBLISH',
  },
  {
    name: '评论',
    value: 'CONTENT_COMMENT',
  },
  {
    name: '点赞',
    value: 'CONTENT_LIKE',
  },
  {
    name: '收藏',
    value: 'CHAT_COLLECT',
  },
] as const

export type SearchTab = (typeof SEARCH_TABS)[number]['value']
