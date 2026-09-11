// 每个页面只获取一次，并保持在局部作用域中。
(() => {
  const vscode = acquireVsCodeApi();
  const button = document.getElementById('send-test-message');

  button.addEventListener('click', () => {
    vscode.postMessage({ type: 'PING' });
  });
})();
