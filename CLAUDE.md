# TaskForge Pro — Integrated Project Manager

An all-in-one plugin that lets anyone — including non-developers — complete projects easily with Claude Code.
Unifies **TaskForge PM + Harness-100 Domain Experts + GSD Validation Framework** into a single system.

Core philosophy: **Break it down, be explicit, start clean, work with experts.**

## 3 Core DNAs

| Source | Role | Contribution |
|--------|------|--------------|
| **TaskForge** | PM Framework | Planning/execution/tracking, model routing, Handoff |
| **Harness-100** | Domain Experts | 100 domain-specific agent teams, 630 skills |
| **GSD** | Validation Framework | Goal-backward validation, interactive UAT, regression audits |

## Workflow

```
/taskforge-discover → /taskforge-plan → /taskforge-plan-approve
    ↓
  [/taskforge-discuss]  ← Identify gray areas (optional)
    ↓
  /taskforge-execute (repeat, wave parallelism supported)
    ↓
  /taskforge-validate   ← goal-backward enforcement
    ↓
  [/taskforge-verify]   ← Interactive UAT (optional)
    ↓
  /taskforge-refresh → next sprint
    ↓
  [/taskforge-audit]    ← Milestone regression validation (optional)
    ↓
  /taskforge-wrap
```

### Project Kickoff
- `/taskforge-discover` — Define the project through conversation, generate a SpecCard
- `/taskforge-plan` — Opus PM breaks down milestones/sprints/tasks (wave parallelism + mustHaves)
- `/taskforge-plan-edit` — Edit the plan (add/remove/modify tasks)
- `/taskforge-plan-approve` — Approve the plan, ready for execution

### Pre-Execution
- `/taskforge-discuss` — Identify gray areas and record decisions before a sprint begins

### Execution
- `/taskforge-execute` — Execute the next single task (wave parallelism + acceptance criteria)
- `/taskforge-execute-all` — Auto-run through the end of the sprint continuously
- `/taskforge-quick` — Run a quick single task without a plan
- `/taskforge-handoff` — Generate a work history record (usually called automatically by /taskforge-execute)

### Validation (3 Levels)
- `/taskforge-validate` — Goal-backward validation (truths → artifacts → wiring)
- `/taskforge-verify` — Interactive UAT (user confirms directly)
- `/taskforge-audit` — Cross-milestone regression validation

### Monitoring
- `/taskforge-status` — Display full progress tree
- `/taskforge-cost` — Per-model cost summary

### Adaptation
- `/taskforge-refresh` — Refresh the follow-up plan after a sprint completes
- `/taskforge-pivot` — Change direction, fully redesign the remaining plan
- `/taskforge-retry` — Retry a failed task
- `/taskforge-skip` — Skip a task

### Direct Harness Access
- `/taskforge-browse-harness` — Browse the 100-harness catalog
- `/taskforge-use-harness` — Run a harness directly without the PM

### Session Management
- `/taskforge-resume` — Pick up the project in a new session
- `/taskforge-wrap` — Finish the project (final QA + report)
- `/taskforge-help` — Full usage guide

## Work Breakdown Hierarchy

```
Project
  └─ Milestone — A shippable or demo-able unit
       └─ Sprint — A verifiable unit
            └─ Task — The smallest unit an AI can complete in one session
                 └─ Wave — Tasks in the same wave can run in parallel
```

## Difficulty → Model Mapping

| Difficulty | Model | Criteria |
|------------|-------|----------|
| easy | haiku | Boilerplate, config, simple copy, CSS |
| medium | sonnet | General feature implementation, bug fixes, refactoring |
| hard | opus | Architecture design, complex algorithms, multi-file changes |

Fixed assignments: PM (planning) = opus, Discovery = opus, Sprint validation = sonnet, Milestone QA = opus

## Execution Modes (3 Types)

| Mode | Description | Example |
|------|-------------|---------|
| **single** | One agent, no skills | "Build the HTML skeleton" |
| **single + skills** | One agent + domain skill injection | "Apply API security" + api-security-checklist |
| **harness** | Multi-agent team + skills | "Design game balancing" → game-balance harness |

Skills and harnesses are bundled in the `harnesses/` directory. No separate installation needed.

## Validation Framework

| Unit | Timing | Method | Tool |
|------|--------|--------|------|
| Task | On every completion | Build, type-check, lint + acceptance criteria | `/taskforge-validate` |
| Sprint | On sprint completion | Goal-backward (truths→artifacts→wiring) + code review | `/taskforge-validate` + `/taskforge-verify` |
| Milestone | On milestone completion | Cross-regression validation + full QA | `/taskforge-audit` |

### Goal-Backward Validation (absorbed from GSD)
1. **Truths**: What must be true for the goal to be achieved
2. **Artifacts**: Which files must exist to make those truths hold
3. **Key Links**: Whether the files are actually connected (wired)

Task complete ≠ Goal achieved. Tasks can be "done" with placeholders — goal-backward validation catches this.

## Harness Catalog (100 Harnesses)

Full list in `harnesses/INDEX.md`. Categories:

| Category | Count | Examples |
|----------|-------|---------|
| Content | 15 | YouTube, Podcast, Newsletter, Game Narrative |
| Software | 15 | Full-stack Web App, API Design, Mobile App |
| Data/ML | 12 | ML Experiments, Data Analysis, NLP |
| Business | 13 | Startup Strategy, Market Research, Pricing Strategy |
| Education | 10 | Language Learning, Exam Prep, Coding Education |
| Legal | 7 | Contract Analysis, Patents, GDPR |
| Health | 8 | Diet, Fitness, Tax |
| Communication | 8 | Technical Docs, Proposals, Crisis Communication |
| Operations | 7 | Hiring, Onboarding, Audits |
| Specialized | 5 | Real Estate, E-commerce, IP |

## Outputs (_workspace/)

```
_workspace/
├── spec-card.json              — Project definition (discover)
├── project-plan.json           — Task plan tree (plan) — includes wave/mustHaves
├── execution-state.json        — Execution state (execute)
├── contexts/                   — Decision records (discuss)
│   └── sprint-{id}.md
├── handoffs/                   — Per-task handoff records
│   └── {task-id}.json
├── validations/                — Validation results
│   ├── task-{id}.json         — Task validation
│   ├── sprint-{id}.json       — Sprint goal-backward validation
│   ├── uat-sprint-{id}.md     — Interactive UAT
│   ├── milestone-{id}.json    — Milestone validation
│   └── audit-milestone-{id}.md — Regression audit
└── project-report.md           — Completion report (wrap)
```

## Skill Structure

```
skills/
├── taskforge-discover/SKILL.md           — Project definition
├── taskforge-discuss/SKILL.md            — Gray area identification (NEW)
├── taskforge-plan/SKILL.md               — Work breakdown (enhanced)
├── taskforge-plan-edit/SKILL.md          — Plan editing
├── taskforge-plan-approve/SKILL.md       — Plan approval
├── taskforge-execute/SKILL.md            — Task execution (enhanced)
├── taskforge-execute-all/SKILL.md        — Sprint auto-execution (enhanced)
├── taskforge-quick/SKILL.md              — Quick execution (NEW)
├── taskforge-handoff/SKILL.md            — Work history
├── taskforge-validate/SKILL.md           — Validation (significantly enhanced)
├── taskforge-verify/SKILL.md             — Interactive UAT (NEW)
├── taskforge-audit/SKILL.md              — Regression validation (NEW)
├── taskforge-status/SKILL.md             — Progress tracking
├── taskforge-cost/SKILL.md               — Cost summary
├── taskforge-refresh/SKILL.md            — Plan refresh
├── taskforge-pivot/SKILL.md              — Direction change
├── taskforge-retry/SKILL.md              — Retry
├── taskforge-skip/SKILL.md               — Skip
├── taskforge-resume/SKILL.md             — Session resume
├── taskforge-wrap/SKILL.md               — Project wrap-up
├── taskforge-browse-harness/SKILL.md     — Harness search (NEW)
├── taskforge-use-harness/SKILL.md        — Direct harness execution (NEW)
└── taskforge-help/SKILL.md               — Usage guide (NEW)
```
