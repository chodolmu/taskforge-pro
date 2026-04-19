---
name: taskforge-cost
description: Displays a per-model cost summary. Use when the user says "/taskforge-cost", "cost", "how much did I spend", "token usage", "how much has this cost", or similar. v2 aggregates from telemetry.jsonl.
---

# Cost — Cost Summary (v2)

Summarize costs by model and phase for the project execution, and project remaining costs.

## Prerequisites

- A project with execution state must exist under `_workspace/projects/{projectId}/`
- **Project selection**: Same as `/taskforge-execute` — auto-select if only one, ask if multiple
- All file paths below are relative to `_workspace/projects/{projectId}/`

## Data Sources (v2)

Primary: `telemetry.jsonl` — one JSON object per line. Relevant events:

| Event | Fields used |
|-------|-------------|
| `task_end` | `model`, `costUSD`, `tokens`, `wallMin`, `outcome`, `taskId` |
| `sprint_complete` | `sprintId`, `totalCostUSD`, `guardrailEvents` |
| `guardrail_triggered` | `taskId`, `type`, `value`, `limit` |
| `plan_approved` | `milestoneId`, `estimatedCostUSD` |
| `quick_task` | `costUSD`, `tokens`, `wallMin` |

Fallback (if telemetry.jsonl is missing or empty): `execution-state.json` per-task `cost` fields.

PM calls (plan) and validation (validate) costs are tracked as separate telemetry events and bucketed into "Other" in the summary.

## Estimating Remaining Cost

Project remaining task costs using per-model average rates from completed tasks:

```
Estimated remaining = Σ (average costUSD per model × remaining tasks per model)

Per-model average:
  - Average costUSD of completed haiku tasks × remaining haiku tasks
  - Average costUSD of completed sonnet tasks × remaining sonnet tasks

For models with no completed tasks yet, use default estimates:
  - haiku:  $0.002/task
  - sonnet: $0.04/task
```

Note: execution tasks only use **haiku** or **sonnet**. Opus is reserved for PM (planning) and milestone QA, and is tracked separately under "Other".

## Output Format

```
비용 요약 — Card Battle Game

모델별 (실행):
  haiku:  3 runs,  $0.003  (1%)   | avg $0.001/task
  sonnet: 8 runs,  $0.32   (92%)  | avg $0.04/task
  ─────────────────────────
  Subtotal: 11 runs, $0.323

단계별:
  M0 (프로토타입):   $0.15 (8/8 tasks)    ✅ 완료
  M1 (기본 전투):    $0.17 (3/12 tasks)  🔄 진행 중
  M2 (덱 빌딩):      미시작
  M3 (폴리시):       미시작

기타 (PM/검증, opus):
  계획 (plan):       $0.12
  마일스톤 QA:        $0.00
  스프린트 검증:      $0.03  (자동, sonnet)
  ─────────────────────────
  Subtotal:          $0.15

총 비용:             $0.473

가드레일 발동: 1회 (이번 마일스톤)
  - M1-S1-T3: maxWallTimeMin 초과 (36분)

예상 남은 비용:
  haiku  × 1 = ~$0.001
  sonnet × 8 = ~$0.32
  PM/검증    = ~$0.05
  ─────────────────────────
  남은 예상:   ~$0.37
  총 예상:     ~$0.84
```

## Aggregation Rules

1. **By model (execution)**: group all `task_end` events by `model`, sum `costUSD`, count runs.
2. **By milestone**: group `task_end` events by the `milestoneId` derived from the task's `taskId` prefix (e.g. `M1-S1-T3` → `M1`). Cross-check with `project-plan.json` for total task counts.
3. **Other**: aggregate non-execution events — plan runs, validate runs, milestone QA. These can use opus.
4. **Guardrail summary**: count `guardrail_triggered` events for the current milestone. Show the top 3 offenders (taskId + trigger type).

## When Data Is Unavailable

If neither `telemetry.jsonl` nor `execution-state.json` has cost data yet:
- "아직 실행 내역이 없어서 비용 데이터가 없어요. 태스크가 실행되면 자동으로 기록됩니다."
- Show the plan's `estimatedCostUSD` (from `plan_approved` event) if available, as a rough upfront estimate.

## Notes

- `telemetry.jsonl` is the source of truth. Only fall back to `execution-state.json` when telemetry is missing.
- Opus usage in "Other" is expected and normal — it's the PM model. An opus entry under "모델별 (실행)" would be a bug.
- Guardrail events do not directly add cost, but a high count usually correlates with higher-than-estimated cost for that milestone.
