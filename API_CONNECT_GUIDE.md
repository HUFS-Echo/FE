# HUFS Echo API 연결 가이드

> 현재 저장소 구현은 화면·데모 보존을 위한 **mock 전용**입니다. 실제 API 요청과 라이브 배포는 수행하지 않았습니다. 현재 API 계약 원문은 저장소 루트의 [`API_SPEC.md`](./API_SPEC.md)입니다. 구현과 계약 사이의 보충 결정 사항은 `SPEC_GAPS.md`를 참고합니다.

## 환경 설정과 안전 경계

저장소의 `.env.example`을 참고해 개발 환경의 `.env.local`을 만들 수 있습니다. `.env*`는 Git에서 제외되고 `.env.example`만 추적됩니다.

```dotenv
VITE_USE_MOCK=true
VITE_API_BASE_URL=
```

`src/api/client.ts`의 `USE_MOCK`은 `VITE_USE_MOCK !== 'false'`입니다. 실제 endpoint가 승인·준비된 뒤 `.env.local`에서 `VITE_USE_MOCK=false`와 개발/테스트 서버의 `VITE_API_BASE_URL`을 설정할 수 있습니다. 다만 **현재 모든 도메인 API 함수는 `mockRequest`를 호출**하며 `fetchRequest`에 연결되어 있지 않습니다. 따라서 이 브랜치에서 `VITE_USE_MOCK=false`만 설정해도 API 모듈이 실제 요청으로 바뀌지 않으며, `fetchRequest` 단독 사용은 mock 전용 차단 오류를 반환합니다. endpoint별 요청·응답 검토와 별도 승인 없이 mock 함수를 fetch 함수로 바꾸거나 실제 서버를 호출하지 마세요.

지연·강제 오류 기본값은 `client.ts`의 `MOCK_DELAY_ENABLED = false`, `MOCK_FORCE_ERROR = false`입니다. 개발 중 브라우저 콘솔에서 아래처럼 스위치를 켜고 끌 수 있습니다(코드 기본값이나 환경을 바꾸지 않는 런타임 진단).

```js
const { setMockOptions } = await import('/src/api/client.ts');
setMockOptions({ delay: true });       // mock 응답에 300ms 추가
setMockOptions({ forceError: true });  // 공통 mock 500 오류
setMockOptions({ delay: false, forceError: false });
```

## 공통 클라이언트, 토큰, 401

- 모든 현재 도메인 함수는 `src/api/client.ts`의 `mockRequest`를 거칩니다. mock 응답도 `{ success, code, message, data, error_code }` envelope를 통과하며, 성공 시 `data`만 반환하고 실패 시 `ApiError(code, errorCode, message)`를 던집니다.
- 향후 HTTP 연결 접점은 같은 파일의 `fetchRequest({ method, path, body, accessToken })`입니다. 여기서 `VITE_API_BASE_URL`, JSON/FormData body, Bearer 헤더와 공통 envelope를 처리합니다. **현재 API 모듈은 여전히 mock입니다.**
- mock 로그인·가입은 `A1/A4` 응답 뒤 `A5 GET /users/me`로 프로필을 채웁니다. mock access token은 `src/lib/session.ts`의 `saveAccessToken`이 `hufs-echo.access-token.v1`에 저장합니다. fetch 헤더는 `getAuthHeaders()`에서 `Authorization: Bearer <token>`으로 만듭니다.
- fetch 응답 HTTP 401 또는 mock 공통 envelope의 `code: 401`은 `client.ts`의 `goToLogin()`을 거쳐 `clearSession()`으로 세션과 access token을 지운 후 `/`로 이동합니다. refresh token 갱신은 구현하지 않았습니다.

## 화면 → API 함수 → 명세 endpoint

`method + path`는 함수 주석에 적힌 API 계약 경로입니다. 화면 연결은 목 호출입니다.

| 화면/사용처 | API 함수 | API 번호 · method + endpoint |
|---|---|---|
| 로그인, 로그인 직후 프로필 채움 | `loginWithProfile` → `login`, `getMe` | A1 `POST /auth/login`; A5 `GET /users/me` |
| 회원가입 직후 프로필 채움 | `signupWithProfile` → `signup`, `getMe` | A4 `POST /auth/signup`; A5 `GET /users/me` |
| 로그아웃 | `logout` | A2 `POST /auth/logout` |
| 학생 홈 | `getCourseHome` | B1 `GET /student/courses/{courseId}/home` |
| 학생 주차 목록 | `getCourseWeeks` | B2 `GET /student/courses/{courseId}/weeks` |
| 학생 사이드바 교정 배지·교정 기록 | `getCorrections` | B8 `GET /student/corrections?week=&courseId=&cursor=&size=20` |
| 학생 사이드바 과목 선택, 학생 마이페이지 수강 과목 | `getStudentCourses` | A12 `GET /student/courses` |
| 학생 과목 나가기 | `leaveCourse` | A13 `DELETE /student/courses/{courseId}` |
| 문법·읽기와 쓰기·회화 연습 문제 | `getPracticeSet` | B3 `GET /practice-sets/{setId}` |
| 문법 문항 답안·채점 | `answerPracticeQuestion` | B4 `POST /practice-sets/{setId}/questions/{questionId}/answers` |
| 회화 녹음/전사 답안 | `submitTranscription` | B5 `POST /practice-sets/{setId}/questions/{questionId}/transcriptions` |
| 풀이 제출·정답/예시 답안 | `submitPracticeSet` | B6 `POST /practice-sets/{setId}/submit` |
| 학습 완료 통계 | `completePracticeSet` | B7 `POST /practice-sets/{setId}/complete` |
| 맞춤 연습 생성·복원 | `createCustomPractice`, `getCustomPractice` | B9 `POST /student/custom-practice`; `getCustomPractice`은 API_SPEC GET endpoint가 아닌 브라우저 mock 복원 helper |
| 맞춤 문항 답안·채점 | `submitCustomAnswer` | B10 `POST /student/custom-practice/{practiceId}/questions/{questionId}/answers` |
| 교수 상단 과목 필터·교수 마이페이지 담당 과목 | `getProfessorCourses` | A14 `GET /prof/courses` |
| 범위 설정 출제 유형 | `getExerciseTypes` | A15 `GET /prof/exercise-types?courseId=` |
| 교수 자료 업로드·목록·삭제 | `uploadMaterial`, `getMaterials`, `deleteMaterial` | A16 `POST /prof/materials`; A17 `GET /prof/materials`; A18 `DELETE /prof/materials/{materialId}` |
| 교수 범위 생성·목록·상세·수정·게시 | `createScope`, `getScopes`, `getScope`, `updateScope`, `publishScope` | A19 `POST /prof/scopes`; A20 `GET /prof/scopes?courseId=&sectionId=`; A22 `GET /prof/scopes/{scopeId}`; A21 `PUT /prof/scopes/{scopeId}`; A23 `POST /prof/scopes/{scopeId}/publish` |
| 교수 AI 연습 문제 생성 시연 | `generateExercises` | A24 `POST /prof/scopes/ai/exercises` |
| 교수 반 학습 현황 | `getDashboard` | B12 `GET /prof/dashboard?courseId=&sectionId=&week=` |
| 교수 AI 오류 신고 목록·처리·되돌리기 | `getFeedbackReports`, `resolveFeedbackReport`, `reopenFeedbackReport` | B13 `GET /prof/feedback-reports?courseId=&sectionId=&week=&status=OPEN|RESOLVED`; B14 `PATCH /prof/feedback-reports/{reportId}`; B15 `POST /prof/feedback-reports/{reportId}/reopen` |
| 교수 취약점 리포트·주간 예시 | `getInsights`, `getWeeklyReport` | B16 `GET /prof/insights?courseId=&sectionId=&week=`; B17 `GET /prof/reports/weekly?courseId=&sectionId=&week=` |
| 학생 마이페이지 프로필 수정·동의·설정·내보내기 | `getMe`, `updateMe`, `agreeLearningConsent`, `revokeLearningConsent`, `getUserSettings`, `updateUserSettings`, `exportLearningData` | A5 `GET /users/me`; A6 `PATCH /users/me`; A7 `POST /users/me/consent`; A8 `DELETE /users/me/consent`; A9 `GET /users/me/settings`; A10 `PATCH /users/me/settings`; A11 `GET /users/me/export?format=json|csv` |
| 교수 마이페이지 프로필·자료 | `getMe`, `updateMe`, `getProfessorCourses`, `getMaterials`, `uploadMaterial`, `deleteMaterial` | A5 `GET /users/me`; A6 `PATCH /users/me`; A14 `GET /prof/courses`; A16 `POST /prof/materials`; A17 `GET /prof/materials`; A18 `DELETE /prof/materials/{materialId}` |

문법 연습도 문항별 채점 없이 마지막 B6 제출로 한 번에 채점함. B5(문항별 답 제출)는 현재 화면에서 사용하지 않음.

현재 화면에서 사용하지 않는 mock endpoint 함수: B11 `POST /corrections/{correctionId}/reports`; C1–C4 `speaking-sessions`; C5–C9 `writing-tasks`. A3 refresh token 함수도 정의돼 있으나 로그인 갱신 UI/자동 호출은 연결하지 않았습니다.

## 목 전용 동작 및 프론트 제안 필드

- `src/api/adapters.ts`는 역할·과목·상태 변환만 합니다. 화면 데이터는 API 도메인 함수를 통해 읽으며, `src/lib/demoStore.ts` 접근은 mock API 구현 내부에 한정합니다. A24 문제 생성, B16/B17 리포트, 자료 저장, 신고 처리/되돌리기, 프로필·설정은 모두 브라우저 demoStore/목 카탈로그 기반입니다. 실제 AI 생성, PDF 업로드 서버 저장, 영속 계정·인증·서버 채점은 없습니다.
- `Question`의 `instruction`, `explanation`, `typeLabel`, `prompt`와 `Correction`의 `courseId`, `courseTitle`, `repeatCount`는 화면 유지/맞춤 연습을 위한 `프론트 제안` 필드입니다. `src/api/types.ts`에 필드 주석이 있습니다. 추가 차이와 결정 질문은 `SPEC_GAPS.md` 27개 항목을 참고하세요.
- 목업 A23의 게시 상태는 `src/api/mockDate.ts`의 데모 기준일 `2026-11-20`과 주차 `startDate`로 판정하며, **실제 API에서는 서버가 실제 날짜로 판단합니다.** 상태는 A23 응답과 demoStore에 저장된 값을 이후 A14/A20에서도 그대로 사용합니다. 맞춤 연습 생성·진행은 새 연습 결과를 저장하지 않는 mock 데이터입니다.
- 같은 과목·분반·주차에 A20 범위가 있으면 A19 대신 A21로 갱신하고, IN_PROGRESS/SCHEDULED 게시 범위 수정은 A21만 호출하며 A23을 다시 호출하지 않습니다; 목업 A19 중복 요청은 409 `이 주차에는 이미 학습 범위가 있어요.`를 반환합니다.
- UI 언어 및 교수 필터 선택은 `Workspace.tsx`의 localStorage UI 설정으로 유지합니다. 학습 완료 화면을 새로고침 후 복원하는 `sessionStorage` 값은 화면 전환용 임시 요약입니다. 이는 학습 도메인 데이터를 컴포넌트가 직접 localStorage에서 읽는 경우와 구분됩니다.

## 명칭·경로 호환

화면 과목 ID는 `grammar / writing / speaking`이며, 과거 `reading` 과목 ID는 읽을 때 `grammar`로 변환됩니다. `/student/course/reading`, `/student/practice/reading` 구주소도 문법 경로로 호환됩니다. 역할·범위 상태·문항 필드는 API 타입의 `STUDENT/PROFESSOR`, `DONE/IN_PROGRESS/SCHEDULED/DRAFT/LOCKED`, `format/choices/sourcePage` 등으로 정규화하고, 기존 브라우저 저장 값은 읽을 때 변환합니다. 학생 경로에는 교수용 `courseId/sectionId/week` query를 붙이지 않으며, 교수 `/prof` 경로에서만 사용합니다. B1의 현재 주 targetId는 과목별 B3 세트 구분과 일치하는 ID를 학생 홈 CTA에서 연습 컴포넌트에 전달합니다.

## 검증

- `npm run typecheck`와 `npm run build` 통과(2026-11-26). Vite는 500KB 초과 JS 청크 경고를 냈으나 build는 성공했습니다.
- 화면별 수동 확인 여부와 아직 확인하지 못한 흐름은 PR 검토 설명과 `TODO.md`에 기록합니다. 라이브 배포·실제 API 요청은 수행하지 않습니다.
