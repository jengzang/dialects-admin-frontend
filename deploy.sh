#!/bin/bash

# 方言管理后台部署脚本
# 用途：构建项目并部署到远程服务器

set -e  # 遇到错误立即退出

# 配置变量
REMOTE_USER="root"
REMOTE_HOST="47.115.57.138"
REMOTE_PATH="/srv/myapp/statics/admin/"
BUILD_DIR="dist"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  方言管理后台部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 步骤 1: 构建项目
echo -e "${YELLOW}[1/4] 构建项目...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}构建失败！${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 构建完成${NC}"
echo ""

# 步骤 2: 检查构建产物
echo -e "${YELLOW}[2/4] 检查构建产物...${NC}"

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}错误: 构建目录 $BUILD_DIR 不存在${NC}"
    exit 1
fi

REQUIRED_FILES=("index.html" "admin.js" "admin.css")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$BUILD_DIR/$file" ]; then
        echo -e "${RED}错误: 缺少必需文件 $file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓ 构建产物检查通过${NC}"
echo ""

# 步骤 3: 上传文件到服务器
echo -e "${YELLOW}[3/4] 上传文件到服务器...${NC}"
echo "目标服务器: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"
echo ""

# 上传 index.html
echo "上传 index.html..."
scp "$BUILD_DIR/index.html" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"

# 上传 admin.css
echo "上传 admin.css..."
scp "$BUILD_DIR/admin.css" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"

# 上传 admin.js
echo "上传 admin.js..."
scp "$BUILD_DIR/admin.js" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"

if [ $? -ne 0 ]; then
    echo -e "${RED}上传失败！${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 文件上传完成${NC}"
echo ""

# 步骤 4: 验证部署
echo -e "${YELLOW}[4/4] 验证部署...${NC}"
echo "检查远程文件..."

ssh "${REMOTE_USER}@${REMOTE_HOST}" "ls -lh ${REMOTE_PATH}"

if [ $? -ne 0 ]; then
    echo -e "${RED}验证失败！${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署成功！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "访问地址: https://dialects.yzup.top/admin"
echo ""
