---
name: taskforge-execute
description: Executes the next available task. Use when the user says "/taskforge-execute", "next task", "run", "go ahead", or similar. v2 changes: contextManifest-based file loading, few-shot reference injection, CoT template injection, guardrail enforcement, telemetry logging, silent error detection.
---

# Execute — Task Execution (v2)

Find the next executable task and run it.

**v2 key changes**:
1. **contextManifest**: Read files in priority order before execution (not ad-hoc).
2. **Reference injection**: Automatically include `references/` files listed in task.
3. **CoT template**: Inject `cotTemplate` if specified — reasoning scaffold before action.
4. **Guardrails**: Enforce maxTurns / maxCostUSD / maxWallTimeMin. Stop and report if exceeded.
5. **Silent error detection**: Scan output for TODOs, stubs, placeholders before marking done.
6. **Telemetry**: Append events to `telemetry.jsonl`.

**Core principle**: Clean context, clear plan, right model, right references.

## Prerequisites

- `project-plan.json` (status: approved) under `_workspace/projects/{projectId}/`
- `execution-state.json` exists
- **Project selection**: auto if one project, ask if multiple
- All paths relative to `_workspace/projects/{projectId}/`

## Step 0: Task Size Gate (v2)

Before executing, check if the incoming request is actually a plan task or an ad-hoc request:

| Signal | Route |
|--------|-------|
| Explicit task ID (e.g. "M1-S1-T2") | Execute that task |
| User says "next task" / "go" | Find next task from plan |
| User describes a tiny change ("just fix X") | Suggest `/taskforge-quick` |
| User describes multi-milestone feature | Suggest `/taskforge-discover` |

This gate prevents execute from being used for work that belongs in a different route.

## Execution Flow

### 1. Select Next Task

Find the next task to run:
- Earliest task in dependency order with all dependencies completed
- Exclude: completed / failed / skipped / locked tasks
- **Lock check**: Read `locks/{task-id}.lock` — skip if exists and < 30 min old

**Task Locking**:
```json
{
  "sessionId": "{timestamp}-{random}",
  "acquiredAt": "2026-04-20T10:30:00Z",
  "taskId": "M1-S1-T3",
  "expiresAt": "2026-04-20T11:00:00Z"
}
```
Write lock → execute → release lock (always, even on failure).

**Wave parallelism**: If multiple tasks share same wave number and all deps satisfied:
- "Wave {n}에 병렬 실행 가능한 태스크가 {count}개 있어요. 동시에 실행할까요?"
- On yes: run in parallel via Agent tool (each acquires own lock)

### 2. Assemble Context (v2 contextManifest)

Read files in the order specified in the task's `contextManifest`, highest priority first:

```
Priority 0: vision.json          ← project why / constraints
Priority 1: concept.json         ← core loop / tech direction
Priority 2: conventions.md       ← naming, colors, patterns
Priority 3: references/*.html    ← few-shot examples
Priority 4: decisions/D*.md      ← relevant decisions
Priority 5: handoffs/{prev}.json ← what previous task did
```

**What gets injected** (in order):
1. contextManifest files (priority order)
2. Task plan (the `plan` field — specific how-to)
3. CoT template if `cotTemplate` is set (reasoning scaffold)
4. Domain skills if `skills` is non-empty
5. acceptanceCriteria (what done looks like)
6. Guardrail limits (what to stop at)

**What does NOT get injected**:
- Full conversation history
- Other tasks' details
- Logs from unrelated sessions

**CoT template injection** (hidden from user):
If `cotTemplate` is set, prepend the scaffold to the execution prompt:
```
이 작업을 시작하기 전에 다음 순서로 생각해보세요:
1. {step 1}
2. {step 2}
3. {step 3}
그 다음 구현을 시작하세요.
```
User sees the AI thinking through steps — they don't need to know it's a CoT template.

### 3. Guardrail Check (v2)

Before starting, record guardrail limits from task:
```json
{ "maxTurns": 20, "maxCostUSD": 2.0, "maxWallTimeMin": 35 }
```

During execution, monitor:
- If **maxTurns** exceeded: stop, save state, report:
  ```
  ⚠️ 이 작업이 예상보다 복잡해요. 지금까지 한 것을 저장하고 멈출게요.
  계속하려면 /taskforge-execute, 건너뛰거나 분할하려면 /taskforge-plan-edit.
  ```
- If **maxCostUSD** exceeded: same stop behavior.
- If **maxWallTimeMin** exceeded: same stop behavior.

Log to `telemetry.jsonl`:
```json
{"t":"...","event":"guardrail_triggered","taskId":"M1-S1-T3","type":"maxTurns","value":22,"limit":20}
```

### 4. Model Routing

Use the task's `model` field for the **code-writing model**:
- `haiku`: simple, fast, cheap
- `sonnet`: general and complex (both medium and hard)

**Opus is never used for code-writing.** It is reserved for judgment work — planning, propagation, orchestration, cross-context analysis. The split is by *work type*, not by step name. If a step inside execution turns out to be a judgment step (see harness mode below), opus may run it; the worker that writes the actual code stays on haiku/sonnet.

### 5. Execute

#### single mode
Execute task plan directly with the task's `model` (haiku/sonnet). Write code, create/modify files.

#### single + skills mode
Same as single, but inject domain skills from `skills` field.
Load from `harnesses/*/skills/{skill-name}/skill.md`.

#### harness mode
Two-tier model split:
- **Orchestrator: opus.** Loads the harness, coordinates the team, dispatches sub-tasks, cross-validates outputs, handles errors. This is judgment work — model routing here is opus regardless of the task's `model` field.
- **Worker agents: haiku/sonnet.** Each worker that actually writes code/content runs on the task's `model` field (or the per-agent model defined in the harness). Opus never writes the worker output directly.

This mirrors the project-wide rule: judgment → opus, code-writing → haiku/sonnet.

### 6. Self-Review

After writing code, re-read changed files and check:
- Does code match the task plan?
- Are acceptance criteria actually met?
- Any obvious bugs, missing imports, broken references?

### 7. Silent Error Detection (v2)

Before marking done, scan all changed files for:

| Pattern | Type |
|---------|------|
| `TODO` / `FIXME` / `HACK` | Incomplete work |
| Empty function bodies `{}` / `pass` | Stub |
| "Lorem ipsum" / "placeholder" / "dummy" | Placeholder content |
| `console.log` / `print(` / `debugger` | Debug code |
| Hardcoded secrets (`password=`, `api_key=`) | Security risk |

If found, show with this format (one line per finding):
```
⚠️ 완료 전 확인이 필요해요:
  - {file}:{line} — {issueType}: {description}
  - {file}:{line} — {issueType}: {description}

수정하고 다시 확인할까요?
```
Auto-fix if simple. Report to user if cannot auto-fix.

### 8. Acceptance Criteria Validation

Show each criterion's check result:
```
완성 기준 확인:
  ✅ {criterion as written in plan}
  ✅ {criterion as written in plan}
  ❌ {criterion as written in plan} → {what's missing}
```

If any fail: auto-fix once. If still failing after retry: report to user.

### 9. Platform Validation

Use `validationStrategy` from spec-card:
- Run build, typecheck, lint, run per spec-card config
- If manual validation needed: present checklist to user

### 10. Completion Processing

1. **Telemetry**: Append to `telemetry.jsonl`:
   ```json
   {"t":"...","event":"task_end","taskId":"M1-S1-T3","outcome":"pass","retryCount":0,"tokens":12450,"costUSD":0.42,"wallMin":18,"referencesInjected":["ui-pattern.html"],"cotUsed":false}
   ```
2. **Generate Handoff**: Save `handoffs/{task-id}.json` with this schema:
   ```json
   {
     "taskId": "{task-id}",
     "completedAt": "{ISO-8601 timestamp}",
     "whatChanged": ["{file path} {created|modified|deleted}", "..."],
     "decisionsMade": ["{decision id and summary}", "..."],
     "hintsForNext": "{any context the next task should know — or empty string}",
     "openItems": ["{known incomplete piece}", "..."],
     "silentErrors": [],
     "guardrailEvents": []
   }
   ```
   Fill all values from the actual task outcome — do not invent details. **Handoff is always generated** (not conditional). Only tiny quick-fix tasks skip handoff.
3. **Platform validation**: Run per spec-card strategy
4. **Acceptance criteria check**: All must pass
5. **Update execution-state.json**: ready → in_progress → completed
6. **Release task lock**: Delete `locks/{task-id}.lock`
7. **Report** with this template:
   ```
   ✅ 완료: "{taskName}" ({difficultyLabel}, {duration}, ${cost})
      변경 파일: {files joined by comma}
      검증: {check name} ✅ {check name} ✅
      완성 기준: {passed}/{total} ✅
      
      다음: "{nextTaskName}" [{difficultyLabel}/{model}]
      → /taskforge-execute로 계속, /taskforge-status로 전체 진행 확인
   ```

### 11. On Failure

**Auto-retry (built-in)**:
1. Add failure reason to context: "이전 시도가 [이유]로 실패했어요. 이 방법은 피해보세요."
2. Re-execute in same session
3. After 2 failures: stop and ask:
   ```
   ⚠️ 이 작업이 2번 실패했어요.
   실패 이유: [요약]
   
   선택:
   - 다시 시도 (다른 방법으로)
   - 건너뛰기
   - 직접 수정 후 /taskforge-execute 계속
   ```

Log to telemetry:
```json
{"t":"...","event":"task_end","taskId":"...","outcome":"failed","retryCount":2,"failureReason":"..."}
```

## Sprint/Milestone Completion Detection

After task completes, if all sprint tasks done:
- "스프린트 [이름] 완료! /taskforge-validate로 통합 검증을 실행해보세요."

If all milestone tasks done:
- "마일스톤 [이름] 완료! /taskforge-validate milestone으로 최종 검증을 먼저 하고, /taskforge-playtest로 직접 확인해보세요."
