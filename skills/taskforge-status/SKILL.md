---
name: taskforge-status
description: Displays the full project progress as a tree. Use when the user says "/taskforge-status", "status", "where are we", "progress", or similar. Can be called at any time while a project is in progress.
---

# Status — Progress Display

Show the full project progress at a glance in a tree format.

## Prerequisites

- `_workspace/project-plan.json`
- `_workspace/execution-state.json` (after execution starts)

## Output Format

```
Project: Chrome Dino Game Clone
Status: In progress | Started: 2026-04-06 | Elapsed: 2h 15m

Milestone 1: Basic Game Loop              [████████░░] 75%
  ├─ Sprint 1.1: Canvas Setup             ✅ Complete (validation passed)
  │   ├─ Build HTML skeleton             ✅ haiku  (32s, $0.001)
  │   ├─ Implement game loop             ✅ sonnet (2m, $0.04)
  │   └─ Handle keyboard input           ✅ sonnet (1m 48s, $0.03)
  ├─ Sprint 1.2: Character               🔄 In progress
  │   ├─ Dino rendering                  ✅ sonnet (1m 30s, $0.03)
  │   ├─ Jump physics                 → 🔄 Running (sonnet)
  │   └─ Duck action                     ⏳ Waiting
  └─ Sprint 1.3: Obstacles               ⏳ Waiting

Milestone 2: Scoring System               ⏳ Waiting
Milestone 3: Polishing                    ⏳ Waiting

Progress: 4/12 tasks complete (33%)
Cost: $0.101 | haiku: $0.001 / sonnet: $0.10 / opus: $0.00
```

## Detail Mode

Use `/taskforge-status detail` or `/taskforge-status m1-s1-t2` for detailed info on a specific item:

```
Task: Implement game loop
Status: ✅ Complete
Model: sonnet | Elapsed: 2m 15s | Cost: $0.04

Plan:
  requestAnimationFrame-based game loop.
  deltaTime calculation, update/render separated.

Handoff:
  gameLoop() function implemented. Targeting 60fps.
  Separated update(dt) and render(ctx) structure.
  
  Design decision: deltaTime-based physics (frame-independent)
  For next task: ctx is cached as a global variable

Validation: build ✅ | typecheck ✅
```

## Failed Task Display

If there are failed tasks, display them prominently:

```
  ├─ Collision detection              ❌ Failed (2x) — Build error
  │   → `/taskforge-retry m1-s2-t3` or `/taskforge-skip m1-s2-t3`
```
