// TaskForge GUI v2 - v2 workspace readers + onboarding + cwd re-spawn
// Usage: node server.js [workspace-path] [port]

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const pty = require('node-pty');

const INITIAL_WORKSPACE_ARG = process.argv[2] ? path.resolve(process.argv[2]) : null;
const PORT = parseInt(process.argv[3], 10) || 7777;
const PUBLIC_DIR = path.join(__dirname, 'public');
const NM_DIR = path.join(__dirname, 'node_modules');
const CONFIG_DIR = path.join(os.homedir(), '.taskforge-gui');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

const MIME = {
  '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'application/javascript; charset=utf-8','.mjs':'application/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8','.map':'application/json; charset=utf-8',
  '.svg':'image/svg+xml','.md':'text/markdown; charset=utf-8',
};

// ---------- config ----------
function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
  catch { return { projects: [], currentProjectId: null, firstRun: true, ui: {} }; }
}
function saveConfig(cfg) {
  try { fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2)); }
  catch (e) { console.warn('[warn] saveConfig:', e.message); }
}
let config = loadConfig();

// ---------- workspace resolution (v2.1: _workspace/projects/{projectId}/) ----------
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
function readTextSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } }
function readJsonlTail(p, n = 50) {
  try {
    const txt = fs.readFileSync(p, 'utf8');
    const lines = txt.split(/\r?\n/).filter(Boolean);
    return lines.slice(-n).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  } catch { return []; }
}

// A TaskForge project directory has at least one of these files
function isProjectDir(dir) {
  if (!dir || !fs.existsSync(dir)) return false;
  return ['vision.json','spec-card.json','project-plan.json','execution-state.json']
    .some(f => fs.existsSync(path.join(dir, f)));
}

// Given a user-supplied folder, find candidate projects under <root>/_workspace/projects/*/
function scanProjects(root) {
  const base = path.join(root, '_workspace', 'projects');
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base)
    .map(name => ({ projectId: name, path: path.join(base, name) }))
    .filter(p => isProjectDir(p.path));
}

function detectProjectDisplayName(projectPath, projectId) {
  const vision = readJsonSafe(path.join(projectPath, 'vision.json'));
  if (vision?.projectName) return vision.projectName;                 // v2.1: projectName
  const spec = readJsonSafe(path.join(projectPath, 'spec-card.json'));
  if (spec?.projectName) return spec.projectName;
  return projectId;
}

if (INITIAL_WORKSPACE_ARG) {
  const root = path.resolve(INITIAL_WORKSPACE_ARG);
  const found = scanProjects(root);
  if (found.length === 1) {
    const p = found[0];
    let match = config.projects.find(x => path.resolve(x.workspacePath) === p.path);
    if (!match) {
      match = {
        id: crypto.randomBytes(4).toString('hex'),
        name: detectProjectDisplayName(p.path, p.projectId),
        projectId: p.projectId, projectRoot: root, workspacePath: p.path,
        addedAt: new Date().toISOString(),
      };
      config.projects.push(match);
    }
    config.currentProjectId = match.id;
    config.firstRun = false;
    saveConfig(config);
  }
  // if 0 or >1, leave to onboarding / picker
}

function getCurrentProject() {
  return config.projects.find(p => p.id === config.currentProjectId) || null;
}
function currentWorkspace() { return getCurrentProject()?.workspacePath || null; }  // _workspace/projects/{id}
function currentRoot() { return getCurrentProject()?.projectRoot || null; }          // user's cwd root

// ---------- v2.1 state collection ----------
function collectStateV2() {
  const ws = currentWorkspace();
  if (!ws) {
    return {
      onboarding: { firstRun: config.firstRun, hasProjects: config.projects.length > 0 },
      projects: config.projects, project: null, workspace: null,
      vision: null, concept: null, roadmap: null,
      spec: null, plan: null, exec: null,
      telemetry: [], guardrailHits: {}, silentErrors: {}, handoffs: {},
      recentQuickFixes: [], archive: [], validations: {},
      timestamp: Date.now(),
    };
  }
  const vision  = readJsonSafe(path.join(ws, 'vision.json'));
  const concept = readJsonSafe(path.join(ws, 'concept.json'));
  const roadmap = readJsonSafe(path.join(ws, 'roadmap.json'));
  const spec    = readJsonSafe(path.join(ws, 'spec-card.json'));
  const plan    = readJsonSafe(path.join(ws, 'project-plan.json'));
  const exec    = readJsonSafe(path.join(ws, 'execution-state.json'));

  const telemetry = readJsonlTail(path.join(ws, 'telemetry.jsonl'), 100);

  // v2.1: Guardrail derived from telemetry.jsonl (exec-state doesn't carry this)
  const guardrailHits = {};
  for (const e of telemetry) {
    if (e.event === 'guardrail_triggered' && e.taskId) {
      (guardrailHits[e.taskId] ||= []).push({ type: e.type, value: e.value, limit: e.limit, t: e.t });
    }
  }

  // v2.1: Silent errors from handoffs/{task-id}.json → silentErrors array
  const handoffs = {};
  const silentErrors = {};
  const hoDir = path.join(ws, 'handoffs');
  if (fs.existsSync(hoDir)) {
    for (const f of fs.readdirSync(hoDir)) {
      if (!f.endsWith('.json')) continue;
      const h = readJsonSafe(path.join(hoDir, f));
      if (!h) continue;
      const taskId = h.taskId || f.replace(/\.json$/,'');
      handoffs[taskId] = h;
      if (Array.isArray(h.silentErrors) && h.silentErrors.length) silentErrors[taskId] = h.silentErrors;
    }
  }

  // v2.1: Quick-fix detection — telemetry size:"tiny" events
  const recentQuickFixes = [];
  for (const e of telemetry) {
    if (e.event === 'task_end' && e.size === 'tiny') {
      recentQuickFixes.push({ id: e.taskId, status: e.outcome === 'pass' ? 'completed' : 'failed',
        cost: e.costUSD, wallMin: e.wallMin, t: e.t });
    }
  }
  recentQuickFixes.reverse();

  // Archive — generated by /taskforge-retro; tolerate absence
  const archive = [];
  const archDir = path.join(ws, 'milestones');
  if (fs.existsSync(archDir)) {
    for (const d of fs.readdirSync(archDir)) {
      const mDir = path.join(archDir, d);
      try { if (!fs.statSync(mDir).isDirectory()) continue; } catch { continue; }
      archive.push({
        id: d,
        spec: readJsonSafe(path.join(mDir, 'spec-card.json')),
        retrospective: readTextSafe(path.join(mDir, 'retrospective.md')),
        playtest: readTextSafe(path.join(mDir, 'playtest.md')),
      });
    }
  }

  const validations = {};
  const valDir = path.join(ws, 'validations');
  if (fs.existsSync(valDir)) {
    for (const f of fs.readdirSync(valDir)) {
      if (f.endsWith('.json')) validations[f.replace('.json','')] = readJsonSafe(path.join(valDir, f));
    }
  }

  return {
    onboarding: { firstRun: false, hasProjects: true },
    projects: config.projects, project: getCurrentProject(), workspace: ws,
    vision, concept, roadmap,
    spec, plan, exec,
    telemetry, guardrailHits, silentErrors, handoffs,
    recentQuickFixes: recentQuickFixes.slice(0, 10),
    archive, validations,
    timestamp: Date.now(),
  };
}

// ---------- SSE ----------
const sseClients = new Set();
function broadcast() {
  const payload = `data: ${JSON.stringify(collectStateV2())}\n\n`;
  for (const res of sseClients) { try { res.write(payload); } catch {} }
}

// ---------- watchers ----------
let watcher = null, debounce = null, telemetryTimer = null, telemetrySize = 0;
let pendingWatcher = null;

function attachWatcher() {
  if (watcher) { try { watcher.close(); } catch {} watcher = null; }
  clearInterval(telemetryTimer); telemetryTimer = null; telemetrySize = 0;
  if (pendingWatcher) { try { pendingWatcher.close(); } catch {} pendingWatcher = null; }

  const proj = getCurrentProject();
  if (!proj) return;
  if (proj.pending) { attachPendingWatcher(proj); return; }

  const ws = proj.workspacePath;
  if (!ws || !fs.existsSync(ws)) { console.warn(`[warn] workspace missing: ${ws}`); return; }

  try {
    watcher = fs.watch(ws, { recursive: true }, () => {
      clearTimeout(debounce); debounce = setTimeout(broadcast, 120);
    });
    console.log(`[watch] ${ws}`);
  } catch (e) { console.warn(`[warn] fs.watch: ${e.message}`); }

  // telemetry.jsonl tail polling (fs.watch unreliable for append-only files)
  const telFile = path.join(ws, 'telemetry.jsonl');
  telemetryTimer = setInterval(() => {
    try {
      const { size } = fs.statSync(telFile);
      if (size !== telemetrySize) { telemetrySize = size; broadcast(); }
    } catch {}
  }, 500);
}

// Pending project: /taskforge-vision hasn't created {projectId}/ yet.
function attachPendingWatcher(proj) {
  const projectsDir = path.join(proj.projectRoot, '_workspace', 'projects');
  try { fs.mkdirSync(projectsDir, { recursive: true }); } catch {}
  try {
    pendingWatcher = fs.watch(projectsDir, () => {
      const found = scanProjects(proj.projectRoot);
      if (!found.length) return;
      const first = found[0];
      proj.projectId = first.projectId;
      proj.workspacePath = first.path;
      proj.name = detectProjectDisplayName(first.path, first.projectId);
      proj.pending = false;
      saveConfig(config);
      try { pendingWatcher.close(); } catch {}
      pendingWatcher = null;
      attachWatcher(); broadcast();
    });
    console.log(`[watch-pending] ${projectsDir}`);
  } catch (e) { console.warn(`[warn] pending watch: ${e.message}`); }
}

// ---------- HTTP ----------
function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

// Track PTY liveness for "busy" detection during project switch
const liveTerminals = new Set();

function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  let filePath;
  if (urlPath.startsWith('/vendor/')) {
    filePath = path.join(NM_DIR, urlPath.replace(/^\/vendor\//, ''));
    if (!filePath.startsWith(NM_DIR)) { res.writeHead(403); return res.end('forbidden'); }
  } else {
    filePath = path.join(PUBLIC_DIR, urlPath);
    if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end('forbidden'); }
  }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  try {
    if (pathname === '/api/state' && req.method === 'GET') return sendJson(res, 200, collectStateV2());

    if (pathname === '/api/events' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive' });
      res.write(`data: ${JSON.stringify(collectStateV2())}\n\n`);
      sseClients.add(res);
      req.on('close', () => sseClients.delete(res));
      return;
    }

    if (pathname === '/api/projects' && req.method === 'GET') {
      return sendJson(res, 200, { projects: config.projects, currentProjectId: config.currentProjectId, firstRun: config.firstRun });
    }

    // v2.1: "기존 프로젝트 열기" — user gives a root folder; we scan _workspace/projects/*/
    if (pathname === '/api/projects' && req.method === 'POST') {
      const body = await readBody(req);
      if (!body.path) return sendJson(res, 400, { error: 'path required' });
      const root = path.resolve(body.path);
      if (!fs.existsSync(root)) return sendJson(res, 400, { error: 'path does not exist', resolved: root });
      const found = scanProjects(root);
      if (found.length === 0)
        return sendJson(res, 404, { error: 'no TaskForge projects found under _workspace/projects/', resolved: root });

      let pick = null;
      if (body.projectId) pick = found.find(f => f.projectId === body.projectId) || null;
      else if (found.length === 1) pick = found[0];

      if (!pick) {
        // Multiple projects → ask client to choose
        return sendJson(res, 300, {
          error: 'multiple projects — choose one',
          projectRoot: root,
          candidates: found.map(f => ({
            projectId: f.projectId,
            displayName: detectProjectDisplayName(f.path, f.projectId),
            workspacePath: f.path,
          })),
        });
      }

      const dup = config.projects.find(p => path.resolve(p.workspacePath) === pick.path);
      if (dup) {
        config.currentProjectId = dup.id; config.firstRun = false;
        saveConfig(config); attachWatcher(); broadcast();
        return sendJson(res, 200, { project: dup, switched: true });
      }
      const proj = {
        id: crypto.randomBytes(4).toString('hex'),
        name: body.name?.trim() || detectProjectDisplayName(pick.path, pick.projectId),
        projectId: pick.projectId, projectRoot: root, workspacePath: pick.path,
        addedAt: new Date().toISOString(),
      };
      config.projects.push(proj);
      config.currentProjectId = proj.id;
      config.firstRun = false;
      saveConfig(config); attachWatcher(); broadcast();
      return sendJson(res, 201, { project: proj, switched: true });
    }

    // v2.1: "신규 프로젝트 시작"
    if (pathname === '/api/projects/new' && req.method === 'POST') {
      const body = await readBody(req);
      if (!body.path) return sendJson(res, 400, { error: 'path required' });
      const root = path.resolve(body.path);
      if (scanProjects(root).length > 0) {
        return sendJson(res, 409, {
          error: 'projects already exist under this path — use 열기 instead',
          resolved: root,
        });
      }
      try {
        fs.mkdirSync(path.join(root, '_workspace', 'projects'), { recursive: true });
      } catch (e) { return sendJson(res, 500, { error: `mkdir failed: ${e.message}` }); }

      const proj = {
        id: crypto.randomBytes(4).toString('hex'),
        name: body.name?.trim() || path.basename(root),
        projectId: null, projectRoot: root, workspacePath: null,
        addedAt: new Date().toISOString(), pending: true,
      };
      config.projects.push(proj);
      config.currentProjectId = proj.id;
      config.firstRun = false;
      saveConfig(config); attachPendingWatcher(proj); broadcast();

      // SSE action → client respawns PTY at root + injects `claude` + `/taskforge-vision`
      for (const sse of sseClients) {
        try {
          sse.write(`event: action\ndata: ${JSON.stringify({ kind:'new-project', projectRoot: root })}\n\n`);
        } catch {}
      }
      return sendJson(res, 201, { project: proj, bootstrap: '/taskforge-vision' });
    }

    const delMatch = pathname.match(/^\/api\/projects\/([a-z0-9]+)$/i);
    if (delMatch && req.method === 'DELETE') {
      const id = delMatch[1];
      const idx = config.projects.findIndex(p => p.id === id);
      if (idx === -1) return sendJson(res, 404, { error: 'not found' });
      config.projects.splice(idx, 1);
      if (config.currentProjectId === id) {
        config.currentProjectId = config.projects[0]?.id || null;
        attachWatcher();
      }
      saveConfig(config); broadcast();
      return sendJson(res, 200, { ok: true });
    }

    if (pathname === '/api/workspace/switch' && req.method === 'POST') {
      const body = await readBody(req);
      const proj = config.projects.find(p => p.id === body.id);
      if (!proj) return sendJson(res, 404, { error: 'project not found' });
      config.currentProjectId = proj.id;
      saveConfig(config); attachWatcher(); broadcast();
      return sendJson(res, 200, { ok: true, project: proj, terminalBusy: liveTerminals.size > 0 });
    }

    if (pathname === '/api/telemetry/tail' && req.method === 'GET') {
      const ws = currentWorkspace();
      const n = parseInt(url.searchParams.get('n'), 10) || 50;
      return sendJson(res, 200, { events: ws ? readJsonlTail(path.join(ws, 'telemetry.jsonl'), n) : [] });
    }

    // Retry/skip trigger — injected as slash command into a live terminal
    const retryMatch = pathname.match(/^\/api\/task\/([^/]+)\/retry$/);
    if (retryMatch && req.method === 'POST') {
      const taskId = retryMatch[1];
      for (const r of sseClients) {
        try { r.write(`event: action\ndata: ${JSON.stringify({ kind:'retry', taskId })}\n\n`); } catch {}
      }
      return sendJson(res, 200, { ok: true, taskId });
    }

    return serveStatic(req, res);
  } catch (e) {
    return sendJson(res, 500, { error: e.message });
  }
});

// ---------- WebSocket / PTY ----------
const wss = new WebSocketServer({ noServer: true });
server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/ws/pty')) wss.handleUpgrade(req, socket, head, ws => attachPty(ws, req));
  else socket.destroy();
});

function attachPty(ws, req) {
  const url = new URL(req.url, 'http://x');
  const cwd = url.searchParams.get('cwd') || currentRoot() || process.env.USERPROFILE || process.cwd();
  const shell = process.env.TFG_SHELL ||
    (process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : (process.env.SHELL || '/bin/bash'));
  const cols = parseInt(url.searchParams.get('cols'), 10) || 120;
  const rows = parseInt(url.searchParams.get('rows'), 10) || 30;

  let term;
  try {
    term = pty.spawn(shell, [], {
      name: 'xterm-256color', cols, rows, cwd,
      env: { ...process.env, TERM: 'xterm-256color' },
    });
  } catch (e) {
    try { ws.send(JSON.stringify({ type:'error', message:`spawn failed: ${e.message}` })); ws.close(); } catch {}
    return;
  }

  liveTerminals.add(term);
  const send = obj => { try { ws.send(JSON.stringify(obj)); } catch {} };
  send({ type: 'ready', pid: term.pid, shell, cwd });

  term.onData(d => send({ type: 'data', data: d }));
  term.onExit(({ exitCode }) => { send({ type: 'exit', exitCode }); try { ws.close(); } catch {} });

  ws.on('message', raw => {
    let msg; try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (msg.type === 'input') term.write(msg.data);
    else if (msg.type === 'resize' && msg.cols && msg.rows) { try { term.resize(msg.cols, msg.rows); } catch {} }
  });
  ws.on('close', () => { liveTerminals.delete(term); try { term.kill(); } catch {} });
  ws.on('error', () => { liveTerminals.delete(term); try { term.kill(); } catch {} });
}

server.listen(PORT, () => {
  console.log(`\n  TaskForge GUI v2 → http://localhost:${PORT}`);
  const cur = getCurrentProject();
  console.log(`  Current:       ${cur ? cur.name : '(none — onboarding)'}`);
  console.log(`  Projects:      ${config.projects.length}\n`);
  attachWatcher();
});
