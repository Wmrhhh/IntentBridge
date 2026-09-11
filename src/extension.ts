import * as vscode from 'vscode';
import { registerOpenIntentBridge } from './host/openIntentBridge';

// 插件激活时注册模块，具体命令实现由 Host 模块负责。
export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(registerOpenIntentBridge(context.extensionUri));
}
