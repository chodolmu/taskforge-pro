---
name: taskforge-validate
description: Automatically validates code. Use when the user says "/taskforge-validate", "check the build", "validate the code", "run automated validation", "run tests", or similar. AI automatically runs build, type check, lint, acceptance criteria, and goal-backward validation at the task/sprint level. Use "/taskforge-verify" for user-driven manual confirmation (interactive UAT), and "/taskforge-audit" for comprehensive milestone audits.
---

# Validate — Validation Runner (Goal-Backward Enhanced)

Validate the work output of the project. Three-level validation framework + goal-backward analysis.

**Core principle**: Task complete ≠ Goal achieved. Tasks can be marked "done" with placeholders, so validate backward from the goal to confirm it actually works.

## Gating Policy (IMPORTANT)

| Level | Gating | Rationale |
|-------|--------|-----------|
| Task | **inline / blocking** | Cheap; catches local breakage immediately |
| Sprint | **async / non-blocking** | Advisory only — runs in background, does NOT stall the next sprint. Preserves wave parallelism across sprint boundaries |
| Milestone | **blocking gate** | This is where goal-backward + cross-regression decide whether to ship. Sprint warnings accumulated since the last gate roll into this review |

Sprint validation must never block `/taskforge-execute-all` from continuing into the next sprint. Surface warnings in the result file; the milestone gate is the enforcement point.

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

### 2. Sprint Validation (after sprint completes — ASYNC, non-blocking)

**Run mode**: This validation is launched in the background and does NOT block the next sprint from starting. Results are written to `_workspace/validations/sprint-{id}.json` with `status: "advisory"`. Failures here become warnings — they are surfaced in `/taskforge-status` and rolled into the next milestone gate. Only the milestone gate can halt progression.

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

### 3. Milestone Validation (cross-regression — BLOCKING gate)

**Run mode**: This is the only blocking validation. The next milestone cannot start until this passes. Any sprint-level advisory warnings accumulated since the last milestone gate are pulled in and reviewed here.

When a milestone is complete, cross-reference three sources to verify nothing is missing:

| Source | What to check |
|--------|--------------|
| **Plan** (project-plan.json) | Each task's mustHaves, acceptanceCriteria |
| **Handoffs** (handoffs/*.json) | Actual work performed, changed files, known issues |
| **Code** (actual filesystem) | File existence, connections (import/export), behavior |

**Flow:**

1. Collect mustHaves from all tasks within the milestone (truths, artifacts, keyLinks)

2. Artifact validation:
   - `[VERIFIED]` — exists, has content
   - `[STUB]` — exists but contains only TODOs
   - `[MISSING]` — file not found
   - `[ORPHANED]` — exists but not imported anywhere

3. Wiring validation:
   - `[WIRED]` — import + actual usage confirmed
   - `[PARTIAL]` — imported but unused
   - `[NOT_WIRED]` — has exports but no imports

4. Truth validation — synthesize artifact + wiring results for each truth

5. Anti-pattern scan across entire codebase (TODO/FIXME, empty bodies, console.log, hardcoded secrets)

6. Handoff cross-check — verify all `knownIssues` from handoffs are resolved

Save to `_workspace/validations/audit-milestone-{id}.md`

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

- **Task validation failure** (inline/blocking): Guide to retry with `/taskforge-retry`. The task does not count as complete.
- **Sprint validation failure** (async/advisory): Do NOT halt execution. Record warnings in `sprint-{id}.json` with `status: "advisory"`, surface them in `/taskforge-status`, and carry them into the next milestone gate. The user is notified but the next sprint proceeds.
- **Milestone validation failure** (blocking): Opus full review → suggests fix sprint that addresses both the milestone failures and any accumulated sprint advisories → user confirmation required before continuing.

## Usage

```
/taskforge-validate              → Auto-detect the most recently completed unit and validate it
/taskforge-validate sprint       → Validate the current sprint (includes goal-backward)
/taskforge-validate task m1-s1-t3 → Validate a specific task
/taskforge-validate milestone    → Redirect to /taskforge-audit (milestones use audit)
```
