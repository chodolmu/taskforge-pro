---
name: use-harness
description: PM 파이프라인 없이 하네스를 직접 실행한다. "/use-harness", "하네스 실행", "하네스 써줘", "팀 실행" 등을 말할 때 사용한다. 프로젝트 관리 없이 특정 도메인 전문가 팀을 바로 활용하고 싶을 때 사용한다.
---

# Use Harness — 하네스 직접 실행

PM 파이프라인(discover→plan→execute) 없이 하네스를 직접 실행한다.
"유튜브 영상 기획해줘", "계약서 분석해줘" 같은 단발성 전문가 작업에 적합하다.

## 사용법

```
/use-harness youtube-production "AI 뉴스 채널 영상 기획해줘"
/use-harness contract-analyzer "이 계약서 리스크 분석해줘"
/use-harness ml-experiment "추천 모델 설계해줘"
```

인자 없이 실행하면:
1. 무엇을 하고 싶은지 물어본다
2. 적합한 하네스를 추천한다
3. 선택하면 실행한다

## 실행 흐름

### 1. 하네스 로드

`harnesses/{category}/{harness-name}/CLAUDE.md`를 읽어 오케스트레이터를 로드한다.

하네스를 찾을 수 없으면:
- INDEX.md에서 유사한 이름 검색
- "혹시 [유사 하네스]를 찾으시나요?"로 제안

### 2. 입력 수집

사용자의 요청에서 하네스 입력에 필요한 정보를 파악한다.
부족한 정보는 대화로 수집한다 (한 번에 하나씩).

### 3. 에이전트 팀 실행

하네스의 오케스트레이터가 정의한 워크플로우에 따라 실행:
1. `_workspace/` 디렉토리 생성
2. 입력을 `_workspace/00_input.md`로 저장
3. 에이전트 팀을 순서대로/병렬로 실행
4. 각 에이전트의 산출물을 `_workspace/`에 저장

### 4. 산출물 전달

실행 완료 후:
```
✅ 하네스 실행 완료: youtube-production

산출물:
  _workspace/01_strategist_brief.md   — 콘텐츠 전략
  _workspace/02_scriptwriter_script.md — 대본
  _workspace/03_thumbnail_concept.md   — 썸네일 컨셉
  _workspace/04_seo_package.md         — SEO 메타데이터
  _workspace/05_review_report.md       — 리뷰 보고서

수정이 필요하면 말씀해주세요.
```

## 하네스 모드 자동 감지

사용자 요청 규모에 따라 하네스의 실행 모드를 자동 결정:

| 규모 | 모드 | 예시 |
|------|------|------|
| 전체 | 풀 파이프라인 (5명) | "유튜브 영상 전체 기획" |
| 일부 | 축소 모드 (2-3명) | "대본만 써줘" |
| 단일 | 스킬만 사용 (1명) | "훅 패턴 알려줘" |

## 기존 파일 활용

사용자가 이미 만든 파일이 있으면:
- 해당 파일을 `_workspace/`에 복사
- 중복 작업을 건너뛰고 이어서 진행
- "기존 [파일]을 활용하겠습니다"라고 안내

## 프로젝트 모드와의 차이

| | 프로젝트 모드 | 하네스 직접 실행 |
|---|---|---|
| 계획 | discover→plan→approve | 없음 |
| 추적 | execution-state.json | 없음 |
| Handoff | 태스크 간 연결 | 없음 |
| 적합 상황 | 복잡한 프로젝트 | 단발성 전문가 작업 |
