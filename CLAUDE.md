# TaskForge Pro — 통합 프로젝트 매니저

비개발자도 Claude Code를 쉽게 사용하여 프로젝트를 완성할 수 있게 하는 올인원 플러그인.
**TaskForge PM + Harness-100 도메인 전문가 + GSD 검증 체계**를 하나로 통합.

핵심 철학: **잘게 쪼개서, 명확하게, 깨끗한 컨텍스트에서, 전문가와 함께.**

## 3가지 DNA

| 출처 | 역할 | 기여 |
|------|------|------|
| **TaskForge** | PM 프레임워크 | 계획/실행/추적, 모델 배치, Handoff |
| **Harness-100** | 도메인 전문가 | 100개 분야별 에이전트 팀, 630개 스킬 |
| **GSD** | 검증 체계 | Goal-backward 검증, 대화형 UAT, 회귀 감사 |

## 워크플로우

```
/discover → /plan → /plan:approve
    ↓
  [/discuss]  ← 회색지대 식별 (선택)
    ↓
  /execute (반복, wave 병렬 지원)
    ↓
  /validate   ← goal-backward 강화
    ↓
  [/verify]   ← 대화형 UAT (선택)
    ↓
  /refresh → 다음 스프린트
    ↓
  [/audit]    ← 마일스톤 회귀 검증 (선택)
    ↓
  /wrap
```

### 프로젝트 시작
- `/discover` — 대화로 프로젝트 정의, SpecCard 생성
- `/plan` — Opus PM이 마일스톤/스프린트/태스크 분할 (wave 병렬 + mustHaves)
- `/plan:edit` — 계획 수정 (태스크 추가/삭제/변경)
- `/plan:approve` — 계획 승인, 실행 가능 상태로

### 실행 전 준비
- `/discuss` — 스프린트 시작 전 회색지대 식별 + 의사결정 기록

### 실행
- `/execute` — 다음 태스크 1개 실행 (wave 병렬 + acceptance criteria)
- `/execute:all` — 스프린트 끝까지 자동 연속 실행
- `/quick` — 계획 없이 빠른 단일 작업 실행
- `/handoff` — 작업 이력 생성 (보통 /execute가 자동 호출)

### 검증 (3단계)
- `/validate` — goal-backward 검증 (truths → artifacts → wiring)
- `/verify` — 대화형 UAT (사용자가 직접 확인)
- `/audit` — 마일스톤 교차 회귀 검증

### 모니터링
- `/status` — 전체 진행 상황 트리 표시
- `/cost` — 모델별 비용 요약

### 적응
- `/refresh` — 스프린트 완료 후 후속 계획 갱신
- `/pivot` — 방향 전환, 남은 계획 전면 재설계
- `/retry` — 실패 태스크 재시도
- `/skip` — 태스크 건너뛰기

### 하네스 직접 사용
- `/browse-harness` — 100개 하네스 카탈로그 검색
- `/use-harness` — PM 없이 하네스 직접 실행

### 전환
- `/resume` — 새 세션에서 프로젝트 이어받기
- `/wrap` — 프로젝트 마무리 (최종 QA + 보고서)
- `/help` — 전체 사용법 안내

## 작업 분할 계층

```
프로젝트 (Project)
  └─ 마일스톤 (Milestone) — 배포/데모 가능한 단위
       └─ 스프린트 (Sprint) — 검증 가능한 단위
            └─ 태스크 (Task) — AI가 한 세션에서 완료할 수 있는 최소 단위
                 └─ Wave — 같은 wave의 태스크는 병렬 실행 가능
```

## 난이도 → 모델 매핑

| 난이도 | 모델 | 기준 |
|--------|------|------|
| easy | haiku | 보일러플레이트, 설정, 단순 복사, CSS |
| medium | sonnet | 일반 기능 구현, 버그 수정, 리팩토링 |
| hard | opus | 아키텍처 설계, 복잡한 알고리즘, 다중 파일 변경 |

고정 배치: PM(계획)=opus, Discovery=opus, 스프린트 검증=sonnet, 마일스톤 QA=opus

## 실행 모드 (3가지)

| 모드 | 설명 | 예시 |
|------|------|------|
| **single** | 에이전트 1명, 스킬 없음 | "HTML 뼈대 만들기" |
| **single + skills** | 에이전트 1명 + 도메인 스킬 주입 | "API 보안 적용" + api-security-checklist |
| **harness** | 멀티에이전트 팀 + 스킬 | "게임 밸런싱 설계" → game-balance 하네스 |

스킬과 하네스는 `harnesses/` 디렉토리에 내장. 별도 설치 불필요.

## 검증 체계

| 단위 | 타이밍 | 방법 | 도구 |
|------|--------|------|------|
| 태스크 | 매 완료 시 | 빌드, 타입체크, 린트 + acceptance criteria | `/validate` |
| 스프린트 | 스프린트 완료 시 | goal-backward (truths→artifacts→wiring) + 코드 리뷰 | `/validate` + `/verify` |
| 마일스톤 | 마일스톤 완료 시 | 교차 회귀 검증 + 전체 QA | `/audit` |

### Goal-Backward 검증 (GSD 흡수)
1. **Truths**: 목표 달성을 위해 참이어야 하는 것들
2. **Artifacts**: 그 참을 위해 존재해야 하는 파일들
3. **Key Links**: 파일들이 실제로 연결(wired)되어 있는지

태스크 완료 ≠ 목표 달성. 플레이스홀더로 "완료"될 수 있으므로 goal-backward로 검증.

## 하네스 카탈로그 (100개)

`harnesses/INDEX.md`에서 전체 목록 확인. 카테고리:

| 카테고리 | 수량 | 예시 |
|----------|------|------|
| 콘텐츠 | 15 | YouTube, 팟캐스트, 뉴스레터, 게임 내러티브 |
| 소프트웨어 | 15 | 풀스택 웹앱, API 설계, 모바일 앱 |
| 데이터/ML | 12 | ML 실험, 데이터 분석, NLP |
| 비즈니스 | 13 | 스타트업 전략, 시장 조사, 가격 전략 |
| 교육 | 10 | 언어 학습, 시험 준비, 코딩 교육 |
| 법률 | 7 | 계약 분석, 특허, GDPR |
| 건강 | 8 | 식단, 피트니스, 세금 |
| 커뮤니케이션 | 8 | 기술 문서, 제안서, 위기 소통 |
| 운영 | 7 | 채용, 온보딩, 감사 |
| 전문 | 5 | 부동산, 이커머스, IP |

## 산출물 (_workspace/)

```
_workspace/
├── spec-card.json              — 프로젝트 정의 (discover)
├── project-plan.json           — 작업 계획 트리 (plan) — wave/mustHaves 포함
├── execution-state.json        — 실행 상태 (execute)
├── contexts/                   — 의사결정 기록 (discuss)
│   └── sprint-{id}.md
├── handoffs/                   — 태스크별 handoff
│   └── {task-id}.json
├── validations/                — 검증 결과
│   ├── task-{id}.json         — 태스크 검증
│   ├── sprint-{id}.json       — 스프린트 goal-backward 검증
│   ├── uat-sprint-{id}.md     — 대화형 UAT
│   ├── milestone-{id}.json    — 마일스톤 검증
│   └── audit-milestone-{id}.md — 회귀 감사
└── project-report.md           — 완료 보고서 (wrap)
```

## 스킬 구조

```
skills/
├── discover/SKILL.md           — 프로젝트 정의
├── discuss/SKILL.md            — 회색지대 식별 (NEW)
├── plan/SKILL.md               — 작업 분할 (강화)
├── plan-edit/SKILL.md          — 계획 수정
├── plan-approve/SKILL.md       — 계획 승인
├── execute/SKILL.md            — 태스크 실행 (강화)
├── execute-all/SKILL.md        — 스프린트 자동 실행 (강화)
├── quick/SKILL.md              — 빠른 실행 (NEW)
├── handoff/SKILL.md            — 작업 이력
├── validate/SKILL.md           — 검증 (대폭 강화)
├── verify/SKILL.md             — 대화형 UAT (NEW)
├── audit/SKILL.md              — 회귀 검증 (NEW)
├── status/SKILL.md             — 진행 상황
├── cost/SKILL.md               — 비용 요약
├── refresh/SKILL.md            — 계획 갱신
├── pivot/SKILL.md              — 방향 전환
├── retry/SKILL.md              — 재시도
├── skip/SKILL.md               — 건너뛰기
├── resume/SKILL.md             — 이어받기
├── wrap/SKILL.md               — 마무리
├── browse-harness/SKILL.md     — 하네스 검색 (NEW)
├── use-harness/SKILL.md        — 하네스 직접 실행 (NEW)
└── help/SKILL.md               — 사용법 안내 (NEW)
```
