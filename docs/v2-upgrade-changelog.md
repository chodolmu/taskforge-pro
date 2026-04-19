# TaskForge Pro v2 업그레이드 기록

**작성일**: 2026-04-20
**범위**: v1 → v2 전면 재설계
**근거 문서**: `docs/taskforge-v2-design-reference.html`

---

## 한 줄 요약

v1의 "Discover 한 방에 전체 프로젝트 정의" 모델을 버리고, **Vision(고정) → Concept(M0 후 고정) → Roadmap(살아있음) → Plan(현재 마일스톤만 JIT)** 의 3층 구조로 전환. 파일시스템을 AI의 외부 기억으로 쓰는 방식으로 통일.

---

## 1. 신규 파일 (5개)

### 신규 스킬 3개

| 파일 | 줄 수 | 역할 |
|------|------|------|
| `skills/taskforge-vision/SKILL.md` | 251 | 프로젝트의 "왜" 고정 + 마일스톤 스케치. `vision.json`, `concept.json`, `roadmap.json` 생성. 대규모 프로젝트 진입점 |
| `skills/taskforge-playtest/SKILL.md` | 216 | 게임 특화 UAT. 체크리스트 + 4개 정성 질문 + M0 한정 핵심 재미 판정 게이트 (concept.json 수정 가능한 유일한 지점) |
| `skills/taskforge-retro/SKILL.md` | 194 | 마일스톤 회고 자동 작성. 증거 수집(evidence → 분석 → 로드맵 갱신 제안 → 다음 마일스톤 handoff 준비) |

### 참고 문서 2개

| 파일 | 줄 수 | 내용 |
|------|------|------|
| `docs/taskforge-v2-design-reference.html` | 602 | v2 설계안 — 7개 개선안 + 버린 아이디어 + 리서치 근거 (사용자 제공) |
| `docs/taskforge-v2-validation-plan.html` | 495 | v2 검증 계획 — 3-Phase, telemetry.jsonl 자동 집계, Phase 1 S1~S6 Go/No-Go 기준 |

---

## 2. 수정된 파일 (12개)

### CLAUDE.md — v2 전면 재작성
- "AI-Native Principles" 10개 원칙 추가
- 3층 구조 + JIT 워크플로우 도입
- Size Gate (tiny/normal/feature/milestone) 라우팅 테이블 추가
- Guardrail 기본값 (maxTurns 20 / maxCostUSD $2 / maxWallTimeMin 35) 명문화
- 출력 디렉토리 구조에 `vision.json`, `concept.json`, `roadmap.json`, `telemetry.jsonl`, `references/`, `prompts/cot/`, `decisions/`, `milestones/` 추가
- "Plain Language Map" (사용자 노출 금지 용어 → 일반어 변환표) 추가

### skills/taskforge-discover/SKILL.md — JIT 마일스톤 상세화로 재정의
- vision/roadmap 존재 여부 분기 추가
- 레퍼런스 수집 단계(`references/`, `references/visual/`, `constraints.md`) 추가
- CoT 스캐폴드 자동 생성(`prompts/cot/`) 추가
- Decisions 기록(`decisions/D{n}-topic.md`) 추가
- Completion checklist(`verification.md`) 생성 단계 추가
- spec-card에 `milestoneId`, `references`, `cotTemplates` 필드 추가

### skills/taskforge-plan/SKILL.md — 현재 마일스톤 한정 JIT 분해
- **PM 6-area 체크리스트** 필수화 (Commands / Testing / Structure / Style / Boundaries / References)
- 태스크 35분 상한 강제(초과 시 자동 분할)
- `contextManifest` 필드 도입 (priority 순서로 읽을 파일 리스트)
- `cotTemplate` 필드 도입
- `guardrails` 필드 도입
- `estimatedMinutes` 필드 도입
- Phase 0 (active milestone 결정) 단계 추가
- 계획 승인 시 `telemetry.jsonl`에 `plan_approved` 이벤트 기록

### skills/taskforge-execute/SKILL.md — 컨텍스트/가드레일/텔레메트리 통합
- Size Gate 사전 분류 추가
- contextManifest 기반 파일 읽기 (우선순위 순)
- Few-shot reference 자동 주입
- CoT 템플릿 주입 (있을 때만)
- Guardrail 실시간 감시 + 초과 시 중단 + 상태 저장
- Silent error 스캔 (TODO/FIXME/empty body/placeholder/debug/hardcoded secret)
- Handoff 기본 ON (tiny 외 모든 태스크)
- Telemetry 이벤트(`task_end`) 기록에 `retryCount`, `referencesInjected`, `cotUsed` 필드 포함

### skills/taskforge-execute-all/SKILL.md — v2 런타임 측정 추가
- Pre-flight size gate 검사
- Guardrail 누적 모니터링 (`guardrailCount >= 3` 시 경고)
- Silent error scan 루프
- Telemetry 이벤트 3종 정식화 (`task_start`, `task_end`, `sprint_complete`)
- `task_start` 이벤트에 `size`, `referencesInjected`, `cotUsed`, `manifestFiles` 필드 추가 (검증 계획 S1/S3 측정 근거)
- 스프린트 boundary에서 async validation + auto-refresh
- 마일스톤 완료 시 자동으로 `validate milestone → playtest → retro` 순서 안내

### skills/taskforge-validate/SKILL.md — Silent Error + 텔레메트리
- **Silent error scan** 섹션 추가 (task/sprint/milestone 3레벨 모두)
- 중증도 분류 (warn / error) — hardcoded secret은 error로 태스크 fail
- `guardrailEvents` 롤업 (sprint → milestone)
- sprint advisories 누적 → milestone gate에서 리뷰
- Telemetry 이벤트 (`task_validate`, `sprint_validate`, `milestone_validate`) 기록
- 마일스톤 통과 후 `playtest → retro → discover` 순서 자동 안내

### skills/taskforge-quick/SKILL.md — Size Gate 내장
- Size Gate 선행 분류 (tiny/normal/feature/milestone)
- feature 이상이면 `/taskforge-discover`로 라우팅 제안
- Reference check (project.references/에서 관련 파일 자동 포함)
- Silent error 스캔 추가
- Telemetry 이벤트(`quick_task`)에 `size` 필드 포함 (검증 계획 S2 측정 근거)

### skills/taskforge-status/SKILL.md — Roadmap/Telemetry 가시화
- Roadmap 진행 바 표시 (vision.json/roadmap.json 존재 시)
- `telemetry.jsonl`에서 실시간 비용 집계 + 남은 비용 추정
- `references/` 수집 개수 표시
- handoff의 `silentErrors` 경고 집계
- Milestone별 guardrail 발동 횟수 표시 (3회 이상 시 ⚠️)

### skills/taskforge-help/SKILL.md — v2 워크플로우 안내
- 대규모 / 소규모 / 빠른수정 3루트로 재구성
- v2 스킬 14개 전체 목록 + 용도 표
- 일반어 FAQ 추가 (기술 용어 노출 없이 사용자 상황 응답)

### skills/taskforge-cost/SKILL.md — telemetry.jsonl 기반으로 재작성
- Primary source를 `telemetry.jsonl`로 전환 (`execution-state.json`은 fallback)
- 모델별 실행 집계에서 **opus 제거** (opus는 PM/검증만 — "Other" 버킷으로 분리)
- `guardrail_triggered` 이벤트 집계 추가 (상위 3개 offender 표시)
- 일반어 출력 포맷

### skills/taskforge-plan-edit/SKILL.md — v2 필드 편집 가이드 추가
- **불일치 수정**: `hard=opus` → `hard=sonnet` (execution에 opus 금지 원칙 반영)
- **없는 명령 제거**: `/taskforge-plan-approve`, `/taskforge-pivot` 참조 삭제
- v2 필드 편집 규칙 추가: `contextManifest`, `cotTemplate`, `guardrails`, `estimatedMinutes`
- 35분 초과 시 태스크 분할 제안 자동화

### skills/taskforge-verify/SKILL.md — 없는 명령 참조 정리
- `/taskforge-audit` 참조 제거 (해당 명령 미존재 — validate milestone이 대체)
- `/taskforge-retry` 참조를 `/taskforge-execute`로 수정
- v2 스킬 연계 섹션 추가 (`validate`, `playtest`, `retro`와의 관계 명시)
- `verification.md` 파일(discover 산출물)이 baseline 역할 한다는 점 명시

---

## 3. 데이터 스키마 변경

### 신규 파일 (프로젝트당)

| 경로 | 생성자 | 역할 |
|------|--------|------|
| `vision.json` | vision | 프로젝트의 "왜" — 고정 불변 |
| `concept.json` | vision | 장르/코어 루프/레퍼런스 — M0 retro에서만 변경 |
| `roadmap.json` | vision | 마일스톤 리스트 — 매 retro마다 갱신 |
| `constraints.md` | discover | 절대 규칙 |
| `verification.md` | discover | 완성 체크리스트 (자연어) |
| `telemetry.jsonl` | plan/execute 등 | 이벤트 로그 — 자동 append |
| `references/` | discover/playtest | Few-shot 소스 디렉토리 |
| `references/visual/` | discover | 비주얼 레퍼런스 |
| `prompts/cot/` | discover | CoT 스캐폴드 템플릿 |
| `decisions/D{n}-{topic}.md` | discover/execute | 의사결정 기록 |
| `milestones/{id}/spec-card.json` | retro | 마일스톤 완료 시 스냅샷 |
| `milestones/{id}/plan.json` | retro | 마일스톤 완료 시 스냅샷 |
| `milestones/{id}/retrospective.md` | retro | 회고 기록 |
| `milestones/{id}/playtest.md` | playtest | 플레이테스트 기록 |

### 태스크 객체 신규 필드

```json
{
  "contextManifest": [
    { "path": "vision.json", "priority": 0 },
    { "path": "references/ui.html", "priority": 2 }
  ],
  "cotTemplate": "prompts/cot/balance-decision.md",
  "guardrails": {
    "maxTurns": 20,
    "maxCostUSD": 2.0,
    "maxWallTimeMin": 35
  },
  "estimatedMinutes": 15
}
```

### Handoff 객체 신규 필드

```json
{
  "silentErrors": [],
  "guardrailEvents": [],
  "decisionsMade": [],
  "openItems": []
}
```

### Telemetry 이벤트 타입 (telemetry.jsonl)

| 이벤트 | 주요 필드 | 기록 지점 |
|--------|-----------|-----------|
| `plan_approved` | milestoneId, totalTasks, estimatedCostUSD | plan 승인 |
| `task_start` | taskId, wave, model, size, referencesInjected, cotUsed, manifestFiles | 태스크 시작 |
| `task_end` | taskId, outcome, retryCount, tokens, costUSD, wallMin | 태스크 종료 |
| `guardrail_triggered` | taskId, type, value, limit | 가드레일 발동 |
| `task_validate` | taskId, passed, silentErrors, acceptancePassed | 태스크 검증 |
| `sprint_validate` | sprintId, passed, advisory, stubCount | 스프린트 검증 |
| `sprint_complete` | sprintId, tasksCompleted, totalCostUSD, guardrailEvents | 스프린트 완료 |
| `milestone_validate` | milestoneId, passed, blocking | 마일스톤 검증 |
| `quick_task` | description, size, outcome, costUSD | quick 태스크 |
| `handoff_created` | taskId | handoff 저장 |

---

## 4. 원칙/정책 변경

| 영역 | v1 | v2 |
|------|----|----|
| 계획 시점 | Discover 한 번에 전체 정의 | Vision만 upfront, 마일스톤은 JIT |
| 마일스톤 detail | 전부 full | 현재 active 1개만 full, 나머지 sketch / name-only |
| Handoff | 조건부 (의존성 있을 때만) | 기본 ON (tiny 외 모든 태스크) |
| 태스크 크기 상한 | 없음 | 35분 (초과 시 자동 분할) |
| 가드레일 | 없음 | maxTurns/maxCostUSD/maxWallTimeMin 기본값 강제 |
| Silent error 탐지 | 없음 | task/sprint/milestone 3레벨 모두 스캔 |
| Opus 실행 | hard 태스크에 배정 가능 | 실행 절대 금지 (PM/검증만) |
| 비용 집계 | execution-state.json | telemetry.jsonl 우선, execution-state fallback |
| Few-shot 레퍼런스 | 없음 | references/ 수집 + contextManifest 주입 |
| CoT 스캐폴드 | 없음 | prompts/cot/ 자동 주입 |
| M0 컨셉 수정 | 불가 | playtest의 핵심 재미 게이트에서만 가능 |

---

## 5. 버린 아이디어 (design-reference.html §6)

이하 항목은 v2에 **넣지 않음** — 실전 1~2 프로젝트 후 재평가:

- patterns/ 전역 경험 축적
- 별도 Verifier 에이전트 (self-verifier 체크리스트로 대체)
- Agent Teams peer-to-peer 통신
- Living Spec (spec-as-source)
- 다중 모델 교차검증
- 의존성 자동 탐지 (IDE 영역)
- decisions/ 정식 프로세스 (자유 형식으로 시작)

---

## 6. 차별화 3요소 (design-reference.html §10)

BMAD/Spec Kit/Kiro와 다음 3가지로만 차별화:

1. **한국어 + 비개발자 UX** — 용어 숨김, 질문 기반 수집
2. **작업 크기 자동 분기** — tiny/normal/feature/milestone 4단계 (sledgehammer 문제 해결)
3. **Claude Code 네이티브** — 스킬/서브에이전트/락 기본 활용 (별도 IDE 불필요)

---

## 7. 검증 상태

### 정적 검증 (완료)
- 스킬 간 필드명 일관성 ✅ (`silentErrors` 통일, telemetry 스키마 일치)
- 존재하지 않는 명령 참조 제거 ✅
- PM 원칙(opus execution 금지) 전수 적용 ✅
- Design-reference 대비 누락 항목 점검 ✅ (verifiers/ → verification.md로 의도적 통합)

### 런타임 검증 (미실행)
- Phase 1 Smoke Test S1~S6 — 실제 프로젝트 1개 돌려야 측정 가능
- Phase 2 A/B 비교 — 3개 프로젝트 필요
- Phase 3 실전 검증 — 2~3개월 누적

검증 계획 상세: `docs/taskforge-v2-validation-plan.html`

---

## 8. 다음 단계 권장

1. 소형 게임 프로젝트 1개를 `/taskforge-vision`부터 실제 실행
2. `telemetry.jsonl`에서 S1~S6 자동 집계
3. Phase 1 통과 시 Phase 2로 진행
