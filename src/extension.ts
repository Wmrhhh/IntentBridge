import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand('aiAssistant.hello', () => {
    void vscode.window.showInformationMessage('Hello from AI Assistant');
  });

  context.subscriptions.push(command);
}
