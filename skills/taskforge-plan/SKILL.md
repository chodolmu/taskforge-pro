---
name: taskforge-plan
description: Automatically breaks down the current milestone into sprints → tasks based on the SpecCard. Use when the user says "/taskforge-plan", "make a plan", "break down the work", or similar. v2 change: plans only the ACTIVE milestone (JIT), not the whole project at once. Opus PM with mandatory 6-area checklist.
---

# Plan — Milestone Work Breakdown (v2 JIT + PM Checklist)

Break the **current active milestone** into sprints → tasks based on its SpecCard.

**v2 key changes**:
1. **JIT scope**: Plan only the active milestone. Future milestones stay as `sketch` until their turn.
2. **PM 6-area checklist**: Mandatory self-validation before showing plan to user.
3. **35-minute task ceiling**: Any task estimated over 35 min is automatically split.
4. **contextManifest**: Every task specifies which files to read and in what order.
5. **References injected**: Tasks reference `references/` and `prompts/cot/` from discover.
6. **Guardrails**: maxTurns / maxCostUSD / maxWallTimeMin on every task.

This is the most critical step, so it runs with the Opus model.

**Core principle**: The user does not directly edit the plan. AI creates a good plan; the user only approves it.

## Prerequisites

- `_workspace/projects/{projectId}/spec-card.json` must exist for the active milestone
- `roadmap.json` must exist (v2) — to know which milestone is active
- **Project selection**: auto-select if only one project, ask if multiple
- All paths below are relative to `_workspace/projects/{projectId}/`

## Plan Creation Flow

### Phase 0: Determine Active Milestone (v2)

1. Read `roadmap.json` → find milestone with `status: "active"` and `detail: "full"`
2. Read `spec-card.json` for that milestone
3. Read `vision.json` and `concept.json` if they exist — for global constraints
4. Read `constraints.md` if it exists
5. Read `references/` list (to know what's available for injection)
6. Read `prompts/cot/` list (to know what CoT templates exist)
7. If no active milestone found: "먼저 /taskforge-discover로 이번 마일스톤을 정의해주세요."

### Phase 1: Codebase Analysis

If existing code exists in the project directory:
1. File tree scan (Glob) — understand full structure
2. Read key files — entry points, config files, main modules
3. Verify actual tech stack matches spec-card
4. Identify existing patterns — code style, architecture, naming conventions

If no existing code (new project): skip Phase 1.
If analysis conflicts with spec-card: confirm with user.

### Phase 2: Identify Gaps and Ask Questions

Based on spec-card and codebase, find insufficient areas. Only ask what AI cannot decide.

Gap types:
- Missing architecture decisions scoped to this milestone
- Unclear scope: "Does this include X or just Y?"
- Unconfirmed technical constraints
- Priority conflicts between features

**Decision principle**: If AI can decide → decide and record in `decisions/D{n}-{topic}.md`. Only ask if it's a user-only decision (business, preference, environment).

### Phase 3: Conventions

Before breaking down tasks, establish/update `conventions.md`:

```markdown
# Project Conventions

## Colors
- Primary: #3B82F6
- Danger: #EF4444

## Components  
- One component per file, PascalCase

## Code Style
- async/await over .then()
- Early returns over nested if/else
```

Every task execution reads this file. Every quick fix reads this file. This is the consistency anchor.

### Phase 4: Work Breakdown

Break the milestone into: **Sprints → Tasks → Waves**

```
Milestone (active only)
  └─ Sprint — verifiable unit
       └─ Task — completable in one session (≤35 min)
            └─ Wave — tasks in same wave run in parallel
```

**Breakdown rules**:
1. **Task size ceiling**: Estimated ≤35 min. If over → split automatically.
2. **Completion condition**: Definable in one sentence: "done when..."
3. **Minimize dependencies**: Enable parallel execution.
4. **Validation environment first**: Prerequisites from spec-card → milestone 1, sprint 1, wave 1.
5. **Harness as tool**: Only assign harness mode when genuine domain need exists.

**Difficulty → Model mapping**:
| Difficulty | Model | Criteria |
|-----------|-------|---------|
| easy | haiku | Boilerplate, config, CSS, constants |
| medium | sonnet | General features, bug fixes, refactoring |
| hard | sonnet | Complex multi-file — plan provides detailed spec |

Opus: planning + milestone QA only. Never execution.

### Phase 5: PM 6-Area Checklist (v2 mandatory)

Before saving the plan, Opus PM self-validates every task against 6 areas:

| Area | Check |
|------|-------|
| 1. Commands | Does the task have a specific, runnable command or action? |
| 2. Testing | Is there a verifiable acceptance criterion (not subjective)? |
| 3. Project structure | Are file paths explicit? |
| 4. Code style | Does conventions.md apply? Is it referenced? |
| 5. Boundaries | Is it clear what's OUT of scope for this task? |
| 6. References | Are relevant references/CoT templates linked in contextManifest? |

**+ v2 extra checks**:
- Task estimated ≤35 min? (if not: split)
- Verification criteria in natural language (user-checkable)?
- contextManifest complete?
- Guardrails set?

If any check fails: **self-correct** before showing to user. Ask user only for issues AI cannot fix.

### Phase 6: Self-Validate the Plan

**Check 1 — Executability**: Can code be written from just the `plan` field?
- Bad: "Create appropriate UI" ❌
- Good: "Create email+password form in src/components/Login.jsx. POST to /api/auth/login on submit." ✅

**Check 2 — Connectivity**: No gaps in dependency chain between tasks.

**Check 3 — Completeness**: All must-have features from spec-card covered.

**Check 4 — Verifiability**: Each task's acceptanceCriteria is actually checkable.

**Check 5 — Anti-stub**: No task that would produce a TODO/placeholder result (detect in plan description).

Self-correct without showing to user. Ask user only for uncorrectable issues.

## Output Format

Save to `project-plan.json`:

```json
{
  "projectName": "Project Name",
  "milestoneId": "M1",
  "milestones": [
    {
      "id": "M1",
      "name": "Milestone name",
      "description": "What will be demo-able when complete",
      "validationStrategy": "How to validate",
      "sprints": [
        {
          "id": "M1-S1",
          "name": "Sprint name",
          "description": "Description",
          "dependencies": [],
          "validationStrategy": "Integration validation method",
          "tasks": [
            {
              "id": "M1-S1-T1",
              "name": "Task name",
              "description": "What needs to be done",
              "plan": "Specifically how — file paths, function names, exact behavior",
              "dependencies": [],
              "difficulty": "easy | medium | hard",
              "model": "haiku | sonnet",
              "wave": 1,
              "executionMode": "single | single+skills | harness",
              "harnessId": null,
              "skills": [],
              "contextManifest": [
                { "path": "vision.json", "priority": 0 },
                { "path": "concept.json", "priority": 1 },
                { "path": "conventions.md", "priority": 2 },
                { "path": "references/ui-pattern.html", "priority": 3 },
                { "path": "decisions/D001-auth.md", "priority": 4 },
                { "path": "handoffs/M1-S1-T0.json", "priority": 5 }
              ],
              "cotTemplate": "prompts/cot/balance-decision.md",
              "acceptanceCriteria": [
                "src/index.html exists",
                "Contains <!DOCTYPE html> tag",
                "npm run build completes without errors"
              ],
              "mustHaves": {
                "truths": ["Page renders correctly in browser"],
                "artifacts": ["src/index.html"],
                "keyLinks": []
              },
              "validation": {
                "auto": ["build", "typecheck"],
                "manual": null
              },
              "guardrails": {
                "maxTurns": 20,
                "maxCostUSD": 2.0,
                "maxWallTimeMin": 35
              },
              "estimatedFiles": ["src/index.html"],
              "estimatedMinutes": 15
            }
          ]
        }
      ]
    }
  ],
  "createdAt": "2026-04-20T...",
  "totalTasks": 12,
  "modelDistribution": { "haiku": 4, "sonnet": 8 },
  "waveStats": { "maxWave": 3, "parallelizable": 8 }
}
```

## Showing the User

After saving, show tree-format summary:

```
마일스톤 M1: 기본 게임 루프 (12 태스크)
  ├─ 스프린트 1: 캔버스 셋업 (5 태스크, 3 웨이브)
  │   ├─ Wave 1: HTML 뼈대 [쉬움/빠름] + CSS 리셋 [쉬움/빠름]
  │   ├─ Wave 2: 게임 루프 [보통] + 입력 처리 [보통]
  │   └─ Wave 3: 통합 연결 [보통]
  └─ 스프린트 2: 캐릭터 (3 태스크, 2 웨이브)
      ├─ Wave 1: 캐릭터 렌더링 [보통]
      └─ Wave 2: 점프 물리 [보통] + 웅크리기 [보통]

총 태스크: 12 | 빠름 4개 / 보통 8개
병렬 가능: 8개 (67%)
예상 비용: ~$0.50 | 예상 시간: ~45분
```

Ask the user: "계획이에요. 바꿀 부분이 있나요, 아니면 진행할까요?"

## Plan Approval

On approval:
1. Add `"status": "approved"`, `"approvedAt"` to `project-plan.json`
2. Initialize `execution-state.json`:
```json
{
  "projectId": "card-battle",
  "milestoneId": "M1",
  "status": "ready",
  "currentSprint": null,
  "currentTask": null,
  "completedTasks": [],
  "failedTasks": [],
  "skippedTasks": [],
  "totalCost": 0,
  "guardrailEvents": [],
  "startedAt": null
}
```
3. Create `locks/` directory
4. Create `telemetry.jsonl` with header entry:
```json
{"t":"...","event":"plan_approved","milestoneId":"M1","totalTasks":12,"estimatedCostUSD":0.5}
```
5. Guide: "계획 승인됐어요. /taskforge-execute로 첫 번째 작업을 시작해볼까요!"
