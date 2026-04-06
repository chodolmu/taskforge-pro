---
target: {sprint-id | milestone-id}
type: sprint | milestone
status: pass | partial | fail
truths_satisfied: 0/0
artifacts_verified: 0/0
wiring_complete: 0/0
anti_patterns: 0
verified: {ISO timestamp}
---

# Verification Report — {target name}

## Must-Haves 검증

### Truths (참이어야 하는 것)
| # | Truth | 상태 | 근거 |
|---|-------|------|------|
| 1 | {관찰 가능한 동작} | satisfied/partial/unsatisfied | {검증 결과} |

### Artifacts (존재해야 하는 것)
| # | 파일 | 상태 | 비고 |
|---|------|------|------|
| 1 | {파일 경로} | VERIFIED/STUB/MISSING/ORPHANED | {상세} |

### Key Links (연결되어야 하는 것)
| # | From → To | 상태 | 비고 |
|---|-----------|------|------|
| 1 | {소스} → {타겟} via {방법} | WIRED/PARTIAL/NOT_WIRED | {상세} |

## Anti-pattern 스캔
| # | 파일:줄 | 유형 | 내용 |
|---|---------|------|------|
| 1 | {path:line} | TODO/FIXME/STUB/DEBUG | {내용} |

## 권장 조치
1. {조치 설명}
