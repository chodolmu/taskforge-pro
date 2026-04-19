---
name: taskforge-validate
description: Automatically validates code. Use when the user says "/taskforge-validate", "check the build", "validate the code", "run automated validation", or similar. v2 adds silent error detection, stub scanning, and telemetry logging. Use "/taskforge-verify" for user-driven manual UAT, "/taskforge-playtest" for game feel feedback.
---

# Validate — Validation Runner (v2)

Validate the work output of the project. Three-level validation + silent error detection + telemetry.

**Core principle**: Task complete ≠ Goal achieved. Tasks can be marked "done" with placeholders. Validate backward from the goal.

**v2 additions**:
- Silent error detection: scan for TODOs, stubs, placeholders, debug code, hardcoded secrets
- Telemetry: append results to `telemetry.jsonl`
- Guardrail event rollup: include guardrail events in sprint/milestone reports

## Gating Policy

| Level | Gating | Rationale |
|-------|--------|-----------|
| Task | **inline / blocking** | Cheap; catches local breakage immediately |
| Sprint | **async / non-blocking** | Advisory only — does NOT stall next sprint |
| Milestone | **blocking gate** | Goal-backward + cross-regression decide whether to ship |

Sprint validation never blocks `/taskforge-execute-all`. Milestone gate is the enforcement point.

## Project Selection
Auto-select if only one project; ask if multiple. All paths relative to `_workspace/projects/{projectId}/`.

## 3-Level Validation

### Level 1: Task Validation (automatic, inline, blocking)

Run items in task's `validation.auto`:

| Item | Behavior |
|------|----------|
| build | Run project build |
| typecheck | TypeScript type check |
| lint | Run linter |
| test | Run test suite |
| run | Run and verify no errors |

**+ Acceptance Criteria Check**:
```
완성 기준 확인:
  ✅ src/index.html 존재
  ✅ <!DOCTYPE html> 포함
  ❌ <canvas> 태그 없음 → 누락
```

**+ Silent Error Scan (v2)**:

Scan all files changed in this task:

| Pattern | Severity |
|---------|----------|
| `TODO` / `FIXME` / `HACK` | warn |
| Empty bodies `{}` / `pass` | warn |
| "placeholder" / "lorem ipsum" / "dummy data" | warn |
| `console.log` / `print(` / `debugger` | info |
| `password=` / `api_key=` / `secret=` hardcoded | error |
| Functions with only `throw new Error("not implemented")` | error |

If **error** severity found: task fails. If **warn**: report but allow pass with user confirmation.

**Telemetry**:
```json
{"t":"...","event":"task_validate","taskId":"M1-S1-T3","passed":true,"silentErrors":[],"acceptancePassed":3,"acceptanceTotal":3}
```

If any item fails: treat task as incomplete.

### Level 2: Sprint Validation (after sprint — ASYNC, non-blocking)

**Run mode**: Launched in background. Does NOT block next sprint. Results → `validations/sprint-{id}.json` with `status: "advisory"`.

1. Re-run all automated validation items

2. **Goal-Backward Validation**:

   Collect `mustHaves` from all sprint tasks:

   **Step 1 — Truths**:
   ```
   [SATISFIED]   "카드 목록이 메인 페이지에 표시됨"
   [PARTIAL]     "카드 클릭 시 상세 페이지 이동" → routes.js에 라우트 없음
   [UNSATISFIED] "검색 동작" → SearchBar.jsx가 스텁
   ```

   **Step 2 — Artifacts**:
   ```
   [VERIFIED]  src/index.html — 존재, 내용 있음
   [STUB]      src/Search.jsx — 존재하나 TODO만 있음
   [MISSING]   src/api.js — 파일 없음
   [ORPHANED]  src/old.js — 어디서도 import 안 됨
   ```

   **Step 3 — Key Links**:
   ```
   [WIRED]     App.jsx → Detail.jsx (import + 라우트에서 사용)
   [NOT_WIRED] auth.js → export 있으나 import 없음
   ```

3. **Silent Error Scan** (sprint-wide): scan all files changed during sprint

4. **Guardrail Event Rollup**: include any guardrail events from this sprint's tasks

5. Code review with Sonnet: read all changed files, evaluate quality/consistency/potential bugs

6. Save `validations/sprint-{id}.json`:
```json
{
  "targetType": "sprint",
  "targetId": "M1-S1",
  "status": "advisory",
  "passed": true,
  "goalBackward": {
    "truths": { "satisfied": 5, "partial": 1, "unsatisfied": 0 },
    "artifacts": { "verified": 8, "stub": 1, "missing": 0, "orphaned": 1 },
    "wiring": { "wired": 6, "partial": 1, "notWired": 0 }
  },
  "silentErrors": [
    { "file": "src/utils.js", "line": 42, "type": "TODO", "content": "// TODO: error handling", "severity": "warn" }
  ],
  "guardrailEvents": [],
  "validatedBy": "auto+sonnet+goal-backward",
  "validatedAt": "..."
}
```

**Telemetry**:
```json
{"t":"...","event":"sprint_validate","sprintId":"M1-S1","passed":true,"advisory":true,"stubCount":1,"orphanCount":1}
```

### Level 3: Milestone Validation (cross-regression — BLOCKING gate)

**Run mode**: Only blocking validation. Next milestone cannot start until this passes. Pull in all sprint advisories accumulated since last milestone gate.

Cross-reference three sources:

| Source | What to check |
|--------|--------------|
| Plan (`project-plan.json`) | Each task's mustHaves, acceptanceCriteria |
| Handoffs (`handoffs/*.json`) | Actual work done, changed files, known issues |
| Code (actual filesystem) | File existence, import/export wiring, behavior |

**Flow**:

1. Collect all mustHaves from milestone tasks
2. Artifact validation: VERIFIED / STUB / MISSING / ORPHANED
3. Wiring validation: WIRED / PARTIAL / NOT_WIRED
4. Truth validation: synthesize artifact + wiring for each truth
5. **Silent error scan** across entire milestone codebase
6. **Handoff cross-check**: verify all `openItems` from handoffs are resolved
7. **Guardrail event summary**: total guardrail events for the milestone
8. **Sprint advisory rollup**: include all accumulated sprint warnings

Save `validations/audit-milestone-{id}.md`.

**Telemetry**:
```json
{"t":"...","event":"milestone_validate","milestoneId":"M1","passed":true,"blocking":true,"stubsFound":0,"openItemsResolved":3,"openItemsPending":0}
```

**On milestone failure**:
Opus full review → suggest fix sprint that addresses both milestone failures and accumulated sprint advisories → user confirmation required → then automatically suggest `/taskforge-playtest`.

## On Failure

- **Task validation failure**: Guide to retry. Task does not count as complete.
- **Sprint validation failure**: Do NOT halt. Record as advisory. Surface in `/taskforge-status`. Carry into next milestone gate.
- **Milestone validation failure**: Blocking. Opus review → fix sprint → user confirmation.

## Usage

```
/taskforge-validate              → Auto-detect most recent completed unit
/taskforge-validate sprint       → Validate current sprint (includes goal-backward)
/taskforge-validate task M1-S1-T3 → Validate specific task
/taskforge-validate milestone    → Full milestone cross-regression (blocking gate)
```

## After Milestone Validation Passes

Automatically suggest the next steps in order:
```
✅ 마일스톤 M1 검증 통과!

다음 권장 순서:
1. /taskforge-playtest — 직접 플레이해서 느낌 확인
2. /taskforge-retro — 이번 마일스톤 회고 + 다음 계획 업데이트
3. /taskforge-discover M2 — 다음 마일스톤 상세 정의
```
