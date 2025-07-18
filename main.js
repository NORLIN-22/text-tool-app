const categoryTree = document.getElementById('categoryTree');
const newCategoryInput = document.getElementById('newCategoryInput');
const tagList = document.getElementById('tagList');
const newTagInput = document.getElementById('newTagInput');
const currentCategoryName = document.getElementById('currentCategoryName');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');

// 自动标点符号模式
let autoModeEnabled = false;
let autoModeSymbol = '';

// 文本替换功能
function replaceText(replaceAll = false) {
    const findText = document.getElementById('findText').value;
    const replaceText = document.getElementById('replaceText').value;
    const inputText = document.getElementById('inputText');
    
    if (!findText) {
        alert('请输入要查找的文本！');
        return;
    }
    
    const currentText = inputText.value;
    let newText;
    
    if (replaceAll) {
        // 全部替换
        newText = currentText.split(findText).join(replaceText);
        const count = (currentText.match(new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        if (count > 0) {
            showReplaceNotification(`已替换 ${count} 处文本`);
        } else {
            alert('未找到要替换的文本！');
            return;
        }
    } else {
        // 替换第一个
        const index = currentText.indexOf(findText);
        if (index !== -1) {
            newText = currentText.substring(0, index) + replaceText + currentText.substring(index + findText.length);
            showReplaceNotification('已替换 1 处文本');
        } else {
            alert('未找到要替换的文本！');
            return;
        }
    }
    
    inputText.value = newText;
    document.getElementById('outputText').textContent = newText;
    
    // 清空查找框
    document.getElementById('findText').value = '';
    document.getElementById('replaceText').value = '';
}

// 从文本中提取标签
function extractTagsFromText() {
    const inputText = document.getElementById('inputText').value.trim();
    
    if (!inputText) {
        alert('请先输入文本！');
        return;
    }
    
    // 检测是否是 Danbooru 格式
    const isDanbooruFormat = inputText.includes('?') && /\d+[kmgtKMGT]/.test(inputText);
    
    let extractedTags = [];
    
    if (isDanbooruFormat) {
        // 处理 Danbooru 格式
        extractedTags = parseDanbooruTagList(inputText);
    } else {
        // 处理普通文本
        extractedTags = inputText
            .split(/[,\s\n]+/)
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
    }
    
    // 清理和过滤标签
    const cleanedTags = extractedTags
        .map(tag => cleanTagText(tag))
        .filter(tag => tag && isValidTag(tag));
    
    if (cleanedTags.length > 0) {
        showExtractPreview(cleanedTags);
    } else {
        alert('未找到有效的标签！');
    }
}

// 清理 Danbooru 格式文本
function cleanDanbooruText() {
    const inputText = document.getElementById('inputText');
    const text = inputText.value.trim();
    
    if (!text) {
        alert('请先输入文本！');
        return;
    }
    
    // 解析 Danbooru 标签列表
    const tags = parseDanbooruTagList(text);
    const cleanedTags = tags
        .map(tag => cleanTagText(tag))
        .filter(tag => tag && isValidTag(tag));
    
    if (cleanedTags.length > 0) {
        // 将清理后的标签放回输入框
        const cleanedText = cleanedTags.join('\n');
        inputText.value = cleanedText;
        document.getElementById('outputText').textContent = cleanedText;
        
        showCleanNotification(cleanedTags.length, tags.length);
    } else {
        alert('未找到有效的标签！');
    }
}

// 显示提取预览
function showExtractPreview(tags) {
    const preview = document.getElementById('extractPreview');
    const extractedTagsDiv = document.getElementById('extractedTags');
    
    extractedTagsDiv.textContent = tags.join(', ');
    preview.style.display = 'block';
    
    // 存储提取的标签供后续使用
    window.currentExtractedTags = tags;
}

// 添加提取的标签到标签库
function addExtractedTags() {
    const cat = getCategoryByPath(currentPath);
    if (!cat || !window.currentExtractedTags) return;
    
    let addedCount = 0;
    window.currentExtractedTags.forEach(tag => {
        if (!cat.tags.includes(tag)) {
            cat.tags.push(tag);
            addedCount++;
        }
    });
    
    if (addedCount > 0) {
        renderTags();
        saveDataToStorage();
        showDetailedAddNotification(addedCount, window.currentExtractedTags.length, window.currentExtractedTags);
    } else {
        alert('所有标签都已存在！');
    }
    
    // 隐藏预览
    cancelExtract();
}

// 取消提取
function cancelExtract() {
    document.getElementById('extractPreview').style.display = 'none';
    window.currentExtractedTags = null;
}

// 显示替换通知
function showReplaceNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3a7bd5;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    notification.textContent = `✓ ${message}`;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// 显示清理通知
function showCleanNotification(cleaned, total) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    notification.textContent = `🧹 已清理 ${total} 项，提取出 ${cleaned} 个有效标签`;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

// 分隔条拖拽功能
document.addEventListener('DOMContentLoaded', function() {
    // 重新获取标点符号按钮
    const punctBtns = document.querySelectorAll('.punct-btn');
    
    const resizer = document.querySelector('.resizer');
    const sidebar = document.querySelector('.sidebar');
    let isResizing = false;
    
    resizer.addEventListener('mousedown', function(e) {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        e.preventDefault();
    });
    
    function handleMouseMove(e) {
        if (!isResizing) return;
        
        const containerRect = document.querySelector('.container').getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left;
        
        // 限制最小和最大宽度
        const minWidth = 160;
        const maxWidth = 400;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            sidebar.style.width = newWidth + 'px';
        }
    }
    
    function handleMouseUp() {
        if (!isResizing) return;
        
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
    
    // 设置标点符号按钮事件监听器
    punctBtns.forEach(btn => {
        let clickTimeout;
        
        btn.addEventListener('click', () => {
            const symbol = btn.dataset.punct;
            
            // 清除之前的延迟执行
            clearTimeout(clickTimeout);
            
            // 延迟执行单击操作，等待可能的双击
            clickTimeout = setTimeout(() => {
                // 单击：插入符号
                insertAtCursor(inputText, symbol);
                inputText.focus();
                outputText.textContent = inputText.value;
            }, 250); // 250ms延迟
        });
        
        btn.addEventListener('dblclick', () => {
            const symbol = btn.dataset.punct;
            
            // 清除单击的延迟执行
            clearTimeout(clickTimeout);
            
            // 双击：启用自动模式
            enableAutoMode(symbol, btn);
        });
    });
    
    // 启用自动模式
    function enableAutoMode(symbol, button) {
        // 清除之前的自动模式
        clearAutoMode();
        
        autoModeEnabled = true;
        autoModeSymbol = symbol;
        
        // 更新按钮状态
        button.classList.add('active');
        
        // 更新状态显示
        updateAutoModeStatus();
    }
    
    // 清除自动模式
    function clearAutoMode() {
        autoModeEnabled = false;
        autoModeSymbol = '';
        
        // 清除所有按钮的激活状态
        punctBtns.forEach(btn => btn.classList.remove('active'));
        
        // 更新状态显示
        updateAutoModeStatus();
    }
    
    // 更新自动模式状态显示
    function updateAutoModeStatus() {
        const statusEl = document.getElementById('autoModeStatus');
        const clearBtn = document.getElementById('clearAutoMode');
        
        if (autoModeEnabled) {
            statusEl.textContent = `自动模式：开启 (${autoModeSymbol}) - 输入空格或按Tab键自动添加`;
            clearBtn.style.display = 'inline-block';
        } else {
            statusEl.textContent = '自动模式：关闭 - 双击标点符号启用';
            clearBtn.style.display = 'none';
        }
    }
    
    // 清除自动模式按钮事件
    document.getElementById('clearAutoMode').addEventListener('click', clearAutoMode);
    
    // 初始化状态显示
    updateAutoModeStatus();
    
    // 文本替换功能事件监听器
    document.getElementById('replaceBtn').addEventListener('click', () => replaceText(false));
    document.getElementById('replaceAllBtn').addEventListener('click', () => replaceText(true));
    
    // 标签提取功能事件监听器
    document.getElementById('extractTagsFromTextBtn').addEventListener('click', extractTagsFromText);
    document.getElementById('cleanDanbooruTextBtn').addEventListener('click', cleanDanbooruText);
    document.getElementById('addExtractedBtn').addEventListener('click', addExtractedTags);
    document.getElementById('cancelExtractBtn').addEventListener('click', cancelExtract);
    
    // 处理输入事件，在单词后自动添加标点符号
    inputText.addEventListener('input', (e) => {
        if (autoModeEnabled && autoModeSymbol) {
            const value = inputText.value;
            const cursorPos = inputText.selectionStart;
            
            // 检查是否刚输入了空格或回车
            if ((value[cursorPos - 1] === ' ' || value[cursorPos - 1] === '\n') && cursorPos > 1) {
                const beforeSpace = value.slice(0, cursorPos - 1);
                
                // 找到最后一个单词
                const words = beforeSpace.split(/\s+/);
                const lastWord = words[words.length - 1];
                
                // 如果最后一个单词不为空且不以标点符号结尾
                if (lastWord && lastWord.length > 0 && !isPunctuation(lastWord[lastWord.length - 1])) {
                    // 在空格前插入标点符号
                    const separator = value[cursorPos - 1]; // 保持原来的分隔符（空格或换行）
                    const newValue = beforeSpace + autoModeSymbol + separator + value.slice(cursorPos);
                    inputText.value = newValue;
                    inputText.selectionStart = inputText.selectionEnd = cursorPos + autoModeSymbol.length;
                }
            }
        }
        
        outputText.textContent = inputText.value;
    });
    
    // 处理Tab键，手动触发自动添加标点符号
    inputText.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && autoModeEnabled && autoModeSymbol) {
            e.preventDefault();
            
            const value = inputText.value;
            const cursorPos = inputText.selectionStart;
            
            // 找到光标前的文本
            const beforeCursor = value.slice(0, cursorPos);
            const words = beforeCursor.split(/\s+/);
            const lastWord = words[words.length - 1];
            
            // 如果最后一个单词不为空且不以标点符号结尾
            if (lastWord && lastWord.length > 0 && !isPunctuation(lastWord[lastWord.length - 1])) {
                // 在当前位置插入标点符号
                const newValue = beforeCursor + autoModeSymbol + value.slice(cursorPos);
                inputText.value = newValue;
                inputText.selectionStart = inputText.selectionEnd = cursorPos + autoModeSymbol.length;
                outputText.textContent = inputText.value;
            }
        }
    });
    
    // 检查字符是否为标点符号
    function isPunctuation(char) {
        const punctuations = '.,!?;:\'"\\-()[]{}';
        return punctuations.includes(char);
    }
    
    // 复制功能
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.addEventListener('click', function() {
        const outputContent = outputText.textContent;
        
        if (outputContent.trim() === '') {
            alert('输出文本为空，无内容可复制！');
            return;
        }
        
        // 使用现代 Clipboard API
        if (navigator.clipboard) {
            navigator.clipboard.writeText(outputContent).then(function() {
                // 显示复制成功的反馈
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>已复制';
                copyBtn.style.background = '#28a745';
                
                setTimeout(function() {
                    copyBtn.innerHTML = originalText;
                    copyBtn.style.background = '#3a7bd5';
                }, 2000);
            }).catch(function(err) {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制！');
            });
        } else {
            // 降级方案：使用 execCommand
            const textArea = document.createElement('textarea');
            textArea.value = outputContent;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>已复制';
                copyBtn.style.background = '#28a745';
                
                setTimeout(function() {
                    copyBtn.innerHTML = originalText;
                    copyBtn.style.background = '#3a7bd5';
                }, 2000);
            } catch (err) {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制！');
            }
            
            document.body.removeChild(textArea);
        }
    });
});

// 数据持久化存储
function saveDataToStorage() {
    const data = {
        categories: categories,
        recycleBin: recycleBin,
        currentPath: currentPath,
        recycleBinExpanded: recycleBinExpanded
    };
    try {
        localStorage.setItem('textToolAppData', JSON.stringify(data));
    } catch (error) {
        console.warn('无法保存数据到本地存储:', error);
    }
}

function loadDataFromStorage() {
    try {
        const savedData = localStorage.getItem('textToolAppData');
        if (savedData) {
            const data = JSON.parse(savedData);
            if (data.categories && Array.isArray(data.categories)) {
                categories = data.categories;
            }
            if (data.recycleBin && Array.isArray(data.recycleBin)) {
                recycleBin = data.recycleBin;
            }
            if (data.currentPath && Array.isArray(data.currentPath)) {
                currentPath = data.currentPath;
            }
            if (typeof data.recycleBinExpanded === 'boolean') {
                recycleBinExpanded = data.recycleBinExpanded;
            }
            return true;
        }
    } catch (error) {
        console.warn('无法从本地存储加载数据:', error);
    }
    return false;
}

let categories = [
    {
        name: '米哈游', 
        tags: [], 
        children: [
            { name: '星穹铁道', tags: [], children: [] },
            { name: '原神', tags: [], children: [] },
        ],
        expanded: true
    },
    { name: '库洛', tags: [], children: [], expanded: true }
];

let recycleBin = []; // 回收站数据
let contextMenuTarget = null; // 右键菜单目标
let recycleBinExpanded = true; // 回收站展开状态

let currentPath = [0]; // 默认选中第一个分类

function getCategoryByPath(path) {
    let node = categories;
    for (let idx of path) {
        node = node[idx].children;
    }
    return path.length ? path.reduce((acc, idx, i) => i === 0 ? categories[idx] : acc.children[idx], categories[path[0]]) : null;
}

function toggleCategory(e, path) {
    e.stopPropagation();
    const cat = getCategoryByPath(path);
    if (cat && cat.children && cat.children.length > 0) {
        cat.expanded = !cat.expanded;
        categoryTree.innerHTML = renderCategoryTree();
        saveDataToStorage(); // 保存数据
    }
}

function renderCategoryTree(list = categories, path = []) {
    return `<ul>${list.map((cat, idx) => {
        const thisPath = [...path, idx];
        const isActive = JSON.stringify(thisPath) === JSON.stringify(currentPath);
        const hasChildren = cat.children && cat.children.length > 0;
        const isExpanded = cat.expanded !== false; // 默认展开
        
        return `
            <li class="${isActive ? 'active' : ''}">
                <div class="category-item" oncontextmenu="showContextMenu(event, ${JSON.stringify(thisPath)})">
                    ${hasChildren ? `
                        <span class="toggle-icon ${isExpanded ? 'expanded' : ''}" onclick="toggleCategory(event, ${JSON.stringify(thisPath)})">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3a7bd5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                        </span>
                    ` : '<span class="toggle-icon-placeholder"></span>'}
                    <span class="folder-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3a7bd5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 7V5a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        </svg>
                    </span>
                    <span class="category-name" onclick="selectCategory(event, ${JSON.stringify(thisPath)})">${cat.name}</span>
                </div>
                ${hasChildren && isExpanded ? renderCategoryTree(cat.children, thisPath) : ''}
            </li>
        `;
    }).join('')}</ul>`;
}

window.selectCategory = function(e, path) {
    e.stopPropagation();
    currentPath = path;
    categoryTree.innerHTML = renderCategoryTree();
    renderTags();
    saveDataToStorage(); // 保存数据
    const cat = getCategoryByPath(path);
    currentCategoryName.textContent = cat ? cat.name + ' 标签库' : '常用标签库';
};

window.toggleCategory = toggleCategory;

function renderTags() {
    const cat = getCategoryByPath(currentPath);
    tagList.innerHTML = cat && cat.tags ? cat.tags.map((tag, tagIdx) =>
        `<span class="tag-item">
            <button class="punct-btn" onclick="insertTag('${tag}')">${tag}</button>
            <button class="del-btn" onclick="removeTag(${tagIdx})">&times;</button>
        </span>`
    ).join('') : '';
}

window.insertTag = function(tag) {
    inputText.value += (inputText.value ? ' ' : '') + tag;
    inputText.focus();
};

window.removeTag = function(tagIdx) {
    const cat = getCategoryByPath(currentPath);
    if (cat && cat.tags) {
        cat.tags.splice(tagIdx, 1);
        renderTags();
        saveDataToStorage(); // 保存数据
    }
};

newTagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const val = newTagInput.value.trim();
        const cat = getCategoryByPath(currentPath);
        if (val && cat && !cat.tags.includes(val)) {
            cat.tags.push(val);
            renderTags();
            saveDataToStorage(); // 保存数据
        }
        newTagInput.value = '';
    }
});

// 快速添加标签功能
const quickAddInput = document.getElementById('quickAddInput');
const quickAddBtn = document.getElementById('quickAddBtn');

function addQuickTag() {
    const val = quickAddInput.value.trim();
    const cat = getCategoryByPath(currentPath);
    if (val && cat) {
        // 检查是否是 Danbooru 标签列表格式
        const isDanbooruFormat = val.includes('?') && /\d+[kmgtKMGT]/.test(val);
        
        let tags = [];
        
        if (isDanbooruFormat) {
            // 处理 Danbooru 复制的标签格式
            tags = parseDanbooruTagList(val);
        } else {
            // 处理普通标签，用逗号、空格或换行分隔
            tags = val.split(/[,\s\n]+/).filter(tag => tag.trim() !== '');
        }
        
        let addedCount = 0;
        let filteredTags = [];
        
        tags.forEach(tag => {
            const cleanTag = cleanTagText(tag.trim());
            if (cleanTag && isValidTag(cleanTag)) {
                filteredTags.push(cleanTag);
                if (!cat.tags.includes(cleanTag)) {
                    cat.tags.push(cleanTag);
                    addedCount++;
                }
            }
        });
        
        if (addedCount > 0) {
            renderTags();
            saveDataToStorage(); // 保存数据
            // 显示详细的添加结果
            showDetailedAddNotification(addedCount, tags.length, filteredTags);
        } else if (filteredTags.length > 0) {
            alert(`已过滤出 ${filteredTags.length} 个有效标签，但都已存在！`);
        } else {
            alert('没有找到有效的标签！');
        }
    }
    quickAddInput.value = '';
}

function parseDanbooruTagList(text) {
    const tags = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
        line = line.trim();
        if (!line || line === '?') return;
        
        // 移除开头的问号
        if (line.startsWith('?')) {
            line = line.substring(1).trim();
        }
        
        // 使用正则表达式匹配标签和数字
        // 匹配格式：标签名 + 空格 + 数字 + 可选单位
        const match = line.match(/^(.+?)\s+[\d.]+[kmgtKMGT]*$/i);
        if (match) {
            const tagName = match[1].trim();
            if (tagName) {
                tags.push(tagName);
            }
        } else if (line && !line.match(/^\d+[kmgtKMGT]*$/i)) {
            // 如果不匹配数字格式，但也不是纯数字，则直接添加
            tags.push(line);
        }
    });
    
    return tags;
}

function showDetailedAddNotification(added, total, filteredTags) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        max-width: 400px;
        line-height: 1.4;
    `;
    
    let message = '';
    if (added === filteredTags.length) {
        message = `✅ 成功添加 ${added} 个标签`;
    } else {
        message = `✅ 添加 ${added} 个新标签（${filteredTags.length - added} 个已存在）`;
    }
    
    if (total > filteredTags.length) {
        message += `\n🔍 从 ${total} 项中过滤出 ${filteredTags.length} 个有效标签`;
    }
    
    notification.innerHTML = message.replace(/\n/g, '<br>');
    
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

function showQuickAddNotification(added, total) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    if (added === total) {
        notification.textContent = `✓ 成功添加 ${added} 个标签`;
    } else {
        notification.textContent = `✓ 添加 ${added} 个新标签（${total - added} 个已存在）`;
    }
    
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

quickAddBtn.addEventListener('click', addQuickTag);

quickAddInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addQuickTag();
    }
});

// 自动检测剪贴板内容
quickAddInput.addEventListener('focus', async () => {
    try {
        if (navigator.clipboard && navigator.clipboard.readText) {
            const clipboardText = await navigator.clipboard.readText();
            // 检查是否看起来像是标签（不包含常见的URL字符）
            if (clipboardText && clipboardText.length < 200 && 
                !clipboardText.includes('http') && 
                !clipboardText.includes('www.')) {
                quickAddInput.placeholder = '检测到剪贴板内容，直接回车添加';
                quickAddInput.value = clipboardText;
                quickAddInput.select();
            }
        }
    } catch (err) {
        // 忽略剪贴板读取错误
    }
});

quickAddInput.addEventListener('blur', () => {
    quickAddInput.placeholder = '粘贴标签后回车快速添加';
});

// Danbooru 链接标签提取功能
const danbooruUrlInput = document.getElementById('danbooruUrlInput');
const extractTagsBtn = document.getElementById('extractTagsBtn');

async function extractTagsFromDanbooru() {
    const url = danbooruUrlInput.value.trim();
    
    if (!url) {
        alert('请输入 Danbooru 链接！');
        return;
    }
    
    if (!url.includes('danbooru.donmai.us')) {
        alert('请输入有效的 Danbooru 链接！');
        return;
    }
    
    try {
        // 显示加载状态
        const originalText = extractTagsBtn.textContent;
        extractTagsBtn.textContent = '分析中...';
        extractTagsBtn.disabled = true;
        
        // 直接从URL中提取标签（更可靠的方法）
        const urlTags = extractTagsFromUrl(url);
        
        if (urlTags.length > 0) {
            const cat = getCategoryByPath(currentPath);
            if (cat) {
                let addedCount = 0;
                urlTags.forEach(tag => {
                    if (tag && !cat.tags.includes(tag)) {
                        cat.tags.push(tag);
                        addedCount++;
                    }
                });
                
                if (addedCount > 0) {
                    renderTags();
                    saveDataToStorage(); // 保存数据
                    showExtractionNotification(addedCount, urlTags.length);
                    
                    // 如果提取的标签数量较少，显示更多选项
                    if (addedCount < 5) {
                        setTimeout(() => {
                            showEnhancedExtractionOptions();
                        }, 2000);
                    }
                } else {
                    alert('没有找到新的标签！');
                }
            }
        } else {
            // 显示手动提取指南
            showEnhancedExtractionOptions();
        }
        
    } catch (error) {
        console.error('提取标签失败:', error);
        showManualExtractionGuide();
    } finally {
        // 恢复按钮状态
        extractTagsBtn.textContent = originalText;
        extractTagsBtn.disabled = false;
    }
    
    danbooruUrlInput.value = '';
}

function showManualExtractionGuide() {
    const guideDiv = document.createElement('div');
    guideDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 500px;
        text-align: center;
        font-family: 'Segoe UI', Arial, sans-serif;
        border: 2px solid #ff9800;
    `;
    
    guideDiv.innerHTML = `
        <h3 style="color: #e65100; margin-top: 0;">📋 手动复制标签</h3>
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            由于浏览器安全限制，无法自动提取标签。<br>
            请按以下步骤手动复制：
        </p>
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
            <strong>方法1：使用书签工具</strong><br>
            1. 使用我们提供的书签工具<br>
            2. 在 Danbooru 页面上点击书签激活<br>
            3. 直接点击标签复制文字
        </div>
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
            <strong>方法2：手动复制</strong><br>
            1. 在 Danbooru 页面上选择标签文字<br>
            2. 复制标签内容（Ctrl+C）<br>
            3. 粘贴到绿色的"快速添加"框中
        </div>
        <button id="closeGuide" style="
            background: #ff9800;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 15px;
        ">知道了</button>
    `;
    
    document.body.appendChild(guideDiv);
    
    // 关闭按钮事件
    document.getElementById('closeGuide').addEventListener('click', () => {
        document.body.removeChild(guideDiv);
    });
    
    // 点击背景关闭
    guideDiv.addEventListener('click', (e) => {
        if (e.target === guideDiv) {
            document.body.removeChild(guideDiv);
        }
    });
}

function extractTagsFromUrl(url) {
    const tags = [];
    
    try {
        // 解析URL
        const urlObj = new URL(url);
        
        // 从URL参数中提取标签
        const tagsParam = urlObj.searchParams.get('tags') || urlObj.searchParams.get('q');
        
        if (tagsParam) {
            // 处理多种分隔符和编码
            const tagList = tagsParam
                .split(/[\s+%20_]+/) // 分割符：空格、+、%20、_
                .filter(tag => tag.length > 0);
            
            tagList.forEach(tag => {
                // 解码URL编码
                let decoded = decodeURIComponent(tag);
                
                // 处理常见的URL编码
                decoded = decoded
                    .replace(/%28/g, '(')
                    .replace(/%29/g, ')')
                    .replace(/%20/g, ' ')
                    .replace(/\+/g, ' ');
                
                const cleanedTag = cleanTagText(decoded);
                if (cleanedTag && isValidTag(cleanedTag)) {
                    tags.push(cleanedTag);
                }
            });
        }
        
        // 如果从URL参数提取的标签很少，显示更多提取选项
        if (tags.length < 5) {
            console.log(`从URL提取到 ${tags.length} 个标签，建议使用手动方法获取更多标签`);
        }
        
    } catch (error) {
        console.error('URL解析错误:', error);
    }
    
    return [...new Set(tags)]; // 去重
}

// 添加一个手动标签提取的增强功能
function showEnhancedExtractionOptions() {
    const enhancedDiv = document.createElement('div');
    enhancedDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 600px;
        font-family: 'Segoe UI', Arial, sans-serif;
        border: 2px solid #2196F3;
    `;
    
    enhancedDiv.innerHTML = `
        <h3 style="color: #1976d2; margin-top: 0;">🚀 获取更多标签的方法</h3>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">方法1：批量复制标签</h4>
            <ol style="margin: 10px 0; padding-left: 20px;">
                <li>在 Danbooru 页面上，选择所有想要的标签文本</li>
                <li>一次性复制多个标签（用空格分隔）</li>
                <li>粘贴到下面的绿色"快速添加"框中</li>
                <li>例如：<code>1boy smile blue_hair sword</code></li>
            </ol>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h4 style="color: #2e7d32; margin-top: 0;">方法2：使用书签工具</h4>
            <ol style="margin: 10px 0; padding-left: 20px;">
                <li>使用我们提供的书签工具</li>
                <li>在 Danbooru 页面上激活功能</li>
                <li>逐个点击标签快速复制</li>
                <li>每个标签都会自动添加到您的标签库</li>
            </ol>
        </div>
        
        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h4 style="color: #e65100; margin-top: 0;">方法3：手动输入</h4>
            <p style="margin: 10px 0;">直接在快速添加框中输入标签，用空格、逗号或换行分隔：</p>
            <textarea style="width: 100%; height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-family: monospace;" placeholder="例如：
1boy
smile
blue hair
sword
magic"></textarea>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <button id="closeEnhanced" style="
                background: #2196F3;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                margin-right: 10px;
            ">我知道了</button>
            <button id="openBookmarkHelper" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            ">打开书签工具说明</button>
        </div>
    `;
    
    document.body.appendChild(enhancedDiv);
    
    // 关闭按钮事件
    document.getElementById('closeEnhanced').addEventListener('click', () => {
        document.body.removeChild(enhancedDiv);
    });
    
    // 打开书签工具说明
    document.getElementById('openBookmarkHelper').addEventListener('click', () => {
        window.open('danbooru-helper.html', '_blank');
        document.body.removeChild(enhancedDiv);
    });
}

function cleanTagText(text) {
    if (!text) return '';
    
    // 移除前后空格
    let cleaned = text.trim();
    
    // 移除开头的问号（Danbooru 复制格式）
    if (cleaned.startsWith('?')) {
        cleaned = cleaned.substring(1).trim();
    }
    
    // 处理常见的HTML实体
    cleaned = cleaned
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    
    // 移除末尾的数字统计（如 "1boy 1.6M" -> "1boy"）
    cleaned = cleaned.replace(/\s+[\d.]+[kmgtKMGT]*$/i, '');
    
    // 移除其他问号和感叹号
    cleaned = cleaned.replace(/[?!]/g, '');
    
    // 转换下划线为空格（Danbooru 标签格式）
    cleaned = cleaned.replace(/_/g, ' ');
    
    // 移除多余的空格并规范化
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
}

function isValidTag(text) {
    if (!text || text.length === 0) return false;
    
    // 过滤掉纯数字（但保留包含字母的标签，如 "1boy", "2girls"）
    if (/^\d+(\.\d+)?[a-zA-Z]*$/.test(text) && !/[a-zA-Z]/.test(text)) return false;
    
    // 过滤掉纯标点符号
    if (/^[^\w\s()]+$/.test(text)) return false;
    
    // 过滤掉包含 "posts" 的文本
    if (text.toLowerCase().includes('posts')) return false;
    
    // 过滤掉太短的标签（但允许像 "1boy" 这样的有效标签）
    if (text.length < 2) return false;
    
    // 过滤掉常见的非标签文本（更宽松的过滤）
    const invalidPatterns = [
        /^[.!?]+$/, // 纯标点
        /^(more|less|show|hide|next|prev|page|view|edit|add|remove|delete|search)$/i, // 常见导航和操作词
        /^\d+[kmgtKMGT]$/, // 纯数字+单位（如 "123K"）
        /^(http|https|www\.)/i, // URL
        /^(ftp|file):/i // 文件协议
    ];
    
    for (const pattern of invalidPatterns) {
        if (pattern.test(text)) return false;
    }
    
    // 更宽松的字符检查：允许更多字符类型
    if (!/^[a-zA-Z0-9_\s()\-'".,:]+$/.test(text)) return false;
    
    return true;
}

function showExtractionNotification(added, total) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff9800;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    if (added === total) {
        notification.textContent = `🎯 从 Danbooru 成功提取 ${added} 个标签`;
    } else {
        notification.textContent = `🎯 提取 ${added} 个新标签（${total - added} 个已存在）`;
    }
    
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

extractTagsBtn.addEventListener('click', extractTagsFromDanbooru);

danbooruUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        extractTagsFromDanbooru();
    }
});

// 自动检测剪贴板中的 Danbooru 链接
danbooruUrlInput.addEventListener('focus', async () => {
    try {
        if (navigator.clipboard && navigator.clipboard.readText) {
            const clipboardText = await navigator.clipboard.readText();
            if (clipboardText && clipboardText.includes('danbooru.donmai.us')) {
                danbooruUrlInput.value = clipboardText;
                danbooruUrlInput.select();
                danbooruUrlInput.placeholder = '检测到 Danbooru 链接，按回车提取标签';
            }
        }
    } catch (err) {
        // 忽略剪贴板读取错误
    }
});

danbooruUrlInput.addEventListener('blur', () => {
    danbooruUrlInput.placeholder = '粘贴 Danbooru 页面链接，自动提取标签';
});

// 新增一级分类（可自行扩展为多级添加）
newCategoryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const val = newCategoryInput.value.trim();
        if (val) {
            categories.push({ name: val, tags: [], children: [], expanded: true });
            categoryTree.innerHTML = renderCategoryTree();
            saveDataToStorage(); // 保存数据
            newCategoryInput.value = '';
        }
    }
});

// 插入标点到光标处
function insertAtCursor(textarea, value) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    textarea.value = text.slice(0, start) + value + text.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start + value.length;
}

// 右键菜单相关功能
function showContextMenu(e, path) {
    e.preventDefault();
    e.stopPropagation();
    
    contextMenuTarget = path;
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = e.pageX + 'px';
    contextMenu.style.top = e.pageY + 'px';
}

function hideContextMenu() {
    document.getElementById('contextMenu').style.display = 'none';
    contextMenuTarget = null;
}

function getCategoryAndParent(path) {
    if (path.length === 1) {
        return { category: categories[path[0]], parent: categories, index: path[0] };
    }
    
    let parent = categories;
    for (let i = 0; i < path.length - 1; i++) {
        parent = parent[path[i]].children;
    }
    const index = path[path.length - 1];
    return { category: parent[index], parent: parent, index: index };
}

function addSubFolder() {
    if (!contextMenuTarget) return;
    
    const folderName = prompt('请输入子文件夹名称:');
    if (!folderName || !folderName.trim()) return;
    
    const { category } = getCategoryAndParent(contextMenuTarget);
    if (!category.children) {
        category.children = [];
    }
    
    category.children.push({
        name: folderName.trim(),
        tags: [],
        children: [],
        expanded: true
    });
    
    category.expanded = true; // 展开父文件夹
    categoryTree.innerHTML = renderCategoryTree();
    renderRecycleBin();
    saveDataToStorage(); // 保存数据
    hideContextMenu();
}

function deleteFolder() {
    if (!contextMenuTarget) return;
    
    const { category, parent, index } = getCategoryAndParent(contextMenuTarget);
    
    if (confirm(`确定要删除文件夹 "${category.name}" 吗？`)) {
        // 添加到回收站
        recycleBin.push({
            name: category.name,
            data: JSON.parse(JSON.stringify(category)), // 深拷贝
            originalPath: [...contextMenuTarget],
            deletedAt: new Date().toLocaleString()
        });
        
        // 从原位置删除
        parent.splice(index, 1);
        
        // 如果删除的是当前选中的分类，切换到第一个分类
        if (JSON.stringify(contextMenuTarget) === JSON.stringify(currentPath)) {
            currentPath = [0];
        }
        
        categoryTree.innerHTML = renderCategoryTree();
        renderTags();
        renderRecycleBin();
        saveDataToStorage(); // 保存数据
        hideContextMenu();
    }
}

function renderRecycleBin() {
    const recycledItems = document.getElementById('recycledItems');
    const clearBtn = document.getElementById('clearRecycleBin');
    const recycleBinToggle = document.getElementById('recycleBinToggle');
    
    // 设置回收站收缩/展开状态
    if (recycleBinExpanded) {
        recycledItems.classList.remove('collapsed');
        recycleBinToggle.classList.add('expanded');
    } else {
        recycledItems.classList.add('collapsed');
        recycleBinToggle.classList.remove('expanded');
    }
    
    if (recycleBin.length === 0) {
        recycledItems.innerHTML = '<div style="color: #999; font-size: 12px; padding: 8px; text-align: center;">回收站为空</div>';
        clearBtn.disabled = true;
    } else {
        // 按删除时间倒序排列
        const sortedItems = [...recycleBin].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
        
        recycledItems.innerHTML = `
            <div class="recycled-tree">
                <ul>
                    ${sortedItems.map((item, index) => `
                        <li>
                            <div class="recycled-item folder">
                                <div class="folder-info">
                                    <div class="folder-name">📁 ${item.name}</div>
                                    <div class="folder-path">路径: ${getPathString(item.originalPath)}</div>
                                    <div class="delete-time">删除时间: ${item.deletedAt}</div>
                                    ${item.data.children && item.data.children.length > 0 ? 
                                        `<div class="folder-path">包含 ${getChildrenCount(item.data)} 个子项</div>` : ''}
                                </div>
                                <button class="restore-btn" onclick="restoreFolder(${recycleBin.indexOf(item)})">恢复</button>
                            </div>
                            ${renderRecycledChildren(item.data.children, recycleBin.indexOf(item))}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        clearBtn.disabled = false;
    }
}

function renderRecycledChildren(children, parentIndex) {
    if (!children || children.length === 0) return '';
    
    return `
        <ul>
            ${children.map(child => `
                <li>
                    <div class="recycled-item file">
                        <div class="folder-info">
                            <div class="folder-name">📄 ${child.name}</div>
                            ${child.tags && child.tags.length > 0 ? 
                                `<div class="folder-path">标签: ${child.tags.join(', ')}</div>` : ''}
                        </div>
                    </div>
                    ${renderRecycledChildren(child.children, parentIndex)}
                </li>
            `).join('')}
        </ul>
    `;
}

function getPathString(path) {
    if (path.length === 0) return '根目录';
    
    let pathString = '';
    let current = categories;
    
    for (let i = 0; i < path.length; i++) {
        if (i > 0) pathString += ' > ';
        if (current && current[path[i]]) {
            pathString += current[path[i]].name;
            current = current[path[i]].children;
        } else {
            pathString += '未知';
        }
    }
    
    return pathString;
}

function getChildrenCount(category) {
    let count = 0;
    if (category.children) {
        count += category.children.length;
        category.children.forEach(child => {
            count += getChildrenCount(child);
        });
    }
    return count;
}

function toggleRecycleBin() {
    recycleBinExpanded = !recycleBinExpanded;
    renderRecycleBin();
    saveDataToStorage(); // 保存数据
}

function addParentFolder() {
    const folderName = prompt('请输入父文件夹名称:');
    if (!folderName || !folderName.trim()) return;
    
    categories.unshift({
        name: folderName.trim(),
        tags: [],
        children: [],
        expanded: true
    });
    
    // 更新当前路径（因为添加了新的父文件夹，所有路径都要向后移动）
    currentPath = [currentPath[0] + 1, ...currentPath.slice(1)];
    
    categoryTree.innerHTML = renderCategoryTree();
    renderRecycleBin();
    saveDataToStorage(); // 保存数据
}

function restoreFolder(index) {
    const item = recycleBin[index];
    
    // 恢复到原位置
    const { parent } = getCategoryAndParent(item.originalPath.slice(0, -1));
    const originalIndex = item.originalPath[item.originalPath.length - 1];
    
    if (parent && originalIndex <= parent.length) {
        parent.splice(originalIndex, 0, item.data);
    } else {
        // 如果原位置不存在，添加到根目录
        categories.push(item.data);
    }
    
    // 从回收站删除
    recycleBin.splice(index, 1);
    
    categoryTree.innerHTML = renderCategoryTree();
    renderRecycleBin();
    saveDataToStorage(); // 保存数据
}

function clearRecycleBin() {
    if (confirm('确定要清空回收站吗？此操作不可恢复。')) {
        recycleBin.length = 0;
        renderRecycleBin();
        saveDataToStorage(); // 保存数据
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 加载保存的数据
    loadDataFromStorage();
    
    // 初始化界面
    categoryTree.innerHTML = renderCategoryTree();
    renderTags();
    renderRecycleBin();
    
    // 设置回收站展开状态
    const recycleBinToggle = document.getElementById('recycleBinToggle');
    const recycledItems = document.getElementById('recycledItems');
    if (recycleBinExpanded) {
        recycleBinToggle.classList.add('expanded');
        recycledItems.style.display = 'block';
    } else {
        recycleBinToggle.classList.remove('expanded');
        recycledItems.style.display = 'none';
    }
});

// 全局事件监听器
document.addEventListener('click', hideContextMenu);

// 右键菜单事件监听器
document.getElementById('addSubFolder').addEventListener('click', addSubFolder);
document.getElementById('deleteFolder').addEventListener('click', deleteFolder);
document.getElementById('clearRecycleBin').addEventListener('click', clearRecycleBin);
document.getElementById('addParentFolder').addEventListener('click', addParentFolder);
document.getElementById('recycleBinToggle').addEventListener('click', toggleRecycleBin);

// 暴露函数到全局
window.showContextMenu = showContextMenu;
window.restoreFolder = restoreFolder;
window.toggleRecycleBin = toggleRecycleBin;
window.addParentFolder = addParentFolder;

