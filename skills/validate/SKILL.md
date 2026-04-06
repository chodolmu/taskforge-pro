---
name: validate
description: 코드를 자동으로 검증한다. "/validate", "빌드 확인", "코드 검증", "자동 검증", "테스트 돌려" 등을 말할 때 사용한다. 태스크/스프린트 단위로 빌드, 타입체크, 린트, acceptance criteria, goal-backward 검증을 AI가 자동 실행한다. 사용자가 직접 확인하는 것은 "/verify"(대화형 UAT), 마일스톤 종합 감사는 "/audit"를 사용한다.
---

# Validate — 검증 실행 (Goal-Backward 강화)

프로젝트의 작업 결과를 검증한다. 3단계 검증 체계 + goal-backward 분석.

**핵심 원칙**: 태스크 완료 ≠ 목표 달성. 플레이스홀더로 "완료" 마킹될 수 있으므로, 목표에서 역산하여 실제로 동작하는지 확인한다.

## 3단계 검증

### 1. 태스�� 검증 (자동, 매 태스크 완료 시)

태스크의 `validation.auto`에 지정된 항목을 실행:

| 항목 | 동작 |
|------|------|
| build | 프로젝트 빌드 실행 |
| typecheck | TypeScript 타입 체크 (해당 시) |
| lint | 린��� 실행 (해당 시) |
| test | 테스트 스위트 실행 (해��� 시) |
| run | 실행해서 에러 없는지 확인 |

**+ Acceptance Criteria 검증** (NEW):

태스크의 `acceptanceCriteria` 배열의 각 항목을 확인:
- 파일 존재 여부 → `ls`로 확인
- 내용 포함 여부 → `grep`으로 확인
- 빌드/실행 결과 → 해당 명령 실행

```
검증: build ✅ typecheck ✅
Acceptance:
  ✅ src/index.html 파일이 존재한다
  ✅ <!DOCTYPE html> 태그가 포함되어 있다
  ❌ <canvas> 태그가 포함되어 있다 → 누락
```

하나라도 실패하면 태스크 미완료로 처���.

### 2. 스프린트 검증 (스프린트 완료 후)

스프린트의 `validationStrategy`에 따라 통합 검증:

1. 자동 검증 항목 전체 재실행 (빌드, 타입체크 등)

2. **Goal-Backward 검증** (NEW):

   스프린트 내 모든 태스크의 `mustHaves`를 수집하여:

   **Step 1 — Truths**: 목표 달성을 위해 참이어야 하는 것들
   ```
   [SATISFIED]   "메인 페이지에서 카드 목록이 표시된다"
   [PARTIAL]     "카드 클릭 시 상세 페이지로 이동" → routes.js 경로 누락
   [UNSATISFIED] "검색 기능이 동작한다" → SearchBar.jsx가 stub
   ```

   **Step 2 — Artifacts**: 존재해야 하는 파일들
   ```
   [VERIFIED]  src/index.html — 존재, 내용 있음
   [STUB]      src/Search.jsx — 존재하지만 TODO만 있음
   [MISSING]   src/api.js — 파일 없음
   [ORPHANED]  src/old.js — 어디서도 import 안 됨
   ```

   **Step 3 — Key Links**: 실제 연결 확인
   ```
   [WIRED]      App.jsx → Detail.jsx (import + routes에서 사용)
   [NOT_WIRED]  auth.js → export만 있고 import 없음
   ```

3. **Anti-Pattern 스캔** (NEW):
   스프린트에서 변경된 파일에서 위험 패턴 탐지:
   - `TODO` / `FIXME` / `HACK` 주석
   - 빈 함수 바디 (`{}` 또는 `pass`)
   - placeholder 텍스트 ("Lorem ipsum", "TODO: implement")
   - `console.log` / `print()` 디버깅 코드
   - 하드코딩된 시크릿 패턴

4. Sonnet 모델로 코드 리뷰:
   - 변경 파일 전체를 읽고 코드 품질, 일관성, 버그 가능성 평가

5. 결과 리포트 생성 (verification-report 템플릿 사용)

### 3. 마일스톤 검증 → `/audit`로 위임

마일스톤 레벨 검증은 `/audit` 스킬이 담당한다. 마일스톤이 완료되면:
- "마일스톤 검증은 `/audit`로 실행하세요 (3-source 교차 검증 + 회귀 감사)"
- `/validate milestone`을 호출해도 자동으로 `/audit` 안내로 리다이렉트

## 검증 결과 저장

`_workspace/validations/{target-type}-{target-id}.json`:

```json
{
  "targetType": "sprint",
  "targetId": "m1-s1",
  "passed": true,
  "results": [
    { "check": "build", "passed": true, "message": "" },
    { "check": "typecheck", "passed": true, "message": "" },
    { "check": "code-review", "passed": true, "message": "코드 품질 ��호" }
  ],
  "goalBackward": {
    "truths": { "satisfied": 5, "partial": 1, "unsatisfied": 0 },
    "artifacts": { "verified": 8, "stub": 0, "missing": 0, "orphaned": 1 },
    "wiring": { "wired": 6, "partial": 1, "notWired": 0 }
  },
  "antiPatterns": [
    { "file": "src/utils.js", "line": 42, "type": "TODO", "content": "// TODO: error handling" }
  ],
  "validatedBy": "auto+sonnet+goal-backward",
  "validatedAt": "2026-04-07T16:00:00Z"
}
```

## 실패 시

- **태스크 검증 실패**: `/retry`로 재시도 안내
- **스프린트 검증 실패**: Opus가 실패 원인 분석 → 수정 태스크 자동 제안 → 사용자 승인 후 실행
- **마일스톤 검증 실패**: Opus가 전체 리뷰 → 수정 스프린트 제안 → 사용자 확인

## 사용법

```
/validate              → 가장 최근 완료된 단위를 자동 감지하여 검증
/validate sprint       → 현재 스프린트 검증 (goal-backward 포함)
/validate task m1-s1-t3 → 특정 태스크 검증
/validate milestone    → /audit로 안내 (마일스톤은 audit이 담당)
```
