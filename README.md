# Text Tool App

This project is a simple text tool application that allows users to input words and automatically adds English punctuation. It features a toggle button to enable or disable the punctuation feature.

## Project Structure

```
# 🏷️ Text Tool App - 智能文本处理工具

一个功能强大的在线文本处理工具，专为处理标签、文本格式化和 Danbooru 标签管理而设计。

## ✨ 主要功能

### 📝 文本处理
- **智能标点符号添加**：自动或手动为文本添加标点符号
- **实时预览**：即时查看处理后的文本效果
- **一键复制**：快速复制处理结果

### 🏷️ 标签管理
- **分类管理**：创建多层级文件夹管理标签
- **快速添加**：支持单个或批量添加标签
- **智能过滤**：自动清理和验证标签格式

### 🎨 Danbooru 集成
- **URL 提取**：从 Danbooru 链接自动提取标签
- **批量处理**：智能解析复制的标签列表
- **格式清理**：自动移除问号、数字统计等无关内容
- **书签工具**：一键激活的浏览器书签，直接在 Danbooru 网站点击标签复制

## 🚀 在线使用

访问：[https://NORLIN-22.github.io/text-tool-app/](https://NORLIN-22.github.io/text-tool-app/)

## 📖 使用指南

### 文本处理
1. 在输入框中粘贴或输入文本
2. 使用标点符号按钮添加标点，或启用自动模式
3. 查看处理结果并一键复制

### 标签管理
1. 创建分类文件夹组织标签
2. 使用快速添加功能批量导入标签
3. 点击标签快速添加到文本中

### Danbooru 功能
1. **URL 提取**：粘贴 Danbooru 页面链接，自动提取标签
2. **批量处理**：直接粘贴复制的标签列表，自动清理格式
3. **书签工具**：使用 `danbooru-helper.html` 页面的书签功能

## 🛠️ 本地开发

```bash
# 克隆仓库
git clone https://github.com/NORLIN-22/text-tool-app.git

# 进入项目目录
cd text-tool-app

# 启动本地服务器
python -m http.server 3000

# 或使用 Node.js
npx serve .
```

访问 `http://localhost:3000` 查看应用。

## 📁 项目结构

```
text-tool-app/
├── index.html              # 主应用页面
├── danbooru-helper.html    # Danbooru 书签助手页面
├── main.js                 # 主要 JavaScript 逻辑
├── styles.css              # 样式文件
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages 自动部署
└── README.md
```

## 🔧 功能特性

### 智能标签处理
- ✅ 自动识别 Danbooru 标签格式
- ✅ 移除问号、数字统计等无关内容
- ✅ 转换下划线为空格
- ✅ 去重和验证标签有效性
- ✅ 支持多种输入格式

### 用户体验
- 🎨 现代化界面设计
- 📱 响应式布局
- ⚡ 快速操作和即时反馈
- 💾 本地数据持久化
- 🔄 撤销/恢复功能

### 技术特点
- 📦 纯前端应用，无需服务器
- 🚀 GitHub Pages 自动部署
- 🔒 本地数据存储，隐私安全
- 🌐 跨浏览器兼容

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系

如有问题或建议，请通过 GitHub Issues 联系。
├── src
│   ├── index.html       # Main HTML file containing the input box, button, and result display area.
│   ├── main.js          # JavaScript file handling user input and punctuation logic.
│   └── styles.css       # CSS file for styling the application.
└── README.md            # Documentation for the project.
```

## Features

- **Input Box**: Users can type in words or sentences.
- **Punctuation Toggle**: A button to enable or disable automatic punctuation.
- **Result Display**: An area to show the processed text with punctuation.

## Usage

1. Open `src/index.html` in a web browser.
2. Type your text into the input box.
3. Click the toggle button to enable or disable punctuation.
4. View the result in the designated display area.

## Installation

No installation is required. Simply clone the repository and open the `index.html` file in your browser.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.