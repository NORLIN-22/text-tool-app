#!/bin/bash

echo "================================="
echo "   Text Tool App 部署助手"
echo "================================="
echo

# 检查是否在正确的目录
if [ ! -f "src/index.html" ]; then
    echo "错误：请在项目根目录运行此脚本！"
    exit 1
fi

echo "正在检查 Git 状态..."
if ! git status >/dev/null 2>&1; then
    echo "初始化 Git 仓库..."
    git init
    echo
fi

echo "添加所有文件..."
git add .

echo
read -p "输入提交信息（直接回车使用默认信息）: " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update application"
fi

echo
echo "提交更改..."
git commit -m "$commit_msg"

echo
echo "检查远程仓库..."
if ! git remote get-url origin >/dev/null 2>&1; then
    echo
    echo "尚未设置远程仓库。"
    read -p "请输入您的 GitHub 仓库 URL（如：https://github.com/yourusername/text-tool-app.git）: " repo_url
    git remote add origin $repo_url
    echo "远程仓库已设置。"
    echo
fi

echo "推送到 GitHub..."
git push -u origin main

echo
echo "================================="
echo "        部署完成！"
echo "================================="
echo
echo "请访问您的 GitHub 仓库查看部署状态："
echo "Actions 选项卡 -> 查看工作流状态"
echo
echo "部署完成后，应用将在以下地址可用："
echo "https://yourusername.github.io/text-tool-app/"
echo
