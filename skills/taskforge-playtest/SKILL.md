---
name: taskforge-playtest
description: Runs a game-focused playtest session where the user verifies the milestone hands-on. Use when the user says "/taskforge-playtest", "let me play it", "I want to test it myself", "playtest", "is it fun", "check the game", or when a milestone validation has just passed and retro hasn't run yet. This is the game-specific extension of /taskforge-verify — use /taskforge-verify for non-game projects.
---

# Playtest — Hands-On Game Confirmation

After a milestone completes, the user plays the game and gives feedback.
Capture what was fun, what was confusing, and what to add next — then pass it all to the retrospective.

**User-facing tone**: "직접 해보시고 느낀 점을 알려주세요. 기술적인 내용은 몰라도 됩니다."
Plain language only. The user is a player right now, not a developer.

## Prerequisites

- A milestone must have completed and passed validation (`/taskforge-validate milestone`)
- The game must be runnable by the user (build/run instructions from spec-card's `validationStrategy`)
- All file paths below are relative to `_workspace/projects/{projectId}/`

## Project Selection

Same as `/taskforge-execute` — auto-select if only one project, ask if multiple.

## Flow

### Step 1: Set Up the Session

Read `spec-card.json` and `project-plan.json` to understand:
- What milestone just completed (which features should be playable)
- The `validationStrategy.functional.checklist` — the "what to check" list from discover
- Whether this is M0 (prototype milestone) — M0 gets special treatment (see below)

Then tell the user what to do to start the game:
```
이제 직접 해볼 시간이에요.

[How to run the game — from validationStrategy, in plain language]
예: "브라우저에서 index.html을 열어주세요." 또는 "Unity에서 플레이 버튼을 눌러주세요."

준비되면 알려주세요.
```

Wait for the user to confirm they're ready before starting the checklist.

### Step 2: Checklist Walk-Through

Present the functional checklist from the spec-card one item at a time — not all at once.

For each item:
```
확인 {n}/{total}: {feature name}

이렇게 해보세요:
1. [Specific action]
2. [What to look for]

→ 됐나요? 아니면 어떻게 됐는지 알려주세요.
```

Rules:
- One item at a time — wait for the user's response before moving on
- Tell the user exactly what to do and what to look for
- Accept plain answers: "됐어요", "안 됐어요", or a description of what happened
- If something failed, record it but keep going — don't stop the session to debug

### Step 3: Collect Qualitative Feedback

After the checklist is done, ask four questions — one at a time:

**Question 1**: "코어 루프(핵심 반복 행동)가 재미있었나요? 1점(전혀 아님)에서 5점(매우 재미있음) 사이로 알려주세요."

**Question 2**: "어디서 막히거나 헷갈리셨나요? (없으면 '없음'이라고 해주세요)"

**Question 3**: "가장 아쉬운 점 하나만 꼽는다면요?"

**Question 4**: "다음에 꼭 추가됐으면 하는 것이 있다면요?"

Wait for each answer before asking the next one.

### Step 4: M0 Special Gate (Prototype Milestone Only)

**Only run this step if the current milestone is M0 (the prototype/proof-of-concept milestone).**

Ask: "마지막으로, 이 프로토타입에서 핵심 재미가 검증됐다고 느끼시나요?"

Give three options:
- **Y (네)** — Core fun confirmed
- **N (아니요)** — Core fun not confirmed
- **부분적 (어느 정도)** — Partially confirmed

**If Y:**
```
좋아요! 이 프로토타입이 앞으로 모든 작업의 레퍼런스가 됩니다.

지금 만들어진 것들을 레퍼런스로 저장해드릴게요.
[Scan references/ directory and list what's there]

추가로 레퍼런스로 남기고 싶은 것이 있나요?
(예: "이 씬의 느낌", "이 조작감", "이 사운드 타이밍")
```

Add user-suggested items to the playtest.md references section.

**If N:**
```
핵심 재미가 아직 없다면, 다음 마일스톤으로 넘어가기 전에 방향을 다시 잡는 게 좋을 것 같아요.

concept.json을 다시 검토해볼까요?
- 코어 루프를 바꿔볼까요?
- 다른 재미 요소를 시도해볼까요?
- 아니면 지금 만든 것에서 어떤 부분이 잘못된 것 같으신가요?

(이 단계가 concept을 수정할 수 있는 유일한 기회예요.)
```

Guide the user through reviewing `concept.json` and updating the core loop definition.
Do NOT proceed to retro until the user decides: fix the prototype or accept and move on.

**If 부분적:**
```
어느 정도 재미가 있군요. 어떤 부분이 재미있었고 어떤 부분이 아쉬웠나요?
```

Capture the details, then ask: "계속 진행할까요, 아니면 조금 더 다듬어볼까요?"
Let the user decide — record their choice in playtest.md.

### Step 5: References Scan (M0 or user request)

If M0 and core fun was confirmed (Y or 부분적 + user wants to proceed):

Scan `references/` directory and list its contents.
Ask: "레퍼런스 폴더에 추가하고 싶은 게 있나요? 현재 프로토타입에서 '이것만큼은 유지하고 싶다'는 것들이요."

Examples to prompt the user:
- 특정 조작감이나 반응 속도
- 화면 구성이나 색감
- 사운드나 피드백 타이밍
- 밸런스 수치나 규칙

Record suggestions in the playtest.md `references` section.

### Step 6: Save Playtest Results

Save to `milestones/{milestoneId}/playtest.md`:

```markdown
# M{id} 플레이테스트 — {날짜}

## 체크리스트 결과
- [x] {feature} — {user's comment if any}
- [ ] {feature} — {what went wrong}

## 재미 판정 (M0 전용)
핵심 재미 검증: Y / N / 부분적
이유: {user's words, verbatim if possible}

## 정성 피드백
재미도: {점수}/5
막힌 부분: {user's answer}
가장 아쉬운 점: {user's answer}
다음에 추가됐으면: {user's answer}

## 레퍼런스 추가 제안
- references/에 추가 권장: {list of items}
```

Rules for saving:
- Use the user's actual words, not a paraphrase
- If a checklist item failed, record what the user described — not a technical diagnosis
- M0 fun judgment section is only included for M0 milestones

### Step 7: Wrap Up

```
플레이테스트가 끝났어요. 피드백을 저장했습니다.

체크리스트: {passed}/{total} 통과
재미도: {score}/5

[If issues found]: {n}개 항목에서 문제가 있었어요. 회고에서 같이 검토할게요.

다음 단계: /taskforge-retro 를 실행하면 회고와 함께 다음 마일스톤 계획을 점검할게요.
```

## Storage

| File | What it contains |
|------|-----------------|
| `milestones/{milestoneId}/playtest.md` | Full playtest session record |

This file is automatically read by `/taskforge-retro` as evidence input.

## Integration with Other Skills

| Skill | Relationship |
|-------|-------------|
| `/taskforge-validate milestone` | Must pass before playtest runs |
| `/taskforge-verify` | Similar but for non-game projects; playtest extends it with fun metrics and M0 gate |
| `/taskforge-retro` | Reads `playtest.md` as input — run playtest before retro |
| `/taskforge-discover` | M0 core loop changes flow back into concept.json via retro |

## Milestone Sequence

```
/taskforge-validate milestone  →  /taskforge-playtest  →  /taskforge-retro  →  /taskforge-discover (next milestone)
```

This is the recommended sequence. Each step's output feeds into the next.

## Notes

- If the user hasn't run the game yet, help them start it before asking any questions. Don't proceed with an imaginary playtest.
- Accept vague answers gracefully. "그냥 재미없었어요" is a valid answer — record it and move on.
- M0's core fun gate is the ONLY point where `concept.json` can be revised. After M0, the core loop is locked — new features are additions, not replacements.
- If the user wants to skip a question, accept "없음" / "패스" and move on — don't push.
- Never tell the user their feedback is wrong or suggest what the "correct" answer is.
