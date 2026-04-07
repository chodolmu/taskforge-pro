---
name: taskforge-plan
description: Automatically breaks down a project into milestones → sprints → tasks based on the SpecCard. Use when the user says "/taskforge-plan", "make a plan", "break down the work", "split it up", or similar. Used as the next step after discover is complete. Generates a plan that includes wave parallelism, acceptance criteria, and mustHaves.
---

# Plan — Project Work Breakdown (Opus PM)

Break the entire project into milestones → sprints → tasks based on the SpecCard.
This is the most critical step in the project, so it runs with the Opus model.

**Core principle: The user does not directly edit the plan.** AI creates a good plan; the user only approves it. If the plan is weak, AI should investigate further and ask questions to improve it — not delegate the editing to the user.

## Prerequisites

- `_workspace/spec-card.json` must exist
- If missing: "Please define the project first with `/taskforge-discover`"

## Plan Creation Flow

A plan is not simply chopping a spec-card into tasks. It goes through **research → questions → design → validation**.

### Phase 1: Codebase Analysis

If existing code exists in the project directory, analyze it first:

1. **File tree scan** — Understand the full structure (Glob)
2. **Read key files** — Entry points, config files, main modules (Read)
3. **Verify tech stack** — Check actual technologies used in package.json, .csproj, project.godot, etc.
4. **Identify existing patterns** — Code style, architecture patterns, naming conventions

If there is no existing code (new project), skip Phase 1.

If analysis conflicts with the spec-card (e.g., spec-card says React but code is Vue), confirm with the user.

### Phase 2: Identify Gaps and Ask Questions

Based on the spec-card and codebase analysis, identify areas where **information is insufficient** to create the plan.

If there are gaps, ask the user. Do not ask all questions at once — start with the most important.

Gap types:
- **Missing architecture decisions**: "Is login session-based or JWT-based?"
- **Unclear scope**: "Does it include an admin panel, or just the user-facing side?"
- **Unconfirmed technical constraints**: "What Unity version? Is the MCP server already installed?"
- **Priority conflicts**: "Features A and B conflict — which takes priority?"
- **External dependencies**: "Which payment gateway for billing integration? Do you have an API key?"

**Question principles:**
- If AI can make the decision, decide and record the rationale in the plan (don't ask the user unnecessarily)
- Only ask about things only the user can answer (business decisions, environmental constraints, etc.)
- Reflect answers in the spec-card as well (add to designDecisions)

### Phase 3: Conventions + Breakdown Design

Before breaking down tasks, establish project conventions and save them to `_workspace/conventions.md`.

**Why conventions matter**: Every task executes in a clean context. Without shared conventions, task A might use `#FF4444` for cancel buttons while task B uses `#E53935`. Conventions are the single source of truth that keeps all tasks consistent — and they persist across quick fixes too.

**What to define** (based on project type):

For UI projects:
- Color palette (primary, secondary, danger, success, etc.)
- Typography (font family, sizes, weights)
- Component naming convention
- File/folder structure pattern
- Spacing/layout system

For code projects:
- Naming conventions (camelCase, snake_case, etc.)
- File/folder structure pattern
- Error handling pattern
- API response format
- State management approach

For game projects:
- Asset naming convention
- Scene/level structure
- Input handling pattern
- Physics/collision layer naming
- UI style guide

For all projects:
- Language/framework-specific idioms to follow
- Import ordering
- Test naming convention (if tests exist)

**How conventions are generated**:
- If existing code: extract patterns from Phase 1 analysis (don't invent — document what's already there)
- If new project: derive from tech stack + spec-card design decisions
- Keep it concise — one page max. Rules, not essays.

**Example** (`_workspace/conventions.md`):
```markdown
# Project Conventions

## Colors
- Primary: #3B82F6
- Danger/Cancel: #EF4444
- Success: #10B981
- Text: #1F2937
- Background: #F9FAFB

## Components
- One component per file
- Name: PascalCase (LoginButton.jsx)
- Styles: co-located CSS module (LoginButton.module.css)

## File Structure
- src/components/ — UI components
- src/pages/ — route pages
- src/utils/ — shared utilities
- src/api/ — API client functions

## Code Style
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- async/await over .then() chains
- Early returns over nested if/else
```

**Who reads conventions**:
- Every `/taskforge-execute` task gets conventions injected into context
- `/taskforge-quick` reads conventions before making changes
- `/taskforge-validate` checks for convention violations

After conventions are set, break down into milestones → sprints → tasks.

### Phase 4: Self-Validate the Plan

Validate before saving the plan:

**Check 1 — Executability**: Can code be written from just the `plan` field of each task?
- Vague plan: "Create appropriate UI" → ❌ Unclear what to build
- Good plan: "Create an email + password form in src/components/Login.jsx. POST to /api/auth/login on submit" → ✅

**Check 2 — Connectivity**: Are there any gaps in the dependency chain between tasks?
- If Task B uses a file created by Task A, but A is not in B's dependencies → ❌

**Check 3 — Completeness**: Are all must-have features from the spec-card covered by tasks?
- If "search feature" is in spec-card but no search-related task in the plan → ❌

**Check 4 — Verifiability**: Are each task's acceptanceCriteria actually auto/manually verifiable?

If issues are found during validation, **self-correct** without showing to the user, then re-validate. Only ask the user about problems that cannot be self-corrected.

## Breakdown Hierarchy

```
Project
  └─ Milestone — A shippable or demo-able unit
       └─ Sprint — A verifiable unit
            └─ Task — The smallest unit an AI agent can complete in one session
                 └─ Wave — Tasks in the same wave can run in parallel
```

## Breakdown Principles

1. **Task size**: Changes spanning one to a few files. Split if too large.
2. **Completion condition**: Must be definable in a single sentence: "done when..."
3. **Minimize dependencies**: Minimize dependencies to allow parallel execution.
4. **Harness as a tool**: Only assign harness mode when a genuine business need arises. Do not create work to justify using a harness.
5. **Validation environment first**: If spec-card has `validationStrategy.prerequisites`, place those setup items as tasks in **milestone 1, sprint 1, wave 1**.

## Auto-Generating Validation Environment Tasks

If spec-card has `validationStrategy`:

1. Convert each item in the `prerequisites` array to a task
2. Place in milestone 1, sprint 1, wave 1 (before all code work)
3. For subsequent tasks, `validation.auto` is sourced from the spec-card's validation strategy

**Example — Unity project:**
```
spec-card.validationStrategy:
  prerequisites:
    - { step: "Create Unity project", type: "setup" }
    - { step: "Install and connect Unity MCP server", type: "tool" }

→ Auto-generated tasks:
  m1-s1-t1: "Create Unity project" [easy/haiku, wave 1]
    acceptanceCriteria: ["Assets/ directory exists", "ProjectSettings/ exists"]
  m1-s1-t2: "Install and verify Unity MCP server connection" [medium/sonnet, wave 1]
    acceptanceCriteria: ["MCP connection test passes"]
```

**Example — Web project (no prerequisites):**
→ Start directly with feature tasks, no environment setup tasks

For all subsequent tasks, use appropriate items in `validation.auto` based on the spec-card strategy:
- Unity: `["unity-build", "unity-console-check"]`
- Node.js: `["build", "typecheck", "lint"]`
- Python: `["run", "ruff", "mypy"]`
- Web HTML: `["open-browser"]` (manual if automation is not possible)

## Difficulty Rating Criteria

| Difficulty | Model | Criteria |
|------------|-------|----------|
| easy | haiku | Boilerplate, config files, simple copy/move, CSS changes, constant definitions |
| medium | sonnet | General feature implementation, bug fixes, refactoring, API integration |
| hard | opus | Architecture design, complex algorithms, cascading multi-file changes, optimization |

## Execution Mode Determination (3 Modes)

| Mode | Criteria | Example |
|------|----------|---------|
| **single** | One perspective is sufficient, no domain expertise needed | "Build the HTML skeleton" |
| **single + skills** | One perspective but domain expertise raises quality | "Apply API security" + api-security-checklist |
| **harness** | Multiple expert perspectives + cross-validation needed | "Design game balancing" → game-balance harness |

### Skill Injection Decision

There are 100 harnesses in `harnesses/`, each containing domain-specific skills.
Even without using a full harness, **injecting just the skill raises quality.**

Skill examples:
- `api-security-checklist` — OWASP Top 10, auth patterns, input validation
- `component-patterns` — 6 React component design patterns, state management strategies
- `quest-design-patterns` — 12 quest archetypes, reward psychology, difficulty curves
- `hook-writing` — 15 hook patterns, retention psychology

When creating tasks, Opus PM evaluates "Is there a skill that helps here?" and adds it to the `skills` field.
Just as we don't create work to justify a harness, **we don't create work to justify a skill.** Work comes first; skills assist.

The harness/skill catalog is available in `harnesses/INDEX.md`.

## Wave Design (NEW)

Assign wave numbers to tasks within a sprint to optimize parallel execution.

**Rules:**
- Wave 1: Tasks with no dependencies (can run simultaneously)
- Wave 2: Tasks that depend on wave 1
- Wave N: Tasks that depend on wave N-1
- Tasks in the same wave must not conflict on files

**Example:**
```
Sprint 1.1:
  Wave 1: [HTML skeleton, CSS reset, constant definitions] — parallel
  Wave 2: [Game loop, input handling] — parallel after Wave 1
  Wave 3: [Wire up integration] — after Wave 2
```

## Acceptance Criteria Design (NEW)

Specify verifiable completion conditions for each task.

**Good acceptance criteria:**
- `src/index.html file exists` — can be verified by file existence check
- `Contains <!DOCTYPE html> tag` — can be verified by grep
- `npm run build completes without errors` — verifiable by running command

**Bad acceptance criteria:**
- `Code is clean` — subjective, unverifiable
- `Performance is good` — no standard defined

## Must-Haves Design (NEW)

Design mustHaves for goal-backward validation for each task:

- **truths**: Observable behaviors that must be true when this task is achieved
- **artifacts**: Concrete file paths that must exist
- **keyLinks**: Connections between files (A imports B which is used in C)

## Validation Methods

Design a validation strategy for each unit:

- **Task**: Auto validation items in `validation.auto` + `acceptanceCriteria`
- **Sprint**: Describe integration validation method in `validationStrategy`
- **Milestone**: Describe QA method in `validationStrategy`

## Output Format

Save to `_workspace/project-plan.json`:

```json
{
  "projectName": "Project Name",
  "milestones": [
    {
      "id": "m1",
      "name": "Milestone name",
      "description": "What will be done when complete",
      "validationStrategy": "How to validate",
      "sprints": [
        {
          "id": "m1-s1",
          "name": "Sprint name",
          "description": "Description",
          "dependencies": [],
          "validationStrategy": "Integration validation method",
          "tasks": [
            {
              "id": "m1-s1-t1",
              "name": "Task name",
              "description": "What needs to be done",
              "plan": "Specifically how to do it",
              "dependencies": [],
              "difficulty": "easy | medium | hard",
              "model": "haiku | sonnet | opus",
              "wave": 1,
              "executionMode": "single | harness",
              "harnessId": null,
              "skills": [],
              "acceptanceCriteria": [
                "src/index.html file exists",
                "Contains <!DOCTYPE html> tag"
              ],
              "mustHaves": {
                "truths": ["Page renders correctly in the browser"],
                "artifacts": ["src/index.html"],
                "keyLinks": []
              },
              "validation": {
                "auto": ["build", "typecheck"],
                "manual": null
              },
              "estimatedFiles": ["src/index.html"]
            }
          ]
        }
      ]
    }
  ],
  "createdAt": "2026-04-07T...",
  "totalTasks": 24,
  "modelDistribution": { "haiku": 8, "sonnet": 12, "opus": 4 },
  "waveStats": { "maxWave": 3, "parallelizable": 16 }
}
```

## Showing the User

After saving, show a tree-format summary:

```
Milestone 1: Basic Game Loop (8 tasks)
  ├─ Sprint 1.1: Canvas Setup (5 tasks, 3 waves)
  │   ├─ Wave 1: HTML skeleton [easy/haiku] + CSS reset [easy/haiku]
  │   ├─ Wave 2: Game loop [medium/sonnet] + Input handling [medium/sonnet]
  │   └─ Wave 3: Wire up integration [medium/sonnet]
  └─ Sprint 1.2: Character (3 tasks, 2 waves)
      ├─ Wave 1: Dino rendering [medium/sonnet]
      └─ Wave 2: Jump physics [medium/sonnet] + Duck [medium/sonnet]
      
Total tasks: 24 | haiku 8 / sonnet 12 / opus 4
Parallelizable: 16 (67%)
```

Guide the user: "Use `/taskforge-plan-approve` to proceed with this plan."
Also note that they can describe changes in natural language. (e.g., "Milestone 2 looks too big", "I want to do search first")
AI will incorporate the feedback and rewrite the plan. No need for the user to touch the JSON directly.
Mention `/taskforge-plan-edit` only as an emergency option for fine-grained adjustments.
