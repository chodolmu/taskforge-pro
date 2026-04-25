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

Template — fill values from project state. Do not copy literal example labels.

```
프로젝트: {projectName}
비전: {vision.elevator}
현재 마일스톤: {activeMilestoneId} — {activeMilestoneTitle}

마일스톤 진행:
  {M0}: {title} ✅ 완료
  {M1}: {title}  [████████░░] {n}% — 현재 작업 중
  {M2}: {title}  ⏳ 대기 (sketch)
  {M3}: {title}  ⏳ 대기 (name-only)

{activeMilestoneId} 상세:
  ├─ 스프린트 1: {sprintName}  ✅ 완료 (검증 통과)
  │   ├─ {taskName}       ✅ {difficultyLabel} ({duration}, ${cost})
  │   └─ {taskName}       ✅ {difficultyLabel} ({duration}, ${cost})
  ├─ 스프린트 2: {sprintName}   🔄 진행 중
  │   ├─ {taskName}         ✅ {difficultyLabel} ({duration}, ${cost})
  │   ├─ {taskName}      → 🔄 실행 중 ({difficultyLabel}/{model})
  │   └─ {taskName}           ⏳ 대기
  └─ 스프린트 3: {sprintName}    ⏳ 대기

레퍼런스: {n}개 수집됨 (references/ 디렉토리)
경고: 스프린트 {n} — {issueDescription} ({file}:{line})
가드레일: 이번 마일스톤 {n}회 발동

전체: {done}/{total} 완료 ({pct}%)
비용: ${total} (추정 남은 비용: ~${remaining})
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

Use `/taskforge-status detail` or `/taskforge-status {taskId}` for detailed info on a specific item.

Template:
```
Task: {taskName}
Status: {statusIcon} {statusLabel}
Model: {model} | Elapsed: {duration} | Cost: ${cost}

Plan:
  {plan field — verbatim}

Handoff:
  {whatChanged summary}
  {decisionsMade — if any}
  {hintsForNext — if any}

Validation: {checks with ✅/❌}
```

## Failed Task Display

If there are failed tasks, display them prominently. Template:

```
  ├─ {taskName}              ❌ Failed ({n}x) — {failureReason}
  │   → `/taskforge-execute {taskId}` (재시도) 또는 `/taskforge-plan-edit`에서 스킵/수정
```

## Locked Task Display

If tasks have active locks (from other sessions), display them. Template:

```
  ├─ {taskName}                  🔒 Locked (session {sessionId}, since {time})
```

## Multi-Project Overview

If called without a specific project and multiple projects exist, show a summary of all projects. Template:

```
Projects in _workspace/projects/:
  1. {projectId}    [████████░░] {pct}%  — {done}/{total} tasks
  2. {projectId}    [██████████] 100% — complete
  3. {projectId}    [██░░░░░░░░] {pct}%  — {done}/{total} tasks

Use `/taskforge-status {projectId}` for details
```
