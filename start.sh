#!/bin/bash

echo "🚀 启动Vue3模型库管理系统..."

# 检查Node.js版本
node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 16 ]; then
  echo "❌ 错误: 需要Node.js版本 >= 16.0.0"
  echo "当前版本: $(node --version)"
  exit 1
fi

echo "✅ Node.js版本检查通过: $(node --version)"

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
  echo "📦 正在安装依赖..."
  npm install
fi

echo "🎯 启动开发服务器..."
echo "📱 访问地址: http://localhost:3000"
echo "🛑 按 Ctrl+C 停止服务器"
echo ""

npm run dev