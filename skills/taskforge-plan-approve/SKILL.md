---
name: taskforge-plan-approve
description: Finalizes the project plan and transitions it to an executable state. Use when the user says "/taskforge-plan-approve", "approve the plan", "proceed with this", "finalize", or similar.
---

# Plan Approve — Plan Approval

Finalize the project plan and transition it to an executable state.

## Prerequisites

- `_workspace/project-plan.json` must exist

## Approval Process

1. Show a final summary of the current plan one more time:
   - Number of milestones, sprints, and tasks
   - Model distribution (how many haiku/sonnet/opus each)
   - Estimated cost breakdown
   
2. Get final confirmation from the user

3. On approval:
   - Add `"status": "approved"` and `"approvedAt"` to `_workspace/project-plan.json`
   - Initialize `_workspace/execution-state.json`:
     ```json
     {
       "projectId": "...",
       "status": "ready",
       "currentMilestone": null,
       "currentSprint": null, 
       "currentTask": null,
       "completedTasks": [],
       "failedTasks": [],
       "skippedTasks": [],
       "totalCost": 0,
       "startedAt": null
     }
     ```

4. Guide the user: "Plan approved. Start the first task with `/taskforge-execute`!"
