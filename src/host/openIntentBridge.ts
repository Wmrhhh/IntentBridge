import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';

export function registerOpenIntentBridge(extensionUri: vscode.Uri): vscode.Disposable {
  return vscode.commands.registerCommand('intentBridge.open', async () => {
    // 从插件目录读取，不依赖用户当前打开的工作区。
    const webviewRoot = vscode.Uri.joinPath(extensionUri, 'webview');
    const htmlUri = vscode.Uri.joinPath(webviewRoot, 'index.html');
    let html: string;
    try {
      const bytes = await vscode.workspace.fs.readFile(htmlUri);
      html = Buffer.from(bytes).toString('utf-8');
    } catch {
      void vscode.window.showErrorMessage('Unable to load IntentBridge webview.');
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'intentBridge',
      'IntentBridge',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [webviewRoot]
      }
    );
    const receiver = panel.webview.onDidReceiveMessage((message: unknown) => {
      if (typeof message === 'object' && message !== null &&
          'type' in message && message.type === 'PING') {
        void vscode.window.showInformationMessage('Message received');
      }
    });
    panel.onDidDispose(() => receiver.dispose());

    const scriptUri = panel.webview.asWebviewUri(
      vscode.Uri.joinPath(webviewRoot, 'main.js')
    );
    const nonce = randomBytes(16).toString('hex');
    panel.webview.html = html
      .replace(/\{\{nonce\}\}/g, nonce)
      .replace('{{scriptUri}}', scriptUri.toString());
  });
}
