---
name: taskforge-audit
description: Runs cross-regression validation when a milestone is complete. Use when the user says "/taskforge-audit", "audit", "regression check", "milestone validation", or similar. Cross-references the plan, handoffs, and actual code to find missing items, broken connections, and dropped features.
---

# Audit — Milestone Cross-Regression Validation

When a milestone is complete, cross-reference three sources to verify nothing is missing.

**Key insight**: A task marked "done" does not mean the feature actually works.

## Prerequisites

- All sprints in the target milestone must be in completed status
- If not: "Please complete all sprints in the milestone first"

## 3-Source Cross-Validation

| Source | What to check |
|--------|--------------|
| **Plan** (project-plan.json) | Each task's mustHaves, acceptanceCriteria |
| **Handoffs** (handoffs/*.json) | Actual work performed, changed files, known issues |
| **Code** (actual filesystem) | File existence, connections (import/export), behavior |

## Validation Flow

### 1. Collect Requirements

Collect mustHaves from all tasks within the milestone:
- **truths**: Things that must be true
- **artifacts**: Files that must exist
- **keyLinks**: Things that must be connected

### 2. Artifact Validation

For each artifact:

```
[VERIFIED]  src/index.html — exists, has content (> 10 lines)
[STUB]      src/detail.js — exists but contains only TODOs
[MISSING]   src/api.js — file not found
[ORPHANED]  src/unused.js — exists but not imported anywhere
```

### 3. Wiring Validation

Verify actual connections for each key link:

```
[WIRED]     App.jsx → import Detail from './Detail' → used in routes
[PARTIAL]   api.js → export fetchData → no call sites (imported but unused)
[NOT_WIRED] auth.js → has exports → not imported anywhere
```

### 4. Truth Validation

Synthesize artifact + wiring results for each truth:

```
[SATISFIED]   "Card list is displayed on the main page"
              → index.html ✅, CardList.jsx ✅, wired ✅
              
[PARTIAL]     "Click card navigates to detail page"
              → Detail.jsx ✅, routes.js ⚠️ (missing route)
              
[UNSATISFIED] "Search functionality works"
              → SearchBar.jsx [STUB], api/search.js [MISSING]
```

### 5. Anti-Pattern Scan

Detect risky patterns across the entire codebase:
- `TODO` / `FIXME` / `HACK` comments
- Empty function bodies / placeholder text
- `console.log` debug code
- Hardcoded passwords/tokens

### 6. Handoff Cross-Check

Verify that each handoff's `knownIssues` have been resolved:
- Resolved in a subsequent task → ✅
- Still unresolved → ⚠️ reported as an outstanding issue

### 7. Save Report

Save to `_workspace/validations/audit-milestone-{id}.md`:

```markdown
---
milestone: m1
status: pass | partial | fail
truths_satisfied: 8/10
artifacts_verified: 15/17
wiring_complete: 12/14
anti_patterns: 3
unresolved_issues: 1
audited: 2026-04-07T...
---

# Audit Report — Milestone 1: Basic Game Loop

## Summary
- Truths: 8/10 satisfied (2 partial)
- Artifacts: 15/17 verified (1 stub, 1 missing)
- Wiring: 12/14 connected (2 partial)
- Anti-patterns: 3 found
- Unresolved issues: 1

## Detailed Results

### Truths
| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Main page renders | ✅ satisfied | ... |
| 2 | Card click navigates | ⚠️ partial | Missing route in routes.js |

### Artifacts
(artifact validation details)

### Wiring
(wiring validation details)

### Anti-patterns
(found pattern details)

### Unresolved Issues
(outstanding issue list from handoffs)

## Recommended Actions
1. [PARTIAL] Add detail page route to routes.js
2. [STUB] Complete implementation of detail.js
```

## Follow-up

- **pass**: "Milestone validation passed! Use `/taskforge-wrap` to finish or proceed to the next milestone"
- **partial**: "Some items are not fully satisfied. Use `/taskforge-plan-edit` to add fix tasks, or proceed if acceptable"
- **fail**: "Major requirements are unmet. Fixes are required"
