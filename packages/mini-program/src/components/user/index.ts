import type UserCollect from './collect.vue'
import type UserComment from './comment.vue'
import type UserLike from './like.vue'
import type UserPublish from './publish.vue'

export type UserPublishInstance = InstanceType<typeof UserPublish>
export type UserCommentInstance = InstanceType<typeof UserComment>
export type UserLikeInstance = InstanceType<typeof UserLike>
export type UserCollectInstance = InstanceType<typeof UserCollect>
