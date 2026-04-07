---
name: taskforge-validate
description: Automatically validates code. Use when the user says "/taskforge-validate", "check the build", "validate the code", "run automated validation", "run tests", or similar. AI automatically runs build, type check, lint, acceptance criteria, and goal-backward validation at the task/sprint level. Use "/taskforge-verify" for user-driven manual confirmation (interactive UAT), and "/taskforge-audit" for comprehensive milestone audits.
---

# Validate — Validation Runner (Goal-Backward Enhanced)

Validate the work output of the project. Three-level validation framework + goal-backward analysis.

**Core principle**: Task complete ≠ Goal achieved. Tasks can be marked "done" with placeholders, so validate backward from the goal to confirm it actually works.

## 3-Level Validation

### 1. Task Validation (automatic, on every task completion)

Run items specified in the task's `validation.auto`:

| Item | Behavior |
|------|----------|
| build | Run the project build |
| typecheck | TypeScript type check (if applicable) |
| lint | Run linter (if applicable) |
| test | Run test suite (if applicable) |
| run | Run and verify no errors |

**+ Acceptance Criteria Validation** (NEW):

Check each item in the task's `acceptanceCriteria` array:
- File existence → verify with `ls`
- Content presence → verify with `grep`
- Build/run results → run the command

```
Validation: build ✅ typecheck ✅
Acceptance:
  ✅ src/index.html file exists
  ✅ Contains <!DOCTYPE html> tag
  ❌ Contains <canvas> tag → missing
```

If any item fails, treat the task as incomplete.

### 2. Sprint Validation (after sprint completes)

Integration validation according to the sprint's `validationStrategy`:

1. Re-run all automated validation items (build, type check, etc.)

2. **Goal-Backward Validation** (NEW):

   Collect `mustHaves` from all tasks in the sprint:

   **Step 1 — Truths**: Things that must be true to achieve the goal
   ```
   [SATISFIED]   "Card list is displayed on the main page"
   [PARTIAL]     "Click card navigates to detail page" → missing route in routes.js
   [UNSATISFIED] "Search works" → SearchBar.jsx is a stub
   ```

   **Step 2 — Artifacts**: Files that must exist
   ```
   [VERIFIED]  src/index.html — exists, has content
   [STUB]      src/Search.jsx — exists but contains only TODOs
   [MISSING]   src/api.js — file not found
   [ORPHANED]  src/old.js — not imported anywhere
   ```

   **Step 3 — Key Links**: Verify actual connections
   ```
   [WIRED]      App.jsx → Detail.jsx (import + used in routes)
   [NOT_WIRED]  auth.js → has exports but no imports
   ```

3. **Anti-Pattern Scan** (NEW):
   Detect risky patterns in files changed during the sprint:
   - `TODO` / `FIXME` / `HACK` comments
   - Empty function bodies (`{}` or `pass`)
   - Placeholder text ("Lorem ipsum", "TODO: implement")
   - `console.log` / `print()` debug code
   - Hardcoded secret patterns

4. Code review with Sonnet:
   - Read all changed files and evaluate code quality, consistency, and potential bugs

5. Generate results report (using verification-report template)

### 3. Milestone Validation → Delegated to `/taskforge-audit`

Milestone-level validation is handled by the `/taskforge-audit` skill. When a milestone is complete:
- "Run `/taskforge-audit` for milestone validation (3-source cross-validation + regression audit)"
- If `/taskforge-validate milestone` is called, automatically redirect to `/taskforge-audit` guidance

## Saving Validation Results

`_workspace/validations/{target-type}-{target-id}.json`:

```json
{
  "targetType": "sprint",
  "targetId": "m1-s1",
  "passed": true,
  "results": [
    { "check": "build", "passed": true, "message": "" },
    { "check": "typecheck", "passed": true, "message": "" },
    { "check": "code-review", "passed": true, "message": "Code quality good" }
  ],
  "goalBackward": {
    "truths": { "satisfied": 5, "partial": 1, "unsatisfied": 0 },
    "artifacts": { "verified": 8, "stub": 0, "missing": 0, "orphaned": 1 },
    "wiring": { "wired": 6, "partial": 1, "notWired": 0 }
  },
  "antiPatterns": [
    { "file": "src/utils.js", "line": 42, "type": "TODO", "content": "// TODO: error handling" }
  ],
  "validatedBy": "auto+sonnet+goal-backward",
  "validatedAt": "2026-04-07T16:00:00Z"
}
```

## On Failure

- **Task validation failure**: Guide to retry with `/taskforge-retry`
- **Sprint validation failure**: Opus analyzes failure cause → auto-suggests fix tasks → execute after user approval
- **Milestone validation failure**: Opus full review → suggests fix sprint → user confirmation

## Usage

```
/taskforge-validate              → Auto-detect the most recently completed unit and validate it
/taskforge-validate sprint       → Validate the current sprint (includes goal-backward)
/taskforge-validate task m1-s1-t3 → Validate a specific task
/taskforge-validate milestone    → Redirect to /taskforge-audit (milestones use audit)
```
