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
/taskforge-discover → /taskforge-plan (includes approval)
    ↓
  /taskforge-execute (repeat) or /taskforge-execute-all (auto)
    ↓ (sprint boundaries are NON-blocking — sprint validation runs async in background)
  next sprint → next sprint → ... (waves keep flowing across sprint boundaries)
    ↓
  /taskforge-validate milestone   ← BLOCKING gate: goal-backward + cross-regression
    ↓
  [/taskforge-verify]   ← Interactive UAT (optional)
    ↓
  next milestone
```

**Validation gating policy**: Only milestone validation is a blocking gate. Task validation is inline (cheap), sprint validation is async/non-blocking (advisory). This preserves wave parallelism across sprint boundaries — the executor doesn't stall waiting for sprint review.

### Project Kickoff
- `/taskforge-discover` — Define the project through conversation, generate a SpecCard
- `/taskforge-plan` — Opus PM breaks down milestones/sprints/tasks, includes approval at the end
- `/taskforge-plan-edit` — Edit the plan (add/remove/modify tasks)

### Execution
- `/taskforge-execute` — Execute the next single task (includes retry/skip built-in)
- `/taskforge-execute-all` — Auto-run through the sprint (includes plan refresh at sprint boundary)
- `/taskforge-quick` — Run a quick single task without a plan

### Validation
- `/taskforge-validate` — Goal-backward validation at task/sprint/milestone level
- `/taskforge-verify` — Interactive UAT (user confirms directly, follows spec-card validation plan)

### Monitoring
- `/taskforge-status` — Display full progress tree
- `/taskforge-cost` — Per-model cost summary
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
| hard | sonnet | Complex implementation, multi-file changes — plan provides detailed spec |

Opus is reserved for **planning and validation** where design judgment is needed, not for task execution.
Fixed assignments: PM (planning) = opus, Discovery = opus, Sprint validation = sonnet, Milestone QA = opus

## Execution Modes (3 Types)

| Mode | Description | Example |
|------|-------------|---------|
| **single** | One agent, no skills | "Build the HTML skeleton" |
| **single + skills** | One agent + domain skill injection | "Apply API security" + api-security-checklist |
| **harness** | Multi-agent team + skills | "Design game balancing" → game-balance harness |

Skills and harnesses are bundled in the `harnesses/` directory. No separate installation needed.

## Validation Framework

| Unit | Timing | Method | Gating | Tool |
|------|--------|--------|--------|------|
| Task | On every completion | Build, type-check, lint + acceptance criteria | **inline** (blocks task) | `/taskforge-validate` |
| Sprint | On sprint completion | Goal-backward (truths→artifacts→wiring) + code review | **async / non-blocking** (advisory only — next sprint starts immediately) | `/taskforge-validate` + `/taskforge-verify` |
| Milestone | On milestone completion | Cross-regression (3-source) + full QA | **blocking gate** (must pass to move on) | `/taskforge-validate milestone` |

**Why this gating**: Blocking on every sprint serializes the executor and kills wave parallelism across sprint boundaries. Task validation stays inline because it's cheap and catches local breakage early. Sprint validation runs in the background and surfaces warnings, but does not stall the next sprint's waves. The milestone gate is where goal-backward + cross-regression actually decide whether to ship — failures here trigger fix sprints, and any sprint-level warnings accumulated since the last gate are rolled into that review.

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
├── conventions.md              — Project conventions (plan)
├── execution-state.json        — Execution state (execute)
├── handoffs/                   — Per-task handoff records (conditional)
│   └── {task-id}.json
├── validations/                — Validation results
│   ├── task-{id}.json         — Task validation
│   ├── sprint-{id}.json       — Sprint goal-backward validation
│   ├── uat-sprint-{id}.md     — Interactive UAT
│   └── audit-milestone-{id}.md — Milestone cross-regression
└── project-report.md           — Completion report (optional)
```

## Skill Structure

```
skills/
├── taskforge-discover/SKILL.md       — Project definition
├── taskforge-plan/SKILL.md           — Work breakdown + approval (Opus PM)
├── taskforge-plan-edit/SKILL.md      — Plan editing
├── taskforge-execute/SKILL.md        — Task execution (retry/skip/handoff built-in)
├── taskforge-execute-all/SKILL.md    — Sprint auto-execution (refresh built-in)
├── taskforge-quick/SKILL.md          — Quick execution
├── taskforge-validate/SKILL.md       — Validation (task/sprint/milestone)
├── taskforge-verify/SKILL.md         — Interactive UAT
├── taskforge-status/SKILL.md         — Progress tracking
├── taskforge-cost/SKILL.md           — Cost summary
└── taskforge-help/SKILL.md           — Usage guide
```
