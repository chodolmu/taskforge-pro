---
name: taskforge-refresh
description: Refreshes the follow-up plan after a sprint completes. Use when the user says "/taskforge-refresh", "refresh the plan", "update the remaining plan", or similar. Use after a sprint validation passes, before moving to the next step.
---

# Refresh — Plan Refresh (Opus PM)

After a sprint completes, update the follow-up tasks to reflect the actual results of the work.
Runs with the Opus model.

## Why It's Needed

Plans are made before execution. During actual implementation:
- Design can change ("Used WebSocket instead of REST API")
- Unexpected issues can be discovered
- Tasks can be added or removed

If these changes are not reflected in follow-up tasks, subsequent tasks will operate on incorrect assumptions.

## Behavior

### Input
1. All handoffs from the completed sprint (design decisions, issues, etc.)
2. List of remaining tasks/sprints
3. Original plan (project-plan.json)

### What Opus Does
1. Extract design changes from handoffs
2. Reflect changes in the `plan` field of subsequent tasks
3. As needed:
   - Add tasks (newly discovered work)
   - Remove tasks (work that is no longer needed)
   - Modify tasks (changed plans)
   - Update dependencies
4. Record the reason for each change

### Output

Updated `_workspace/project-plan.json` + change summary:

```
Plan refreshed (based on Sprint 1.1)

Changes:
  Modified: m1-s2-t1 "Dino rendering" — reflects global Canvas context cache
  Added: m1-s2-t4 "Prevent double jump" — issue discovered during testing
  Removed: (none)

Affected tasks: 3
→ Check the updated plan with `/taskforge-status`
```

## Auto-Trigger

After `/taskforge-validate sprint` passes, automatically prompt: "The plan may need refreshing. Would you like to run `/taskforge-refresh`?"
