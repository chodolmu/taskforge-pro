---
name: taskforge-plan-edit
description: Edits the project plan (milestones/sprints/tasks). Use when the user says "/taskforge-plan-edit", "edit the plan", "add a task", "remove this", "reorder", "change difficulty", "adjust wave", or similar.
---

# Plan Edit — Plan Editing

Edit the project plan according to user requests.

## Prerequisites

- `_workspace/project-plan.json` must exist
- If missing: "Please create a plan first with `/taskforge-plan`"

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
| difficulty/model | Changing difficulty also updates model automatically (easy=haiku, medium=sonnet, hard=opus) |
| wave | Verify no file conflicts within the same wave. Must align with dependency relationships |
| dependencies | Adding/removing requires recalculating wave numbers |
| acceptanceCriteria | Write as verifiable statements (file exists, content present, build passes, etc.) |
| mustHaves | Maintain structure: truths (observable), artifacts (file paths), keyLinks (connections) |
| skills | Use valid skill names from `harnesses/INDEX.md` |
| executionMode | When changing to "harness", also specify harnessId |

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
  [+] Task added: "Error handling" (m1-s2-t4, medium/sonnet, wave 2)
  [~] Difficulty changed: "Jump physics" medium→hard (sonnet→opus)
  [↻] Wave recalculated: Sprint 1.2 (wave 1→2→3)

  Before: 24 tasks | haiku 8 / sonnet 12 / opus 4
  After:  25 tasks | haiku 8 / sonnet 11 / opus 6

  Approve with `/taskforge-plan-approve` to start execution
  Let me know if you need more changes
```

## Notes

- Ask for clarification if the edit request is ambiguous
- For large-scale changes (e.g., restructuring an entire milestone), suggest `/taskforge-pivot`
- Warn when trying to modify an already-completed task: "This task is already complete. Modifying it will invalidate the handoff and validation results. Proceed?"
- Editing tasks in an in-progress sprint also requires updating execution-state
