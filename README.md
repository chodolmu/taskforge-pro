# TaskForge Pro

**통합 프로젝트 매니저** — TaskForge PM + Harness-100 도메인 전문가 + GSD 검증 체계를 하나로.

비개발자도 Claude Code를 쉽게 사용하여 프로젝트를 완성할 수 있게 하는 올인원 플러그인입니다.

## 특징

- **PM 자동화** — 프로젝트를 마일스톤→스프린트→태스크로 자동 분할
- **100개 도메인 전문가** — YouTube, 웹앱, ML, 법률, 교육 등 전 분야 에이전트 팀 내장
- **3단계 검증** — Goal-backward 검증 + 대화형 UAT + 마일스톤 회귀 감사
- **Wave 병렬 실행** — 의존성 없는 태스크를 자동 병렬 처리
- **모델 최적화** — 난이도별 자동 모델 배치 (haiku/sonnet/opus)
- **깨끗한 컨텍스트** — 매 태스크마다 최소 컨텍스트, Handoff로 연결

## 설치

Claude Code의 플러그인 디렉토리에 복사하거나 링크합니다:

```bash
# 방법 1: 직접 복사
cp -r taskforge-pro/ ~/.claude/plugins/taskforge-pro/

# 방법 2: 심볼릭 링크
ln -s $(pwd)/taskforge-pro ~/.claude/plugins/taskforge-pro
```

## 빠른 시작

### 프로젝트 만들기

```
/taskforge-pro:discover     ← 대화로 프로젝트 정의
/taskforge-pro:plan          ← AI가 작업을 자동 분할
/taskforge-pro:plan-approve  ← 계획 승인
/taskforge-pro:execute       ← 하나씩 실행 (반복)
/taskforge-pro:wrap          ← 완료!
```

### 하네스 직접 사용

```
/taskforge-pro:browse-harness          ← 100개 하네스 카탈로그
/taskforge-pro:use-harness youtube-production "영상 기획해줘"
```

### 빠른 작업

```
/taskforge-pro:quick 버튼 색상 변경
```

## 전체 워크플로우

```
/discover → /plan → /plan:approve
    ↓
  [/discuss]  ← 실행 전 논의 (선택)
    ↓
  /execute (반복) 또는 /execute:all (자동)
    ↓
  /validate   ← goal-backward 검증
    ↓
  [/verify]   ← 대화형 UAT (선택)
    ↓
  /refresh → 다음 스프린트
    ↓
  [/audit]    ← 마일스톤 검증 (선택)
    ↓
  /wrap
```

## 명령어 목록 (26개)

### 프로젝트 관리
| 명령어 | 설명 |
|--------|------|
| `/discover` | 대화로 프로젝트 정의 |
| `/plan` | 마일스톤/스프린트/태스크 분할 |
| `/plan:edit` | 계획 수정 |
| `/plan:approve` | 계획 승인 |
| `/discuss` | 실행 전 회색지대 논의 |

### 실행
| 명령어 | 설명 |
|--------|------|
| `/execute` | 다음 태스크 실행 |
| `/execute:all` | 스프린트 자동 실행 |
| `/quick` | 계획 없이 빠른 실행 |
| `/handoff` | 작업 이력 생성 |

### 검증
| 명령어 | 설명 |
|--------|------|
| `/validate` | Goal-backward 검증 |
| `/verify` | 대화형 UAT |
| `/audit` | 마일스톤 회귀 검증 |

### 모니터링
| 명령어 | 설명 |
|--------|------|
| `/status` | 진행 상황 트리 |
| `/cost` | 비용 요약 |

### 적응
| 명령어 | 설명 |
|--------|------|
| `/refresh` | 계획 갱신 |
| `/pivot` | 방향 전환 |
| `/retry` | 재시도 |
| `/skip` | 건너뛰기 |

### 하네스
| 명령어 | 설명 |
|--------|------|
| `/browse-harness` | 100개 하네스 카탈로그 |
| `/use-harness` | 하네스 직접 실행 |

### 기타
| 명령어 | 설명 |
|--------|------|
| `/resume` | 새 세션에서 이어받기 |
| `/wrap` | 프로젝트 마무리 |
| `/help` | 사용법 안내 |

## 하네스 카탈로그

100개 도메인 전문 에이전트 팀이 내장되어 있습니다:

| 카테고리 | 수량 | 예시 |
|----------|------|------|
| 콘텐츠 | 15 | YouTube, 팟캐스트, 뉴스레터, 게임 내러티브 |
| 소프트웨어 | 15 | 풀스택 웹앱, API 설계, 모바일 앱 |
| 데이터/ML | 12 | ML 실험, 데이터 분석, NLP |
| 비즈니스 | 13 | 스타트업 전략, 시장 조사, 가격 전략 |
| 교육 | 10 | 언어 학습, 시험 준비, 코딩 교육 |
| 법률 | 7 | 계약 분석, 특허, GDPR |
| 건강 | 8 | 식단, 피트니스, 세금 |
| 커뮤니케이션 | 8 | 기술 문서, 제안서, 연설문 |
| 운영 | 7 | 채용, 온보딩, 프로세스 감사 |
| 전문 | 5 | 부동산, 이커머스, 도시계획 |

## 3가지 DNA

| 출처 | 기여 |
|------|------|
| **TaskForge** | PM 프레임워크 — 계획, 실행, 추적, 모델 배치, Handoff |
| **Harness-100** | 도메인 전문가 — 100개 분야, 630개 스킬, 489개 에이전트 |
| **GET SHIT DONE** | 검증 체계 — Goal-backward, UAT, 회귀 감사, Wave 병렬 |

## 라이선스

MIT
