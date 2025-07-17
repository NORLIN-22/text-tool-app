# 🚀 GitHub Pages 部署指南

## 📋 部署步骤

### 1. 创建 GitHub 仓库
1. 登录 [GitHub](https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 输入仓库名称：`text-tool-app`
4. 设置为 Public（公开）
5. 不要初始化 README、.gitignore 或 LICENSE（我们已经有了）
6. 点击 "Create repository"

### 2. 上传代码到 GitHub

#### 方法一：使用 Git 命令行
```bash
# 在项目根目录打开终端，执行：
cd i:\text-tool-app

# 初始化 Git 仓库
git init

# 添加远程仓库（替换 yourusername 为您的 GitHub 用户名）
git remote add origin https://github.com/yourusername/text-tool-app.git

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit: Text Tool App with Danbooru integration"

# 推送到 GitHub（可能需要输入 GitHub 用户名和密码）
git push -u origin main
```

#### 方法二：使用 GitHub 网页上传
1. 在新创建的仓库页面，点击 "uploading an existing file"
2. 将所有文件拖拽到上传区域：
   - `.github/` 文件夹（包含 workflows/deploy.yml）
   - `src/` 文件夹（包含所有应用文件）
   - `.gitignore`
   - `LICENSE`
   - `README.md`
3. 在下方输入提交信息：`Initial commit`
4. 点击 "Commit changes"

### 3. 启用 GitHub Pages

1. 在您的仓库页面，点击 "Settings" 选项卡
2. 在左侧菜单中找到 "Pages"
3. 在 "Source" 部分，选择 "GitHub Actions"
4. 保存设置

### 4. 等待部署完成

1. 转到仓库的 "Actions" 选项卡
2. 您应该能看到一个正在运行或已完成的工作流
3. 等待工作流完成（通常需要 1-3 分钟）
4. 部署完成后，您的网站将在以下地址可用：
   ```
   https://yourusername.github.io/text-tool-app/
   ```

### 5. 访问应用

- **主应用**：`https://yourusername.github.io/text-tool-app/`
- **Danbooru 助手**：`https://yourusername.github.io/text-tool-app/danbooru-helper.html`

## 🔧 自定义域名（可选）

如果您有自己的域名：

1. 在仓库的 Settings > Pages 中
2. 在 "Custom domain" 输入您的域名
3. 在您的域名 DNS 设置中添加 CNAME 记录指向 `yourusername.github.io`

## 🔄 更新应用

每次您修改代码并推送到 GitHub：

```bash
git add .
git commit -m "描述您的更改"
git push
```

GitHub Actions 会自动重新部署您的应用。

## 🔗 在 README 中更新链接

不要忘记在 `README.md` 中将示例链接替换为您的实际链接：

```markdown
## 🚀 在线使用

访问：[https://yourusername.github.io/text-tool-app/](https://yourusername.github.io/text-tool-app/)
```

## ⚠️ 注意事项

1. **仓库必须是公开的**才能使用免费的 GitHub Pages
2. **首次部署可能需要几分钟**
3. **DNS 传播可能需要时间**，如果立即访问失败，请等待几分钟
4. **分支名称**：确保使用 `main` 分支（不是 `master`）

## 🆘 故障排除

### 部署失败
- 检查 Actions 选项卡中的错误信息
- 确保 `.github/workflows/deploy.yml` 文件存在且格式正确

### 404 错误
- 确保 Pages 设置正确
- 检查文件路径大小写是否正确
- 等待几分钟让更改生效

### 权限错误
- 确保在仓库 Settings > Actions > General 中启用了 "Read and write permissions"
