---
name: taskforge-verify
description: Runs an interactive UAT where the user confirms directly by eye. Use when the user says "/taskforge-verify", "I'll check it myself", "let me test it", "show me", "UAT", "manual testing", or similar. AI guides the expected behavior and the user confirms whether it matches. Use "/taskforge-validate" for automated code validation and "/taskforge-audit" for comprehensive milestone audits.
---

# Verify — Interactive UAT

After a sprint completes, walk through features one by one in conversation with the user.
AI presents "this is how it should behave," and the user confirms and records results.

## Philosophy

**Show the expected behavior, then ask if reality matches.**

AI presents: "Clicking this button should open a modal."
User response:
- "Yes" / "Right" / "Next" → pass
- Anything else → record as issue; severity is automatically inferred by AI (never ask about severity)

## Prerequisites

- All tasks in the target sprint must be in completed state
- If not: "Please complete the sprint first"

## Flow

### 1. Extract Test Items

Extract testable items from the sprint's handoff files.
If server/DB changes are included, add a cold-start smoke test at the front.

### 2. Check for Existing Session

If `_workspace/validations/uat-sprint-{id}.md` already exists:
- "Would you like to continue the previous UAT, or start fresh?"

### 3. Run Tests

Process one test at a time:

```
## Test 1/6: Main Page Load

**Expected behavior**: Opening localhost:3000 in the browser shows the main page with a card layout.
- Navigation bar at the top
- 2-column card grid
- Each card has a title and description

Please confirm →
```

### 4. Record Results

Based on the user's response:

- **pass**: Move to the next test
- **issue**: Record the problem description + auto-infer severity

Severity criteria (automatic):
- **blocker**: Core feature non-functional (page won't load, crash)
- **major**: Main feature misbehaves (data not showing, button not working)
- **minor**: Secondary feature abnormal (sort broken, wrong color)
- **cosmetic**: Visual issue (spacing, font size)

### 5. Diagnose (if issues found)

If an issue is found, run parallel debug agents to investigate the cause.
Record investigation results in the UAT file.

### 6. Save UAT File

Save to `_workspace/validations/uat-sprint-{id}.md`:

```markdown
---
status: complete | partial | testing
sprint: m1-s1
started: 2026-04-07T...
updated: 2026-04-07T...
---

# UAT — Sprint m1-s1

## Results Summary
- Passed: 4/6
- Issues: 2 (major 1, minor 1)

## Test Results

### 1. Main Page Load
Expected: Card layout main page displayed
Result: pass

### 2. Card Click
Expected: Navigate to detail page
Result: issue (major)
Description: 404 error on click
Cause: Missing detail page route in routing config
File: src/routes.js:15

## Outstanding Issues (Gaps)
- truth: "Click card navigates to detail page"
  severity: major
  root_cause: "Missing route"
  artifacts: ["src/routes.js"]
```

### 7. Follow-up

- No issues: "UAT passed! Proceed to the next sprint or run `/taskforge-audit` for milestone validation"
- Issues found: "N issues found. Fix with `/taskforge-retry`, or add fix tasks with `/taskforge-plan-edit`"
- Blocker found: "There is a blocker issue that must be resolved before proceeding"
