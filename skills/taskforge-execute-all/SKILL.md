---
name: taskforge-execute-all
description: Automatically and continuously executes all tasks in the current sprint. Use when the user says "/taskforge-execute-all", "run everything", "run the sprint", "keep going automatically", or similar. Supports wave-based parallel execution and runs through the sprint without stopping.
---

# Execute All — Sprint Auto-Execution (Wave Parallel) v2

Continuously execute the remaining tasks in the current sprint without stopping.

## Prerequisites

- Same as `/taskforge-execute` (project selection, approved plan, execution-state)
- All file paths are relative to `_workspace/projects/{projectId}/`

## v2 Pre-flight: Size Gate Check

Before starting execution, verify that the current sprint's tasks are real planned tasks:

1. Load `project-plan.json` and `execution-state.json`
2. Confirm each pending task in the sprint exists in `project-plan.json` with a valid `plan` field
3. If any task is missing or has an empty `plan`, skip it with a warning and continue with the remaining tasks
4. Log the pre-flight result to `telemetry.jsonl` as a `sprint_start` event

This prevents phantom tasks (tasks in execution-state that were never in the plan) from running silently.

## Behavior

### Wave-Based Parallel Execution

If tasks have a `wave` field, execute in wave order:

```
Wave 1: [t1, t2, t3] — no dependencies, parallel execution
  ↓ (after all complete)
Wave 2: [t4, t5] — depends on Wave 1, parallel execution
  ↓ (after all complete)
Wave 3: [t6] — depends on Wave 2, single execution
```

1. Tasks in the same wave are **executed in parallel** using the Agent tool (each acquires its own task lock)
2. Skip tasks that are already locked by another session
3. Proceed to the next wave only after all tasks in the current wave complete
4. Tasks without a `wave` field are executed **sequentially** in dependency order

### Execution Flow

For each task, perform the same flow as `/taskforge-execute`:
- Assemble context → route model → execute → self-review → check acceptance criteria → write handoff → silent error scan → validate

### Handoff: Always ON (v2)

Every completed task gets a handoff written to `handoffs/{task-id}.json`. This is no longer conditional.
Handoff content: what was built, key decisions made, anything the next task needs to know.

### Failure Handling

- Do not stop on task failure; continue to the next task
- However, skip tasks that depend on a failed task (marked as skipped)
- If one task fails within a wave, only that task is marked failed; the rest continue

## v2 Guardrail Monitoring

Track guardrail events across the sprint:

- A **guardrail event** is any of: task retry triggered, silent error detected, acceptance criteria partially failed, model fallback applied
- Maintain a running count: `guardrailCount` in memory during the sprint run
- At sprint completion, include the count in the summary and in the `sprint_complete` telemetry event
- If `guardrailCount >= 3`, surface a warning in the sprint summary prompting the user to review `/taskforge-status`

## v2 Silent Error Scan

After each task completes (same as `/taskforge-execute`):

1. Scan the changed files for common silent failure patterns:
   - `TODO`, `FIXME`, `PLACEHOLDER`, `NOT IMPLEMENTED` in new code
   - Functions that always return `null`, `undefined`, or `false`
   - `console.error` / `throw` paths that are unreachable (dead catch blocks)
   - Empty function bodies
2. If any are found, record them as warnings in `handoffs/{task-id}.json` under `silentErrors`
3. Increment `guardrailCount` by the number of issues found
4. Do **not** block execution — surface as warnings only

## v2 Telemetry Logging

Append each event to `telemetry.jsonl` (newline-delimited JSON, one object per line).

### Event: task_start
```json
{"t":"2026-04-19T10:23:00Z","event":"task_start","taskId":"M1-S1-T3","wave":1,"model":"sonnet","size":"feature","referencesInjected":["ui-pattern.html"],"cotUsed":true,"manifestFiles":5}
```
- `size`: `"tiny"` | `"normal"` | `"feature"` | `"milestone"` (matches plan task size)
- `referencesInjected`: array of reference file paths injected into context
- `cotUsed`: whether a CoT template from `prompts/cot/` was injected
- `manifestFiles`: total number of files read from `contextManifest`

### Event: task_end
```json
{"t":"2026-04-19T10:41:00Z","event":"task_end","taskId":"M1-S1-T3","outcome":"pass","retryCount":0,"tokens":12450,"costUSD":0.42,"wallMin":18}
```
- `outcome`: `"pass"` | `"fail"` | `"skip"`
- `retryCount`: number of retries before outcome (0 = first-try pass)

### Event: sprint_complete
```json
{"t":"2026-04-19T10:45:00Z","event":"sprint_complete","sprintId":"M1-S1","tasksCompleted":5,"tasksFailed":0,"totalCostUSD":1.2,"guardrailEvents":0}
```

Write to `_workspace/projects/{projectId}/telemetry.jsonl`. Create the file if it does not exist. Never overwrite — always append.

## Sprint Completion: User Summary (v2)

After all tasks in the sprint complete, display:

```
스프린트 M1-S1 "캔버스 셋업" 완료

  Wave 1 (병렬): HTML 뼈대 ✅ CSS 리셋 ✅
  Wave 2 (병렬): 게임 루프 ✅ 입력 처리 ✅
  Wave 3: 통합 연결 ✅

  소요: 4분 35초 | 비용: $0.15 | 가드레일 발동: 0회

  다음 단계:
  → 스프린트 검증이 백그라운드에서 진행 중 (결과는 /taskforge-status에서 확인)
  → 다음 스프린트로 자동 진행 중...
```

If `guardrailCount >= 3`, append:
```
  ⚠️  이번 스프린트에서 가드레일이 여러 번 발동됐습니다. /taskforge-status로 확인하세요.
```

## Sprint Boundary: Async Validation + Auto-Refresh (built-in)

At every sprint boundary:

1. **Launch sprint validation in the background** (`/taskforge-validate sprint`, async). It is advisory only and must NOT block the next sprint. Results land in `validations/sprint-{id}.json` with `status: "advisory"`. Failures become warnings carried into the next milestone gate.
2. **Refresh the follow-up plan** (below).
3. **Immediately start the next sprint's Wave 1** — do not wait for the background validation to finish.

This is the core change that makes wave parallelism work across sprint boundaries: the executor never stalls on sprint review.

### Auto-Refresh

After a sprint completes, automatically refresh the follow-up plan:

1. Read all handoffs from the completed sprint (design decisions, issues discovered)
2. Check remaining tasks — do any `plan` fields need updating based on what actually happened?
3. If changes needed:
   - Modify task plans to reflect actual design decisions
   - Add tasks if new work was discovered
   - Remove tasks if work is no longer needed
   - Show the user a brief change summary
4. If no changes needed: proceed silently

Plan refresh happens automatically at sprint boundaries. No separate refresh command needed.

## Milestone Completion: User Guidance (v2)

When the final sprint of a milestone completes, display:

```
마일스톤 M1 모든 스프린트 완료!

권장 순서:
1. /taskforge-validate milestone — 자동 품질 검증
2. /taskforge-playtest — 직접 플레이해서 확인
3. /taskforge-retro — 회고 + 다음 마일스톤 계획 업데이트
```

Then **halt**. Do not start the next milestone automatically. The user must run `/taskforge-validate milestone` first.

## Stopping

If the user says "stop", "halt", "pause", or similar mid-execution, stop after the current task completes.
Then use `/taskforge-execute` to continue one at a time, or `/taskforge-execute-all` to resume continuous execution.

## Notes

- Auto-execution runs through sprints continuously within a single milestone. Sprint validation is async and advisory, so the executor flows from one sprint into the next without stopping.
- Halt automatically at the **milestone boundary** — that is the blocking validation gate. Guide the user to run `/taskforge-validate milestone` before starting the next milestone.
- Sprint advisories accumulated during the milestone are surfaced in `/taskforge-status` and rolled into the milestone gate review.
- `telemetry.jsonl` is the source of truth for `/taskforge-cost` aggregation.
