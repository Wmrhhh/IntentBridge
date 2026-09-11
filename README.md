# IntentBridge

IntentBridge 的长期方向是通过自然语言导航和操作 VS Code。当前阶段仅验证 Webview 向 Extension Host 发送 PING 消息。

## 运行和验证

需要 VS Code 1.74 或更新版本，以及 Node.js 和 npm。

1. 在 VS Code 中打开项目根目录。
2. 首次运行 `npm ci` 安装依赖。
3. 运行 `npm run compile` 检查 TypeScript 编译。
4. 按 **F5**，使用 **Run Extension** 配置打开 Extension Development Host，启动前会自动编译。
5. 在新窗口按 **Ctrl+Shift+P**，执行 **IntentBridge: Open**。
6. 确认打开标题为 **IntentBridge** 的面板，依次显示 **IntentBridge**、**AI assistant for VS Code** 和 **Hello World**。
7. 点击 **Send Test Message**，确认 VS Code 显示 **Message received** 通知。

每次执行命令都会创建新面板，可以直接关闭标签页。修改代码后停止调试并重新按 F5。编译检查不能代替界面验收。

## 文件职责

| 文件 | 职责 |
| --- | --- |
| `package.json` | 插件清单、命令声明、编译脚本和开发依赖 |
| `package-lock.json` | 锁定依赖版本 |
| `src/extension.ts` | 激活插件并注册 Host 模块 |
| `src/host/openIntentBridge.ts` | 注册命令、读取 HTML、创建面板并设置安全选项 |
| `webview/index.html` | 在 Webview 浏览器环境中渲染的静态页面 |
| `webview/main.js` | 获取 Webview API，点击按钮时发送 PING |
| `tsconfig.json` | TypeScript 严格检查、CommonJS 输出和调试源映射 |
| `.vscode/launch.json` | 启动开发宿主并加载当前插件 |
| `.vscode/tasks.json` | 调试前的编译任务 |
| `.gitignore` | 忽略依赖和编译产物 |

编译生成 `out/extension.js`，对应清单中的 `main`。插件由 Extension Host 加载，不能用普通 Node.js 直接运行，因为 `vscode` 模块由宿主提供。

## 命令与 Webview

清单和 `registerCommand()` 都使用 `intentBridge.open`。面板类型标识 `intentBridge` 是独立概念，无需与命令 ID 相同。

首次执行命令时，VS Code 调用 `activate()` 注册处理函数，再执行它。VS Code 1.74 起，清单声明的命令会自动触发激活，无需显式配置 `activationEvents`。注册对象加入 `context.subscriptions`，供宿主停用插件时清理。

`createWebviewPanel()` 的四个主要参数：

| 参数 | 当前值 | 含义 |
| --- | --- | --- |
| `viewType` | `'intentBridge'` | 面板类型的内部标识 |
| `title` | `'IntentBridge'` | 标签页显示的标题 |
| `showOptions` | `vscode.ViewColumn.One` | 在第一个编辑器列显示，也支持包含列和焦点选项的对象 |
| `options` | `{ enableScripts: true, localResourceRoots: [webviewRoot] }` | 启用脚本，本地资源仅允许插件的 `webview/` 目录 |

`panel.webview.html` 接收 HTML 字符串。Host 通过 `context.extensionUri` 定位插件内的 `webview/index.html`，用 `workspace.fs.readFile()` 读取并解码为 UTF-8 字符串。HTML 保留在插件根目录的 `webview/` 中，无需复制到 `out/`，现有 F5 配置仍然适用。读取失败时显示错误，不创建空白面板。

Host 为每个面板生成随机 nonce，并替换 HTML 中的 nonce 和脚本地址占位符。CSP 默认禁止资源加载，仅允许带有该 nonce 的脚本执行，没有开放内联事件处理器或任意脚本执行权限。

Webview 是隔离的浏览器环境，不能直接把普通磁盘路径或 `file:` URI 用作资源地址。Host 使用 `panel.webview.asWebviewUri()` 将 `webview/main.js` 的 URI 转成页面可加载的地址。该转换不会绕过 `localResourceRoots` 和 CSP 限制。

这次拆分按运行环境划分：`src/` 中的模块在 Extension Host 执行，可以使用 `vscode` 和 Node.js API；`webview/` 中的页面由浏览器渲染，不拥有 Host 的权限。文件夹名称本身不会创建隔离，真正的边界由 VS Code 的运行机制建立。

本项目在桌面本地调试时，插件逻辑运行在独立的 Node.js Extension Host 进程中；Webview 页面运行在 VS Code 窗口内隔离的浏览器上下文中。两者不是同一个 JavaScript 环境，Webview 无法导入宿主的 `vscode` 模块或直接调用完整 VS Code Extension API。

## 消息通信

1. `acquireVsCodeApi()`：在 Webview 内获取 VS Code 注入的有限 API 对象，每个页面只调用一次，保存在局部作用域中。它不是完整的 Extension API。
2. `vscode.postMessage({ type: 'PING' })`：Webview 点击按钮时向 Host 发送可序列化消息。
3. `panel.webview.onDidReceiveMessage()`：Host 注册接收回调，检查收到的是非空对象且 `type` 为 `PING`，然后调用 `vscode.window.showInformationMessage('Message received')`。其他消息被忽略，面板关闭时释放监听器。

当前没有 Host 回复消息、主题操作或其他命令执行能力。

参考：[官方 Webview 指南](https://code.visualstudio.com/api/extension-guides/webview)。

当前不包含 React、LLM、Python、主题修改或额外架构。
