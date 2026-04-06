---
name: plan
description: SpecCard를 기반으로 프로젝트를 마일스톤→스프린트→태스크로 자동 분할한다. "/plan", "계획 세워줘", "작업 나눠줘", "분할해줘" 등을 말할 때 이 스킬을 사용한다. discover 완료 후 다음 단계로 사용된다. wave 병렬, acceptance criteria, mustHaves를 포함한 계획을 생성한다.
---

# Plan — 프로젝트 작업 분할 (Opus PM)

SpecCard를 기반으로 프로젝트 전체를 마일스톤 → 스프린트 → 태스크로 분할한다.
이 작업은 프로젝트에서 가장 중요한 단계이므로 Opus 모델로 실행한다.

## 사전 조건

- `_workspace/spec-card.json`이 존재해야 한다
- 없으면 "먼저 `/discover`로 프로젝트를 정의해주세요"라고 안내

## 분할 계층

```
프로젝트
  └─ 마일스톤 — 배포/데모 가능한 단위
       └─ 스프린트 — 검증 가능한 단위
            └─ 태스크 — AI 에이전트가 한 세션에서 완료할 수 있는 최소 단위
                 └─ Wave — 같은 wave의 태스크는 병렬 실행 가능
```

## 분할 원칙

1. **태스크 크기**: 한 파일~몇 파일 수준 변경. 너무 크면 쪼갠다.
2. **완료 조건**: "~하면 끝"을 한 문장으로 정의할 수 있어야 한다.
3. **의존성 최소화**: 병렬 실행이 가능하도록 의존성을 최소화한다.
4. **하네스는 수단**: 업무에서 필요가 생겨야만 하네스 모드를 지정한다. 하네스를 위한 업무를 만들지 않는다.

## 난이도 판정 기준

| 난이도 | 모델 | 기준 |
|--------|------|------|
| easy | haiku | 보일러플레이트, 설정 파일, 단순 복사/이동, CSS 수정, 상수 정의 |
| medium | sonnet | 일반 기능 구현, 버그 수정, 리팩토링, API 연동 |
| hard | opus | 아키텍처 설계, 복잡한 알고리즘, 다중 파일 연쇄 변경, 최적화 |

## 실행 방식 판정 (3가지 모드)

| 모드 | 기준 | 예시 |
|------|------|------|
| **single** | 하나의 관점으로 충분, 전문지식 불필요 | "HTML 뼈대 만들기" |
| **single + skills** | 하나의 관점이지만 도메인 전문지식이 품질을 올림 | "API 보안 적용" + api-security-checklist |
| **harness** | 여러 전문 관점의 협업 + 교차 검증 필요 | "게임 밸런싱 설계" → game-balance 하네스 |

### 스킬 주입 판단

`harnesses/`에 100개 하네스가 있고, 각 하네스 안에 도메인 전문 스킬이 들어있다.
하네스를 통째로 안 써도, **스킬만 뽑아서 태스크에 주입하면 품질이 올라간다.**

스킬 예시:
- `api-security-checklist` — OWASP Top 10, 인증 패턴, 입력 검증
- `component-patterns` — React 컴포넌트 설계 패턴 6종, 상태관리 전략
- `quest-design-patterns` — 퀘스트 아키타입 12종, 보상 심리학, 난이도 곡선
- `hook-writing` — 15가지 훅 패턴, 유지율 심리학

Opus PM은 태스크를 만들 때 "이 태스크에 도움되는 스킬이 있나?"를 판단하여 `skills` 필드에 추가한다.
하네스를 위한 업무를 만들지 않듯, **스킬을 위한 업무도 만들지 않는다.** 업무가 먼저, 스킬은 보조.

하네스/스킬 카탈로그는 `harnesses/INDEX.md`에서 확인 가능.

## Wave 설계 (NEW)

스프린트 내 태스크에 wave 번호를 부여하여 병렬 실행을 최적화한다.

**규칙:**
- wave 1: 의존성 없는 태스크들 (동시 실행 가능)
- wave 2: wave 1에 의존하는 태스크들
- wave N: wave N-1에 의존하는 태스크들
- 같은 wave 내 태스크들은 파일 충돌이 없어야 함

**예시:**
```
Sprint 1.1:
  Wave 1: [HTML 뼈대, CSS 초기화, 상수 정의] — 병렬
  Wave 2: [게임 루프, 입력 처리] — Wave 1 완료 후 병렬
  Wave 3: [통합 연결] — Wave 2 완료 후
```

## Acceptance Criteria 설계 (NEW)

각 태스크에 검증 가능한 완료 조건을 명시한다.

**좋은 acceptance criteria:**
- `src/index.html 파일이 존재한다` — 파일 존재 확인 가능
- `<!DOCTYPE html> 태그가 포함되어 있다` — grep 검증 가능
- `npm run build가 에러 없이 완료된다` — 명령 실행 검증

**나쁜 acceptance criteria:**
- `코드가 깔끔하다` — 주관적, 검증 불가
- `성능이 좋다` — 기준 없음

## Must-Haves 설계 (NEW)

각 태스크에 goal-backward 검증용 mustHaves를 설계한다:

- **truths**: 이 태스크가 달성되었을 때 참이어야 하는 관찰 가능한 동작
- **artifacts**: 존재해야 하는 구체적 파일 경로
- **keyLinks**: 파일 간 연결 (A에서 B를 import하여 C에서 사용)

## 검증 방법

각 단위마다 검증 전략을 함께 설계한다:

- **태스크**: `validation.auto`에 자동 검증 항목 + `acceptanceCriteria`
- **스프린트**: `validationStrategy`에 통합 검증 방법 기술
- **마일스톤**: `validationStrategy`에 QA 방법 기술

## 출력 형식

`_workspace/project-plan.json`에 저장:

```json
{
  "projectName": "프로젝트 이름",
  "milestones": [
    {
      "id": "m1",
      "name": "마일스톤 이름",
      "description": "완료되면 무엇이 되는지",
      "validationStrategy": "어떻게 검증하는지",
      "sprints": [
        {
          "id": "m1-s1",
          "name": "스프린트 이름",
          "description": "설명",
          "dependencies": [],
          "validationStrategy": "통합 검증 방법",
          "tasks": [
            {
              "id": "m1-s1-t1",
              "name": "태스크 이름",
              "description": "무엇을 해야 하는지",
              "plan": "구체적으로 어떻게 해야 하는지",
              "dependencies": [],
              "difficulty": "easy | medium | hard",
              "model": "haiku | sonnet | opus",
              "wave": 1,
              "executionMode": "single | harness",
              "harnessId": null,
              "skills": [],
              "acceptanceCriteria": [
                "src/index.html 파일이 존재한다",
                "<!DOCTYPE html> 태그가 포함되어 있다"
              ],
              "mustHaves": {
                "truths": ["페이지가 브라우저에서 정상 렌더링된다"],
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

## 사용자에게 보여주기

저장 후 트리 형태로 요약해서 보여준다:

```
마일스톤 1: 기본 게임 루프 (태스크 8개)
  ├─ 스프린트 1.1: 캔버스 세팅 (5개, 3 waves)
  │   ├─ Wave 1: HTML 뼈대 [easy/haiku] + CSS 초기화 [easy/haiku]
  │   ├─ Wave 2: 게임 루프 [medium/sonnet] + 입력 처리 [medium/sonnet]
  │   └─ Wave 3: 통합 연결 [medium/sonnet]
  └─ 스프린트 1.2: 캐릭터 (3개, 2 waves)
      ├─ Wave 1: 공룡 렌더링 [medium/sonnet]
      └─ Wave 2: 점프 물리 [medium/sonnet] + 숙이기 [medium/sonnet]
      
총 태스크: 24개 | haiku 8 / sonnet 12 / opus 4
병렬 실행 가능: 16개 (67%)
```

"이 계획을 수정하려면 `/plan:edit`, 승인하려면 `/plan:approve`를 사용하세요"라고 안내한다.
실행 전에 논의가 필요하면 `/discuss`로 회색지대를 먼저 정리할 수 있다고 안내한다.
