'use strict';

(function () {
  const container = document.getElementById('terminal');
  const ptyInfo = document.getElementById('pty-info');
  const resetBtn = document.getElementById('term-reset');
  if (!container) return;

  const Terminal = window.Terminal;
  const FitCtor = (window.FitAddon && window.FitAddon.FitAddon) || window.FitAddon;
  if (!Terminal || !FitCtor) { container.textContent = 'xterm 로드 실패'; return; }

  let term, fit, ws, currentCwd = null;

  function createTerminal() {
    term = new Terminal({
      fontFamily:'Cascadia Mono, Consolas, Menlo, monospace',
      fontSize: 13, lineHeight: 1.2, cursorBlink: true, allowProposedApi: true,
      theme: { background:'#000000', foreground:'#e6edf3', cursor:'#58a6ff',
        selectionBackground:'#264f78' },
    });
    fit = new FitCtor(); term.loadAddon(fit);
    container.innerHTML = ''; term.open(container);
    requestAnimationFrame(() => { try { fit.fit(); } catch {} });
  }

  function connect(cwd) {
    if (!term) createTerminal();
    currentCwd = cwd || null;
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const { cols, rows } = term;
    const q = new URLSearchParams({ cols, rows });
    if (cwd) q.set('cwd', cwd);
    ws = new WebSocket(`${proto}//${location.host}/ws/pty?${q}`);
    ws.binaryType = 'arraybuffer';
    ptyInfo.textContent = '연결중…';
    ws.onmessage = ev => {
      let m; try { m = JSON.parse(ev.data); } catch { return; }
      if (m.type === 'data') term.write(m.data);
      else if (m.type === 'ready') ptyInfo.textContent = `pid ${m.pid} · ${m.shell.split(/[\\/]/).pop()} · ${m.cwd || ''}`;
      else if (m.type === 'exit') {
        term.write(`\r\n\x1b[33m[종료됨 · 코드 ${m.exitCode}]\x1b[0m\r\n`);
        ptyInfo.textContent = '종료됨 — ⟳ 로 재시작';
      }
      else if (m.type === 'error') term.write(`\r\n\x1b[31m${m.message}\x1b[0m\r\n`);
    };
    ws.onclose = () => { ptyInfo.textContent = '연결 끊김'; };
    term.onData(d => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type:'input', data:d }));
    });
    term.onResize(({ cols, rows }) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type:'resize', cols, rows }));
    });
  }

  function respawn(newCwd) {
    try { if (ws && ws.readyState === WebSocket.OPEN) ws.close(); } catch {}
    try { term.dispose(); } catch {}
    term = null; fit = null;
    connect(newCwd);
    setTimeout(() => { try { term.focus(); } catch {} }, 100);
  }

  function refit() { if (fit) try { fit.fit(); } catch {} }
  function sendInput(data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type:'input', data }));
      try { term.focus(); } catch {}
    }
  }

  resetBtn.addEventListener('click', () => respawn(currentCwd));
  new ResizeObserver(() => refit()).observe(container);
  window.addEventListener('resize', refit);

  window.TFGTerminal = {
    respawn,
    reset: () => respawn(currentCwd),
    refit,
    focus: () => term && term.focus(),
    sendInput,
    sendCommand: cmd => sendInput(cmd + '\r'),
    interrupt: () => sendInput('\x03'),
  };

  connect(null);
  setTimeout(() => { try { term.focus(); } catch {} }, 100);
})();
