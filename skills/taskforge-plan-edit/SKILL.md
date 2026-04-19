---
name: taskforge-plan-edit
description: Edits the project plan (milestones/sprints/tasks). Use when the user says "/taskforge-plan-edit", "edit the plan", "add a task", "remove this", "reorder", "change difficulty", "adjust wave", or similar.
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
- **Add**: "Add a task to sprint 1.2" → Insert task into that sprint
- **Remove**: "Remove the HTML skeleton task" → Delete the task + clean up dependencies
- **Modify**: "Change jump physics to hard" → Update difficulty/model/plan, etc.
- **Move**: "Move this task to sprint 1.3" → Move between sprints
- **Merge**: "Merge these two" → Combine tasks
- **Split**: "Split this task into two" → Divide a task

### Per-Field Editing Guide

| Field | Notes when editing |
|-------|--------------------|
| difficulty/model | Changing difficulty also updates model automatically (easy=haiku, medium=sonnet, hard=sonnet). Opus is reserved for PM/validation — never assign opus to an execution task. |
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
5. **Record edit history**: Add change record to project-plan.json's editHistory

## Output Format

### Update project-plan.json

Change only the modified fields and append a change record to the `editHistory` array:

```json
{
  "editHistory": [
    {
      "editedAt": "2026-04-07T...",
      "changes": [
        { "type": "add_task", "target": "m1-s2-t4", "description": "Add error handling" },
        { "type": "modify_task", "target": "m1-s1-t3", "field": "difficulty", "from": "medium", "to": "hard" }
      ]
    }
  ]
}
```

### Output Change Summary

```
Plan updated:
  [+] Task added: "Error handling" (M1-S2-T4, medium/sonnet, wave 2)
  [~] Difficulty changed: "Jump physics" medium→hard (both use sonnet)
  [↻] Wave recalculated: Sprint 1.2 (wave 1→2→3)

  Before: 24 tasks | haiku 8 / sonnet 16
  After:  25 tasks | haiku 8 / sonnet 17

  변경사항이 반영됐어요. 추가로 고칠 부분이 있으면 말해주세요, 없으면 /taskforge-execute로 진행하세요.
```

## Notes

- Ask for clarification if the edit request is ambiguous
- For restructuring an entire milestone, suggest running `/taskforge-retro` first (if the milestone is finishing) or re-running `/taskforge-plan` (if the plan needs full regeneration)
- Warn when trying to modify an already-completed task: "이 작업은 이미 완료됐어요. 수정하면 handoff와 검증 결과가 무효화됩니다. 진행할까요?"
- Editing tasks in an in-progress sprint also requires updating execution-state
- If `estimatedMinutes` is raised above 35, automatically suggest splitting the task instead
