# 第九章静电场互动课件

这是一个可部署到 GitHub Pages 的静态 HTML 互动课件站点，不需要安装依赖或执行构建命令。

首页提供以下三节课的入口：

- 9.2 库仑定律
- 9.3 电场 电场强度（第1课时）
- 9.3 电场 电场强度（第2课时）

每节课暂设 3 页：

1. 课程导入与学习目标
2. 核心概念与课堂小测
3. GeoGebra 动态展示

## 目录结构

```text
.
├── index.html              # 三选一课程首页
├── 9.2/
│   └── index.html          # 9.2 库仑定律课件
├── 9.3.1/
│   └── index.html          # 9.3 第1课时课件
├── 9.3.2/
│   └── index.html          # 9.3 第2课时课件
├── assets/
│   ├── 9.2.ggb             # 9.2 使用的 GeoGebra 文件
│   ├── 9.3.1.ggb           # 9.3 第1课时使用的 GeoGebra 文件
│   ├── 9.3.2.ggb           # 9.3 第2课时使用的 GeoGebra 文件
│   └── demo.ggb            # 备用示例文件
├── GeoGebra/               # GeoGebra 离线运行库
├── styles.css              # 首页和三套课件共用样式
└── script.js               # 翻页、进度保存及 GeoGebra 加载逻辑
```

## 本地运行

在项目根目录执行：

```bash
python3 -m http.server 8080
```

浏览器访问：

```text
http://localhost:8080
```

停止服务：

```text
Ctrl + C
```

请通过 HTTP 服务访问，不建议直接双击 HTML 文件。`file://` 模式可能会阻止 GeoGebra 读取本地资源。

## 课件操作

- `↓`、`→`、空格、`PageDown`、`Enter`：下一步。
- `↑`、`←`、`PageUp`、`Backspace`：上一步。
- 右下角上下箭头按钮与键盘操作效果相同。
- 下一步会先显示当前页的后续内容，全部显示后才进入下一页。
- 上一步会先隐藏当前页最后显示的内容，再返回上一页。
- 点击左上角课程名称可返回课程首页。

## 步骤恢复

课件会使用浏览器的 `sessionStorage` 分别保存每节课的：

- 当前页码
- 当前页内已显示的步骤数量

刷新页面后会恢复到刷新前的位置。三节课的进度互不影响。

关闭对应浏览器标签页后，会话进度通常会被清除。

## 替换 GeoGebra 文件

三节课分别加载：

```text
9.2       -> assets/9.2.ggb
9.3 第1课时 -> assets/9.3.1.ggb
9.3 第2课时 -> assets/9.3.2.ggb
```

更新时直接用新的 `.ggb` 文件替换对应文件，并保持文件名不变，不需要修改 HTML 或 JavaScript。

例如，要更新“9.3 电场 电场强度（第2课时）”：

```text
用新文件替换 assets/9.3.2.ggb
```

加载 GGB 时会自动为文件地址添加缓存标识，因此正常刷新页面即可读取新版本。

如果仍显示旧内容，请检查：

1. 文件名是否完全一致，例如应为 `9.3.2.ggb`，不要写成 `9.3.22.ggb`。
2. 文件是否放在项目根目录的 `assets/` 中。
3. 是否刷新了正确的课程页面。
4. 尝试使用 `Cmd + Shift + R` 或 `Ctrl + Shift + R` 强制刷新。

## GitHub Pages

仓库推送到 GitHub 后，在仓库中依次进入：

```text
Settings -> Pages
```

将发布方式设置为：

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

如果仓库名为 `zjuzxd94.github.io`，网站地址通常为：

```text
https://zjuzxd94.github.io
```

每次更新后提交并推送：

```bash
git add .
git commit -m "Update courseware"
git push
```

GitHub Pages 会自动重新部署。
# qayzzxd.github.io
