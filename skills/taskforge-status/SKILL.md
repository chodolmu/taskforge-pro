---
name: taskforge-status
description: Displays the full project progress as a tree. Use when the user says "/taskforge-status", "status", "where are we", "progress", or similar. Can be called at any time while a project is in progress.
---

# Status — Progress Display v2

Show the full project progress at a glance in a tree format.

## Prerequisites

- A project must exist under `_workspace/projects/{projectId}/`
- **Project selection**: Same as `/taskforge-execute` — auto-select if only one, ask if multiple
- Required files (under `_workspace/projects/{projectId}/`):
  - `project-plan.json`
  - `execution-state.json` (after execution starts)
- Optional files that enrich the display (v2):
  - `vision.json` or `roadmap.json` — roadmap-level milestone overview
  - `telemetry.jsonl` — real-time cost and speed aggregation
  - `references/` directory — collected reference files
  - `validations/sprint-*.json` — advisory warnings from background validation

## Output Format v2

```
프로젝트: Card Battle Game
비전: 전략적 덱빌딩으로 생각하는 재미를 준다
현재 마일스톤: M1 — 기본 전투 시스템

마일스톤 진행:
  M0: 프로토타입 ✅ 완료
  M1: 기본 전투  [████████░░] 80% — 현재 작업 중
  M2: 덱 빌딩   ⏳ 대기 (sketch)
  M3: 폴리시    ⏳ 대기 (name-only)

M1 상세:
  ├─ 스프린트 1: 카드 렌더링  ✅ 완료 (검증 통과)
  │   ├─ 카드 컴포넌트       ✅ 보통 (2분, $0.04)
  │   └─ 애니메이션          ✅ 보통 (1분, $0.03)
  ├─ 스프린트 2: 전투 로직   🔄 진행 중
  │   ├─ 데미지 계산         ✅ 보통 (1분 30초, $0.03)
  │   ├─ 차례 관리        → 🔄 실행 중 (보통/sonnet)
  │   └─ 승패 판정           ⏳ 대기
  └─ 스프린트 3: UI 통합     ⏳ 대기

레퍼런스: 3개 수집됨 (references/ 디렉토리)
경고: 스프린트 1 — TODO 1개 발견 (src/utils.js:42)
가드레일: 이번 마일스톤 0회 발동

전체: 4/12 완료 (33%)
비용: $0.10 (추정 남은 비용: ~$0.40)
```

## v2 Roadmap Display

If `vision.json` or `roadmap.json` exists in the project directory:

- Show the project `vision` string on the second line (after project name)
- Show all milestones in a "마일스톤 진행:" block with progress bars and status labels
- Milestone status labels:
  - `✅ 완료` — all tasks done and milestone validation passed
  - `[████░░░░░░] N%` — in progress (current milestone)
  - `⏳ 대기 (sketch)` — milestones with a rough plan but no tasks yet
  - `⏳ 대기 (name-only)` — milestones listed by name only in the roadmap
- If no vision/roadmap file exists, skip the roadmap block and show only the current milestone

## v2 Telemetry Summary

Aggregate `telemetry.jsonl` to show real-time cost and speed:

- Sum `costUSD` from all `task_end` events → current total cost
- Compute remaining estimated cost: `(totalCost / tasksCompleted) * tasksRemaining`
- Display as: `비용: $X.XX (추정 남은 비용: ~$Y.YY)`
- If `telemetry.jsonl` does not exist or is empty, fall back to cost from `execution-state.json`

## v2 References Display

If the `references/` directory exists under the project folder:

- Count the files inside
- Display as: `레퍼런스: N개 수집됨 (references/ 디렉토리)`
- If the directory is empty or does not exist, omit this line

## v2 Silent Error Warnings

Aggregate warnings from `handoffs/{task-id}.json` (field: `silentErrors`) across the current milestone:

- Collect all non-empty `silentErrors` arrays from handoff files
- Display each warning as: `경고: 스프린트 N — {description} ({file}:{line})`
- If no silent errors exist, omit the warnings block

## v2 Guardrail Summary

Count guardrail events for the current milestone from `telemetry.jsonl` (field: `guardrailEvents` on `sprint_complete` events):

- Sum across all completed sprints in the current milestone
- Display as: `가드레일: 이번 마일스톤 N회 발동`
- If `N >= 3`, append ` ⚠️` to the line to draw attention

## Detail Mode

Use `/taskforge-status detail` or `/taskforge-status m1-s1-t2` for detailed info on a specific item:

```
Task: Implement game loop
Status: ✅ Complete
Model: sonnet | Elapsed: 2m 15s | Cost: $0.04

Plan:
  requestAnimationFrame-based game loop.
  deltaTime calculation, update/render separated.

Handoff:
  gameLoop() function implemented. Targeting 60fps.
  Separated update(dt) and render(ctx) structure.
  
  Design decision: deltaTime-based physics (frame-independent)
  For next task: ctx is cached as a global variable

Validation: build ✅ | typecheck ✅
```

## Failed Task Display

If there are failed tasks, display them prominently:

```
  ├─ Collision detection              ❌ Failed (2x) — Build error
  │   → `/taskforge-execute M1-S2-T3` (재시도) 또는 `/taskforge-plan-edit`에서 스킵/수정
```

## Locked Task Display

If tasks have active locks (from other sessions), display them:

```
  ├─ Jump physics                  🔒 Locked (session abc123, since 10:30)
  ├─ Duck action                   🔒 Locked (session def456, since 10:32)
```

## Multi-Project Overview

If called without a specific project and multiple projects exist, show a summary of all projects:

```
Projects in _workspace/projects/:
  1. card-battle-ui    [████████░░] 75%  — 18/24 tasks
  2. inventory-system  [██████████] 100% — complete
  3. shop-ui           [██░░░░░░░░] 20%  — 4/20 tasks

Use `/taskforge-status {projectId}` for details
```
