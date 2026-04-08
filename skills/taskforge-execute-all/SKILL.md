---
name: taskforge-execute-all
description: Automatically and continuously executes all tasks in the current sprint. Use when the user says "/taskforge-execute-all", "run everything", "run the sprint", "keep going automatically", or similar. Supports wave-based parallel execution and runs through the sprint without stopping.
---

# Execute All — Sprint Auto-Execution (Wave Parallel)

Continuously execute the remaining tasks in the current sprint without stopping.

## Prerequisites

- Same as `/taskforge-execute`

## Behavior

### Wave-Based Parallel Execution (NEW)

If tasks have a `wave` field, execute in wave order:

```
Wave 1: [t1, t2, t3] — no dependencies, parallel execution
  ↓ (after all complete)
Wave 2: [t4, t5] — depends on Wave 1, parallel execution
  ↓ (after all complete)
Wave 3: [t6] — depends on Wave 2, single execution
```

1. Tasks in the same wave are **executed in parallel** using the Agent tool
2. Proceed to the next wave only after all tasks in the current wave complete
3. Tasks without a `wave` field are executed **sequentially** in dependency order

### Execution Flow

For each task, perform the same flow as `/taskforge-execute`:
- Assemble context → route model → execute → self-review → check acceptance criteria → conditional handoff → validate

### Failure Handling

- Do not stop on task failure; continue to the next task
- However, skip tasks that depend on a failed task (marked as skipped)
- If one task fails within a wave, only that task is marked failed; the rest continue

### Result Summary

After all tasks in the sprint complete:

```
Sprint 1.1 "Canvas Setup" complete

  Wave 1 (parallel):
    ✅ Build HTML skeleton (haiku, 32s)
    ✅ Set up CSS styles (haiku, 28s)
  Wave 2 (parallel):
    ✅ Implement game loop (sonnet, 2m 15s)
    ✅ Handle keyboard input (sonnet, 1m 48s)
  Wave 3:
    ✅ Wire up integration (sonnet, 1m 12s)

  Elapsed: 4m 35s (parallel efficiency: 38% faster than sequential)
  Cost: $0.15
  Validation: build ✅ typecheck ✅
  Acceptance: all passed

  → Run `/taskforge-validate` for sprint integration validation
  → Or run `/taskforge-execute-all` to continue with the next sprint
```

## Stopping

If the user says "stop", "halt", "pause", or similar mid-execution, stop after the current task completes.
Then use `/taskforge-execute` to continue one at a time, or `/taskforge-execute-all` to resume continuous execution.

## Sprint Boundary: Auto-Refresh (built-in)

After a sprint completes and validation passes, automatically refresh the follow-up plan:

1. Read all handoffs from the completed sprint (design decisions, issues discovered)
2. Check remaining tasks — do any `plan` fields need updating based on what actually happened?
3. If changes needed:
   - Modify task plans to reflect actual design decisions
   - Add tasks if new work was discovered
   - Remove tasks if work is no longer needed
   - Show the user a brief change summary
4. If no changes needed: proceed silently

This replaces the old `/taskforge-refresh` — it happens automatically at sprint boundaries.

## Notes

- Auto-execution runs one sprint at a time only. Do not auto-run an entire milestone at once.
  Reason: Validation and plan refreshes are needed between sprints.
- Always stop at the end of a sprint and guide the user to validate.
