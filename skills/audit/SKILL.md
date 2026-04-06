---
name: audit
description: 마일스톤 완료 시 교차 회귀 검증을 실행한다. "/audit", "감사", "회귀 검증", "마일스톤 검증" 등을 말할 때 사용한다. 계획→handoff→실제 코드를 교차 대조하여 빠진 것, 끊어진 연결, 사라진 기능을 찾는다.
---

# Audit — 마일스톤 교차 회귀 검증

마일스톤이 완료되었을 때, 3가지 소스를 교차 대조하여 빠진 것이 없는지 검증한다.

**핵심**: 태스크가 "완료"라고 해서 기능이 "동작"하는 것은 아니다.

## 사전 조건

- 대상 마일스톤의 모든 스프린트가 완료 상태
- 없으면 안내: "먼저 마일스톤의 모든 스프린트를 완료해주세요"

## 3-Source 교차 검증

| 소스 | 무엇을 확인 |
|------|------------|
| **계획** (project-plan.json) | 각 태스크의 mustHaves, acceptanceCriteria |
| **Handoff** (handoffs/*.json) | 실제 수행한 작업, 변경 파일, 알려진 이슈 |
| **코드** (실제 파일 시스템) | 파일 존재, 연결(import/export), 동작 |

## 검증 흐름

### 1. 요구사항 수집

마일스톤 내 모든 태스크의 mustHaves를 수집:
- **truths**: 참이어야 하는 것들
- **artifacts**: 존재해야 하는 파일들
- **keyLinks**: 연결되어야 하는 것들

### 2. Artifact 검증

각 artifact에 대해:

```
[VERIFIED]  src/index.html — 존재, 내용 있음 (> 10줄)
[STUB]      src/detail.js — 존재하지만 TODO만 있음
[MISSING]   src/api.js — 파일 없음
[ORPHANED]  src/unused.js — 존재하지만 어디서도 import 안 됨
```

### 3. Wiring 검증

Key link마다 실제 연결을 확인:

```
[WIRED]     App.jsx → import Detail from './Detail' → routes에서 사용
[PARTIAL]   api.js → export fetchData → 호출부 없음 (import만 있고 사용 안 됨)
[NOT_WIRED] auth.js → export 있음 → 어디서도 import 안 됨
```

### 4. Truth 검증

각 truth에 대해 artifact + wiring 결과를 종합:

```
[SATISFIED]   "메인 페이지에서 카드 목록이 표시된다"
              → index.html ✅, CardList.jsx ✅, 연결 ✅
              
[PARTIAL]     "카드 클릭 시 상세 페이지로 이동"
              → Detail.jsx ✅, routes.js ⚠️ (경로 누락)
              
[UNSATISFIED] "검색 기능이 동작한다"
              → SearchBar.jsx [STUB], api/search.js [MISSING]
```

### 5. Anti-pattern 스캔

전체 코드에서 위험 패턴을 탐지:
- `TODO` / `FIXME` / `HACK` 주석
- 빈 함수 바디 / placeholder 텍스트
- `console.log` 디버깅 코드
- 하드코딩된 비밀번호/토큰

### 6. Handoff 교차 확인

각 handoff의 `knownIssues`가 해결되었는지 확인:
- 후속 태스크에서 해결됨 → ✅
- 아직 미해결 → ⚠️ 미해결 이슈로 보고

### 7. 보고서 저장

`_workspace/validations/audit-milestone-{id}.md`에 저장:

```markdown
---
milestone: m1
status: pass | partial | fail
truths_satisfied: 8/10
artifacts_verified: 15/17
wiring_complete: 12/14
anti_patterns: 3
unresolved_issues: 1
audited: 2026-04-07T...
---

# Audit Report — Milestone 1: 기본 게임 루프

## 요약
- Truths: 8/10 충족 (2개 partial)
- Artifacts: 15/17 검증 (1 stub, 1 missing)
- Wiring: 12/14 연결 (2 partial)
- Anti-patterns: 3건
- 미해결 이슈: 1건

## 상세 결과

### Truths
| # | Truth | 상태 | 근거 |
|---|-------|------|------|
| 1 | 메인 페이지 렌더링 | ✅ satisfied | ... |
| 2 | 카드 클릭 이동 | ⚠️ partial | routes.js 경로 누락 |

### Artifacts
(artifact 검증 상세)

### Wiring
(wiring 검증 상세)

### Anti-patterns
(발견된 패턴 상세)

### 미해결 이슈
(handoff에서 가져온 미해결 목록)

## 권장 조치
1. [PARTIAL] routes.js에 상세 페이지 경로 추가 필요
2. [STUB] detail.js 구현 완료 필요
```

## 후속 조치

- **pass**: "마일스톤 검증 통과! `/wrap`으로 마무리하거나 다음 마일스톤으로 진행하세요"
- **partial**: "일부 미충족 항목이 있습니다. `/plan:edit`로 수정 태스크를 추가하거나, 허용 가능하면 진행하세요"
- **fail**: "주요 요구사항이 미충족입니다. 수정이 필요합니다"
