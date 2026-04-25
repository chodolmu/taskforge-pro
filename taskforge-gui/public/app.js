'use strict';

const $conn = document.getElementById('conn');

// --- SSE ---
function connect() {
  const ev = new EventSource('/api/events');
  ev.onopen = () => { $conn.textContent = '● 연결됨'; $conn.className = 'conn ok'; };
  ev.onmessage = m => { try { window.render(JSON.parse(m.data)); } catch(e){ console.error(e); } };
  ev.addEventListener('action', e => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.kind === 'retry' && window.TFGTerminal)
        window.TFGTerminal.sendCommand(`/taskforge-execute ${msg.taskId} 다시 시도`);
      else if (msg.kind === 'new-project' && window.TFGTerminal) {
        // Respawn PTY in the new folder, then auto-launch claude + vision flow
        window.TFGTerminal.respawn(msg.projectRoot);
        setTimeout(() => {
          window.TFGTerminal.sendCommand('claude');
          setTimeout(() => window.TFGTerminal.sendCommand('/taskforge-vision'), 800);
        }, 600);
      }
    } catch {}
  });
  ev.onerror = () => { $conn.textContent = '● 재연결…'; $conn.className = 'conn err'; };
}
connect();

// --- Onboarding ---
(function setupOnboard() {
  const onboard = document.getElementById('onboard');

  document.getElementById('ob-open').addEventListener('click', () => {
    onboard.classList.add('hidden');
    document.getElementById('add-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('add-path').focus(), 50);
  });

  document.getElementById('ob-new').addEventListener('click', () => {
    onboard.classList.add('hidden');
    const m = document.getElementById('new-modal');
    document.getElementById('new-path').value = '';
    document.getElementById('new-name').value = '';
    document.getElementById('new-error').classList.add('hidden');
    m.classList.remove('hidden');
    setTimeout(() => document.getElementById('new-path').focus(), 50);
  });

  // New-project modal submit
  const newModal = document.getElementById('new-modal');
  const newPath = document.getElementById('new-path');
  const newName = document.getElementById('new-name');
  const newErr = document.getElementById('new-error');
  const newCancel = document.getElementById('new-cancel');
  const newSubmit = document.getElementById('new-submit');

  newCancel.addEventListener('click', () => {
    newModal.classList.add('hidden');
    // If user cancels and still has no projects, re-show onboard
    if (!document.querySelectorAll('.picker-row').length) onboard.classList.remove('hidden');
  });
  newModal.addEventListener('click', e => { if (e.target === newModal) newCancel.click(); });

  async function submitNew() {
    const p = newPath.value.trim();
    if (!p) { newErr.textContent = '경로를 입력하세요'; newErr.classList.remove('hidden'); return; }
    newSubmit.disabled = true; newSubmit.textContent = '만드는 중…';
    try {
      const res = await fetch('/api/projects/new', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: p, name: newName.value.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { newErr.textContent = data.error || 'error'; newErr.classList.remove('hidden'); return; }
      newModal.classList.add('hidden');
      // Terminal respawn + /taskforge-vision 자동 주입은 SSE 'action' 핸들러가 처리
    } catch (e) {
      newErr.textContent = String(e); newErr.classList.remove('hidden');
    } finally {
      newSubmit.disabled = false; newSubmit.textContent = '만들기';
    }
  }
  newSubmit.addEventListener('click', submitNew);
  newPath.addEventListener('keydown', e => { if (e.key === 'Enter') submitNew(); });
  newName.addEventListener('keydown', e => { if (e.key === 'Enter') submitNew(); });
})();

// --- Project picker + add modal + switch confirm ---
(function setupPicker() {
  const btn = document.getElementById('picker-btn');
  const menu = document.getElementById('picker-menu');
  const list = document.getElementById('picker-list');
  const addBtn = document.getElementById('picker-add');
  const modal = document.getElementById('add-modal');
  const addPath = document.getElementById('add-path');
  const addName = document.getElementById('add-name');
  const addErr = document.getElementById('add-error');
  const addCancel = document.getElementById('add-cancel');
  const addSubmit = document.getElementById('add-submit');

  const switchModal = document.getElementById('switch-modal');
  const switchKeep = document.getElementById('switch-keep');
  const switchRespawn = document.getElementById('switch-respawn');
  const pickModal = document.getElementById('pick-modal');
  const pickList = document.getElementById('pick-list');
  const pickCancel = document.getElementById('pick-cancel');
  let pendingSwitchProject = null;
  let pendingPickRoot = null;
  let pendingPickName = null;

  btn.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('hidden'); });
  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) menu.classList.add('hidden');
  });

  addBtn.addEventListener('click', () => {
    menu.classList.add('hidden');
    addPath.value=''; addName.value=''; addErr.classList.add('hidden'); addErr.textContent='';
    modal.classList.remove('hidden');
    setTimeout(() => addPath.focus(), 50);
  });
  addCancel.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

  async function submitAdd() {
    const p = addPath.value.trim();
    if (!p) { addErr.textContent='경로를 입력하세요'; addErr.classList.remove('hidden'); return; }
    addSubmit.disabled = true; addSubmit.textContent = '추가 중…';
    try {
      const res = await fetch('/api/projects', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ path: p, name: addName.value.trim() || undefined }),
      });
      const data = await res.json();
      if (res.status === 300 && data.candidates) {
        // Multiple projects found — show pick modal
        modal.classList.add('hidden');
        pendingPickRoot = data.projectRoot;
        pendingPickName = addName.value.trim() || undefined;
        showPickModal(data.candidates);
        return;
      }
      if (!res.ok) { addErr.textContent = data.error || 'error'; addErr.classList.remove('hidden'); return; }
      modal.classList.add('hidden');
      if (data.project?.projectRoot && window.TFGTerminal) {
        window.TFGTerminal.respawn(data.project.projectRoot);
      }
    } catch (e) { addErr.textContent = String(e); addErr.classList.remove('hidden'); }
    finally { addSubmit.disabled = false; addSubmit.textContent = '추가'; }
  }
  addSubmit.addEventListener('click', submitAdd);
  addPath.addEventListener('keydown', e => { if (e.key === 'Enter') submitAdd(); });
  addName.addEventListener('keydown', e => { if (e.key === 'Enter') submitAdd(); });

  function showPickModal(candidates) {
    pickList.innerHTML = candidates.map(c => `
      <button class="pick-item" data-project-id="${escapeHtml(c.projectId)}">
        <div class="pick-item-name">${escapeHtml(c.displayName)}</div>
        <div class="pick-item-path">${escapeHtml(c.workspacePath)}</div>
      </button>`).join('');
    pickList.querySelectorAll('.pick-item').forEach(btn => {
      btn.addEventListener('click', async () => {
        pickModal.classList.add('hidden');
        const pid = btn.dataset.projectId;
        const res = await fetch('/api/projects', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ path: pendingPickRoot, projectId: pid, name: pendingPickName }),
        });
        const data = await res.json();
        if (data.project?.projectRoot && window.TFGTerminal) {
          window.TFGTerminal.respawn(data.project.projectRoot);
        }
      });
    });
    pickModal.classList.remove('hidden');
  }
  pickCancel.addEventListener('click', () => pickModal.classList.add('hidden'));
  pickModal.addEventListener('click', e => { if (e.target === pickModal) pickModal.classList.add('hidden'); });

  switchKeep.addEventListener('click', () => { switchModal.classList.add('hidden'); pendingSwitchProject = null; });
  switchRespawn.addEventListener('click', () => {
    switchModal.classList.add('hidden');
    if (pendingSwitchProject && window.TFGTerminal) window.TFGTerminal.respawn(pendingSwitchProject.projectRoot);
    pendingSwitchProject = null;
  });

  window.TFGPicker = {
    renderList(projects, currentId) {
      list.innerHTML = '';
      if (!projects.length) { list.innerHTML = '<div class="picker-empty">프로젝트 없음</div>'; return; }
      for (const p of projects) {
        const row = document.createElement('div');
        row.className = 'picker-row' + (p.id === currentId ? ' active' : '');
        row.innerHTML = `
          <div class="picker-row-main">
            <div class="picker-row-name">${escapeHtml(p.name)}</div>
            <div class="picker-row-path">${escapeHtml(p.workspacePath || p.projectRoot || '')}</div>
          </div>
          <button class="picker-row-del" title="목록에서 제거">×</button>`;
        row.querySelector('.picker-row-main').addEventListener('click', async () => {
          if (p.id === currentId) { menu.classList.add('hidden'); return; }
          const res = await fetch('/api/workspace/switch', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ id: p.id }),
          });
          const data = await res.json();
          menu.classList.add('hidden');
          if (data.terminalBusy) {
            pendingSwitchProject = data.project;
            switchModal.classList.remove('hidden');
          } else if (data.project?.projectRoot && window.TFGTerminal) {
            window.TFGTerminal.respawn(data.project.projectRoot);
          }
        });
        row.querySelector('.picker-row-del').addEventListener('click', async e => {
          e.stopPropagation();
          if (!confirm(`"${p.name}" 을(를) 목록에서 제거할까요? (폴더는 유지됨)`)) return;
          await fetch(`/api/projects/${p.id}`, { method:'DELETE' });
        });
        list.appendChild(row);
      }
    },
    setLabel(name) { document.getElementById('picker-label').textContent = name || '—'; },
  };
  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g,
      c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
})();

// --- action bar ---
(function setupActionBar() {
  const bar = document.querySelector('.action-bar');
  bar.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action], button[data-cmd]');
    if (!btn || !window.TFGTerminal) return;
    const action = btn.dataset.action, cmd = btn.dataset.cmd;
    if (action === 'claude') window.TFGTerminal.sendCommand('claude');
    else if (action === 'interrupt') window.TFGTerminal.interrupt();
    else if (cmd) window.TFGTerminal.sendCommand(cmd);
  });
})();

// --- splitter ---
(function setupSplitter() {
  const gutter = document.getElementById('gutter');
  const split = document.getElementById('split');
  const termPane = document.querySelector('.terminal-pane');
  if (!gutter || !split || !termPane) return;
  let dragging = false;
  const saved = parseInt(localStorage.getItem('tfg.termWidth'), 10);
  if (!isNaN(saved) && saved >= 360 && saved <= window.innerWidth - 360)
    termPane.style.flexBasis = `${saved}px`;
  gutter.addEventListener('mousedown', e => {
    dragging = true; gutter.classList.add('dragging');
    document.body.style.userSelect='none'; document.body.style.cursor='col-resize'; e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const rect = split.getBoundingClientRect();
    let w = e.clientX - rect.left;
    const min = 360, max = rect.width - 360;
    if (w < min) w = min; if (w > max) w = max;
    termPane.style.flexBasis = `${w}px`;
    if (window.TFGTerminal) window.TFGTerminal.refit();
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return; dragging = false;
    gutter.classList.remove('dragging');
    document.body.style.userSelect=''; document.body.style.cursor='';
    const px = parseInt(termPane.style.flexBasis, 10);
    if (!isNaN(px)) localStorage.setItem('tfg.termWidth', String(px));
  });
})();

// --- guide modal ---
(function setupGuide() {
  const modal = document.getElementById('guide-modal');
  const openBtn = document.getElementById('guide-btn');
  const closeBtn = document.getElementById('guide-close');
  const tabs = modal.querySelectorAll('.guide-tab');
  const bodies = modal.querySelectorAll('.guide-tab-body');

  openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      bodies.forEach(b => b.classList.remove('active'));
      tab.classList.add('active');
      modal.querySelector(`.guide-tab-body[data-body="${tab.dataset.tab}"]`).classList.add('active');
    });
  });

  // Escape to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) modal.classList.add('hidden');
  });
})();

// --- keyboard shortcuts ---
document.addEventListener('keydown', e => {
  // Ctrl+P → open picker
  if (e.ctrlKey && e.key.toLowerCase() === 'p') {
    e.preventDefault();
    document.getElementById('picker-menu').classList.remove('hidden');
  }
  // Ctrl+Enter → send 'claude' (only if not focused in inputs)
  if (e.ctrlKey && e.key === 'Enter' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    if (window.TFGTerminal) window.TFGTerminal.sendCommand('claude');
  }
});
