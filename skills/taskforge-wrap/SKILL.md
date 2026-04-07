---
name: taskforge-wrap
description: Wraps up the project. Runs final QA and generates a completion report. Use when the user says "/taskforge-wrap", "wrap up", "project done", "complete", or similar. Final step after all milestones are complete.
---

# Wrap — Project Wrap-Up

After all milestones are complete, perform a final QA and close out the project.

## Prerequisites

- All milestones must be in completed state
- If any milestone is not complete, warn and confirm before proceeding

## Behavior

### 1. Final QA (Opus)

Opus reviews the entire project:

- Whether all features from the SpecCard are implemented
- Whether build/run is functioning normally
- Overall code quality
- List of known issues (collected from handoffs)

### 2. Summarize Unresolved Issues

Collect `knownIssues` from all handoffs and summarize:

```
Outstanding issues:
1. [m1-s2-t3] Occasional jitter on double jump — low priority
2. [m2-s1-t2] High score UI overlaps above 1000 points

If fixes are needed, you can add fix tasks with `/taskforge-plan-edit`.
```

### 3. Generate Completion Report

`_workspace/project-report.md`:

```markdown
# Project Completion Report

## Project: [Name]
## Completed: [Date]

## Summary
- Milestones: [n] complete
- Tasks: [n] complete, [n] skipped, [n] failed then fixed
- Elapsed time: [hours]
- Total cost: $[amount]

## Model Usage
- Opus: [n] runs ($[amount])
- Sonnet: [n] runs ($[amount])
- Haiku: [n] runs ($[amount])

## Implemented Features
1. [Feature A] ✅
2. [Feature B] ✅
3. [Feature C] ✅

## Tech Stack
[...]

## Known Issues
[...]

## File Structure
[Project file tree]
```

### 4. Wrap-Up Notice

```
Project "Chrome Dino Game Clone" is complete! 🎉

Completion report: _workspace/project-report.md
Total cost: $1.02 | Elapsed: 4h 30m

Great work!
```
