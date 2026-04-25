# TaskForge Pro v2 — AI-Native Project Manager

An all-in-one plugin that lets anyone — including non-developers — complete projects easily with Claude Code.

**Core philosophy**: AI가 망각하는 것을 파일로 보상한다. 세션이 끊겨도 맥락이 살아있다.

**v2 key upgrades**:
- **3-layer structure**: Vision (fixed) → Concept (M0-locked) → Roadmap (living) → Plan (JIT per milestone)
- **References layer**: Few-shot examples, CoT scaffolds, verifier checklists — collected from user, injected silently
- **Size gate**: tiny → quick / normal → single task / feature → sprint / milestone → full flow
- **Guardrails**: maxTurns / maxCostUSD / maxWallTimeMin per task
- **Telemetry**: telemetry.jsonl auto-logging for all events
- **Silent error detection**: TODO/stub/placeholder/secret scans before marking done
- **Handoff always ON**: every task generates handoff (not conditional)
- **PM 6-area checklist**: mandatory self-validation before plan is shown to user

## 3 Core DNAs

| Source | Role | Contribution |
|--------|------|--------------|
| **TaskForge** | PM Framework | JIT planning, execution, tracking, model routing, handoff |
| **Harness-100** | Domain Experts | 100 domain-specific agent teams, 630 skills |
| **GSD** | Validation Framework | Goal-backward validation, interactive UAT, regression audits |

## Workflow (v2)

### Large Project (3+ milestones)
```
/taskforge-vision          → 비전 + 마일스톤 스케치 (vision.json, concept.json, roadmap.json)
    ↓
/taskforge-discover {M}    → 현재 마일스톤만 상세 정의 (spec-card, references, decisions)
    ↓
/taskforge-plan            → 현재 마일스톤만 태스크 분해 (JIT, PM 6-area 체크)
    ↓
/taskforge-execute-all     → 스프린트 자동 실행 (wave parallel, guardrails, telemetry)
    ↓ (sprint boundaries: async validation, non-blocking)
/taskforge-validate milestone  ← BLOCKING gate
    ↓
/taskforge-playtest        → 사용자 직접 확인 + 재미 판정
    ↓
/taskforge-retro           → 회고 + roadmap 갱신 + 다음 마일스톤 handoff
    ↓
/taskforge-discover {M+1}  → 다음 마일스톤 (반복)
```

### Small Project (1-2 milestones)
```
/taskforge-discover → /taskforge-plan → /taskforge-execute → /taskforge-validate → /taskforge-playtest
```

### Quick Fix
```
/taskforge-quick → done
```

**Validation gating policy**:
- Task: inline/blocking (cheap, immediate)
- Sprint: async/non-blocking (advisory, preserves wave parallelism)
- Milestone: blocking gate (goal-backward + cross-regression)

## AI-Native Principles (v2)

1. **JIT planning**: Vision only upfront. Milestone detail only when active.
2. **Filesystem = memory**: All context in files. Sessions can die; files live.
3. **Spec is a contract**: 6 areas mandatory — commands, testing, structure, style, boundaries, references.
4. **Size gate first**: Classify before acting. Tiny → quick. Don't overengineer.
5. **Handoff always**: Every non-tiny task leaves a handoff. Context never evaporates.
6. **References over prose**: A working example beats 10 lines of description.
7. **CoT for decisions**: Complex judgment → scaffold the reasoning steps.
8. **Guardrails**: maxTurns / maxCostUSD / maxWallTimeMin. No runaway agents.
9. **Silent error scan**: TODOs, stubs, placeholders caught before marking done.
10. **Telemetry**: Everything logged. Measurable = improvable.

## Size Gate (route classifier)

| Size | Signals | Route |
|------|---------|-------|
| tiny | Single file, CSS, config, copy | `/taskforge-quick` |
| normal | 2-3 files, bug fix, small feature | `/taskforge-execute` (single task) |
| feature | New component, design decision | `/taskforge-discover` + plan |
| milestone | Major feature, architectural | `/taskforge-vision` or `/taskforge-discover` |

## Difficulty → Model Mapping

The split is by **work type**, not by skill name. Every step that mostly *writes code* uses haiku/sonnet. Every step that mostly *makes judgments* (planning, propagation, orchestration, cross-context analysis) uses opus.

**Code-writing tasks** (haiku/sonnet only):

| Difficulty | Model | Criteria |
|------------|-------|----------|
| easy | haiku | Boilerplate, config, CSS, constants |
| medium | sonnet | Features, bug fixes, refactoring |
| hard | sonnet | Complex multi-file (plan provides detailed spec) |

**Judgment tasks** (opus required):

| Step | Why opus |
|------|----------|
| `/taskforge-vision` | Long-horizon project framing |
| `/taskforge-discover` | Spec design, gap analysis, decision recording |
| `/taskforge-plan` | Work breakdown, model routing, 6-area checklist |
| `/taskforge-plan-edit` | **Cross-file propagation** — edits ripple across roadmap/decisions/constraints/verification |
| `/taskforge-retro` | Roadmap mutation, learning extraction |
| `/taskforge-validate` (milestone) | Cross-regression, audit |
| Harness orchestrator | Team coordination, cross-validation, workflow judgment |

**Opus never for code-writing.** Opus is reserved for judgment/orchestration steps. Inside a harness, the orchestrator runs on opus while the worker agents (the ones that actually write code) stay on haiku/sonnet — same split, applied recursively.

Sprint validation = sonnet (advisory, not gating).

## Guardrail Defaults (per task)

| Limit | Default | Behavior on trigger |
|-------|---------|---------------------|
| maxTurns | 20 | Stop, save state, report to user |
| maxCostUSD | $2.00 | Stop, save state, report to user |
| maxWallTimeMin | 35 | Stop, save state, report to user |

## Outputs (_workspace/) — v2

```
_workspace/
└── projects/
    └── {projectId}/
        ├── vision.json             ← 고정 불변 (v2 신규)
        ├── concept.json            ← 구현 방향 — M0 retro에서만 변경 (v2 신규)
        ├── roadmap.json            ← 마일스톤 리스트, 매 retro 갱신 (v2 신규)
        ├── spec-card.json          ← 현재 active 마일스톤 spec
        ├── project-plan.json       ← 현재 active 마일스톤 태스크
        ├── conventions.md          ← 프로젝트 컨벤션
        ├── constraints.md          ← 절대 규칙 (v2 신규)
        ├── verification.md         ← 완성 체크리스트 (v2 신규)
        ├── execution-state.json    ← 실행 상태
        ├── telemetry.jsonl         ← 자동 측정 로그 (v2 신규)
        ├── references/             ← few-shot 레퍼런스 (v2 신규)
        │   └── visual/
        ├── prompts/cot/            ← CoT 스캐폴드 (v2 신규)
        ├── decisions/              ← 의사결정 기록 (v2 신규)
        │   └── D{n}-{topic}.md
        ├── locks/                  ← 태스크 락 (멀티세션)
        │   └── {task-id}.lock
        ├── handoffs/               ← 태스크 handoff (기본 ON — v2 변경)
        │   └── {task-id}.json
        ├── validations/            ← 검증 결과
        │   ├── task-{id}.json
        │   ├── sprint-{id}.json
        │   ├── uat-sprint-{id}.md
        │   └── audit-milestone-{id}.md
        └── milestones/             ← 완료 마일스톤 아카이브 (v2 신규)
            └── {milestoneId}/
                ├── spec-card.json  (스냅샷)
                ├── plan.json       (스냅샷)
                ├── retrospective.md
                └── playtest.md
```

## Skill Structure (v2)

```
skills/
├── taskforge-vision/SKILL.md       ← 비전 + 마일스톤 스케치 [NEW v2]
├── taskforge-discover/SKILL.md     ← 마일스톤 상세 정의 (JIT, references 수집)
├── taskforge-plan/SKILL.md         ← 태스크 분해 (JIT, PM 6-area 체크, guardrails)
├── taskforge-plan-edit/SKILL.md    ← 계획 수정
├── taskforge-execute/SKILL.md      ← 태스크 실행 (contextManifest, guardrails, telemetry)
├── taskforge-execute-all/SKILL.md  ← 스프린트 자동 실행
├── taskforge-quick/SKILL.md        ← 즉시 실행 (size gate 내장)
├── taskforge-validate/SKILL.md     ← 검증 (silent error 추가)
├── taskforge-playtest/SKILL.md     ← 플레이테스트 + 재미 판정 [NEW v2]
├── taskforge-retro/SKILL.md        ← 회고 + roadmap 갱신 [NEW v2]
├── taskforge-verify/SKILL.md       ← 대화형 UAT
├── taskforge-status/SKILL.md       ← 진행 상황 (roadmap 포함)
├── taskforge-cost/SKILL.md         ← 비용 요약
└── taskforge-help/SKILL.md         ← 전체 가이드
```

## UX Principles (non-developer friendly)

**Never expose to users**: spec, handoff, few-shot, CoT, telemetry, contextManifest, guardrail, sprint, milestone (use plain language alternatives)

**Plain language map**:
| Technical | User-facing |
|-----------|-------------|
| spec-card | 프로젝트 정의 |
| milestone | 단계 |
| sprint | 묶음 작업 |
| handoff | (숨김) |
| few-shot reference | 본보기 자료 |
| CoT template | 생각 순서 |
| verifier | 완성 체크리스트 |
| guardrail | (숨김, 발동 시 "작업이 예상보다 복잡해요") |
| telemetry | (숨김) |

## Validation Framework

| Unit | Timing | Method | Gating |
|------|--------|--------|--------|
| Task | Every completion | Build + lint + acceptance criteria + **silent error scan** | inline/blocking |
| Sprint | Sprint completion | Goal-backward + code review + guardrail rollup | async/advisory |
| Milestone | Milestone completion | 3-source cross-regression + silent error + handoff check | **blocking gate** |

## Differentiation (v2)

TaskForge v2는 BMAD/Spec Kit/Kiro와 다음 3가지로 차별화:
1. **한국어 + 비개발자 UX**: 용어 숨김, 질문 기반. 경쟁 도구 전부 영어 + 개발자 타겟.
2. **작업 크기 자동 분기**: tiny에 오버엔지니어링 없음. 경쟁 도구 전부 "sledgehammer" 문제.
3. **Claude Code 네이티브**: 스킬/서브에이전트/락 기본 활용. 별도 IDE 불필요.
