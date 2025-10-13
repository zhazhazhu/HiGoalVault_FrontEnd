# Introduce

HiGoal AI" 是一个轻量级的金融信息服务平台，旨在为用户提供实时、权威、个性化的财经信息服务与分享社区。该平台集成了AI对话、多模态交互（文本/语音/图像）、金融信息聚合（AIGC+UGC）的功能，帮助用户更轻松地获取和分享财经信息。

# What is HiGoal AI

HiGoal AI 是一个基于深度学习和自然语言处理技术的金融信息服务平台。它通过集成AI对话、多模态交互（文本/语音/图像）、金融信息聚合（AIGC+UGC）的功能，提供实时、权威、个性化的财经信息服务与分享社区。

# Install

```bash
pnpm i

or

curl https://ni-bz9c.vercel.app/install.sh | bash && ni
```
you see [ni](https://github.com/zhazhazhu/ni)


# start

- 运行dev(更多命令请查看package.json)

```bash
// dev server
pnpm run dev:mp-weixin

// build
pnpm run build:mp-weixin
```

- 打包产物在 dist/dev/mp-weixin

- 在微信开发者工具中导入打包结果