---
name: taskforge-discover
description: Defines the current milestone in detail and generates a SpecCard. Use when the user says "/taskforge-discover", "define this milestone", "let's detail M1", or similar. In v2, discover runs per-milestone (JIT), not once for the whole project. If the user hasn't run /taskforge-vision yet, suggest it first for large projects.
model: opus
---

# Discover — Milestone Spec Definition (v2 JIT)

A skill that takes a milestone from `sketch` → `full` by asking focused questions and generating a SpecCard.

**v2 key change**: Discover runs *per milestone*, not once for the whole project. Only the active milestone gets a full spec. Future milestones stay as `sketch` or `name-only` until their turn.

Use friendly, accessible language. Never expose technical terms like "spec", "handoff", "few-shot", or "CoT" to the user.

## Step 0: Context Check

### Check for vision/roadmap (v2)
1. Look for `_workspace/projects/{projectId}/vision.json` and `roadmap.json`
2. If they **exist**: read them — this is a milestone-level discover. Show the user:
   ```
   프로젝트: {projectName}
   지금 작업할 마일스톤: {milestoneId} — {milestoneTitle}
   목적: {purpose}
   미결 질문: {openQuestions}
   
   이 마일스톤을 자세히 정의해볼게요.
   ```
3. If they **don't exist** and this looks like a large project (user mentions multiple phases/milestones): suggest `/taskforge-vision` first.
   ```
   큰 프로젝트처럼 보여요. 먼저 전체 방향을 가볍게 잡고 싶으면 /taskforge-vision을 써보세요.
   지금 바로 시작하고 싶으면 계속 진행할게요.
   ```
4. If this is a small/single-milestone project: proceed directly (no vision needed).

### Read prior context (v2 — mandatory for non-M0 milestones)

If this is **not** the first milestone (M0), read all of the following before asking the user any questions. Each file shapes the spec for this milestone:

| Source | What to extract |
|--------|----------------|
| `milestones/{previousMilestoneId}/retrospective.md` | "다음 마일스톤에 반영할 것" section — explicit instructions for *this* discover. "예상과 달랐던 것" — assumptions to revisit. |
| All `decisions/D*.md` files | Decisions already made — do not re-ask. If a decision's `재검토 조건` matches this milestone, flag it. |
| `constraints.md` | Hard rules. Apply throughout. Do not propose anything that violates them. |
| `concept.json` | Tech direction. Stay consistent unless concept is still unlocked (`lockedAt: null`). |
| Previous milestones' `handoffs/` (last 3-5 tasks of the prior milestone) | What actually got built last, what's open, what's next. |

If retrospective.md says something specific about this milestone (e.g. an entry of the form "M{n}: {artifact}에 '{topic}' 추가"), **fold it into the questions you ask the user — don't make them repeat themselves.**

If any of these files contradicts the user's request in this session, surface it:
```
이전 회고에서 "{내용}"이라고 정리됐는데, 지금 말씀하신 거랑 다른 방향 같아요. 그때 결정을 바꾸는 거예요, 아니면 제가 잘못 이해한 거예요?
```

### Check for existing projects
Before starting, scan `_workspace/projects/`:
- If projects exist, show them and ask: new project or continue existing?

## Step 1: Understand the Milestone Goal

If coming from vision/roadmap, the milestone purpose is already known. Confirm and refine:
- "이 마일스톤 끝나면 뭘 보여줄 수 있어야 해요?" (What should be demo-able when this milestone is done?)
- "지금 가장 확실한 것과, 아직 모르는 것을 나눠봐요."

If starting fresh (no vision):
- Start with: "뭘 만들고 싶으세요?"
- One question at a time. Don't interrogate.

## Step 2: Collect Reference Materials (Few-shot layer — hidden from user)

This step collects materials that will be silently converted into few-shot references for AI execution. **Never use terms like "few-shot" or "reference injection" with the user.**

Ask naturally — adapt the wording to the project type (game / app / tool / site / etc.):
- "비슷한 느낌의 {projectType}이 있어요? 이름, 링크, 스크린샷 뭐든 OK예요."
  → Save to `references/`
- "디자인 톤이 비슷한 이미지가 있나요? (없어도 됩니다)"
  → Save to `references/visual/`
- "이것만은 꼭 지켜야 한다는 규칙이 있나요?"
  → Save to `constraints.md`

**M0 prototype milestone special handling**:
- Frame it as: "이 단계에서 만든 결과물이 앞으로 모든 작업의 본보기가 돼요. 지금 가장 '이런 느낌이었으면' 하는 게 있나요?"
- Whatever they provide becomes the primary reference for all future milestones.

## Step 3: Decisions for This Milestone

Identify decisions needed *only for this milestone*. Don't front-load decisions for future milestones.

Gap types to check:
- Architecture choices scoped to this milestone
- Unclear scope boundaries ("does this include X or not?")
- Technical constraints ("which Unity version?", "online or offline?")

**Decision principles**:
- If AI can decide: decide and record in `decisions/D{n}-{topic}.md`. Don't ask the user.
- Only ask about things only the user can answer (business, preference, constraints).
- Record each decision: what was decided and why.

**Decision file format** (`decisions/D001-topic.md`):
```markdown
# D001: {주제}
- 상태: 결정됨
- 결정: {내용}
- 이유: {근거}
- 영향받는 파일: []
- 재검토 조건: {언제 다시 볼지}
```

## Step 4: Completion Checklist (Verifier layer — shown as plain checklist)

Define "done" for this milestone. Frame as a simple checklist:
- "이 마일스톤이 끝났다고 말하려면 뭐가 돼야 해요? 3가지만 말해줘요."

Convert answers to a verifiable checklist in `verification.md`:
```markdown
# {milestoneId} 완성 체크리스트

□ {조건 1 — 사용자가 직접 확인 가능한 문장}
□ {조건 2}
□ {조건 3}
```

**Good criteria**: an observable action with a measurable result (specific user input → specific outcome within a specific bound). Testable.
**Bad criteria**: subjective adjectives ("clean", "fast", "nice"). Not testable.

## Step 5: Tech Stack & Validation Strategy

If user is non-developer: AI recommends and briefly explains.
If user is developer: ask preferred stack.

Define validation strategy (same as v1 — platform-specific commands).

## Step 6: CoT Scaffold Generation (hidden from user)

For complex decision tasks identified in this milestone, silently generate a CoT template in `prompts/cot/`:

If a task involves a complex judgment (e.g., balance tuning, system design):
- Generate `prompts/cot/{topic}.md` with a reasoning scaffold:
  ```markdown
  # {주제} 결정 순서
  1. 현재 상태 확인
  2. 영향 범위 계산
  3. 극단 케이스 점검
  4. 최종 제안
  ```
- This is injected silently into execution context for matching tasks.

## Step 7: Confirm and Save

Show gathered information as a SpecCard summary (in plain language):

```
마일스톤: {id} — {title}
목표: {what will be demo-able when done}
핵심 기능:
  1. {feature A}
  2. {feature B}
기술: {stack}
본보기 자료: {references collected, if any}
완성 기준: {checklist summary}
결정된 사항: {decisions made}
```

On user confirmation: save.
On requested changes: update only relevant parts and show again.

## SpecCard Storage

### Project ID (if new project)
Generate from name: lowercase, spaces→hyphens, remove special chars.
Rule: `name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`

### Files to create/update

```
_workspace/projects/{projectId}/
├── spec-card.json              ← This milestone's full spec
├── verification.md             ← Completion checklist
├── constraints.md              ← Hard rules (append if exists)
├── references/                 ← Reference materials collected
│   └── {files from user}
├── prompts/
│   └── cot/
│       └── {topic}.md          ← CoT scaffolds (if any)
└── decisions/
    └── D{n}-{topic}.md         ← Decisions made
```

**spec-card.json schema (v2)**:
```json
{
  "projectId": "{projectId}",
  "projectName": "{projectName}",
  "milestoneId": "{milestoneId}",
  "projectType": "game | webapp | mobile | cli | api | other",
  "description": "One or two sentence milestone description",
  "targetUser": "Target users",
  "features": [
    { "name": "{feature name}", "priority": "must" },
    { "name": "{feature name}", "priority": "nice" }
  ],
  "techStack": ["HTML5", "JavaScript", "Canvas API"],
  "designDecisions": ["Single-player", "Works offline"],
  "references": ["references/ui-pattern.html", "references/visual/mood.png"],
  "cotTemplates": ["prompts/cot/balance-decision.md"],
  "validationStrategy": {
    "prerequisites": [],
    "build": { "command": "none", "auto": true },
    "run": { "command": "open index.html", "auto": false },
    "quality": { "command": "eslint src/", "auto": true },
    "functional": { "method": "checklist", "auto": false, "checklist": [] }
  },
  "createdAt": "2026-04-20T..."
}
```

Update `roadmap.json` milestone status: `detail: "sketch"` → `detail: "full"`, `status: "active"`.

## Guardrail Check (v2)

Before finishing, verify:
- [ ] At least one completion criterion is testable (not subjective)
- [ ] Milestone scope is achievable (not the entire project)
- [ ] At least one reference collected (or user explicitly said "없음")
- [ ] All decisions are recorded in `decisions/`

If any fail: ask one more focused question to fix it before saving.

## Notes

- One question at a time. Conversation, not interrogation.
- Non-developer users: AI decides tech choices and explains briefly.
- If user is vague: help clarify — that's the job of this skill.
- When done: "이제 /taskforge-plan으로 작업을 쪼갤 수 있어요."
- **v2 new**: Also mention "/taskforge-vision을 먼저 실행하면 전체 로드맵을 잡을 수 있어요" if this is a large project.
