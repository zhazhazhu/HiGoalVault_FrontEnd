# HiGoal AI 项目说明文档

HiGoal AI 是一个轻量级的金融信息服务平台，面向微信小程序生态，聚合 AI 对话、多模态交互（文本/语音/图像）、金融信息与社区分享功能，为用户提供实时、权威、个性化的财经信息服务与交流社区。

## 开始

```bash
// dev server
pnpm run dev:mp-weixin

// build
pnpm run build:mp-weixin
```

## 版本/更新/打包体积分析

- 变更日志：参见 [CHANGELOG.md](/CHANGELOG.md)
- 构建与打包命令：参见 [package.json](/package.json)
- 打包体积分析：`pnpm run build:mp-weixin && pnpm run build:mp-weixin:analyze`

## 技术栈与运行

- 核心框架：`Vue 3 + Vite + TypeScript`
- 小程序框架：`uni-app`（目标平台：微信小程序）
- 状态管理：`Pinia`
- 网络请求：`uni.request` 二次封装（重试、统一错误处理）
- 图表渲染：`ECharts`（内置 K 线图与股票数据加载）
- 构建与运行：
  - 安装依赖：`pnpm i`
  - 开发：`pnpm run dev:mp-weixin`
  - 构建：`pnpm run build:mp-weixin`
  - 打包产物：`dist/dev/mp-weixin`，请用微信开发者工具导入调试
- 微信开发者工具建议：
  - 调试基础库：`3.10.0`
  - 启用 JS 编译成 ES5
  - 启用上传代码压缩

## 项目结构

- 页面与包：
  - `src/pages/index/` 首页列表页（发现/关注/分享）
  - `src/chat-package/pages/chat/` 消息列表页（AI 对话、消息相关能力）
  - `src/search-package/pages/search/` 搜索页
  - `src/detail-package/pages/detail/` 帖子详情页
  - `src/user-package/pages/` 个人主页相关页面
- 组件与能力：
  - `src/components/` 各种 UI 组件（对话、布局、输入、点赞、标签等）
  - `src/echarts/` 图表（K 线图、股票数据加载逻辑）
  - `src/store/` 全局状态（用户、聊天、搜索、全局等）
  - `src/api/` 接口封装（`http.ts`、`index.ts`、`url.ts`）
  - `src/utils/` 工具（如 `stock.ts`、`wx.ts` 等）

---

## 模块说明（8 项）

### 1. 用户登录和权限

- 小程序手机号一键登录：
  - 通过微信授权获取手机号，后端进行账号绑定或创建，返回登录态。
  - 用户状态保存在 `src/store/user.ts`，用于页面权限和个性化内容展示。
  - 入口组件：`src/components/login/popup.vue`，按钮 `open-type="getPhoneNumber|agreePrivacyAuthorization"`，在 `onGetPhoneNumber` 中：
    - 调用 `uni.login()` 获取 `code`；
    - 调用 `api.autoLoginByPhone({ code, phoneCode })`；
    - 成功后写入 `userStore.auth` 并 `uni.reLaunch('/pages/index/index')`。
  - 隐私协议：`uni.getPrivacySetting`、`uni.openPrivacyContract` 在 `src/App.vue` 初始化时处理；需用户勾选后才能登录。
- 权限与访问控制：
  - 导航拦截器位于 `src/intercepter/navigation.ts` 与 `src/intercepter/index.ts`，在页面跳转前进行登录态校验。
  - 未登录时可触发统一登录弹窗（如首页 `globalStore.showLoginPopup`）。
  - Token 管理：`src/App.vue` 监听 `userStore.accessToken` 变化拉取 `getUserInfo()`；在 `onLaunch` 时若过期则 `refreshAccessToken()`；进入前台（`onShow`）时如已登录则建立 WebSocket。

### 2. 分享页

- 分享消息并开始新对话：
  - 在支持分享的页面（如首页 `src/pages/index/index.vue`），通过 `onShareAppMessage` 把消息上下文或入口路径传递到分享卡片。
  - 分享落地后可跳转到聊天页并基于分享内容发起新的对话（路由传参驱动）。
- 分享的消息记录查询：
  - 后端接口提供分享记录查询，前端可在对应页面根据用户或分享 ID 拉取记录并渲染。
- 分享地址和图片生成：
  - 截图接口：`api.screenShot`（底层 `createScreenShotRequest` 使用 `uni.request`）。
  - 分享卡片图：直接设置 `imageUrl` 指向截图接口地址：
    - `imageUrl = screenShotBaseUrl + API.SCREEN_SHOT + '?id=' + <消息/帖子ID>`
  - 相关常量：`screenShotBaseUrl`（`src/api/http.ts`）、`API.SCREEN_SHOT`（`src/api/url.ts`）。
  - 分享落地页：`chat-package/pages/chat/share.vue`，渲染所选消息（`MessageCard` 只读模式），底部按钮“开始对话”跳转至聊天页。
  - 聊天页分享：`chat-package/pages/chat/index.vue` 中 `onShareAppMessage` 支持从按钮分享所选消息 `queryIds`，生成 `shareId` 并跳转至上述落地页。

### 3. 个人主页

- 个人消息列表：展示用户发起或参与的消息记录（AI 对话、帖子相关内容）。
- 互动过的帖子列表：展示用户点赞/收藏/分享过的帖子。
- 评论过的帖子列表：展示用户参与过的评论及其上下文。
- 发布过的帖子列表：展示用户发布的所有帖子，支持跳转详情与管理。
- 页面位置：`src/user-package/pages/`，具体页面按业务拆分为列表和详情。
- 数据来源：`src/api/index.ts` 中的用户相关接口（示例：消息/帖子列表、互动记录等）。
- 常用页面：
  - 我的互动：`src/user-package/pages/user/message.vue`（收到的评论和@，支持点赞、跳转到帖子详情）。
  - 我的评论：`src/components/user/comment.vue`（按页拉取、刷新、上拉加载）。
  - 用户中心搜索：`api.userCenterSearch` 用于用户维度检索内容。

### 4. 全局侧边栏

- 对话列表：
  - 展示最近会话与置顶对话，支持点击进入聊天页继续对话。
  - 数据来源：`src/store/chat.ts` 与后端会话列表接口。
- 发现列表：
  - 聚合热门帖子/话题/标签，提升信息发现效率。
  - 首页也提供发现流入口，侧边栏用于全局露出和快速切换。
- 交互：
  - 通过全局状态控制显隐，例如首页 `showSidebar`。
  - 组件位于 `src/components/layout/` 与 `src/components/converse/`。
  - 对话列表组件：`src/components/layout/chat-list.vue`，支持：
    - 创建新对话（`api.addChat`）并切换当前会话；
    - 编辑对话标题（`api.updateChat`）；
    - 删除对话（`api.deleteChat`），如删除当前会话则清空消息；
    - 分页加载会话列表（`api.getChatList`）。

### 5. 帖子详情页

- 评论列表支持树状：父子评论分层展示，支持折叠与展开。
- 回复评论：对特定评论进行回复，触发后端创建子评论。
- 删除评论：校验权限后执行删除并刷新视图。
- 展开更多评论：分页拉取，避免一次性加载过多导致性能问题。
- 点赞评论：本地状态与后端计数同步。
- 页面位置与路由：`/detail-package/pages/detail/index`（接收 `id` 路由参数）。
- 相关接口：评论新增/删除/查询、点赞等在 `src/api/index.ts` 中统一封装。
- 评论实现细节：
  - 弹窗入口：`src/components/view/comment-popup.vue`，承载评论列表与发布框；
  - 回复加载：`comment-card.vue` 中 `onLoadReply` 通过 `api.getCommentRepliesList` 分页追加；
  - 回复评论/回复回复：在 `comment-popup.vue` 设置 `currentReplying`，调用 `api.addCommentReply` 发送；
  - 删除评论：`comment-card.vue` 中确认后调用 `api.deleteCommentById` 并更新列表；
  - 点赞评论：`comment-card.vue` 中调用 `api.thumbsUpComment` 并增减 `likeCount`；
  - UI 高亮当前评论：通过 `currentCommentId` 定位并短暂高亮。

### 6. 搜索页

- 搜索词联想：
  - 输入时调用联想接口返回关键词建议，提升检索效率。
  - 实现位置：`src/search-package/pages/search/index`，状态位于 `src/store/search.ts`。
- 个人内容搜索：
  - 在用户维度查询其发布、评论、互动内容，支持筛选与排序。
- 全局搜索：
  - 对帖子、消息、标签进行全局检索，支持分页与高亮。
  - 相关接口：`api.globalSearch`；用户中心搜索使用 `api.userCenterSearch`。
  - 交互建议：输入节流、防抖（`composables/watchDebounced.ts` 可复用）。

### 7. 主页列表页

- 发现列表：拉取平台热门内容，支持无限滚动分页。
- 关注列表：拉取关注对象的最新内容，支持分页与刷新。
- AI 对话框：在首页内嵌对话入口，快速进入聊天或继续讨论。
- 关键实现（`src/pages/index/index.vue`）：
  - 数据结构分为 `view` 与 `follow` 两套状态（`useResetRef` 管理）。
  - 拉取函数：`getViewData`、`getFollowData`，分页条件保存在 `page` 字段，`isLoading/isFinish` 控制加载节奏。
  - 分享：`onShareAppMessage` 设置 `title/path/imageUrl`，其中 `imageUrl` 指向截图接口以生成分享卡片图。
  - 登录弹窗联动：导航栏组件 `components/navbar/index.vue` 暴露 `login-popup`，通过 `globalStore.showLoginPopup` 控制。
  - 发现卡片：`components/view/card.vue`、`components/view/detail-card.vue` 支持点赞、继续提问（创建会话并带 query 进入聊天）。

### 8. 消息列表页

- 语音转文字：支持将语音消息转为文本，便于检索与复制（微信语音能力结合后端转写）。
- 对话框：AI 对话消息流（包含提问、回答、思考过程等）。
- 消息发送/消息重试/中止消息：发送失败可重试；支持中止正在进行的消息请求。
- 消息列表渲染：按时间顺序或上下文分组渲染，支持滚动加载与锚点定位。
- 深度思考步骤渲染：以步骤或树状结构展示模型思考过程（可折叠）。
- 标签渲染：对消息或帖子打标签，支持筛选与聚合展示。
- K 线图渲染：内嵌 ECharts K 线图组件，支持拖动与缩放。
- 分页加载：列表按页加载，避免首屏加载过重。
- 股票实时数据/股票历史数据：
  - 组件：`src/echarts/components/stock.vue`
  - 加载逻辑：`src/echarts/index.ts` 的 `useLoadStockData`（已支持 `abort()` 中止正在进行的加载循环；中止返回 `null`，与“无更多数据”的空数组区分）。
- 消息复制/消息节选复制：支持复制整段或选取片段，便于外部使用。
- 消息回答微信分享：将回答内容生成分享卡片（结合截图接口），一键分享到微信。
- 消息回答发布到帖子：可将对话中的高质量回答发布为帖子，进入社区传播。
- 消息收藏：收藏消息与答案，后续在个人主页统一查看与管理。
 - 关键实现：
   - 发送与等待：`components/converse/index.vue` 中 `waitConfirmMessage` 创建会话并设置 `waitingMessageTask`；`sendWaitingMessage` 通过 WebSocket 发送并创建临时消息；
   - WebSocket：`store/websocket.ts` 管理连接、消息分发、停止消息（`stopMessage`）；
   - 重试与中止：消息工具栏 `components/message/tool.vue` 提供“重新生成”；停止消息通过 WebSocket `stopMessage` 或前端状态 `isPaused` 控制；
   - 深度思考步骤：`api/types.ts` 的 `ChatSteps`；前端按步骤渲染并支持折叠（`showSteps` 字段）；
   - 复制与节选复制：`components/message/card.vue` 结合浮动工具栏触发复制与节选复制弹窗；
   - 发布到帖子：`components/message/card.vue` 的 `publish-popup` 支持将回答与引用内容发布为帖子；
   - 语音能力：`components/converse/voice.vue` 提供按住说话、文本识别、确认发送；`components/message/card.vue` 支持文本转语音播放与停止；
   - 分页与滚动：`chat-package/pages/chat/index.vue` 管理分页拉取消息、滚动到顶部、新消息锚点。

---

## 接口与配置约定

- 接口封装：
  - `src/api/index.ts` 暴露业务接口（如发布消息列表、关注列表、截图接口等）。
  - `src/api/http.ts` 封装 `uni.request`，提供重试机制与统一错误处理。
  - `src/api/url.ts` 维护接口路径常量（如 `API.SCREEN_SHOT` 等）。
- 截图分享：
  - `screenShotBaseUrl`（`src/api/http.ts`）与 `API.SCREEN_SHOT`（`src/api/url.ts`）拼接生成图片直链，用于 `onShareAppMessage` 的 `imageUrl`。
- WebSocket/实时：
  - 如果需要实时行情或消息推送，可参考 `src/store/websocket.ts` 的封装进行扩展。
  - 连接参数：默认使用 `WECHAT_MP` 客户端类型，`AccessToken` 从用户态读取；消息通过回调分发到页面。

## 常见问题与建议

- 运行环境：请确保本地 `pnpm` 版本与 Node 版本满足项目要求（参见 `.node-version` / `.nvmrc`）。
- 构建报错：优先检查 `eslint.config.mjs` 与 TS 类型定义（`src/types`、`shims-uni.d.ts`、`shime-uni.d.ts`）。
- 小程序端限制：注意微信端的网络域名白名单与图片直链加载规则，确保截图服务域名已配置到微信开发者工具的合法域名中。
- 性能与交互：列表页建议合理设置分页大小、懒加载与骨架屏；图表组件应避免过度重绘。
 - 代码组织建议：模块与页面按包拆分（chat/detail/search/user/tag），跨模块能力（分享、评论、图表）在组件层复用；接口统一在 `src/api` 管理，类型在 `src/api/types.ts`。
 - 调试建议：
   - 使用 `wd-root-portal` 的 Toast/MessageBox 提示统一；
   - 通过 `useClassesName` 保持样式命名一致性；
   - 在 `vite.config.ts` 中配置别名，确保路径简洁（`@` 指向 `src`）。
