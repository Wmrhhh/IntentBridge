# IntentBridge

IntentBridge 的长期方向是通过自然语言导航和操作 VS Code。当前只完成最小 TypeScript 插件骨架，还不是完整 AI 应用。

当前唯一功能：在 Command Palette 执行 **AI Assistant: Hello**，通过 VS Code API 显示 **Hello from AI Assistant**。

## 运行

需要 VS Code 1.74 或更新版本，以及 Node.js 和 npm。本阶段已在 Node.js 22.14.0、npm 10.9.2 下编译通过。

1. 在 VS Code 中打开项目根目录。
2. 在终端运行 `npm ci`，安装锁定版本的开发依赖。
3. 运行 `npm run compile`，确认编译成功。
4. 按 **F5**，使用 **Run Extension** 配置，打开 Extension Development Host 窗口。调试配置也会在启动前自动编译。
5. 在新窗口按 **Ctrl+Shift+P**，搜索并执行 **AI Assistant: Hello**。
6. 确认出现通知 **Hello from AI Assistant**。

修改 TypeScript 后，停止调试并重新按 F5，即可重新编译并加载修改。无需直接运行生成的 JavaScript：`vscode` 模块由 Extension Host 提供，普通 Node.js 进程不能运行插件入口。

## 文件职责

| 文件 | 职责 |
| --- | --- |
| `package.json` | 插件清单、命令声明、编译脚本和开发依赖 |
| `package-lock.json` | 锁定依赖版本，供 `npm ci` 使用 |
| `src/extension.ts` | 插件激活入口与 Hello 命令实现 |
| `tsconfig.json` | TypeScript 严格检查、CommonJS 输出与调试源映射配置 |
| `.vscode/launch.json` | 启动 Extension Development Host，加载当前项目 |
| `.vscode/tasks.json` | 定义调试前运行的编译任务，并显示 TypeScript 错误 |
| `.gitignore` | 忽略 `node_modules/` 和 `out/` |

编译输出为 `out/extension.js`，与清单中的 `main` 对应。`out/extension.js.map` 用于将调试位置映射回 TypeScript 源代码。

## 命令如何执行

1. VS Code 读取 `package.json` 的 `contributes.commands`，在命令面板显示标题 `AI Assistant: Hello`。
2. 用户首次执行该命令，VS Code 加载 `main` 指定的入口并调用 `activate(context)`。
3. `registerCommand('aiAssistant.hello', handler)` 将同名命令 ID 绑定到处理函数。
4. 处理函数调用 `vscode.window.showInformationMessage('Hello from AI Assistant')`。

清单的 `command` 和 `registerCommand()` 的第一个参数必须完全一致；`title` 只是用户看到的文字。当前宿主会话中，后续调用直接执行处理函数，不会每次重新调用 `activate()`。

注册命令返回一个可释放对象，将它加入 `context.subscriptions` 后，VS Code 会在插件停用时清理注册。当前无需额外的 `deactivate()` 函数。

`displayName`、`engines.vscode` 和 `contributes` 是 VS Code 插件清单相关字段；`main` 是通用包字段，在这里作为插件入口。VS Code 1.74 起，声明的命令可以自动触发激活，因此当前无需显式配置 `activationEvents`。参见 [VS Code 官方插件结构说明](https://code.visualstudio.com/api/get-started/extension-anatomy)。

## 验证与边界

- `npm run compile` 验证类型检查和 JavaScript 输出。
- 上面的 F5 操作验证真实宿主中的命令发现、激活和通知显示。编译通过不能代替这一步。
- 可以在 `activate()` 和命令处理函数处设置断点，观察首次执行和再次执行的区别。

本阶段没有 React、Webview、LLM、Python 或主题修改能力，也没有额外的架构抽象。后续阶段以明确的当前任务为准，每个阶段保持可运行；重大架构变更先讨论原因和替代方案。
