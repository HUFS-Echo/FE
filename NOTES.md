# HUFS Echo — 작업 노트

## 현재 상태 (2026-11-21)

프로젝트: `/home/ubuntu/hufsecho` · Vite 6 + React 18 + TypeScript(strict) + three.js · 정적 빌드.
개발 서버: `web` (port 3000) · Preview: `https://8328-ia3mpb3ygwlvvg7pok193-56df7cf5.sg2.manus.computer`.

인트로·온보딩·로그인은 1차에서 완성했고, 로그인 후 화면은 첨부 구성안에 맞춰 **밝은 학습 데스크** 테마로 재구성했다.

### 완료된 화면

1. **인트로** — 도트 지구본, 서울 리플, 순차/연속 빛 줄기, 인사말 타자 순환, 핀 호버 툴팁, 마그네틱 CTA, 카운트업 통계, 언어 지도(23핀).
2. **온보딩 1** — 여행가방 부엉이(`public/owls/suitcase.png`), 16초 자동 넘김 + `계속`.
3. **온보딩 2** — 축구복 부엉이(`public/owls/football.png`), `계속` → 로그인.
4. **로그인** — mock 로그인(어떤 값이든 통과), 체험 계정 `김하늘` / 교수 계정 `박민수`.
5. **워크스페이스 셸** — 라이트 헤더, 과목·주차 칩, 학생/교수 역할 전환, 사용자 칩, 로그아웃.
6. **학생 홈** — `Olá, 김하늘님!` 인사, 이번 주 목표, 과목 탭(읽기/작문/회화/인도네시아어 잠금), 남색 히어로 카드(범위·PDF·마감·진행률·이어서 풀기·미니 지구본), 이번 주 연습 세트, 다른 과목 미션, 부엉이 팁.
7. **읽기/쓰기** — 교재 PDF 패널(노란 하이라이트), 10문제(빈칸·선택형·문장 바꿔 쓰기), 진행 점, 채점 피드백, 교재 페이지로 이동, 다시 풀기/다음 문제, 다음 문제 미리보기.
8. **작문** — 과제·권장 분량·범위·체크리스트·표현 칩, 자동 저장 에디터, 초안/교정 결과 토글, 빨간 오류 밑줄, 잘한 점, 교정 카드(틀린 표현→고친 표현·유형·설명·반영하기), 제출→요약.
9. **회화** — 카페 역할극 미션 바, AI/학생 말풍선, 번역 보기, 즉시 교정 카드, 녹음 바, 예시 표현, 이번 범위·핵심 표현·미션 진행, 피드백 보기→요약.
10. **연습 요약** — 부엉이, `Muito bem!`, 정답/정확도/시간, 오늘 고친 문장, 새 단어, 다음 세트 추천.
11. **교정 기록** — 오류 유형 필터(전체/관사/전치사/형용사 성 일치/수 일치), 날짜·주차별 교정 카드, 반복 배지, 다시 연습, 취약점 막대, 맞춤 연습 CTA.
12. **내 진행률** — 누적 연습·연속 연습일·평균 정확도·같은 오류 재발률, 주차별 연습량, 최근 7일, 오류 유형별 주차 변화표.
13. **주차 목록** — 이번 주 강조 카드, 완료/진행 중/잠금 주차 카드, `11.24에 열려요` 안내.
14. **교수 대시보드** — KPI 4개, AI 주간 요약 카드, 자주 틀리는 표현, 다음 수업 제안, 익명 학생 테이블(모바일에서 최근 활동 열 숨김).

전환: intro → suitcase → (아줄레주 와이프) → football → (와이프) → login → workspace.

## 검증 완료

- `pnpm build` 통과 (TypeScript strict + Vite, 68 modules).
- 데스크톱 1280×1100: 인트로→로그인→학생 홈→읽기(채점/정답/다음 문제)→작문(초안/교정 결과)→회화(메시지 전송/즉시 교정)→요약→교정 기록→진행률→주차 목록→교수 대시보드.
- 모바일 375×812: 인트로, 홈, 읽기(채점 전/후), 선택형 채점, 작문(초안/교정 결과/요약), 회화(채팅/요약), 교정 기록(필터 7→2), 진행률, 주차 목록, 교수 대시보드.
- 태블릿 768×1024: 홈, 읽기, 작문, 회화, 교수 대시보드. 가로 넘침 없음(`scrollWidth 768`).
- 읽기 10문제 완주 → 요약(10/10, 100%) 확인. 작문 제출 → 요약, 회화 메시지 전송 → 미션 1/2 → 요약 확인.
- 선택형 문제에 `채점하기` 버튼을 추가해 선택 후 채점하도록 수정.
- 모바일 교수 대시보드의 10px 가로 넘침을 `min-width: 0`으로 수정.
- 모바일 학생 내비를 5열 아이콘+라벨(각 69×46)로 정리.
- 미래 주차 막대가 4% 높이로 보이던 문제를 0으로 수정.
- 채점 전 읽기 카드의 `피드백이 이상해요`를 숨김.

### 알려진 사항

- `fullPage` 스크린샷에서 sticky 헤더가 중간에 한 번 더 찍히는 캡처 아티팩트가 있다. 실제 뷰포트 렌더는 정상이며, 판단은 viewport 스크린샷 기준으로 한다.
- `manus-tools` 브라우저 스크린샷에서 WebGL 캔버스가 검은 사각형으로 합성되는 경우가 있으나 `webdev.take_screenshot` 실제 렌더는 정상.
- `manus-tools` 브라우저 기본 뷰포트는 1280×1100. 모바일/태블릿 검증은 시스템 Chromium + Playwright(`/tmp/pwtest`)로 수행.
- `public/fallback-globe.png`는 1600×1600 도트 지구본. `MiniGlobe`에서 원형 크롭·글로우로 사용.
- mock 로그인은 sessionStorage를 쓰지 않아 새로고침 시 인트로부터 다시 시작한다.

## 파일 맵

### 인트로/온보딩
- `src/config/tuning.ts` — 인트로 속도/개수/색상, `getQuality()`, `applyTheme()`
- `src/config/languages.ts` — 22개 언어, 23개 핀, `greeting`/`greetingNative`, `GREETING_CYCLE`
- `src/globe/geo.ts`, `src/globe/GlobeScene.ts`, `src/globe/landDots.json`
- `src/components/Hero.tsx`, `GreetingTitle.tsx`, `GlobeStage.tsx`, `LanguageTooltip.tsx`, `LanguageIndex.tsx`
- `src/components/onboarding/OnboardingStage.tsx`, `AzulejoWipe.tsx`, `LoginScreen.tsx`
- `src/styles/hero.css`, `globe.css`, `onboarding.css`

### 워크스페이스/학생
- `src/config/learning.ts` — 과목, 주차, 연습 세트, 읽기 10문제, PDF 발췌, 작문 과제/교정, 회화 미션, 교정 기록, 진행률, 주차 목록 mock 데이터와 타입.
- `src/components/workspace/Workspace.tsx` — 라이트 헤더, 주차 칩, 역할 전환, `StudentShell`/`ProfessorDashboard`.
- `src/components/workspace/ProfessorDashboard.tsx` — 교수 KPI·AI 요약·취약점·학생 테이블.
- `src/components/workspace/student/StudentShell.tsx` — view/subject 상태, 사이드바+뷰 렌더.
- `src/components/workspace/student/StudentSidebar.tsx` — 홈/연습하기/교정 기록/내 진행률/주차 목록, 코스 카드, 말하기 타일.
- `src/components/workspace/student/StudentHome.tsx` — 인사·과목 탭·히어로·연습 세트·미션·팁.
- `src/components/workspace/student/MiniGlobe.tsx` — 미니 도트 지구본+서울→리스본 점선.
- `src/components/workspace/student/ReadingPractice.tsx` — PDF·10문제·채점·피드백·다음 문제.
- `src/components/workspace/student/WritingPractice.tsx` — 작문 과제·에디터·교정 카드·제출.
- `src/components/workspace/student/SpeakingPractice.tsx` — 역할극 채팅·교정·녹음 바·피드백.
- `src/components/workspace/student/PracticeSummary.tsx` — 연습 요약과 `SummaryData` 타입.
- `src/components/workspace/student/CorrectionHistory.tsx` — 필터·교정 카드·취약점·CTA.
- `src/components/workspace/student/ProgressView.tsx` — KPI·주차별 바·최근 7일·오류 추이.
- `src/components/workspace/student/WeekList.tsx` — 이번 주 카드·주차 카드.
- `src/styles/workspace.css` — 라이트 셸/헤더/공통 버튼/교수 대시보드/반응형.
- `src/styles/student.css` — 학생 화면 전체 스타일/반응형.

### 공통
- `src/lib/session.ts` — `Session`, `DEMO_STUDENT`, `DEMO_PROFESSOR`
- `src/config/demo.ts` — 기존 채팅/교수 데이터
- `src/App.tsx` — 화면 상태 머신, 와이프, toast, 로그인/로그아웃
- `src/main.tsx` — `student.css` import
- `src/styles/base.css` — 다크 전역 토큰/리셋/토스트/reveal
- `public/owls/suitcase.png`, `football.png`, `public/fallback-globe.png`, `public/flags/*.png`
- `REDESIGN.md` — 학습 화면 리디자인 진행 노트

## 핵심 결정

- 학습 화면은 warm ivory 배경(`#F4F1EA`) + 흰 카드 + 남색 히어로(`#0B2340 → #1C4C7C`) + 아줄레주 블루 액센트.
- 다크 전역 테마(`base.css`)는 그대로 두고 `.workspace`에서 `color-scheme: light`와 라이트 변수로 오버라이드.
- 학생 내비게이션은 데스크톱 사이드바, 900px 이하 상단 가로 바, 560px 이하 5열 아이콘+라벨.
- 읽기 화면은 820px 이하에서 문제→다음 문제→PDF 순서로 재배치해 문제를 먼저 보여준다.
- 작문은 1400px 이하에서 2열(과제+에디터, 교정 카드 아래 3장), 720px 이하에서 1열.
- 교수 테이블은 720px 이하에서 `최근 활동` 열을 숨기고 셀 패딩을 줄여 가로 스크롤 없이 핵심 정보만 보여준다.
- 모든 교정은 `틀린 표현(취소선) → 고친 표현(초록 굵게)` + 오류 유형 칩 + 한국어 설명.
- 음성은 텍스트로 바꾼 뒤 저장하지 않는다는 안내를 회화 화면과 요약에 유지.
- `prefers-reduced-motion`에서 학생 셸 애니메이션 최소화.

## 조절 지점

- **색/라운드/그림자**: `src/styles/workspace.css`의 `.workspace` 토큰
  (`--paper`, `--surface`, `--ink`, `--navy`, `--blue`, `--blue-bright`, `--mint`, `--amber`, `--line`).
- **학습 데이터**: `src/config/learning.ts`
  (`SUBJECTS`, `WEEK`, `PRACTICE_SETS`, `READING_QUESTIONS`, `PDF_EXCERPT`, `WRITING_TASK`, `SPEAKING_MISSION`, `CORRECTION_HISTORY`, `WEEKLY_PROGRESS`, `WEEKS`).
- **레이아웃/브레이크포인트**: `src/styles/student.css`의 `@media (max-width: 1400/1100/1000/900/820/780/720/560px)`.
- **홈 히어로 지구본 크기**: `.hero-card`, `.mini-globe` (모바일 168px, 태블릿 200–220px, 데스크톱 240px).
- **작문 교정 카드 3열→2열→1열**: `.correction-list`, `@media (max-width: 1400px/720px)`.
- **회화 채팅 높이**: `.sp-chat` (`62svh`/`58svh`, min-height 420–460px).
- **읽기 문제 수/정답**: `READING_QUESTIONS` 배열. 마지막 문제 뒤 요약 데이터는 `ReadingPractice.tsx`의 `onComplete`.
- **요약 통계/문구**: 각 연습 컴포넌트의 `onComplete({...})`와 `PracticeSummary.tsx`.
- **인트로 속도/개수/색상**: `src/config/tuning.ts` (`TUNING`, `COLORS`).
- **온보딩 자동 넘김**: `OnboardingStage.tsx`의 `STEP_ONE_SECONDS`.
- **아줄레주 타일 수/속도**: `AzulejoWipe.tsx`의 `COLS`/`ROWS`, `onboarding.css`.

## 검증 메모

- `pnpm build`로 타입 체크 + 빌드. 현재 JS 835 kB(gzip 227 kB), CSS 109 kB(gzip 21 kB), 500 kB 청크 경고는 three.js 포함 때문.
- 개발 서버: `webdev.config PUT runtime/dev-commands` 포트 3000, `web` 이름으로 running.
- 스크린샷: `/home/ubuntu/screenshots/` (`mobile-*.png`, `tablet-*.png`, `localhost_*.webp`).
- 모바일/태블릿 자동화: `/tmp/pwtest`의 Playwright Core + `/usr/bin/chromium` (시스템 Chromium, 별도 다운로드 없음).
- `webdev.take_screenshot`은 로그인 상태를 유지하지 못하므로, 로그인 후 화면은 Playwright로 검증했다.
