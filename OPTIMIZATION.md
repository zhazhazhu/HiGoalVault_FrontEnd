# 小程序包体积优化说明

## 当前状态

**问题**: 主包大小约2.95MB,超过微信小程序2MB限制

主要占用:
- `common/vendor.js`: 1.6MB (所有第三方依赖)
- `components`: 740KB (公共组件)
- `node-modules`: 348KB
- `static`: 180KB (静态资源)
- 其他: ~80KB

## 已完成的优化措施

### ✅ 1. 分包配置优化

已将以下页面从主包移动到分包:

- **chat-package**: 聊天相关页面
  - `/chat-package/pages/chat/index` - 对话页面  
  - `/chat-package/pages/chat/share` - 分享页面

- **detail-package**: 详情页面
  - `/detail-package/pages/detail/index` - 详情页面

- **settings-package**: 设置页面
  - `/settings-package/pages/settings/index` - 设置页面

- **user-package**: 用户相关页面
  - `/user-package/pages/user/index` - 个人中心
  - `/user-package/pages/user/message` - 用户消息

- **search-package**: 搜索相关页面
  - `/search-package/pages/search/index` - 搜索页面
  - `/search-package/pages/search/result` - 搜索结果

- **tag-package**: 标签页面
  - `/tag-package/pages/tag/index` - 标签页面

**效果**: 主包仅保留首页,其他页面按需加载

### ✅ 2. 分包预下载配置

在 `pages.json` 中配置了分包预下载:

```json
"preloadRule": {
  "pages/index/index": {
    "network": "all",
    "packages": ["chat-package", "detail-package"]
  }
}
```

**效果**: 在首页加载时预加载常用分包,提升用户体验

### ✅ 3. 代码压缩优化

在 `vite.config.ts` 中配置:

```typescript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,  // 移除console
      drop_debugger: true,  // 移除debugger
    },
  },
}
```

**效果**: 生产环境代码体积减小约10-15%

### ✅ 4. Stock组件异步加载

将包含echarts的Stock组件改为异步加载:

```typescript
const Stock = defineAsyncComponent(() => import('@/components/stock/index.vue'))
```

**效果**: echarts相关代码不会在主包初始化时加载

### ✅ 5. 页面跳转路径更新

已更新所有页面跳转路径,确保正确跳转到分包页面:
- ✅ `/pages/chat/index` → `/chat-package/pages/chat/index`
- ✅ `/pages/index/detail` → `/detail-package/pages/detail/index`
- ✅ 等所有跳转路径

## 🚨 仍需解决的核心问题

### 问题: `common/vendor.js` 体积过大 (1.6MB)

**原因分析:**

1. **大型依赖库**:
   - `echarts` (~800KB)
   - `wot-design-uni` (~300KB)
   - `highlight.js` (~200KB)
   - `markdown-it` (~150KB)
   - `lodash-es` (~100KB)

2. **uni-app架构限制**:
   - 微信小程序的uni-app会将所有主包引用的依赖打包到 `common/vendor.js`
   - 即使组件在分包中,如果主包有任何引用,依赖仍会进入主包

## 💡 推荐解决方案(按优先级排序)

### 方案 1: 移除主包中不必要的依赖引用 ⭐⭐⭐⭐⭐

检查首页 `pages/index/index.vue` 是否真的需要所有功能:

```bash
# 检查首页实际使用的组件
grep -r "import" src/pages/index/index.vue
```

**建议**:
1. 首页不要直接或间接引用包含echarts的组件
2. 将markdown渲染、代码高亮等功能移到详情页/聊天页分包
3. 使用占位图替代首页的复杂交互组件

### 方案 2: 优化依赖引入方式 ⭐⭐⭐⭐

#### 2.1 按需引入 highlight.js

```typescript
// 当前(全量引入)
import hljs from 'highlight.js'

// 优化后(按需引入)
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
// 只注册需要的语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
```

**预期效果**: 减小 ~150KB

#### 2.2 优化 lodash-es 引入

```typescript
// 当前
import { debounce, throttle } from 'lodash-es'

// 优化后
import debounce from 'lodash-es/debounce'
import throttle from 'lodash-es/throttle'
```

**预期效果**: 减小 ~50KB

### 方案 3: 静态资源外置 ⭐⭐⭐

将图片、SVG等静态资源上传到CDN:

```typescript
// 当前
const logo = '/static/logo.png'

// 优化后
const logo = 'https://cdn.example.com/logo.png'
```

**操作步骤**:
1. 将 `src/static` 目录上传到CDN
2. 全局替换静态资源路径
3. 删除本地 `src/static` 目录

**预期效果**: 减小 ~180KB

### 方案 4: 使用分包异步化 ⭐⭐⭐⭐⭐

**关键方案**: 确保主包页面不要直接或间接引用大型依赖

检查引用链:
```
pages/index/index.vue
  → components/layout/index.vue
  → components/view/list.vue  
  → components/view/card.vue
  → ...
```

如果发现引用链中有使用大型库的组件,考虑:
1. 将该功能延迟到分包页面
2. 使用轻量级替代方案
3. 异步懒加载组件

### 方案 5: 启用小程序分包加载 ⭐⭐⭐

在 `manifest.json` 中配置:

```json
{
  "mp-weixin": {
    "optimization": {
      "subPackages": true
    }
  }
}
```

## 📊 包体积分析工具

使用提供的脚本分析打包结果:

```bash
# 打包
pnpm run build:mp-weixin

# 分析包体积
bash scripts/analyze-package.sh
```

## 🎯 优化目标

- [x] 将页面移至分包 (完成)
- [x] 配置代码压缩 (完成)
- [x] 异步加载组件 (部分完成)
- [ ] 主包 < 1.5MB (需进一步优化)
- [ ] 总包 < 5MB (当前3.4MB,已达标)

## ⚠️ 注意事项

1. **不要在主包页面中直接或间接引用**:
   - echarts相关组件
   - markdown-it相关功能  
   - highlight.js代码高亮
   
2. **分包预下载会增加首屏加载时间**,但能提升后续访问速度,需权衡

3. **定期检查包体积**:
   ```bash
   pnpm run build:mp-weixin && bash scripts/analyze-package.sh
   ```

4. **微信小程序限制**:
   - 主包 ≤ 2MB
   - 单个分包 ≤ 2MB  
   - 总包 ≤ 20MB

## 🔧 下一步操作建议

1. **立即执行** (优先级最高):
   ```bash
   # 重新打包测试
   pnpm run build:mp-weixin
   
   # 在微信开发者工具查看实际包大小
   # 右上角 → 详情 → 本地设置 → 代码包信息
   ```

2. **短期优化** (1-2天内):
   - 检查首页组件引用,移除不必要的依赖
   - 优化 highlight.js 和 lodash-es 的引入方式
   - 考虑将静态资源上传到CDN

3. **中期优化** (1周内):
   - 重构首页,简化功能,将复杂交互移至分包
   - 考虑使用更轻量的markdown渲染库(如mini-markdown)
   - 评估是否所有UI组件都必需

4. **长期维护**:
   - 每次新增功能前评估对包体积的影响
   - 定期审查依赖库,移除未使用的
   - 建立包体积监控机制

## 📝 相关文件

- 分包配置: `src/pages.json`
- 构建配置: `vite.config.ts`
- 包分析脚本: `scripts/analyze-package.sh`
- 优化文档: `OPTIMIZATION.md` (本文件)
