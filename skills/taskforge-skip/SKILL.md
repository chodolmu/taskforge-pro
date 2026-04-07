---
name: taskforge-skip
description: Skips a task. Use when the user says "/taskforge-skip", "skip", "skip this one", "pass", "move on", or similar.
---

# Skip — Task Skip

Skip a specific task and move on to the next.

## Behavior

### 1. Identify the Target Task
- `/taskforge-skip` → the current or most recently failed task
- `/taskforge-skip m1-s2-t3` → a specific task

### 2. Confirm the Skip Reason

Ask the user for a reason:

```
Please select the reason for skipping this task:
1. Already handled manually
2. Not needed right now
3. Other reason (enter manually)
```

If the reason is self-evident (e.g., called right after a failure), do not ask — automatically record as "failed → skipped".

### 3. Analyze Dependency Impact

Check whether any downstream tasks depend on this task:

```
⚠️ Skipping this task will affect the following tasks:
- m1-s2-t4 "Collision detection" (depends on this task)

Options:
1. Also skip the dependent tasks
2. Keep dependent tasks (remove the dependency)
3. Cancel
```

### 4. Update State

On confirmation:
- Set task status to `skipped`
- Record the reason in the `skipReason` field
- Record the `skippedAt` timestamp
- Update execution-state.json

```json
{
  "id": "m1-s2-t3",
  "status": "skipped",
  "skipReason": "manual",
  "skippedAt": "2026-04-07T..."
}
```

skipReason values:
- `manual` — Already handled manually
- `not_needed` — Not needed right now
- `failed` — Skipped after failure
- `blocked` — Skipped because a dependency was skipped
- `custom: {reason}` — User-entered reason

### 5. Completion Notice

```
Task "Collision detection" skipped. (Reason: not needed right now)
→ Run `/taskforge-execute` to proceed to the next task
→ To restore it later, change the status with `/taskforge-plan-edit`
```
