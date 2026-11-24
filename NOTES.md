# HUFS Echo — 현재 작업 노트

> 갱신일: 2026-11-24
> 현재 제품 구조는 [plan.md](plan.md), 구현 상태 및 확인 대기 항목은 [TODO.md](TODO.md)를 기준으로 합니다. 이 파일은 개발 시 빠르게 찾기 위한 기술 메모입니다.

## 프로젝트 상태

- 저장소: `/home/ubuntu/hufsecho`
- 스택: Vite · React 18 · TypeScript · three.js
- 기본 브랜치: `main`
- 확인된 기준 커밋: `3b9cb16` (학생 헤더의 과목 선택기 제거)
- 이전 변경에서 `pnpm build`와 `git diff --check`를 통과했습니다. 이번 요청은 문서 갱신이며, 앱 소스는 삭제하지 않았습니다.
- 앱은 데모 데이터 중심의 클라이언트 앱입니다. 로그인/프로필/설정의 일부는 브라우저 저장소에 기록되며 실제 인증·서버·메일·AI 연결은 없습니다.

## 앱 진입 및 화면 찾기

- `src/App.tsx`: 인트로·로그인·회원가입·워크스페이스 상태, 세션과 토스트 연결
- `src/lib/router.ts`: 역할별 경로 판별과 역할 홈
- `src/components/Hero.tsx`: 지구본 인트로, 가입/로그인 진입
- `src/components/onboarding/LoginScreen.tsx`: 기존 회원 로그인
- `src/components/onboarding/SignupScreen.tsx`: 신규 가입
- `src/components/workspace/Workspace.tsx`: 공통 헤더와 역할별 셸 연결
- `src/components/workspace/student/StudentShell.tsx`: 학생 URL→화면 분기
- `src/components/workspace/professor/ProfessorShell.tsx`: 교수 사이드바·URL→화면 분기

## 역할별 주요 화면

- 학생: `StudentHome.tsx`, `WeekList.tsx`, `ReadingPractice.tsx`, `WritingPractice.tsx`, `SpeakingPractice.tsx`, `PracticeSummary.tsx`, `CorrectionHistory.tsx`
- 학생 과목 선택: `StudentSidebar.tsx` → `StudentCoursePicker.tsx`
- 교수: `Overview.tsx`, `ScopeBuilder.tsx`, `ScopeLibrary.tsx`, `WeaknessReport.tsx`, `FeedbackInbox.tsx`
- 교수·학생 프로필: `src/components/workspace/profile/MyPages.tsx`
- 시연 데이터/상태: `src/config/learning.ts`, `src/lib/session.ts`, `src/lib/demoStore.ts`, `src/components/workspace/professor/ProfFilterContext.tsx`

## 경로 메모

현재 지원 경로는 학생 `/student`, `/student/course/*`, `/student/practice/*`, `/student/summary/*`, `/student/history`, `/student/me`; 교수 `/prof`, `/prof/scope/new`, `/prof/scope/new/edit/*`, `/prof/report`, `/prof/feedback`, `/prof/me`입니다.

`public/manus-routes.json`에는 활성 화면 분기와 다른 `/prof/students`, `/prof/scopes` 항목이 남아 있습니다. 반대로 결과 상세와 범위 편집의 동적 경로 표기도 빠져 있습니다. 사용자가 잔존 항목 제거를 승인하기 전까지 매니페스트에서 해당 경로를 삭제하지 않습니다. 세부 근거는 `plan.md`의 “삭제 전 사용자 확인이 필요한 잔존 후보”를 참고하세요.

## 시각 기준

- 인트로: 깊은 남색 배경, 점묘 지구본, 언어 핀·툴팁, 서울발 빛과 다국어 인사말
- 로그인 후: 따뜻한 아이보리 배경, 흰 카드, 남색과 절제된 파란색 포인트
- 축구 유니폼 부엉이: 학생·교수 프로필 공통 아바타
- 인트로 조정값: `src/config/tuning.ts`; 언어 핀/인사말: `src/config/languages.ts`


## 맞춤 연습 후속 변경 (2026-11-24)

- 새 화면 `src/components/workspace/student/CustomPractice.tsx`는 학생 셸의 `/student/practice/custom` 경로로 진입한다.
- 문항 원천은 `CORRECTION_HISTORY`. 반복 횟수 내림차순으로 정렬하고 원문/정답이 같은 항목은 합쳐 최대 5개를 제공한다. 외부 AI/백엔드 호출 없이 저장된 데모 기록으로 구성한다.
- 동작은 교정문 입력, 포르투갈어 대소문자·공백·문장부호 비교, 결과 설명, 문제 진행, 최종 점수/문장별 복습이다.
- 연습 완료 데이터 타입은 원문과 교정문만 포함한다. 오류 유형은 요약 UI에서 사용하지 않으며, 문제/교정 데이터의 원본 유형은 유지한다.
- `public/manus-routes.json`에 새 경로를 추가하고 `/prof/students`, `/prof/scopes`는 제거한다.
