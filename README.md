# 完全离线 HTML 互动课件示例

这是一个 3 页静态 HTML 互动课件示例。它不依赖构建工具，页面主体可以离线运行；GeoGebra 通过本地离线运行库加载 `.ggb` 文件，适合课堂投影、翻页笔演示和带 2D/3D 视图的动态数学展示。

## 技术栈

- HTML：课件页面结构，所有幻灯片都写在 `index.html` 中。
- CSS：响应式布局、页面视觉样式、进入动画和 GeoGebra 容器尺寸控制，见 `styles.css`。
- JavaScript：翻页、页内逐步显示、小测反馈、GeoGebra 离线加载逻辑，见 `script.js`。
- GeoGebra Offline HTML5：本地 `GeoGebra/deployggb.js` 和 `GeoGebra/HTML5/5.0/web3d/`。
- 本地静态服务器：推荐使用 Python 自带的 `http.server`，不需要联网。

## 文件结构

```text
.
├── index.html              # 3 页课件内容和控制按钮
├── styles.css              # 课件视觉、动画、响应式布局
├── script.js               # 翻页、交互、GeoGebra 加载
├── assets/
│   └── demo.ggb            # 默认 GeoGebra 文件，可替换
└── GeoGebra/
    ├── deployggb.js        # GeoGebra 嵌入入口
    └── HTML5/5.0/web3d/    # 支持 3D 的离线运行库
```

## 使用方式

在本目录运行：

```bash
python3 -m http.server 8080
```

然后在浏览器打开：

```text
http://localhost:8080
```

推荐用本地服务器打开，而不是直接双击 `index.html`。双击时前两页通常可以浏览，但浏览器可能限制本地 GeoGebra 资源加载，导致第 3 页不可用。

## 操作逻辑

- `↓`、`→`、空格、`PageDown`、`Enter`：下一步。
- `↑`、`←`、`PageUp`、`Backspace`：上一步。
- “下一步”会先推进当前页内部的逐步显示内容。
- 当前页内容全部显示后，再按下一步才会进入下一页。
- “上一步”会先回退当前页内部内容。
- 当前页已经回到初始状态时，再按上一步才会返回上一页。
- 右下角两个悬浮按钮与键盘上下键逻辑一致，分别是上一步和下一步。

这个逻辑适合翻页笔：如果翻页笔发出下键或 PageDown，就可以同时控制页内动画和页面切换。

## 当前 3 页内容

- 第 1 页：课程标题、学习目标、导入问题。
- 第 2 页：概念讲解、卡片高亮、小测反馈。
- 第 3 页：GeoGebra Classic 多视图演示，加载 `assets/demo.ggb`。

内容都在 `index.html` 中，可以直接修改每个 `<article class="slide">` 的文字和结构。

## GeoGebra 加载逻辑

第 3 页使用本地 GeoGebra HTML5 运行库，不依赖在线脚本：

```text
GeoGebra/deployggb.js
GeoGebra/HTML5/5.0/web3d/
```

页面加载后会先预加载 `deployggb.js`。真正进入第 3 页时，脚本会读取当前可见容器的宽高，再创建 GeoGebra applet，避免在隐藏页面里初始化导致尺寸异常。

当前 GeoGebra 参数在 `script.js` 中：

```js
appName: "classic",
perspective: "GT",
filename: "assets/demo.ggb"
```

其中：

- `classic`：使用 GeoGebra Classic 多视图模式。
- `G`：2D Graphics 视图。
- `T`：3D Graphics 视图。
- `GT`：请求同时显示 2D 和 3D 视图。

代码还显式启用了 3D 运行库：

```js
const views = {
  is3D: true,
  ...
};
```

## 替换 `.ggb` 文件

把你的 GeoGebra 文件放到：

```text
assets/demo.ggb
```

正式上课时，直接用你的同名文件替换当前示例文件即可。

如果要改文件名，请同步修改 `script.js` 中的：

```js
filename: "assets/demo.ggb"
```

如果替换后视图没有按预期显示，请先在 GeoGebra 里保存文件时确认 2D 和 3D 视图已经打开，再重新导出或保存 `.ggb`。

## 响应式布局

课件使用 `100dvh` 贴合浏览器可见高度，避免内容超出投影窗口。第 3 页会压缩标题区，把主要空间留给 GeoGebra；在较矮窗口中，说明文字会隐藏，让 2D/3D 视图尽量完整显示。

GeoGebra applet 的宽高由 `.ggb-stage` 的实际尺寸决定，因此调整浏览器窗口大小后，刷新页面可以得到更合适的 applet 尺寸。

## 常见问题

### 第 3 页显示“GeoGebra 暂未加载”

先确认是通过本地服务器打开的：

```text
http://localhost:8080
```

再确认这些文件存在：

```text
GeoGebra/deployggb.js
GeoGebra/HTML5/5.0/web3d/
assets/demo.ggb
```

如果刚修改过代码或替换过 `.ggb`，请强制刷新浏览器：`Cmd + Shift + R`。

### 3D 视图没有显示

确认 `script.js` 中仍是：

```js
appName: "classic",
perspective: "GT"
```

同时确认你的 `.ggb` 文件保存时已经打开 3D Graphics 视图。有些 `.ggb` 文件虽然包含 3D 对象，但保存布局时没有显示 3D 视图，嵌入后也可能不会自动展开。

### 想改成纯 3D 模式

可以把 `script.js` 里的参数改成：

```js
appName: "3d"
```

纯 3D 模式更适合只展示 3D 内容，但不适合同时显示 2D 和 3D。
