---
name: taskforge-execute
description: Executes the next available task. Use when the user says "/taskforge-execute", "next task", "run", "go ahead", or similar. This is the core skill for executing tasks one at a time after the plan is approved. Supports wave parallelism and acceptance criteria validation.
---

# Execute — Task Execution (Wave Parallel + Acceptance Criteria)

Find the next executable task in the plan and run it. Core principle: **Clean context, clear plan, right model.**

## Prerequisites

- `_workspace/project-plan.json` (status: approved)
- `_workspace/execution-state.json`
- If missing: "Please approve the plan first with `/taskforge-plan-approve`"

## Execution Flow

### 1. Select the Next Task

Find the next task to run from the execution-state:
- The earliest task in order that has all dependencies completed
- Exclude tasks already completed/failed/skipped

**Wave Parallelism Detection** (NEW):
If multiple tasks share the same wave number and all dependencies are satisfied:
- "Wave {n} has {count} tasks that can run in parallel. Would you like to run them in parallel?"
- On user approval: run in parallel using the Agent tool
- On refusal: run sequentially

### 2. Assemble Context

Prepare the minimal context needed for task execution:

```
What gets injected:
  1. Task plan (plan field) — what to do and how
  2. Dependent task handoffs — only what's necessary from prior work
  3. Project file tree — for understanding current code structure
  4. Project conventions — _workspace/conventions.md (colors, naming, patterns)
  5. Validation conditions — what to verify after completion
  6. Domain skills — domain expertise from the skills field (only when present)
  7. Decision record — contexts/sprint-{id}.md (only when present)
  8. Acceptance criteria — completion conditions

What does NOT get injected:
  - Full conversation history
  - Detailed content of other tasks
  - Logs from previous sessions
```

Why this matters: When context grows too long, AI starts ignoring early instructions and quality degrades. Starting fresh each time maintains consistent quality.

### 3. Model Routing

Use the appropriate model based on the task's `model` field:
- `haiku`: Simple work. Fast and cheap.
- `sonnet`: General and complex implementation. The plan already provides detailed specs, so sonnet handles both medium and hard tasks.

Note: Opus is reserved for planning/validation phases (PM, Discovery, Milestone QA), not for task execution. All execution tasks use haiku or sonnet.

### 4. Execution

#### single mode (default)
Execute the task plan directly using the assigned model.
Write code, create/modify files.

#### single + skills mode
Same as single, but inject the domain skills specified in the `skills` field into the context.
Skills are loaded from `harnesses/`. Search path:
1. `harnesses/*/skills/{skill-name}/skill.md` — search by skill name across all categories
2. Also includes agent skills inside harnesses
Even without using a full harness, injecting just the skill's expertise raises quality.

#### harness mode
Load the harness specified in the task and execute via multi-agent collaboration.
Harness load path: `harnesses/{category}/{harness-name}/`
Agents within the harness divide the work by role.

### 5. Self-Review

After writing code, **re-read the changed files** and check:
- Does the code match the task plan?
- Are acceptance criteria actually met (not just "I think I did it")?
- Any obvious bugs, missing imports, or broken references?

This happens in the same execution context — no extra agent, no extra pipeline. Just "read what you wrote before saying you're done." Catches issues that would otherwise require a retry (which costs far more tokens than a quick re-read).

### 6. Acceptance Criteria Validation

```
Acceptance Criteria Check:
  ✅ src/index.html file exists
  ✅ Contains <!DOCTYPE html> tag
  ❌ Contains <canvas id="game"> tag
```

If any criteria fail:
- Agent automatically attempts a fix (1 time)
- If still failing after retry, report to the user

### 7. Platform-Specific Validation

Refer to `validationStrategy` in `_workspace/spec-card.json` to run **project-appropriate validation**.
Instead of hardcoded `build`, `typecheck`, follow the strategy defined in discover.

| Validation item | spec-card field | Behavior |
|----------------|----------------|----------|
| Build | `validationStrategy.build` | Run `.command`; auto if `.auto` is true |
| Run check | `validationStrategy.run` | Run `.command`, check error code |
| Quality check | `validationStrategy.quality` | Run `.command` |
| Functional check | `validationStrategy.functional` | If `.auto` is false, present checklist to user |

**If spec-card has no validationStrategy** (legacy compatibility):
Use the legacy method — run items in the `validation.auto` field: `["build", "typecheck", "lint"]`.

**If there are manual validation items**:
```
Automated validation complete. Manual confirmation needed:
  □ Verify scene load
  □ Verify basic controls
  □ No console errors
→ After confirming, run `/taskforge-execute` to proceed to the next task
```

### 8. Completion Processing

After execution:

1. **Generate Handoff**: Automatically call `/taskforge-handoff` to record the work history
2. **Platform validation**: Run validation per spec-card's validationStrategy
3. **Acceptance Criteria check**: Verify all completion criteria are met
4. **Update state**: Transition task status in execution-state.json:
   - `ready` → `in_progress` (on execution start)
   - `in_progress` → `completed` (on validation pass)
   - `in_progress` → `failed` (on validation failure or error)
   - `blocked` → `ready` (automatically when dependency completes)
   - Also record `startedAt`, `completedAt`, `failedAt` timestamps on transition
5. **Report result**: Brief report to the user

```
✅ Task complete: "Build HTML skeleton" (haiku, 45s, $0.002)
   Files changed: src/index.html
   Validation: build ✅ typecheck ✅
   Acceptance: 3/3 ✅
   
   Next task: "Implement game loop" [medium/sonnet]
   → Run `/taskforge-execute` to continue, or `/taskforge-status` to check overall progress
```

### 9. On Failure

When validation fails or an error occurs:
- Record the failure reason
- Increment retry_count

**Auto-retry (built-in):**
1. Add the failure reason to context: "Previous attempt failed because: [reason]. Avoid this approach."
2. Re-execute in the same session (no new agent needed)
3. If failed 2 times in a row, stop and ask the user:
   ```
   ⚠️ Task failed 2 times.
   Failure reason: [summary]
   
   Options:
   - Try once more (different approach)
   - Skip this task and move on
   - Fix it yourself, then run `/taskforge-execute` to continue
   ```

**Skip (built-in):**
When the user says "skip" or "move on":
1. Check if downstream tasks depend on this task
2. If yes: warn and ask whether to also skip dependents or remove the dependency
3. Set task status to `skipped` with reason and timestamp
4. Continue to the next task

## Sprint/Milestone Completion Detection

After a task completes, if all tasks in that sprint are complete:
- "Sprint [name] complete! Run `/taskforge-validate` for integration validation."

If all sprints in a milestone are complete:
- "Milestone [name] complete! Run `/taskforge-validate milestone` for full validation."
