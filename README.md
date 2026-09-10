# IntentBridge

IntentBridge 的长期方向是通过自然语言导航和操作 VS Code。当前阶段只实现显示静态文字的最小 Webview。

## 运行和验证

需要 VS Code 1.74 或更新版本，以及 Node.js 和 npm。

1. 在 VS Code 中打开项目根目录。
2. 首次运行 `npm ci` 安装依赖。
3. 运行 `npm run compile` 检查 TypeScript 编译。
4. 按 **F5**，使用 **Run Extension** 配置打开 Extension Development Host，启动前会自动编译。
5. 在新窗口按 **Ctrl+Shift+P**，执行 **IntentBridge: Open**。
6. 确认打开标题为 **IntentBridge** 的面板，依次显示 **IntentBridge**、**AI assistant for VS Code** 和 **Hello World**。

每次执行命令都会创建新面板，可以直接关闭标签页。修改代码后停止调试并重新按 F5。编译检查不能代替界面验收。

## 文件职责

| 文件 | 职责 |
| --- | --- |
| `package.json` | 插件清单、命令声明、编译脚本和开发依赖 |
| `package-lock.json` | 锁定依赖版本 |
| `src/extension.ts` | 激活插件、注册命令、创建面板并设置 HTML |
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
| `options` | `{}` | 面板和 Webview 配置；使用默认值，脚本默认禁用 |

`panel.webview.html` 接收 HTML 字符串，因为 Webview 使用浏览器环境渲染网页文档。当前用 TypeScript 模板字符串提供完整 HTML，无需额外 HTML 文件或前端构建工具。

本项目在桌面本地调试时，插件逻辑运行在独立的 Node.js Extension Host 进程中；Webview 页面运行在 VS Code 窗口内隔离的浏览器上下文中。两者不是同一个 JavaScript 环境，Webview 无法导入宿主的 `vscode` 模块或直接调用完整 VS Code Extension API。后续如需交互，可以通过消息通信让 Extension Host 代为执行操作；当前没有实现消息通信。

参考：[官方 Webview 指南](https://code.visualstudio.com/api/extension-guides/webview)。

当前不包含 React、LLM、Python、主题修改或额外架构。
