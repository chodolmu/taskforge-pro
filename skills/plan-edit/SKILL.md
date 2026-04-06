---
name: plan-edit
description: 프로젝트 계획(마일스톤/스프린트/태스크)을 수정한다. "/plan:edit", "계획 수정", "태스크 추가해줘", "이거 빼줘", "순서 바꿔줘", "난이도 바꿔줘", "wave 조정" 등을 말할 때 이 스킬을 사용한다.
---

# Plan Edit — 계획 수정

사용자의 요청에 따라 프로젝트 계획을 수정한다.

## 사전 조건

- `_workspace/project-plan.json`이 존재해야 한다
- 없으면 "먼저 `/plan`으로 계획을 세워주세요"라고 안내

## 지원하는 수정

### 태스크 수준
- **추가**: "스프린트 1.2에 태스크 추가해줘" → 해당 스프린트에 태스크 삽입
- **삭제**: "HTML 뼈대 태스크 빼줘" → 해당 태스크 제거 + 의존성 정리
- **수정**: "점프 물리를 hard로 바꿔줘" → 난이도/모델/계획 등 변경
- **이동**: "이 태스크를 스프린트 1.3으로 옮겨줘" → 스프린트 간 이동
- **합치기**: "이 두 개 합쳐줘" → 태스크 병합
- **쪼개기**: "이 태스크 두 개로 나눠줘" → 태스크 분할

### 태스크 필드별 수정 가이드

| 필드 | 수정 시 주의사항 |
|------|----------------|
| difficulty/model | 난이도 변경 → 모델도 자동 연동 (easy=haiku, medium=sonnet, hard=opus) |
| wave | 변경 시 같은 wave 내 파일 충돌 없는지 확인. 의존 관계와 일치해야 함 |
| dependencies | 추가/삭제 시 wave 번호 재계산 필요 |
| acceptanceCriteria | 검증 가능한 문장으로 작성 (파일 존재, 내용 포함, 빌드 성공 등) |
| mustHaves | truths(관찰 가능), artifacts(파일 경로), keyLinks(연결) 구조 유지 |
| skills | `harnesses/INDEX.md` 참고하여 유효한 스킬명 사용 |
| executionMode | "harness"로 변경 시 harnessId도 함께 지정 필요 |

### 스프린트 수준
- **추가/삭제/이름 변경/순서 변경**
- **검증 전략 수정**

### 마일스톤 수준
- **추가/삭제/이름 변경/순서 변경**
- **검증 전략 수정**

## 수정 후 처리

1. **의존성 자동 정리**: 삭제된 태스크에 의존하던 태스크의 dependencies 갱신
2. **Wave 재계산**: 의존성이 변경되면 wave 번호를 재계산
   - wave 1: 의존성 없는 태스크
   - wave N: wave N-1 태스크에 의존하는 태스크
3. **ID 재정렬** (필요 시)
4. **통계 갱신**: totalTasks, modelDistribution, waveStats 업데이트
5. **변경 이력 기록**: project-plan.json에 editHistory 추가

## 출력 형식

### project-plan.json 갱신

수정된 필드만 변경하고, `editHistory` 배열에 변경 기록을 추가:

```json
{
  "editHistory": [
    {
      "editedAt": "2026-04-07T...",
      "changes": [
        { "type": "add_task", "target": "m1-s2-t4", "description": "에러 핸들링 추가" },
        { "type": "modify_task", "target": "m1-s1-t3", "field": "difficulty", "from": "medium", "to": "hard" }
      ]
    }
  ]
}
```

### 변경사항 요약 출력

```
계획 수정 완료:
  [+] 태스크 추가: "에러 핸들링" (m1-s2-t4, medium/sonnet, wave 2)
  [~] 난이도 변경: "점프 물리" medium→hard (sonnet→opus)
  [↻] Wave 재계산: 스프린트 1.2 (wave 1→2→3)

  변경 전: 24개 태스크 | haiku 8 / sonnet 12 / opus 4
  변경 후: 25개 태스크 | haiku 8 / sonnet 11 / opus 6

  `/plan:approve`로 승인하면 실행할 수 있어요
  변경이 더 필요하면 계속 말씀해주세요
```

## 주의사항

- 수정 내용이 모호하면 확인 질문을 한다
- 대규모 변경 (마일스톤 전체 재구성 등)은 `/pivot`을 안내한다
- 이미 완료된 태스크를 수정하려 하면 경고: "이 태스크는 이미 완료되었습니다. 수정하면 handoff와 검증 결과가 무효화됩니다. 계속할까요?"
- 실행 중인 스프린트의 태스크를 수정하면 execution-state도 갱신 필요
