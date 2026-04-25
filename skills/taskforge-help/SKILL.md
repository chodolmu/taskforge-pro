---
name: taskforge-help
description: Guides the user through the full TaskForge Pro usage and workflow. Use when the user says "/taskforge-help", "help", "how do I use this", "how does this work", "what do I do first", or similar. Also suggests the appropriate next step based on the current situation.
---

# Help — Usage Guide v2

Explain all TaskForge Pro features and recommend the appropriate next step based on the current project state.

## On Execution

### 1. Detect Current State

Check project state files to determine which stage the project is at.

Check `_workspace/projects/` for existing projects. If multiple exist, show all with their states.

| Files present (under `_workspace/projects/{projectId}/`) | State | Recommended next step |
|----------------------------------------------------------|-------|-----------------------|
| Nothing in `_workspace/projects/` | 시작 전 | `/taskforge-discover` — 프로젝트 정의 시작 |
| spec-card.json only | 정의 완료 | `/taskforge-plan` — 작업 계획 수립 |
| project-plan.json (unapproved) | 계획 검토 중 | `/taskforge-plan` 에서 승인 |
| execution-state.json | 실행 중 | `/taskforge-execute` 또는 `/taskforge-execute-all` |
| Sprint complete state | 스프린트 완료 | `/taskforge-validate` 또는 `/taskforge-status` 확인 |
| Milestone complete state | 마일스톤 완료 | `/taskforge-validate milestone` — 품질 검증 필수 |
| Fully complete | 마무리 | `/taskforge-retro` — 회고 후 종료 |

### 2. Show Situation-Specific Guidance

```
TaskForge Pro — 현재 상황

프로젝트: {projectName}
진행: 마일스톤 {m}/{M} — 스프린트 {s}/{S} — 태스크 {t}/{T}

지금 할 수 있는 것:
- /taskforge-execute     — 다음 태스크 1개 실행: "{nextTaskName}" [{difficultyLabel}]
- /taskforge-execute-all — 이번 스프린트 끝까지 자동 실행
- /taskforge-status      — 전체 진행 상황 보기
```

### 3. First-Time User Guide

If no project files exist:

```
TaskForge Pro 처음 시작하기

1. /taskforge-discover  — 만들고 싶은 것을 대화로 정의
2. /taskforge-plan      — AI가 작업을 자동으로 쪼개줌
3. /taskforge-execute-all — 자동으로 실행 (또는 /taskforge-execute로 하나씩)
4. /taskforge-validate milestone — 완성도 자동 검증
5. /taskforge-playtest  — 직접 확인
6. /taskforge-retro     — 회고 + 다음 단계 계획

작은 수정 하나라면: /taskforge-quick 으로 바로 시작
```

## 전체 워크플로우 안내

### 대규모 프로젝트 (마일스톤 3개 이상)

```
/taskforge-vision      → 전체 방향 + 마일스톤 스케치
/taskforge-discover    → 이번 마일스톤 상세 정의
/taskforge-plan        → 작업 쪼개기 + 승인
/taskforge-execute-all → 자동 실행
/taskforge-validate milestone → 품질 검증
/taskforge-playtest    → 직접 확인
/taskforge-retro       → 회고 + 다음 마일스톤 계획 갱신
(다음 마일스톤으로 반복)
```

### 소규모 프로젝트 (마일스톤 1-2개)

```
/taskforge-discover    → 바로 정의 시작
/taskforge-plan        → 작업 쪼개기
/taskforge-execute     → 하나씩 실행
/taskforge-validate    → 검증
```

### 빠른 수정

```
/taskforge-quick       → 바로 실행 (계획 없이)
```

## 전체 스킬 목록 (v2)

| 스킬 | 용도 |
|------|------|
| /taskforge-vision | 전체 프로젝트 방향과 마일스톤을 큰 그림으로 스케치 (대규모 프로젝트용) |
| /taskforge-discover | 이번 마일스톤에서 만들 것을 대화로 구체적으로 정의 |
| /taskforge-plan | 정의된 내용을 작업 단위로 쪼개고 계획 수립 |
| /taskforge-plan-edit | 수립된 계획을 수정 (태스크 추가/삭제/변경) |
| /taskforge-execute | 다음 태스크 1개를 실행 |
| /taskforge-execute-all | 이번 스프린트의 모든 태스크를 자동으로 연속 실행 |
| /taskforge-quick | 계획 없이 지금 당장 작은 수정 하나를 실행 |
| /taskforge-validate | AI가 자동으로 완성도를 검증 (빌드, 코드 품질 등) |
| /taskforge-playtest | 직접 사용해보면서 재미나 완성도를 확인 |
| /taskforge-retro | 마일스톤 마친 후 회고 + 다음 마일스톤 계획 업데이트 |
| /taskforge-verify | 완성된 결과를 대화로 함께 확인 |
| /taskforge-status | 전체 진행 상황을 한눈에 보기 |
| /taskforge-cost | 지금까지 사용한 비용 요약 |

## 자주 묻는 질문

**Q: 실행 중에 멈추고 싶어요.**
A: "stop" 또는 "멈춰"라고 하면 현재 태스크가 끝난 뒤 멈춥니다. 이후 `/taskforge-execute`로 하나씩 이어갈 수 있습니다.

**Q: 태스크가 실패했어요.**
A: `/taskforge-status`에서 실패 위치를 확인하고, 자동으로 재시도가 이루어집니다. 계속 실패하면 `/taskforge-quick`으로 직접 다른 방식을 시도할 수 있습니다.

**Q: 스프린트가 끝났는데 다음에 뭘 해야 해요?**
A: `/taskforge-status`에서 백그라운드 검증 결과를 확인한 뒤, `/taskforge-execute-all`로 다음 스프린트를 이어가면 됩니다.

**Q: 마일스톤이 끝났는데 다음에 뭘 해야 해요?**
A: 반드시 `/taskforge-validate milestone`을 먼저 실행해 품질을 확인한 뒤, `/taskforge-playtest`로 직접 확인하고, `/taskforge-retro`로 회고하세요.
