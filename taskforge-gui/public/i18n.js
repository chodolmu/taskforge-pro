'use strict';
// 비개발자용 용어 매핑. 모든 UI 텍스트는 이 테이블을 거쳐야 한다.
window.TFGi18n = {
  milestone: '단계',
  sprint: '묶음작업',
  task: '작업',
  mustHaves: '체크리스트',
  wave: '동시 실행 그룹',
  handoff: '인수인계',      // 보통 숨김
  spec: '프로젝트 정의',
  guardrail: '한도',         // 보통 숨김
  telemetry: '활동 기록',
  status: {
    waiting:'대기', running:'진행 중', completed:'완료', failed:'문제 발생',
    // roadmap milestone statuses
    active:'진행 중', planned:'예정', dropped:'중단',
    // execution-state statuses
    in_progress:'진행 중', paused:'일시정지', ready:'준비됨',
    // task outcome
    pass:'성공', fail:'실패', skip:'건너뜀',
  },
  model: { haiku:'⚡ 빠름', sonnet:'◎ 보통', opus:'★ 고난도' },
  guardrailReason: {
    maxTurns: '대화가 길어져서 멈췄어요',
    maxCostUSD: '비용 한도에 도달해서 멈췄어요',
    maxWallTimeMin: '시간 한도에 도달해서 멈췄어요',
  },
};
