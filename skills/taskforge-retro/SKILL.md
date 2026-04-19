---
name: taskforge-retro
description: Runs a milestone retrospective after validation passes and updates the roadmap. Use when the user says "/taskforge-retro", "let's do a retro", "retrospective", "what did we learn", "update the roadmap", or when a milestone validation has just passed and the next milestone hasn't started yet.
---

# Retro — Milestone Retrospective & Roadmap Update

After a milestone completes, look back at what happened, learn from it, and update the plan going forward.
Save everything so the next milestone starts with the benefit of what this one taught us.

**User-facing tone**: "마일스톤 회고를 정리할게요. 다음 단계 계획도 같이 점검해봐요."
No technical jargon. Speak plainly as if reviewing a project with a non-developer collaborator.

## Prerequisites

- A milestone must have completed and passed validation (`/taskforge-validate milestone`)
- Playtest results should exist (`milestones/{milestoneId}/playtest.md`) — if not, ask the user if they want to run `/taskforge-playtest` first, or proceed without it
- All file paths below are relative to `_workspace/projects/{projectId}/`

## Project Selection

Same as `/taskforge-execute` — auto-select if only one project, ask if multiple.

## Flow

### Step 1: Gather the Evidence

Automatically read all available evidence from the completed milestone without asking the user:

1. `project-plan.json` — all tasks in the milestone (planned estimates, wave assignments, difficulty)
2. `execution-state.json` — actual completion times, retries, skips
3. `handoffs/{task-id}.json` — what each task actually did, known issues, changed files
4. `validations/task-{id}.json` — which tasks passed/failed validation and why
5. `validations/sprint-{id}.json` — sprint-level advisory warnings
6. `validations/audit-milestone-{id}.md` — milestone audit findings
7. `milestones/{milestoneId}/playtest.md` — playtest feedback (if exists)

If any of these files are missing, note it and continue — don't block on incomplete evidence.

### Step 2: Analyze What Happened

Analyze the gathered evidence across four dimensions:

#### 2a. Slow Tasks (35+ minutes)
Identify any task that took significantly longer than expected.

For each:
- What was the original estimate?
- How long did it actually take?
- Why? (complexity underestimated, unexpected dependency, tooling issue, etc.)
- What would we do differently in the plan next time?

#### 2b. Flipped Assumptions
Find places where the plan assumed one thing but reality was different.

Examples:
- A task was planned as "easy" but required multiple retries
- A dependency that wasn't in the plan surfaced mid-sprint
- A feature that seemed simple turned out to need a different approach
- An acceptance criterion that was wrong from the start

For each: what was assumed, what was true, why it matters.

#### 2c. New Requirements Discovered
Identify requirements that weren't in the original SpecCard or plan but emerged during execution.

Examples:
- An edge case the user brought up during UAT
- A feature dependency that only became visible once the adjacent feature was built
- A performance constraint that wasn't anticipated

For each: is it already handled, or does it need a task in a future sprint?

#### 2d. Anti-Patterns Flagged
Collect all anti-pattern warnings from `validations/sprint-{id}.json` and `validations/audit-milestone-{id}.md`.

Summarize: which patterns appeared most often, in which files, and whether they were fixed or carried forward.

### Step 3: Review the Roadmap

Read `roadmap.json` (if it exists at `_workspace/projects/{projectId}/roadmap.json`).

For each remaining milestone that hasn't started yet, evaluate:

| Question | Action if yes |
|----------|---------------|
| Is the goal still valid given what we learned? | Keep as-is |
| Has the scope changed? | Update `description` or `openQuestions` |
| Should the order change? | Suggest reordering |
| Is there a new milestone needed? | Propose adding it |
| Is a milestone now unnecessary? | Propose removing it |

Summarize proposed roadmap changes clearly in plain language. Then ask:
"Would you like to apply these changes to the roadmap?"

Wait for user confirmation before writing to `roadmap.json`.

If `roadmap.json` doesn't exist, skip this step and note that roadmap tracking isn't set up.

### Step 4: Write the Retrospective

Save `milestones/{milestoneId}/retrospective.md`:

```markdown
# M{id} 회고 — {날짜}

## 잘 된 것
- ...

## 예상과 달랐던 것
- ...

## 다음 마일스톤에 반영할 것
- ...

## roadmap 변경사항
- M2: openQuestions에 "결제 PG사 선택" 추가
- M3: "관리자 대시보드" → 우선순위 낮춤

## 레퍼런스로 추가할 것
- references/에 추가 권장: ...
```

Rules for writing:
- Use plain language. No jargon. Write as if explaining to the person who will do the next milestone.
- "잘 된 것" — at least one positive finding. If the milestone passed, there is always something that went well.
- "예상과 달랐던 것" — honest. Not blame. Just what happened vs. what was expected.
- "다음 마일스톤에 반영할 것" — concrete and actionable. Not "be more careful" — specific decisions.
- "roadmap 변경사항" — only include if roadmap changes were approved by the user.
- "레퍼런스로 추가할 것" — any external links, tools, patterns, or examples worth adding to `references/`.

### Step 5: Archive the Milestone

Create a snapshot of the milestone's state at the time of retro:

1. Copy `spec-card.json` → `milestones/{milestoneId}/spec-card.json`
2. Extract just the completed milestone's data from `project-plan.json` → `milestones/{milestoneId}/plan.json`
3. `retrospective.md` is already saved in step 4

This archive is the "source of truth" for what was built and what was learned at the end of this milestone.

### Step 6: Prepare Handoff for Next Discovery

The `retrospective.md` file is automatically picked up by `/taskforge-discover {nextMilestoneId}` when it runs.

Tell the user:
"다음 마일스톤을 시작할 때 `/taskforge-discover`를 실행하면 이번 회고 내용이 자동으로 반영됩니다."

No action needed from the user — the file is already in the right place.

### Step 7: Summarize for the User

Present a short, plain-language summary (not a wall of data):

```
M{id} 회고가 완료됐어요.

잘 된 것: [1-2 highlights]
예상과 달랐던 것: [most important finding]
다음에 반영할 것: [most important action]

[If roadmap was updated]: 로드맵도 업데이트했어요 — [brief summary of changes]

다음 단계:
- 플레이테스트 아직 안 하셨다면: /taskforge-playtest
- 다음 마일스톤 시작: /taskforge-discover
```

## Storage

All files saved under `_workspace/projects/{projectId}/`:

| File | What it contains |
|------|-----------------|
| `milestones/{milestoneId}/retrospective.md` | Full retrospective (handoff for next discover) |
| `milestones/{milestoneId}/spec-card.json` | Snapshot of spec-card at milestone completion |
| `milestones/{milestoneId}/plan.json` | Snapshot of this milestone's tasks and results |
| `roadmap.json` | Updated roadmap (if changes were approved) |

## Integration with Other Skills

| Skill | Relationship |
|-------|-------------|
| `/taskforge-validate milestone` | Must pass before retro runs |
| `/taskforge-playtest` | Should run before retro — playtest.md is read as input |
| `/taskforge-discover` | Reads `milestones/{milestoneId}/retrospective.md` as a handoff |
| `/taskforge-plan` | Can reference retrospective to adjust difficulty estimates |

## Notes

- Never run retro before milestone validation has passed. If the user tries, redirect: "먼저 마일스톤 검증을 완료해주세요. `/taskforge-validate milestone`을 실행해볼게요."
- If playtest.md doesn't exist, ask once: "플레이테스트 결과가 없네요. 먼저 `/taskforge-playtest`를 실행하시겠어요, 아니면 회고를 바로 진행할까요?"
- Roadmap changes require explicit user approval. Never write to `roadmap.json` without confirmation.
- The retrospective is a forward-looking document, not a post-mortem. Focus on "what do we do better next time" — not on assigning blame.
