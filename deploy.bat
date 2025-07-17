@echo off
echo =================================
echo    Text Tool App 部署助手
echo =================================
echo.

REM 检查是否在正确的目录
if not exist "src\index.html" (
    echo 错误：请在项目根目录运行此脚本！
    pause
    exit /b 1
)

echo 正在检查 Git 状态...
git status >nul 2>&1
if errorlevel 1 (
    echo 初始化 Git 仓库...
    git init
    echo.
)

echo 添加所有文件...
git add .

echo.
set /p commit_msg="输入提交信息（直接回车使用默认信息）: "
if "%commit_msg%"=="" set commit_msg=Update application

echo.
echo 提交更改...
git commit -m "%commit_msg%"

echo.
echo 检查远程仓库...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo.
    echo 尚未设置远程仓库。
    set /p repo_url="请输入您的 GitHub 仓库 URL（如：https://github.com/yourusername/text-tool-app.git）: "
    git remote add origin %repo_url%
    echo 远程仓库已设置。
    echo.
)

echo 推送到 GitHub...
git push -u origin main

echo.
echo =================================
echo        部署完成！
echo =================================
echo.
echo 请访问您的 GitHub 仓库查看部署状态：
echo Actions 选项卡 -> 查看工作流状态
echo.
echo 部署完成后，应用将在以下地址可用：
echo https://yourusername.github.io/text-tool-app/
echo.
pause
