---
name: taskforge-pivot
description: Changes the project direction and fully redesigns the remaining plan. Use when the user says "/taskforge-pivot", "change direction", "redesign", "scrap the plan", or similar. Use /taskforge-plan-edit for small tweaks; use this skill for major directional changes.
---

# Pivot — Direction Change (Opus PM)

When a mid-project direction change is needed, fully redesign the remaining plan.
Runs with the Opus model.

## /taskforge-plan-edit vs /taskforge-pivot

| /taskforge-plan-edit | /taskforge-pivot |
|----------------------|-----------------|
| Add/remove/modify a few tasks | Redesign from the milestone structure up |
| Keeps the existing plan framework | Fully restructures the remaining plan |
| "Remove this task" | "Take it in this direction" |

## Behavior

1. Listen to the user's desired direction change:
   - "I want to add multiplayer"
   - "Switch from a web app to a desktop app"
   - "Drop this feature, add this one instead"

2. Opus analyzes:
   - Review already-completed work (do not roll back)
   - Decide how to handle the in-progress sprint
   - Fully redesign remaining milestones/sprints/tasks

3. Present the new plan:
   - Completed work remains in place
   - Changed parts are clearly marked
   - Show before/after comparison as a tree

4. Update `project-plan.json` after user approval

## Notes

- Preserve the outputs of already-completed tasks. Do not roll back.
- If the SpecCard also needs updating, update `spec-card.json` as well.
- After approval, the project is immediately executable without needing `/taskforge-plan-approve` again (since the project is already approved).
