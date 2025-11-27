# GitHub 网页上传指南

如果命令行推送总是超时，可以使用网页上传：

## 方法 1：上传 ZIP 文件

1. **压缩项目**：
   - 右键 `MathGame` 文件夹
   - 选择 "发送到" → "压缩(zipped)文件夹"
   
2. **上传到 GitHub**：
   - 访问：https://github.com/ChihiroQx/math_game
   - 点击 "Add file" → "Upload files"
   - 拖拽 ZIP 文件上传
   - 或者点击 "choose your files"

3. **注意**：
   - GitHub 单个文件限制 100MB
   - 如果 ZIP 太大，需要分批上传或使用 GitHub Desktop

---

## 方法 2：使用 GitHub Desktop（推荐）

### 下载安装
- Windows: https://desktop.github.com/
- 中文界面，操作简单

### 使用步骤
1. 打开 GitHub Desktop
2. 登录 GitHub 账号
3. File → Add Local Repository
4. 选择 `MathGame` 文件夹
5. 点击 "Publish repository"
6. 等待上传完成（有进度条）

### 优点
- ✅ 自动处理网络中断和重试
- ✅ 显示上传进度
- ✅ 支持大文件
- ✅ 图形界面，更直观

---

## 方法 3：分多次提交（命令行）

如果坚持用命令行，可以分批上传：

```batch
# 第1次：只推送代码
git add src/ *.md *.json
git commit -m "提交代码文件"
git push -u origin main

# 第2次：推送小资源
git add assets/data/ assets/audio/
git commit -m "添加数据和音频"
git push origin main

# 第3次：推送图片资源
git add assets/res/
git commit -m "添加图片资源"
git push origin main
```

---

## 🎯 推荐方案排序

1. **首选**：GitHub Desktop（最稳定）
2. **次选**：网页上传 ZIP
3. **备选**：命令行分批推送
4. **高级**：Git LFS（需要额外配置）

---

## 📝 注意事项

- 删除 `node_modules` 文件夹后再上传（这个很大）
- 已经有 `.gitignore` 会自动忽略 `node_modules`
- 检查项目大小：右键属性查看（建议 < 500MB）

