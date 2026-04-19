---
name: taskforge-verify
description: Runs an interactive UAT where the user confirms directly by eye. Use when the user says "/taskforge-verify", "I'll check it myself", "let me test it", "show me", "UAT", "manual testing", or similar. AI guides the expected behavior and the user confirms whether it matches. Use "/taskforge-validate" for automated code validation, "/taskforge-validate milestone" for comprehensive milestone cross-regression, and "/taskforge-playtest" for game-specific hands-on confirmation.
---

# Verify — Interactive UAT

After a sprint completes, walk through features one by one in conversation with the user.
AI presents "this is how it should behave," and the user confirms and records results.

## Philosophy

**Follow the validation plan from discover. If you can't follow it, say so — don't silently substitute.**

The spec-card's `validationStrategy` defines HOW to verify. Verify must follow that plan. If something blocks the plan (MCP not connected, server not running), tell the user and ask what to do — never quietly fall back to code-only validation.

## Prerequisites

- A project must exist with a completed sprint
- **Project selection**: Same as `/taskforge-execute` — auto-select if only one, ask if multiple
- All file paths below are relative to `_workspace/projects/{projectId}/`
- All tasks in the target sprint must be in completed state
- If not: "Please complete the sprint first"

## Flow

### 1. Check Validation Environment

**Before anything else**, check if the validation plan from spec-card can actually be executed:

Read `spec-card.json` → `validationStrategy`

For each validation method, check readiness:

| Validation type | Check method | If not ready |
|----------------|-------------|--------------|
| Build command | Try running it | Report the error |
| MCP-based check | Check if MCP server responds | "MCP server ({name}) is not connected. Please connect it first, or tell me how you'd like to proceed." |
| Browser check | Check if Playwright MCP is available | "Browser verification requires Playwright MCP. Please connect it, or I'll create a manual checklist instead." |
| CLI run check | Try running it | Report the error |
| Manual check | Always ready | Proceed |

**Critical rule**: If the spec-card says "verify via Unity MCP play mode" but Unity MCP is not connected:
- ❌ WRONG: Silently read the code and say "looks correct"
- ✅ RIGHT: "The validation plan requires Unity MCP, but it's not connected. Options: (1) Connect it now, (2) Switch to manual verification for this sprint"

**Always get user confirmation before changing the validation method.**

### 2. Extract Test Items

From the sprint's completed tasks, build a test checklist:

1. Read all task `acceptanceCriteria` and `mustHaves.truths` in the sprint
2. Group by feature area
3. For each item, write a **concrete verification step** (not just "confirm it works")

### 3. Check for Existing Session

If `validations/uat-sprint-{id}.md` already exists:
- "Would you like to continue the previous UAT, or start fresh?"

### 4. Run Tests — One at a Time

Present each test with **specific, actionable steps**:

```
## Test 1/6: Main Page Load

📋 How to verify:
1. Open localhost:3000 in your browser
2. Check the following:
   □ Is there a navigation bar at the top?
   □ Are cards displayed in a 2-column grid?
   □ Does each card have a title and description?

→ Let me know: OK / describe the issue
```

**Rules for writing test steps:**
- Tell the user exactly WHAT to do (open this URL, click this button, type this text)
- Tell them exactly WHAT to look for (specific visual elements, specific text, specific behavior)
- One test = one user action + one observable result
- Never write "confirm it works" — always specify what "works" means

**If MCP (Playwright/browser) IS connected:**
- Take a screenshot after each navigation
- Show the screenshot to the user: "This is what I see. Does it match?"
- Automate clicks/form fills where possible, but still ask the user to confirm the result

### 5. Record Results

Based on the user's response:

- **pass**: Move to the next test
- **issue**: Record the problem description + auto-infer severity

Severity criteria (automatic, never ask the user about severity):
- **blocker**: Core feature non-functional (page won't load, crash)
- **major**: Main feature misbehaves (data not showing, button not working)
- **minor**: Secondary feature abnormal (sort broken, wrong color)
- **cosmetic**: Visual issue (spacing, font size)

### 6. Diagnose (if issues found)

If an issue is found, run parallel debug agents to investigate the cause.
Record investigation results in the UAT file.

### 7. Save UAT File

Save to `validations/uat-sprint-{id}.md` (under `_workspace/projects/{projectId}/`):

```markdown
---
status: complete | partial | testing
sprint: m1-s1
validationMethod: planned | fallback-manual
started: 2026-04-07T...
updated: 2026-04-07T...
---

# UAT — Sprint m1-s1

## Validation Environment
- Build: ✅ working
- MCP (Playwright): ❌ not connected → switched to manual (user approved)
- Run check: ✅ working

## Results Summary
- Passed: 4/6
- Issues: 2 (major 1, minor 1)

## Test Results

### 1. Main Page Load
How verified: User opened localhost:3000 in browser
Expected: Card layout main page displayed
Result: pass

### 2. Card Click
How verified: User clicked first card
Expected: Navigate to detail page
Result: issue (major)
Description: 404 error on click
Cause: Missing detail page route in routing config
File: src/routes.js:15

## Outstanding Issues
- truth: "Click card navigates to detail page"
  severity: major
  root_cause: "Missing route"
  artifacts: ["src/routes.js"]
```

### 8. Follow-up

- No issues: "UAT 통과! 다음 스프린트로 진행하거나, 마일스톤이 끝났다면 `/taskforge-validate milestone`을 실행하세요."
- Issues found: "N개 이슈가 발견됐어요. `/taskforge-execute`로 재시도하거나 `/taskforge-plan-edit`으로 수정 태스크를 추가할 수 있어요."
- Blocker found: "Blocker 이슈가 있어 다음 단계로 넘어가기 전에 해결이 필요해요."

## Integration with v2 Skills

| Skill | Relationship |
|-------|--------------|
| `/taskforge-validate` | Automated code checks. Run before verify for catching build/typecheck issues |
| `/taskforge-validate milestone` | Blocking gate — run after verify at milestone boundary |
| `/taskforge-playtest` | Game-specific extension with fun metrics and M0 core-fun gate. Prefer playtest for games |
| `/taskforge-retro` | Reads UAT file as evidence alongside validation results |

The `verification.md` file (created by `/taskforge-discover`) provides the baseline "done" criteria. UAT should check those items in addition to acceptanceCriteria from the plan.
