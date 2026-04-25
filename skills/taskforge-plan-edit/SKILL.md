---
name: taskforge-plan-edit
description: Edits the project plan (milestones/sprints/tasks). Use when the user says "/taskforge-plan-edit", "edit the plan", "add a task", "remove this", "reorder", "change difficulty", "adjust wave", or similar.
model: opus
---

# Plan Edit — Plan Editing

Edit the project plan according to user requests.

## Prerequisites

- A project with a plan must exist under `_workspace/projects/{projectId}/`
- **Project selection**: Same as `/taskforge-execute` — auto-select if only one, ask if multiple
- All file paths below are relative to `_workspace/projects/{projectId}/`
- If no plan exists: "Please create a plan first with `/taskforge-plan`"

## Supported Edits

### Task Level
- **Add**: "Add a task to sprint {id}" → Insert task into that sprint
- **Remove**: "Remove the {taskName} task" → Delete the task + clean up dependencies
- **Modify**: "Change {taskName} to hard" → Update difficulty/model/plan, etc.
- **Move**: "Move this task to sprint {id}" → Move between sprints
- **Merge**: "Merge these two" → Combine tasks
- **Split**: "Split this task into two" → Divide a task

### Per-Field Editing Guide

| Field | Notes when editing |
|-------|--------------------|
| difficulty/model | Changing difficulty updates the task's code-writing model (easy=haiku, medium=sonnet, hard=sonnet). Opus is never assigned to a task's code-writing model — it's reserved for judgment work (planning, orchestration, propagation). If a task is harness mode, the orchestrator runs on opus automatically; the task's `model` field still controls the worker code-writing model. |
| wave | Verify no file conflicts within the same wave. Must align with dependency relationships |
| dependencies | Adding/removing requires recalculating wave numbers |
| acceptanceCriteria | Write as verifiable statements (file exists, content present, build passes, etc.) |
| mustHaves | Maintain structure: truths (observable), artifacts (file paths), keyLinks (connections) |
| skills | Use valid skill names from `harnesses/INDEX.md` |
| executionMode | When changing to "harness", also specify harnessId |
| contextManifest (v2) | List of `{ path, priority }` — files read by the task in priority order. Lower priority = read first. Paths relative to project root. |
| cotTemplate (v2) | Optional path to a CoT scaffold under `prompts/cot/`. Only set for tasks involving complex judgment. |
| guardrails (v2) | `{ maxTurns, maxCostUSD, maxWallTimeMin }`. Defaults 20 / $2.00 / 35. Raise only with clear justification. |
| estimatedMinutes (v2) | Must be ≤35. If editing pushes it over, split the task. |

### Sprint Level
- **Add/remove/rename/reorder**
- **Edit validation strategy**

### Milestone Level
- **Add/remove/rename/reorder**
- **Edit validation strategy**

## Post-Edit Processing

1. **Auto-clean dependencies**: Update dependencies of tasks that depended on removed tasks
2. **Recalculate waves**: If dependencies change, recalculate wave numbers
   - Wave 1: Tasks with no dependencies
   - Wave N: Tasks that depend on wave N-1 tasks
3. **Re-sequence IDs** (if needed)
4. **Update statistics**: Update totalTasks, modelDistribution, waveStats
5. **Cross-file propagation check (v2 — mandatory)**: see next section
6. **Record edit history**: Add change record to project-plan.json's editHistory

## Cross-File Propagation (v2 — mandatory)

In v2 the project state is **split across many files**, not one. An edit to `project-plan.json` often makes one of the sibling files stale. Before finishing, walk through this checklist for every change. Do not skip it — silent drift between these files is the #1 source of "갱신 안 된 부분" complaints.

| Change type | Files to re-check | What to look for |
|-------------|-------------------|------------------|
| Add task | `roadmap.json` (active milestone description / openQuestions), `verification.md` (does new task introduce a new completion criterion?), `decisions/` (does it depend on a decision not yet recorded?) | Did the milestone scope just grow? Reflect it. |
| Remove task | `roadmap.json` (description still claims something this task delivered?), `verification.md` (a criterion now unprovable?), `handoffs/` (only for completed tasks — warn user), `decisions/` (decisions whose `영향받는 파일` list pointed to this task) | Did we just delete something the milestone description still promises? |
| Modify scope (`plan`, `description`, `acceptanceCriteria`) | `roadmap.json`, `verification.md`, `constraints.md` (does change violate a hard rule?), `references/` (still relevant?) | Has the meaning of the task drifted from the milestone-level promise? |
| Change difficulty/model | `concept.json` (tech stack still appropriate?) | Usually no propagation needed — local change. |
| Change wave/dependencies | None (local) | Just re-verify no file conflicts within the same wave. |
| Add/remove sprint | `roadmap.json` (milestone description), `verification.md` | Sprint boundaries usually map to user-visible chunks. |
| Add/remove/rename milestone | `roadmap.json` (always), `vision.json` (only if successCriteria affected — warn user, vision is supposed to be unchanging), `concept.json` (usually no), all future milestones' `openQuestions` | Milestone-level changes ripple far. **Always read every other milestone's roadmap entry and decide if it needs an update.** |
| Edit milestone validation strategy | `verification.md`, `spec-card.json` (validationStrategy field) | These two must stay aligned. |

**Propagation rules**:
1. **Always read before deciding.** Open each file in the "Files to re-check" column — do not guess from memory.
2. **Roadmap is the index.** If the active milestone's `description`, `openQuestions`, or `status` is now wrong, update `roadmap.json` even though retro is the usual updater. Plan-edit is allowed to update roadmap when the cause is a plan edit.
3. **Other milestones' roadmap entries.** If a structural change (added/removed/renamed milestone) ripples to other entries' `openQuestions` or `purpose`, update those too. This is the "M3 수정 → M1234 순회" pattern that v1 did automatically and v2 must do explicitly.
4. **Decisions can be invalidated.** If a removed/changed task is referenced in any `decisions/D*.md` `영향받는 파일` list, mark that decision as needing review (add a `검토 필요: {date} — {reason}` line).
5. **Vision is sacred.** If a change seems to require editing `vision.json`, **stop and ask the user**. Do not auto-edit vision.
6. **Show the propagation report to the user** before saving (see Output Format).

If no other files need changes, say so explicitly: `Cross-file check: 영향받는 다른 파일 없음.` This proves the check was done, not skipped.

## Output Format

### Update project-plan.json

Change only the modified fields and append a change record to the `editHistory` array:

```json
{
  "editHistory": [
    {
      "editedAt": "{ISO-8601}",
      "changes": [
        { "type": "add_task", "target": "{taskId}", "description": "{what was added}" },
        { "type": "modify_task", "target": "{taskId}", "field": "{fieldName}", "from": "{oldValue}", "to": "{newValue}" }
      ]
    }
  ]
}
```

### Output Change Summary

Use this structure (fill from actual edits — do not copy literal labels):

```
Plan updated:
  [+] Task added: "{task name}" ({task id}, {difficulty}/{model}, wave {n})
  [~] {field} changed: "{task name}" {from}→{to}
  [↻] Wave recalculated: Sprint {id} (wave {n}→{m})

  Before: {n} tasks | {model breakdown}
  After:  {n} tasks | {model breakdown}

함께 갱신된 파일 (cross-file propagation):
  [↻] {file path} — {what was updated and why}
  [—] {file path}, {file path} — 영향 없음

  변경사항이 반영됐어요. 추가로 고칠 부분이 있으면 말해주세요, 없으면 /taskforge-execute로 진행하세요.
```

Markers: `[+]` add, `[-]` remove, `[~]` modify, `[↻]` recalculated/propagated, `[—]` checked, no change.

If a file *would* need a vision-level change, do not auto-edit. Instead show:

```
⚠️ 이 수정이 vision.json까지 영향을 줄 수 있어요:
  - successCriteria의 "{항목}"이 이번 변경과 모순돼 보입니다.
  vision은 함부로 바꾸면 안 되는 파일이라 사용자 확인이 필요해요. 어떻게 할까요?
  - vision은 그대로 두고 이 변경을 취소
  - vision도 함께 업데이트 (이유 설명 필요)
```

## Notes

- Ask for clarification if the edit request is ambiguous
- For restructuring an entire milestone, suggest running `/taskforge-retro` first (if the milestone is finishing) or re-running `/taskforge-plan` (if the plan needs full regeneration)
- Warn when trying to modify an already-completed task: "이 작업은 이미 완료됐어요. 수정하면 handoff와 검증 결과가 무효화됩니다. 진행할까요?"
- Editing tasks in an in-progress sprint also requires updating execution-state
- If `estimatedMinutes` is raised above 35, automatically suggest splitting the task instead
