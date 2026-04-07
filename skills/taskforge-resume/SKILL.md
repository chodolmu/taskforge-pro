---
name: taskforge-resume
description: Picks up the project in a new session. Use when the user says "/taskforge-resume", "resume", "where did we leave off", "continue the project", or similar. Used to resume previous work when starting a new conversation session.
---

# Resume — Project Resumption

Continue previous work in a new session.
Load only the necessary context quickly, without reading the full history.

## Behavior

1. Load project state from the `_workspace/` directory:
   - `spec-card.json` — Project definition
   - `project-plan.json` — Work plan
   - `execution-state.json` — Execution state

2. Determine current state:
   - What stage the project is at (planning/executing/validating)
   - Last completed task
   - Failed/skipped tasks
   - Next task to execute

3. Load the most recent handoff:
   - Handoff from the last completed task
   - Recent design decisions

4. Output summary:

```
Resuming project: Chrome Dino Game Clone

Progress: 8/24 tasks complete (33%)
Last task: "Jump physics" (✅ complete, sonnet)
Current position: Milestone 1 > Sprint 1.2 > Task 3/3

Recent design decisions:
- deltaTime-based physics (frame-independent)
- Canvas context globally cached

Next task: "Duck action" [medium/sonnet]

→ Run `/taskforge-execute` to start the next task
→ Run `/taskforge-status` to view full progress
```

## Notes

- If `_workspace/` doesn't exist: "No project found. Start a new project with `/taskforge-discover`"
- If a plan exists but hasn't been approved: "Please approve the plan with `/taskforge-plan-approve`"
- If only a spec-card exists (no plan): "Please create a work plan with `/taskforge-plan`"
