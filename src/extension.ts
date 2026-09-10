import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand('intentBridge.open', () => {
    const panel = vscode.window.createWebviewPanel(
      'intentBridge',
      'IntentBridge',
      vscode.ViewColumn.One,
      {}
    );

    panel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IntentBridge</title>
</head>
<body>
  <h1>IntentBridge</h1>
  <p>AI assistant for VS Code</p>
  <p>Hello World</p>
</body>
</html>`;
  });

  context.subscriptions.push(command);
}
