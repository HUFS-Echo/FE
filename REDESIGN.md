# 학습 화면 리디자인 — 진행 노트

## 요청
- 첨부 구성안(`pasted_content.txt`)의 학생 화면 S1–S8 구조를 참고해 학습 화면을 재구성.
- 인트로·로그인은 그대로 유지.
- 로그인 후 학습 화면이 어둡다는 피드백 → **밝은 학습 데스크 + 남색 히어로 카드**로 전환.
- 위치·구성은 자유롭게 수정 가능.

## 디자인 방향
- 배경: warm ivory `#F4F1EA` / surface `#FFFFFF` / ink `#12233D`.
- 남색 히어로 카드(`#0B2340 → #1C4C7C`), 아줄레주 블루 액센트(`#2E5FA3`, `#3E7BD6`).
- 사이드바: 밝은 크림, 활성 내비게이션은 남색 필.
- 카드: 흰색, 1px 웜 라인, 14–20px 라운드, 부드러운 그림자.
- 타이포: Pretendard UI, Instrument Serif 포르투갈어/인사말, IBM Plex Mono 라벨.
- 히어로 오른쪽: `public/fallback-globe.png`를 원형 크롭한 미니 도트 지구본 + 점선 서울→리스본 아크.

## 생성/수정한 파일
- `src/config/learning.ts` — 과목, 주차, 연습 세트, 읽기 10문제, 작문 과제/교정, 회화 미션, 교정 기록, 진행률, 주차 목록 mock 데이터.
- `src/components/workspace/student/MiniGlobe.tsx`
- `src/components/workspace/student/StudentSidebar.tsx`
- `src/components/workspace/student/StudentHome.tsx`
- `src/components/workspace/student/ReadingPractice.tsx`
- `src/components/workspace/student/WritingPractice.tsx`
- `src/components/workspace/student/SpeakingPractice.tsx`
- `src/components/workspace/student/PracticeSummary.tsx` — `SummaryData` 타입 export.
- `src/components/workspace/student/CorrectionHistory.tsx`
- `src/components/workspace/student/ProgressView.tsx`
- `src/components/workspace/student/WeekList.tsx`
- `src/components/workspace/student/StudentShell.tsx`
- `src/components/workspace/Workspace.tsx` — 라이트 헤더 + 주차 칩 + `StudentShell`.
- `src/components/workspace/ProfessorDashboard.tsx` — 라이트 테마 + AI 주간 요약 카드.
- `src/styles/workspace.css` — 라이트 셸/헤더/교수 대시보드로 전면 교체.
- `src/styles/student.css` — 학생 화면 전체 스타일 신규.
- `src/main.tsx` — `student.css` import.

## 검증 완료
- `pnpm build` 통과 (TypeScript strict 포함).
- 1280×1100 브라우저에서 확인: 홈, 읽기(채점/정답 피드백/다음 문제), 작문(초안/교정 결과), 회화(메시지 전송/즉시 교정/미션 진행), 요약, 교정 기록, 진행률, 주차 목록, 교수 대시보드.
- 수정 반영:
  - 작문 3열 → 1400px 이하에서 2열(과제+에디터, 교정 카드는 아래 3장)로 전환.
  - 진행률 막대의 빈 트랙 배경 제거.
  - 교정 기록/요약/회화 교정 문장의 폰트 크기·대비 상향.
  - 회화 미션 미완료 항목의 회색 대비 상향.
  - 지구본 크롭 47.5%로 조정해 흰 테두리 제거, 채도/밝기 보정.
  - 오류 밑줄 두께 1.5px + 옅은 배경.
  - 완료 주차의 "복습하기"는 읽기 연습으로 연결.
- `SpeakingPractice`의 교정 카드 신고 버튼에 `onToast` 연결.
- 모바일 375×812·태블릿 768×1024 확인. 학생 내비를 5열 아이콘+라벨(69×46)로 변경.
- 교수 대시보드 `.panel { min-width: 0 }` + `.dashboard__grid > * { min-width: 0 }`로 10px 가로 넘침 제거.
- 모바일 교수 테이블은 `최근 활동` 열을 숨기고 셀 패딩을 줄여 4열로 표시.
- 읽기 선택형 문제에 `채점하기` 버튼 추가(선택 후 채점). 채점 전 `피드백이 이상해요` 숨김.
- 진행률의 미래 주차 막대 높이를 0으로 수정.
- 읽기 10문제 완주→요약, 작문 제출→요약, 회화 메시지→미션→요약, 교정 기록 필터(7→2), 주차 복습 이동 확인.

## 남은 작업
1. `NOTES.md` 갱신 완료.
2. `pnpm build` 재확인, 체크포인트 커밋/푸시.

## 브라우저 검증 메모
- `manus-tools` 브라우저 뷰포트: 1280×1100.
- 스크린샷: `/home/ubuntu/screenshots/localhost_*.webp`.
- Vite dev server: `http://localhost:3000` (running, `web`).
- 체크포인트: `origin/main` `bafb218` (1차), 새 작업 후 재커밋 필요.
- `webdev.take_screenshot`은 `viewport_size`를 지원하지만 로그인 상태를 유지하지 못함.

## 컴포넌트 API 메모
- `StudentShell`: `{ session: Session; onToast: (m: string) => void }`.
- `StudentHome`: `{ session; subject; onSubject(id); onOpen(id); onToast }`.
- `ReadingPractice`: `{ onBack; onComplete(data: SummaryData); onToast }`.
- `WritingPractice`: `{ onBack; onComplete; onToast }`.
- `SpeakingPractice`: `{ onBack; onComplete; onToast }`.
- `PracticeSummary`: `{ data; onHome; onRetry; onNext(subject) }`.
- `StudentSidebar`: `{ subject; active: 'home'|'practice'|'history'|'progress'|'weeks'; onNavigate; onSpeak }`.
- `CorrectionHistory`: `{ onPractice(subject); onToast }`.
- `ProgressView`: props 없음.
- `WeekList`: `{ onOpen(subject) }`.

## CSS 클래스 메모
- 셸: `.workspace`, `.workspace__head`, `.week-chip`, `.role-switch`, `.user-chip`, `.student-shell`, `.student-side`, `.side-course`, `.side-nav`, `.side-tile`, `.student-main`.
- 홈: `.home`, `.home__top`, `.home__goal`, `.subject-tabs`, `.subject-tab`, `.hero-card`, `.hero-card__copy`, `.hero-card__visual`, `.mini-globe`, `.home__grid`, `.home-sets`, `.set-card`, `.home-aside`, `.mission-card`, `.owl-tip`.
- 읽기: `.reading`, `.reading__top`, `.reading__grid`, `.pdf-card`, `.pdf-sheet`, `.q-progress`, `.question-card`, `.answer-row`, `.choice-row`, `.feedback`, `.next-preview`.
- 작문: `.writing`, `.writing__top`, `.writing__grid`, `.writing-task`, `.writing-editor`, `.editor-toolbar`, `.editor-paper`, `.writing-corrections`, `.writing-correction`, `.writing-tip`, `.mode-toggle`, `.writing__err`.
- 회화: `.speaking`, `.mission-bar`, `.speaking__grid`, `.sp-chat`, `.sp-msg`, `.sp-composer`, `.sp-recording`, `.sp-side`, `.sp-correction`.
- 요약: `.summary`, `.summary__hero`, `.summary__stats`, `.summary__grid`, `.summary-correction`, `.summary-next`.
- 기록/진행/주차: `.history`, `.history__filters`, `.history-item`, `.history__side`; `.progress-view`, `.progress-kpis`, `.weekly-bars`, `.recent-days`; `.weeks`, `.week-current`, `.week-grid`, `.week-card`.
- 교수: `.dashboard`, `.dashboard__head`, `.kpis`, `.kpi`, `.panel`, `.weak`, `.next-class`, `.student-table`, `.prof-ai`.

## 알려진 메모
- `StudentSidebar`의 교정 기록 카운트 `7`은 하드코딩. `CORRECTION_HISTORY.length`로 바꾸면 유지보수 쉬움.
- `PracticeSummary`의 `stats` 값은 문자열; 숫자 애니메이션은 없음.
- `home__goal`은 `WEEK.goalDone/goalTotal` 기반.
- `WeekList`는 `WEEKS`의 active 주차를 현재 주차로 사용.
