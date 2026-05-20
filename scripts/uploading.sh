#!/bin/bash

# 配置
LOCAL_DIST="/Users/shadowabyss/Desktop/softWare/code/01 Vue/e-commerce-front/dist"
REMOTE_DIR="/var/www/centos.local"
SSH_KEY="/Users/shadowabyss/Desktop/个人文件/百度同步目录/writing/Linux/密钥/secretKey"
TEMP_FILE="/tmp/dist-$(date +%s).tar.gz"

echo "🚀 开始部署..."

# 检查密钥文件是否存在
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ 错误：SSH密钥文件不存在: $SSH_KEY"
    exit 1
fi

# 切换到项目根目录并构建
echo "📦 0.构建项目..."
cd "/Users/shadowabyss/Desktop/softWare/code/01 Vue/e-commerce-front" || exit 1
npm run build-only -- --mode development
if [ $? -ne 0 ]; then
    echo "❌ 错误：构建失败"
    exit 1
fi


# 检查本地dist目录是否存在
if [ ! -d "$LOCAL_DIST" ]; then
    echo "❌ 错误：本地dist目录不存在: $LOCAL_DIST"
    exit 1
fi

# 第一步：打包本地dist目录
echo "📦 1.打包本地目录..."
tar czf "$TEMP_FILE" -C "$(dirname "$LOCAL_DIST")" "$(basename "$LOCAL_DIST")"

# 第二步：远程清理旧文件
echo "🖥️  2.远程清理旧文件..."
ssh -p 2222 -i "$SSH_KEY" root@127.0.0.1 \
"mkdir -p '$REMOTE_DIR' && \
 echo '🧹 清理旧文件...' && \
 rm -rf ${REMOTE_DIR:?}/* && \
 ls -lah ${REMOTE_DIR:?} && \
 echo '✅ 清理完成'"

if [ $? -ne 0 ]; then
    echo "❌ 错误：远程清理失败"
    rm -f "$TEMP_FILE"
    exit 1
fi

# 第三步：上传到远程服务器
echo "📤 3.上传到远程服务器..."
scp -P 2222 -i "$SSH_KEY" "$TEMP_FILE" root@127.0.0.1:/tmp/
if [ $? -ne 0 ]; then
    echo "❌ 错误：上传失败"
    rm -f "$TEMP_FILE"
    exit 1
fi

# 第四步：远程解包
echo "🖥️  4.远程解包..."
ssh -p 2222 -i "$SSH_KEY" root@127.0.0.1 \
"tar xzf /tmp/$(basename "$TEMP_FILE") -C '$REMOTE_DIR' --strip-components=1 && \
 find '$REMOTE_DIR' -name '._*' -delete && \
 find '$REMOTE_DIR' -name '.DS_Store' -delete && \
 rm -f /tmp/$(basename "$TEMP_FILE") && \
 echo '✅ 部署完成！'"

if [ $? -ne 0 ]; then
    echo "❌ 错误：远程执行命令失败"
    rm -f "$TEMP_FILE"
    exit 1
fi

# 清理本地临时文件
rm -f "$TEMP_FILE"

# 验证部署结果
echo "🔍 验证部署结果..."
ssh -p 2222 -i "$SSH_KEY" root@127.0.0.1 "ls -la '$REMOTE_DIR'"
