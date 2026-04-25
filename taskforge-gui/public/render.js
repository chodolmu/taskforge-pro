'use strict';

const $ = (id) => document.getElementById(id);
const STATUS_ICON = { completed:'✓', running:'◐', failed:'✗', waiting:'○' };

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g,
    c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function fmtDuration(ms) {
  if (!ms || ms < 0) return '—';
  const s = Math.floor(ms/1000);
  if (s < 60) return `${s}초`;
  const m = Math.floor(s/60), r = s%60;
  return r ? `${m}분 ${r}초` : `${m}분`;
}
function fmtCost(n) { return n == null ? '—' : `$${n.toFixed(3)}`; }
function fmtDate(iso) { if (!iso) return '—'; return new Date(iso).toLocaleString('ko-KR', { hour12:false }); }
function elapsedSince(iso) { return iso ? Date.now() - new Date(iso).getTime() : 0; }
const t = (k) => window.TFGi18n?.[k] || k;
const tStatus = (s) => window.TFGi18n?.status?.[s] || s;
const tModel = (m) => window.TFGi18n?.model?.[m] || m;

// Hero: vision-centric (v2.1 field names)
function renderHero(state) {
  const { vision, spec, plan, exec, project, roadmap } = state;
  $('project-name').textContent = vision?.projectName || spec?.projectName || project?.name || '(정의 없음)';
  $('project-vision').textContent = vision?.elevator || spec?.description || '';
  $('project-meta').textContent = vision?.createdAt ? `시작: ${fmtDate(vision.createdAt)}` : '';

  const active = findActiveMilestone(plan, roadmap, exec);
  let total = 0, done = 0, running = 0, failed = 0;
  for (const s of active?.sprints || []) for (const task of s.tasks || []) {
    total++;
    const st = exec?.tasks?.[task.id]?.status || 'waiting';
    if (st === 'completed') done++;
    else if (st === 'running') running++;
    else if (st === 'failed') failed++;
  }
  const pct = total ? Math.round((done/total)*100) : 0;
  $('progress-pct').textContent = `${pct}%`;
  $('progress-sub').textContent = `${done}/${total} ${t('task')}`;

  $('current-milestone').textContent = active?.title || '—';
  $('current-sub').textContent = active ? `${active.sprints?.length || 0}개 ${t('sprint')}` : '대기 중';

  const cost = exec?.cost || { total: 0 };
  $('cost-total').textContent = fmtCost(cost.total);
  $('cost-breakdown').textContent =
    `${tModel('haiku')} ${fmtCost(cost.haiku||0)} · ${tModel('sonnet')} ${fmtCost(cost.sonnet||0)} · ${tModel('opus')} ${fmtCost(cost.opus||0)}`;

  $('status-label').textContent = tStatus(exec?.status) || '—';
  const bits = [];
  if (running) bits.push(`${running} ${tStatus('running')}`);
  if (failed) bits.push(`${failed} ${tStatus('failed')}`);
  $('status-sub').textContent = bits.length ? bits.join(' · ') : '정상';

  // Guardrail alert rollup (v2.1: from telemetry)
  const gr = collectGuardrailHits(state);
  if (gr.length) {
    const uniqTasks = new Set(gr.map(h => h.taskId)).size;
    $('guardrail-alert').classList.remove('hidden');
    $('guardrail-alert').textContent = `작업이 예상보다 복잡해요 — ${uniqTasks}개 작업이 한도에 닿았어요.`;
  } else {
    $('guardrail-alert').classList.add('hidden');
  }
}

// v2.1: Guardrail hits come from state.guardrailHits (keyed by taskId), populated from telemetry
function collectGuardrailHits(state) {
  const hits = [];
  for (const [taskId, events] of Object.entries(state?.guardrailHits || {})) {
    for (const e of events) hits.push({ taskId, ...e });
  }
  return hits;
}

// v2.1: roadmap has no currentMilestoneId. Active = milestones[].status === 'active'.
function findActiveMilestone(plan, roadmap, exec) {
  const activeFromRoadmap = (roadmap?.milestones || []).find(m => m.status === 'active');
  if (activeFromRoadmap && plan?.milestones) {
    const m = plan.milestones.find(m => m.id === activeFromRoadmap.id);
    if (m) return m;
    return { id: activeFromRoadmap.id, title: activeFromRoadmap.title, sprints: [] };
  }
  // Fallback: first uncompleted milestone in plan
  for (const m of plan?.milestones || []) {
    let allDone = true;
    for (const s of m.sprints || []) for (const task of s.tasks || []) {
      if ((exec?.tasks?.[task.id]?.status || 'waiting') !== 'completed') { allDone = false; break; }
    }
    if (!allDone) return m;
  }
  return plan?.milestones?.[0] || null;
}

// Roadmap strip (v2.1: detail/confidence/openQuestions)
function renderRoadmap(state) {
  const { roadmap, plan, exec } = state;
  const $list = $('roadmap-list');
  const milestones = roadmap?.milestones || plan?.milestones || [];
  if (!milestones.length) {
    $list.innerHTML = `<div class="picker-empty">로드맵이 아직 없어요. "비전" 버튼으로 시작해 보세요.</div>`;
    return;
  }
  const activeId = findActiveMilestone(plan, roadmap, exec)?.id;
  $list.innerHTML = milestones.slice(0, 6).map(m => {
    const isActive = m.status === 'active' || m.id === activeId;
    const isDone = m.status === 'completed';
    const cls = isActive ? 'active' : (isDone ? 'done' : '');
    const label = tStatus(m.status) || tStatus('waiting');
    const detailBadge = m.detail ? ` · ${tDetail(m.detail)}` : '';
    const confBadge = m.confidence && m.confidence !== 'high' ? ` · 확신 ${tConfidence(m.confidence)}` : '';
    const openQ = (m.openQuestions?.length || 0) > 0 ? ` · 질문 ${m.openQuestions.length}` : '';
    const purpose = m.purpose ? `<div class="roadmap-card-purpose">${escapeHtml(m.purpose)}</div>` : '';
    return `
      <div class="roadmap-card ${cls}" data-m-id="${m.id}">
        <div class="roadmap-card-title">${escapeHtml(m.title || m.id)}</div>
        <div class="roadmap-card-status">${label}${detailBadge}${confBadge}${openQ}</div>
        ${purpose}
      </div>
    `;
  }).join('');
}
const tDetail = (d) => ({ 'name-only':'이름만', 'sketch':'스케치', 'full':'상세' }[d] || d);
const tConfidence = (c) => ({ high:'높음', medium:'보통', low:'낮음' }[c] || c);

// Current-milestone tree
function renderTree(state) {
  const { plan, exec, roadmap, guardrailHits = {}, silentErrors = {} } = state;
  const m = findActiveMilestone(plan, roadmap, exec);
  const $tree = $('tree');
  if (!m) {
    $tree.innerHTML = `<div style="color:var(--muted);padding:20px;">계획이 아직 없어요. "계획" 버튼을 눌러 보세요.</div>`;
    return;
  }
  const sprintsHtml = (m.sprints || []).map(s => {
    const tasksHtml = (s.tasks || []).map(task => {
      const tst = exec?.tasks?.[task.id] || {};
      const status = tst.status || 'waiting';
      const model = task.model || tst.model || '';
      let meta = '';
      if (status === 'completed') meta = `${fmtDuration(tst.elapsedMs)} · ${fmtCost(tst.cost)}`;
      else if (status === 'running') meta = `${fmtDuration(elapsedSince(tst.startedAt))} 경과`;
      else if (status === 'failed') meta = `${tst.attempts || 1}회 실패`;
      const grBadge = (guardrailHits[task.id]?.length) ? `<span class="task-meta" style="color:var(--warn)">⚠ 한도</span>` : '';
      const seBadge = (silentErrors[task.id]?.length) ? `<span class="task-meta" style="color:var(--warn)">⚠ 확인</span>` : '';
      return `
        <div class="task status-${status}" data-task-id="${task.id}">
          <span class="task-icon">${STATUS_ICON[status] || '·'}</span>
          <span class="task-title">${escapeHtml(task.title)}</span>
          <span class="task-meta">${meta}</span>
          ${grBadge}${seBadge}
          ${model ? `<span class="task-model ${model}">${tModel(model)}</span>` : '<span></span>'}
        </div>`;
    }).join('');
    return `
      <div class="sprint">
        <div class="sprint-head">
          <span class="sprint-title">${escapeHtml(s.title)}</span>
        </div>
        <div class="tasks">${tasksHtml}</div>
      </div>`;
  }).join('');
  $tree.innerHTML = `
    <div class="milestone">
      <div class="milestone-head">
        <div class="milestone-title"><span>${escapeHtml(m.title)}</span></div>
      </div>
      <div class="milestone-body">${sprintsHtml}</div>
    </div>`;
}

function renderQuickFixes(state) {
  const $list = $('quick-list');
  if (!state.recentQuickFixes?.length) {
    $list.innerHTML = `<div class="picker-empty" style="padding:10px;">빠른수정 기록이 없어요.</div>`;
    return;
  }
  $list.innerHTML = state.recentQuickFixes.map(q => `
    <div class="quick-item">
      <span>${escapeHtml(q.title || q.id)}</span>
      <span style="color:var(--muted);font-family:var(--mono);">${tStatus(q.status)} · ${fmtCost(q.cost)}</span>
    </div>
  `).join('');
}

// v2.1: telemetry fields are `t` (ISO ts) and `event` (snake_case)
const FEED_EVENT = {
  task_start:         (e) => `작업 시작: ${e.taskId}${e.model ? ` · ${e.model}` : ''}${e.size ? ` · ${e.size}` : ''}`,
  task_end:           (e) => `작업 ${e.outcome === 'pass' ? '완료' : e.outcome === 'fail' ? '실패' : '건너뜀'}: ${e.taskId} · ${fmtCost(e.costUSD)}${e.wallMin != null ? ` · ${e.wallMin}분` : ''}`,
  sprint_complete:    (e) => `묶음작업 완료: ${e.sprintId} · ${e.tasksCompleted}/${(e.tasksCompleted||0)+(e.tasksFailed||0)} · ${fmtCost(e.totalCostUSD)}`,
  guardrail_triggered:(e) => `⚠ 한도 도달: ${e.taskId} · ${e.type} (${e.value}/${e.limit})`,
  sprint_start:       (e) => `묶음작업 시작: ${e.sprintId}`,
};
function renderFeed(state) {
  const $feed = $('feed');
  const events = state.telemetry || [];
  if (!events.length) { $feed.innerHTML = `<div style="color:var(--muted);">이벤트 없음</div>`; return; }
  $feed.innerHTML = events.slice().reverse().slice(0, 50).map(e => {
    const formatter = FEED_EVENT[e.event];
    const desc = formatter ? formatter(e) : (e.msg || e.taskId || JSON.stringify(e).slice(0, 80));
    const ts = (e.t || e.ts || '').slice(11, 19);
    return `
      <div class="feed-row">
        <span class="feed-ts">${escapeHtml(ts)}</span>
        <span class="feed-type">${escapeHtml(e.event || '')}</span>
        ${escapeHtml(desc)}
      </div>`;
  }).join('');
}

function renderArchive(state) {
  const $arch = $('archive');
  if (!state.archive?.length) { $arch.innerHTML = `<div class="picker-empty" style="padding:10px;">완료된 단계가 아직 없어요.</div>`; return; }
  $arch.innerHTML = state.archive.map(a => `
    <div class="archive-card" data-archive-id="${a.id}">
      <div class="archive-card-title">${escapeHtml(a.spec?.projectName || a.id)}</div>
      <div class="archive-card-meta">회고 ${a.retrospective ? '✓' : '—'} · 플레이테스트 ${a.playtest ? '✓' : '—'}</div>
    </div>`).join('');
}

// --- main render entry ---
let lastState = null;
let selectedTaskId = null;

function render(state) {
  lastState = state;
  // Onboarding gate
  const needOnboard = state.onboarding?.firstRun || !state.onboarding?.hasProjects;
  document.getElementById('onboard').classList.toggle('hidden', !needOnboard);
  if (needOnboard) return;

  // Topbar
  const wsEl = $('workspace-path');
  if (wsEl && state.workspace) wsEl.textContent = state.workspace;
  if (window.TFGPicker) {
    window.TFGPicker.setLabel(state.project?.name);
    window.TFGPicker.renderList(state.projects || [], state.project?.id);
  }

  renderHero(state);
  renderRoadmap(state);
  renderTree(state);
  renderQuickFixes(state);
  renderFeed(state);
  renderArchive(state);
  bindTreeEvents();

  if (selectedTaskId) openInspector(selectedTaskId);
}

function bindTreeEvents() {
  for (const t of document.querySelectorAll('.task')) {
    t.addEventListener('click', () => openInspector(t.dataset.taskId));
  }
}

function findTask(plan, taskId) {
  for (const m of plan?.milestones || [])
    for (const s of m.sprints || [])
      for (const task of s.tasks || [])
        if (task.id === taskId) return { task, sprint: s, milestone: m };
  return null;
}

function openInspector(taskId) {
  const found = findTask(lastState?.plan, taskId);
  if (!found) return;
  selectedTaskId = taskId;
  const { task, sprint, milestone } = found;
  const tst = lastState?.exec?.tasks?.[taskId] || {};
  const guardrailEvents = lastState?.guardrailHits?.[taskId] || [];
  const silents = lastState?.silentErrors?.[taskId] || [];
  const handoff = lastState?.handoffs?.[taskId];

  $('ins-title').textContent = task.title;
  const rows = [];
  rows.push(`<div class="ins-row"><div class="ins-label">위치</div><div class="ins-value">${escapeHtml(milestone.title)} › ${escapeHtml(sprint.title)}</div></div>`);
  rows.push(`<div class="ins-row"><div class="ins-label">상태</div><div class="ins-value">${tStatus(tst.status || 'waiting')}</div></div>`);
  if (task.difficulty) rows.push(`<div class="ins-row"><div class="ins-label">난이도</div><div class="ins-value">${task.difficulty}</div></div>`);
  if (task.model || tst.model) rows.push(`<div class="ins-row"><div class="ins-label">모델</div><div class="ins-value">${tModel(task.model || tst.model)}</div></div>`);
  if (tst.elapsedMs) rows.push(`<div class="ins-row"><div class="ins-label">소요 시간</div><div class="ins-value">${fmtDuration(tst.elapsedMs)}</div></div>`);
  if (tst.cost != null) rows.push(`<div class="ins-row"><div class="ins-label">비용</div><div class="ins-value">${fmtCost(tst.cost)}</div></div>`);
  if (task.mustHaves?.length)
    rows.push(`<div class="ins-row"><div class="ins-label">${t('mustHaves')}</div><ul class="ins-list">${task.mustHaves.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul></div>`);

  // v2.1: guardrail from telemetry.jsonl events
  if (guardrailEvents.length) {
    const items = guardrailEvents.map(g => {
      const reason = window.TFGi18n?.guardrailReason?.[g.type] || g.type;
      return `<li>${escapeHtml(reason)} (${g.value}/${g.limit})</li>`;
    }).join('');
    rows.push(`<div class="ins-row"><div class="ins-label">한도 도달</div><ul class="ins-list">${items}</ul></div>`);
  }

  // v2.1: silent errors from handoffs/{task-id}.json
  if (silents.length) {
    const items = silents.map(s =>
      `<li>${escapeHtml(typeof s === 'string' ? s : `${s.file || ''}${s.line ? `:${s.line}` : ''} — ${s.issue || s.type || ''}`)}</li>`
    ).join('');
    rows.push(`<div class="ins-row"><div class="ins-label">확인 필요</div><ul class="ins-list">${items}</ul></div>`);
  }

  if (handoff?.openItems?.length) {
    const items = handoff.openItems.map(o => `<li>${escapeHtml(o)}</li>`).join('');
    rows.push(`<div class="ins-row"><div class="ins-label">남은 과제</div><ul class="ins-list">${items}</ul></div>`);
  }

  if (tst.error) rows.push(`<div class="ins-row"><div class="ins-label">에러</div><div class="ins-error">${escapeHtml(tst.error)}</div></div>`);
  $('ins-body').innerHTML = rows.join('');

  // Action footer: retry / skip / run
  const status = tst.status || 'waiting';
  const foot = [];
  if (status === 'failed' || guardrailEvents.length) {
    foot.push(`<button class="btn btn-primary" data-ins-action="retry" data-task-id="${task.id}">재시도</button>`);
    foot.push(`<button class="btn" data-ins-action="skip" data-task-id="${task.id}">건너뛰기</button>`);
  } else if (status === 'waiting') {
    foot.push(`<button class="btn btn-primary" data-ins-action="run" data-task-id="${task.id}">지금 실행</button>`);
  }
  $('ins-foot').innerHTML = foot.join('');
  $('inspector').classList.remove('hidden');
}

$('ins-close').addEventListener('click', () => {
  $('inspector').classList.add('hidden');
  selectedTaskId = null;
});

// Inspector action buttons — route through terminal (same as typing)
// v2.1: no CLI flags exist. Pass taskId as natural-language argument.
$('ins-foot').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-ins-action]');
  if (!btn || !window.TFGTerminal) return;
  const act = btn.dataset.insAction;
  const id = btn.dataset.taskId;
  if (act === 'retry') window.TFGTerminal.sendCommand(`/taskforge-execute ${id} 다시 시도`);
  else if (act === 'skip') window.TFGTerminal.sendCommand(`/taskforge-plan-edit ${id} 건너뛰기`);
  else if (act === 'run') window.TFGTerminal.sendCommand(`/taskforge-execute ${id}`);
});

window.render = render;
