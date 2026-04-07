---
name: taskforge-help
description: Guides the user through the full TaskForge Pro usage and workflow. Use when the user says "/taskforge-help", "help", "how do I use this", "how does this work", "what do I do first", or similar. Also suggests the appropriate next step based on the current situation.
---

# Help — Usage Guide

Explain all TaskForge Pro features and recommend the appropriate next step based on the current project state.

## On Execution

### 1. Detect Current State

Check project state files to determine which stage the project is at:

| File(s) present | State | Recommended next step |
|-----------------|-------|-----------------------|
| Nothing | Not started | `/taskforge-discover` to define the project |
| spec-card.json only | Defined | `/taskforge-plan` to create a plan |
| project-plan.json (unapproved) | Plan created | `/taskforge-plan-approve` to approve |
| execution-state.json | In progress | `/taskforge-execute` for the next task, or `/taskforge-status` for status |
| Sprint complete state | Needs validation | `/taskforge-validate` or `/taskforge-verify` |
| Milestone complete state | Needs audit | `/taskforge-audit` |
| Fully complete | Wrap up | `/taskforge-wrap` |

### 2. Show Situation-Specific Guidance

```
## TaskForge Pro — Current State

📍 Project: [Name]
📊 Progress: Milestone 1/3 — Sprint 2/4 — Task 5/12

### What you can do now
- `/taskforge-execute` — Run next task: "Implement game loop" [medium/sonnet]
- `/taskforge-execute-all` — Auto-run the rest of the sprint
- `/taskforge-status` — View full progress
- `/taskforge-discuss` — Discuss the next sprint

### All Commands

#### Project Kickoff
| Command | Description |
|---------|-------------|
| `/taskforge-discover` | Define the project through conversation |
| `/taskforge-plan` | Break down into milestones/sprints/tasks |
| `/taskforge-plan-edit` | Edit the plan |
| `/taskforge-plan-approve` | Approve the plan |

#### Execution
| Command | Description |
|---------|-------------|
| `/taskforge-execute` | Execute the next task |
| `/taskforge-execute-all` | Auto-run the sprint |
| `/taskforge-quick` | Quick execution without a plan |
| `/taskforge-discuss` | Discuss before execution |

#### Validation (3 types — each has a distinct role)

> `/taskforge-validate` = AI automatically validates code (build, tests, code review)
> `/taskforge-verify` = User confirms directly (interactive UAT)
> `/taskforge-audit` = Milestone comprehensive audit (cross-reference + regression)

| Command | Description |
|---------|-------------|
| `/taskforge-validate` | Goal-backward validation |
| `/taskforge-verify` | Interactive UAT |
| `/taskforge-audit` | Milestone regression validation |

#### Monitoring
| Command | Description |
|---------|-------------|
| `/taskforge-status` | Progress tree |
| `/taskforge-cost` | Cost summary |

#### Adaptation
| Command | Description |
|---------|-------------|
| `/taskforge-refresh` | Refresh the plan |
| `/taskforge-pivot` | Change direction |
| `/taskforge-retry` | Retry a failed task |
| `/taskforge-skip` | Skip a task |

#### Harness
| Command | Description |
|---------|-------------|
| `/taskforge-browse-harness` | Browse the 100-harness catalog |
| `/taskforge-use-harness` | Run a harness directly |

#### Other
| Command | Description |
|---------|-------------|
| `/taskforge-resume` | Pick up the project in a new session |
| `/taskforge-wrap` | Finish the project |
```

### 3. First-Time User Guide

If no project files exist, display the beginner guide:

```
## Getting Started with TaskForge Pro

1️⃣ `/taskforge-discover` — Define what you want to build through conversation
2️⃣ `/taskforge-plan` — AI automatically breaks down the work
3️⃣ `/taskforge-plan-approve` — Review and approve the plan
4️⃣ `/taskforge-execute` — Execute one task at a time (repeat)
5️⃣ `/taskforge-wrap` — Done!

For small tasks, you can also start right away with `/taskforge-quick`.
To use just a harness, browse the catalog with `/taskforge-browse-harness`.
```
