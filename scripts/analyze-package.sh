#!/bin/bash

# 微信小程序包体积分析脚本

BUILD_DIR="dist/build/mp-weixin"

echo "========================================"
echo "微信小程序包体积分析"
echo "========================================"
echo ""

# 总体积
echo "📦 总体积:"
du -sh $BUILD_DIR
echo ""

# 主包体积计算
echo "📦 主包体积 (不含分包目录):"
MAIN_SIZE=$(du -sh $BUILD_DIR/common $BUILD_DIR/components $BUILD_DIR/pages $BUILD_DIR/static $BUILD_DIR/api $BUILD_DIR/utils $BUILD_DIR/store $BUILD_DIR/composables $BUILD_DIR/constants $BUILD_DIR/intercepter $BUILD_DIR/node-modules 2>/dev/null | awk '{sum+=$1} END {print sum}')

# 详细主包内容
echo ""
echo "主包各目录大小:"
du -sh $BUILD_DIR/common 2>/dev/null
du -sh $BUILD_DIR/components 2>/dev/null  
du -sh $BUILD_DIR/pages 2>/dev/null
du -sh $BUILD_DIR/static 2>/dev/null
du -sh $BUILD_DIR/api 2>/dev/null
du -sh $BUILD_DIR/utils 2>/dev/null
du -sh $BUILD_DIR/store 2>/dev/null
du -sh $BUILD_DIR/composables 2>/dev/null
du -sh $BUILD_DIR/node-modules 2>/dev/null

echo ""
echo "分包大小:"
du -sh $BUILD_DIR/chat-package 2>/dev/null
du -sh $BUILD_DIR/detail-package 2>/dev/null
du -sh $BUILD_DIR/settings-package 2>/dev/null
du -sh $BUILD_DIR/user-package 2>/dev/null
du -sh $BUILD_DIR/search-package 2>/dev/null
du -sh $BUILD_DIR/tag-package 2>/dev/null

echo ""
echo "========================================"
echo "主包大文件 Top 10:"
echo "========================================"
find $BUILD_DIR/common $BUILD_DIR/components $BUILD_DIR/pages $BUILD_DIR/static -type f -exec ls -lh {} \; 2>/dev/null | sort -k5 -hr | head -10 | awk '{print $9, "\t", $5}'

echo ""
echo "========================================"
echo "⚠️  注意事项:"
echo "========================================"
echo "1. 微信小程序主包限制: 2MB"
echo "2. 单个分包限制: 2MB"
echo "3. 所有分包总大小限制: 20MB"
echo ""
echo "💡 如果主包超过2MB,请考虑:"
echo "  - 将更多页面移到分包"
echo "  - 压缩静态资源"
echo "  - 优化第三方库的引入"
echo "  - 使用CDN存储图片资源"
