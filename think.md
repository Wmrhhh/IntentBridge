# 总模型
```text
  VS Code
  |
  ├─ package.json
  |    └─ 声明：这个插件是谁、入口在哪、提供哪些命令
  |
  ├─ Extension Host
  |    └─ 运行 extension.ts 编译后的 JavaScript
  |         └─可以调用 VS Code API
  |
  └─ Webview
       └─ VS Code 里的一个隔离网页
            └─负责 HTML / CSS / JavaScript / 以后 React UI
```

- 错略类比
Weview  =  前端
Extension Host  =  插件内部“后端”
VS Code API  =  系统能力接口

# package.json 的作用
   1. 在普通前端项目中
      - 依赖
      - script
      - 项目信息
   2. 在VS Code Extension 中
     Extension Manifest（插件清单）告诉VS Code
      - 插件叫什么
      - 支持哪个 VS Code 版本
      - 代码入口在哪
      - 向编辑器提供什么命令
      - 未来有哪些 页面 菜单 设置等

```json
package.json内
{ 
// VS Code 去哪里加载插件代码
"main": "./out/extension.js",
     // 插件向 VS Code 贡献了什么能力
  "contributes": {
    "commands": [
      {
          // 程序内部使用的 **Command ID**。
        "command": "intentBridge.open",
          // 用户在 Command Palette 里看到的文字。
        "title": "IntentBridge: Open"
      }
    ]
  },
}
```