# HUFS ECHO API 명세서 (노션 원본을 옮긴 버전)

> 백엔드 팀이 노션에 작성한 명세를 그대로 옮겼습니다. 개발 상태는 전부 "시작 전"입니다.
> 응답 예시는 `data` 부분만 적었습니다. 공통 껍데기는 아래 0번을 따릅니다.

## 0. 공통 규칙

### 응답 껍데기
성공:
```json
{ "success": true, "code": 200, "message": "로그인 성공", "data": { } }
```
실패:
```json
{ "success": false, "code": 400, "error_code": "INVALID_INPUT", "message": "비밀번호를 입력해 주세요.", "data": null }
```
- 화면에 보여줄 에러 문구는 `message` 를 그대로 씁니다.

### 인증
- `Auth: Bearer` 인 API는 `Authorization: Bearer {accessToken}` 헤더가 필요합니다.
- 권한 표시: (학생만) / (교수만) / (학생·교수) / 없음

### 공통 enum
- 역할 `role`: STUDENT / PROFESSOR
- 과목 종류 `type`: GRAMMAR / WRITING / SPEAKING (※ 출제 유형 API에서는 작문·독해를 READING_WRITING 으로 씀)
- 교수 주차·범위 상태: DONE(종료) / IN_PROGRESS(진행 중) / SCHEDULED(예약) / DRAFT(임시 저장)
- 학생 주차 상태: DONE / IN_PROGRESS / LOCKED(미공개)
- 문제 형식 `format`
  - 문법: FORM_WRITE(형태 쓰기) · FILL_BLANK(빈칸 채우기) · FIX_PART(한 부분 고치기) · REWRITE(문장 바꾸기) · MULTIPLE_CHOICE(객관식)
  - 작문·독해: FIND_INFO(핵심 정보 찾기) · FIND_PURPOSE(글의 목적 파악) · WRITE_REQUIRED(필수 정보를 담아 쓰기) · REPLY(읽고 답장 쓰기) · MULTIPLE_CHOICE
  - 회화: LISTEN(듣고 이해하기) · REPLY_LINE(응답 한 줄 쓰기) · SPEAK(직접 말하기) · READ_ALOUD(소리 내어 읽기) · MULTIPLE_CHOICE
- 답 형식 `answerType`: TEXT / CHOICE / AUDIO
- 출제 규칙: 분야마다 5문항, 형식별로 하나씩. 힌트는 넣지 않음.

### 전체 목록
| # | 기능 | method | endpoint | 화면 |
|---|---|---|---|---|
| A1 | 로그인 | POST | /auth/login | 로그인 |
| A2 | 로그아웃 | POST | /auth/logout | 학생·교수 마이페이지 |
| A3 | 토큰 재발급 | POST | /auth/refresh | 로그인 (사용 미정) |
| A4 | 회원가입 | POST | /auth/signup | 회원가입 |
| A5 | 내 정보 조회 | GET | /users/me | 로그인 후, 헤더, 마이페이지 |
| A6 | 프로필 수정 | PATCH | /users/me | 학생·교수 마이페이지 |
| A7 | 학습 기록 활용 동의 | POST | /users/me/consent | 학생 마이페이지 |
| A8 | 동의 철회 | DELETE | /users/me/consent | 학생 마이페이지 |
| A9 | 설정 조회 | GET | /users/me/settings | 학생 마이페이지 |
| A10 | 설정 수정 | PATCH | /users/me/settings | 학생 마이페이지 |
| A11 | 내 학습 기록 내려받기 | GET | /users/me/export | 학생 마이페이지 |
| A12 | 수강 과목 목록 | GET | /student/courses | 학생 홈·사이드바·마이페이지 |
| A13 | 과목 나가기 | DELETE | /student/courses/{courseId} | 학생 마이페이지 |
| A14 | 담당 과목·분반·주차 | GET | /prof/courses | 교수 상단 필터, 교수 마이페이지 |
| A15 | 출제 유형 목록 | GET | /prof/exercise-types | 범위 설정 |
| A16 | 강의자료 업로드 | POST | /prof/materials | 범위 설정, 교수 마이페이지 |
| A17 | 강의자료 목록 | GET | /prof/materials | 범위 설정, 교수 마이페이지 |
| A18 | 강의자료 삭제 | DELETE | /prof/materials/{materialId} | 교수 마이페이지 |
| A19 | 학습 범위 생성(임시 저장) | POST | /prof/scopes | 범위 설정 |
| A20 | 학습 범위 목록 | GET | /prof/scopes | 범위 설정 |
| A21 | 학습 범위 수정(자동 저장) | PUT | /prof/scopes/{scopeId} | 범위 설정 |
| A22 | 학습 범위 상세 | GET | /prof/scopes/{scopeId} | 범위 설정 |
| A23 | 학습 범위 게시 | POST | /prof/scopes/{scopeId}/publish | 범위 설정 |
| A24 | AI 연습 문제 생성 | POST | /prof/scopes/ai/exercises | 범위 설정 |
| B1 | 과목 홈 | GET | /student/courses/{courseId}/home | 학생 홈 |
| B2 | 주차 목록 | GET | /student/courses/{courseId}/weeks | 학생 홈 |
| B3 | 연습 세트 조회 | GET | /practice-sets/{setId} | 학습 문제(문법·읽기와 쓰기·회화) |
| B4 | 문제 채점(한 문항) | POST | /practice-sets/{setId}/questions/{questionId}/answers | 문법 연습 |
| B5 | 답변 녹음 변환 | POST | /practice-sets/{setId}/questions/{questionId}/transcriptions | 회화 학습 문제 |
| B6 | 학습 문제 제출(해설 보기) | POST | /practice-sets/{setId}/submit | 학습 문제 |
| B7 | 연습 세트 완료(요약) | POST | /practice-sets/{setId}/complete | 학습 완료 |
| B8 | 교정 기록 조회 | GET | /student/corrections | 교정 기록 |
| B9 | 맞춤 연습 생성 | POST | /student/custom-practice | 교정 기록 → 맞춤 연습 |
| B10 | 맞춤 연습 답 확인 | POST | /student/custom-practice/{practiceId}/questions/{questionId}/answers | 맞춤 연습 |
| B11 | 피드백 신고(학생) | POST | /corrections/{correctionId}/reports | (지금 화면에 버튼 없음) |
| B12 | 반 현황 | GET | /prof/dashboard | 교수 홈 |
| B13 | AI 오류 신고 목록 | GET | /prof/feedback-reports | AI 오류 신고 |
| B14 | AI 오류 신고 처리 | PATCH | /prof/feedback-reports/{reportId} | AI 오류 신고 |
| B15 | 신고 처리 되돌리기 | POST | /prof/feedback-reports/{reportId}/reopen | AI 오류 신고 |
| B16 | AI 주간 분석 | GET | /prof/insights | 취약점 리포트 |
| B17 | 취약점 리포트 | GET | /prof/reports/weekly | 취약점 리포트 |
| C1 | 회화 세션 시작 | POST | /speaking-sessions | (예전 역할극 화면, 지금 없음) |
| C2 | 회화 메시지 전송 | POST | /speaking-sessions/{sessionId}/messages | (지금 없음) |
| C3 | 회화 음성 변환 | POST | /speaking-sessions/{sessionId}/transcriptions | (지금 없음) |
| C4 | 회화 종료·피드백 | POST | /speaking-sessions/{sessionId}/finish | (지금 없음) |
| C5 | 작문 과제 조회 | GET | /writing-tasks/{taskId} | (예전 작문 화면, 지금 없음) |
| C6 | 작문 초안 저장 | PUT | /writing-tasks/{taskId}/draft | (지금 없음) |
| C7 | 작문 AI 교정 요청 | POST | /writing-tasks/{taskId}/corrections | (지금 없음) |
| C8 | 교정 반영 | PATCH | /writing-tasks/{taskId}/corrections | (지금 없음) |
| C9 | 작문 제출 | POST | /writing-tasks/{taskId}/submit | (지금 없음) |

---

## A · 계정·과목·범위

### A1. 로그인 `POST /auth/login` — Auth 없음
역할·학교 메일 아이디·비밀번호로 로그인하고 토큰을 돌려줍니다. 고른 역할과 계정 역할이 다르면 실패(에러 형식 미정).
```json
// request
{ "role": "STUDENT", "emailId": "harin", "password": "********" }
// 200 data
{ "userId": 1, "role": "STUDENT", "name": "한하린", "accessToken": "eyJhbGciOi..." }
```
- 400 INVALID_INPUT "비밀번호를 입력해 주세요." (메일 아이디 형식·비밀번호 누락)
- 404 USER_NOT_FOUND "이 메일로 가입된 계정을 찾을 수 없어요. 먼저 회원가입해 주세요."
- 401 INVALID_PASSWORD "메일 또는 비밀번호를 확인해 주세요."
- emailId 는 @hufs.ac.kr 을 뺀 아이디만 보냅니다.

### A2. 로그아웃 `POST /auth/logout` — Bearer(학생·교수)
토큰을 무효화합니다. request 없음, 200 data `null` ("로그아웃 성공").

### A3. 토큰 재발급 `POST /auth/refresh` — refresh 토큰(HttpOnly 쿠키 권장)
access 토큰이 만료되면(401) 다시 발급. refresh 토큰을 쓸지는 미정이며, 안 쓰면 삭제.
```json
// 200 data
{ "accessToken": "eyJhbGciOi..." }
```
- 401: refresh 토큰 만료 → 다시 로그인

### A4. 회원가입 `POST /auth/signup` — Auth 없음
한 화면에서 가입. 서버가 @hufs.ac.kr 을 붙이고, 가입 후 바로 로그인 상태로 토큰을 돌려줍니다.
```json
// request
{ "role": "STUDENT", "name": "한하린", "emailId": "harin", "studentId": "202503356", "professorId": null,
  "department": "포르투갈어과", "language": "KO", "password": "********", "passwordConfirm": "********" }
// 201 data
{ "userId": 1, "role": "STUDENT", "accessToken": "eyJhbGciOi..." }
```
- 교수는 studentId 대신 professorId(교번) 필수
- language(선택): KO / EN, 기본 KO (외국인 교수용 화면·AI 글 언어). 회원가입에서 받을지는 미정
- 400 INVALID_INPUT "필수 정보를 모두 입력해 주세요."
- 400 INVALID_EMAIL "학교 메일 아이디를 확인해 주세요." (영문·숫자·._- 2자 이상)
- 400 PASSWORD_TOO_SHORT "비밀번호는 8자 이상 입력해 주세요."
- 400 PASSWORD_MISMATCH "비밀번호가 서로 일치하지 않아요."
- 409 DUPLICATE_USER "이미 가입된 계정이에요."
- 학교 메일 인증 메일은 데모에서 빠짐(마이페이지 '학교 메일 인증 완료' 배지 때문에 넣을지 미정)

### A5. 내 정보 조회 `GET /users/me` — Bearer(학생·교수)
상단 프로필, 마이페이지 프로필 카드, 진입 시 역할 분기.
```json
// 200 data (학생)
{ "userId": 1, "role": "STUDENT", "name": "한하린", "email": "harin@hufs.ac.kr", "studentId": "202503356",
  "department": "포르투갈어과", "year": "2학년", "emailVerified": true, "language": "KO", "setupComplete": true }
// 200 data (교수)
{ "userId": 2, "role": "PROFESSOR", "name": "김교수", "professorId": "prof-2024", "email": "prof@hufs.ac.kr",
  "department": "포르투갈어과", "room": "본관 512호 · 화 14:00–16:00", "language": "EN", "setupComplete": true }
```

### A6. 프로필 수정 `PATCH /users/me` — Bearer(학생·교수)
보낸 필드만 바꿉니다. 학교 메일은 수정 불가. 교수는 room 사용. language(KO/EN)만 보내 언어만 바꿀 수도 있음.
```json
// request
{ "name": "한하린", "department": "포르투갈어과", "year": "2학년" }
// 200 data
{ "userId": 1, "name": "한하린", "department": "포르투갈어과", "year": "2학년" }
```
- 400 INVALID_INPUT "입력값을 확인해 주세요."

### A7. 학습 기록 활용 동의 `POST /users/me/consent` — Bearer(학생만)
철회한 학생이 다시 동의할 때. 동의한 학생만 교수 화면(학생별 진행률·리포트)에 표시. request 없음.
```json
// 200 data
{ "agreed": true, "agreedAt": "2026-11-23" }
```

### A8. 동의 철회 `DELETE /users/me/consent` — Bearer(학생만)
```json
// 200 data ("동의를 철회했어요.")
{ "agreed": false }
```

### A9. 설정 조회 `GET /users/me/settings` — Bearer(학생만)
학생 마이페이지 알림·개인정보. (교수 설정은 화면에서 빠짐)
```json
// 200 data
{ "notifications": { "newScope": true, "dueTomorrow": true, "weeklyReportMail": false },
  "consent": { "agreed": true, "agreedAt": "2026-11-17" } }
```

### A10. 설정 수정 `PATCH /users/me/settings` — Bearer(학생만)
토글을 바꿀 때마다 바뀐 필드만 보내고, 바뀐 뒤 전체 설정을 받습니다.
```json
// request
{ "notifications": { "dueTomorrow": false } }
// 200 data
{ "notifications": { "newScope": true, "dueTomorrow": false, "weeklyReportMail": false } }
```
- 400 INVALID_INPUT "설정 값을 확인해 주세요."

### A11. 내 학습 기록 내려받기 `GET /users/me/export?format=json|csv` — Bearer(학생만)
프로필·연습·교정·단어장을 파일로 내려줍니다. 200, Content-Disposition: attachment; filename="hufs-echo-202503356.json"

### A12. 수강 과목 목록 `GET /student/courses` — Bearer(학생만)
상단·사이드바 "현재 과목" 드롭다운과 마이페이지 "수강 과목". 연결이 끊긴 과목도 enrolled=false 로 내려 '연결 필요'로 표시.
```json
// 200 data
{ "language": "PT", "level": "A1",
  "courses": [
    { "courseId": 1, "title": "포르투갈어 문법", "type": "GRAMMAR", "typeLabel": "문법·문제 풀이", "code": "PT-GRAM1",
      "professorName": "김교수", "section": "01분반", "currentScopeTitle": "부정관사와 명사의 성·수 일치", "enrolled": true },
    { "courseId": 2, "title": "포르투갈어 읽기와 쓰기", "type": "WRITING", "typeLabel": "작문·교정", "code": "PT-WRITE1", "enrolled": true },
    { "courseId": 3, "title": "포르투갈어 회화", "type": "SPEAKING", "typeLabel": "말하기", "code": "PT-TALK1", "enrolled": false } ] }
```
- ※ 데모 드롭다운에는 읽기와 쓰기 코드가 PT-READ1, 마이페이지·교수 화면에는 PT-WRITE1 → 확인 필요

### A13. 과목 나가기 `DELETE /student/courses/{courseId}` — Bearer(학생만)
수강 연결만 끊고 학습 기록은 유지(다시 연결하면 이어짐). 200 data `null` ("과목에서 나갔어요.")

### A14. 담당 과목·분반·주차 `GET /prof/courses` — Bearer(교수만)
교수 상단 필터와 마이페이지 "담당 과목 관리". 다른 교수 API는 여기서 고른 courseId·sectionId·week 를 쿼리로 받습니다.
```json
// 200 data
{ "courses": [
    { "courseId": 1, "title": "포르투갈어 문법", "type": "GRAMMAR", "typeLabel": "문법·문제 풀이",
      "sections": [ { "sectionId": 1, "name": "01분반", "studentCount": 48, "classCode": "PT-GRAM1" },
                    { "sectionId": 2, "name": "02분반", "studentCount": 0 } ],
      "weeks": [ { "week": 1, "status": "DONE" },
                 { "week": 3, "status": "IN_PROGRESS", "startDate": "2026-11-17", "endDate": "2026-11-23" },
                 { "week": 4, "status": "SCHEDULED" }, { "week": 5, "status": "DRAFT" } ] } ],
  "current": { "courseId": 1, "sectionId": 1, "week": 3 } }
```

### A15. 출제 유형 목록 `GET /prof/exercise-types?courseId=` — Bearer(교수만)
범위 설정의 "출제 유형" 버튼. 서버의 유형 정의 JSON(exercise-types.json: 표시 이름, 문제 형식, AI 프롬프트 템플릿)을 읽어 내려줌. 프롬프트는 응답에 내리지 않음. AI가 과목 종류를 구별하지 못해 교수가 직접 고름.
```json
// 200 data
{ "types": [
    { "type": "GRAMMAR", "label": "문법", "recommended": true,
      "formats": [ { "format": "FORM_WRITE", "label": "형태 쓰기" }, { "format": "FILL_BLANK", "label": "빈칸 채우기" },
                   { "format": "FIX_PART", "label": "한 부분 고치기" }, { "format": "REWRITE", "label": "문장 바꾸기" },
                   { "format": "MULTIPLE_CHOICE", "label": "객관식" } ] },
    { "type": "READING_WRITING", "label": "작문·독해", "recommended": false,
      "formats": [ { "format": "FIND_INFO", "label": "핵심 정보 찾기" }, { "format": "FIND_PURPOSE", "label": "글의 목적 파악" },
                   { "format": "WRITE_REQUIRED", "label": "필수 정보를 담아 쓰기" }, { "format": "REPLY", "label": "읽고 답장 쓰기" },
                   { "format": "MULTIPLE_CHOICE", "label": "객관식" } ] },
    { "type": "SPEAKING", "label": "회화", "recommended": false,
      "formats": [ { "format": "LISTEN", "label": "듣고 이해하기" }, { "format": "REPLY_LINE", "label": "응답 한 줄 쓰기" },
                   { "format": "SPEAK", "label": "직접 말하기" }, { "format": "READ_ALOUD", "label": "소리 내어 읽기" },
                   { "format": "MULTIPLE_CHOICE", "label": "객관식" } ] } ] }
```
- 404: 담당하지 않는 과목

### A16. 강의자료 업로드 `POST /prof/materials` — Bearer(교수만), multipart/form-data
`file`: PDF(최대 용량 미정). 업로드 후 쪽수를 읽고 AI용 텍스트 추출.
```json
// 201 data
{ "materialId": 4, "fileName": "Diálogos_A1.pdf", "pageCount": 56 }
```
- 400 INVALID_FILE "PDF 파일만 올릴 수 있어요."

### A17. 강의자료 목록 `GET /prof/materials` — Bearer(교수만)
범위 설정 PDF 선택("변경")과 마이페이지 "강의자료 보관함". 최근 사용순.
```json
// 200 data
{ "materials": [ { "materialId": 1, "fileName": "Português_A1_2026.pdf", "pageCount": 120, "usedScopeCount": 3,
    "fileUrl": "https://.../materials/1.pdf", "uploadedAt": "2026-11-17T09:00:00", "lastUsedAt": "2026-11-23T10:00:00" } ] }
```
- fileUrl 은 만료되는 서명 URL 권장. PDF 미리보기·쪽 이동은 프론트 처리.

### A18. 강의자료 삭제 `DELETE /prof/materials/{materialId}` — Bearer(교수만)
200 data `null` ("강의자료를 삭제했어요.")
- 409 MATERIAL_IN_USE "학습 범위 3개에서 사용 중인 자료예요."

### A19. 학습 범위 생성 `POST /prof/scopes` — Bearer(교수만)
스튜디오에서 처음 저장할 때 DRAFT 로 만들고, 이후 변경은 A21(PUT)로 자동 임시 저장.
```json
// request
{ "courseId": 1, "sectionId": 1, "week": 4, "materialId": 1, "startPage": 38, "endPage": 42, "exerciseType": "GRAMMAR", "questions": [] }
// 201 data ("임시 저장됨")
{ "scopeId": 4, "status": "DRAFT" }
```
- 400 INVALID_PAGE_RANGE "최대 10쪽까지 설정할 수 있어요."
- 409: 그 주차에 이미 범위 있음

### A20. 학습 범위 목록 `GET /prof/scopes?courseId=&sectionId=` — Bearer(교수만)
범위 설정 화면 아래 "학습 범위 목록". 최신 주차순. summary 는 화면에서 빠져 삭제 가능.
```json
// 200 data
{ "summary": { "published": 2, "scheduledOrDraft": 0, "avgParticipation": 89 }, "studentCount": 48,
  "scopes": [ { "scopeId": 3, "week": 3, "startDate": "2026-11-17", "endDate": "2026-11-23", "pdfPages": "29–30",
                "title": "부정관사와 명사의 성·수 일치", "status": "IN_PROGRESS", "participants": 41, "accuracy": 78 } ] }
```
- participants·accuracy 는 B파트 연습 기록에서 계산. B 구현 전, DRAFT·SCHEDULED 범위는 null.

### A21. 학습 범위 수정 `PUT /prof/scopes/{scopeId}` — Bearer(교수만)
자동 임시 저장("임시 저장됨 ✓"). 문제 수정·삭제도 questions 배열을 통째로 보냄.
```json
// request
{ "materialId": 1, "startPage": 29, "endPage": 30, "title": "부정관사와 명사의 성·수 일치", "exerciseType": "GRAMMAR",
  "questions": [ { "questionId": 101, "type": "MULTIPLE_CHOICE", "sentence": "Eu quero ___ café, por favor.", "answer": "um", "sourcePage": 29 } ] }
// 200 data
{ "scopeId": 3, "updatedAt": "2026-11-23T11:02:00" }
```
- 409: 종료된 범위 수정 불가 여부 미정

### A22. 학습 범위 상세 `GET /prof/scopes/{scopeId}` — Bearer(교수만)
목록의 "수정"·"미리보기".
```json
// 200 data
{ "scopeId": 3, "courseId": 1, "sectionId": 1, "week": 3, "materialId": 1, "startPage": 29, "endPage": 30,
  "title": "부정관사와 명사의 성·수 일치", "exerciseType": "GRAMMAR",
  "questions": [ { "questionId": 101, "type": "MULTIPLE_CHOICE", "sentence": "Eu quero ___ café, por favor.", "answer": "um", "sourcePage": 29 } ],
  "status": "IN_PROGRESS", "updatedAt": "2026-11-17T09:00:00" }
```

### A23. 학습 범위 게시 `POST /prof/scopes/{scopeId}/publish` — Bearer(교수만)
"학습 범위 확정하고 게시 →". 주차 시작일 전이면 SCHEDULED, 지났으면 IN_PROGRESS. 게시되면 학생 홈에 나타나고 "새 학습 범위 공개" 알림.
```json
// 200 data ("학습 범위를 게시했어요.")
{ "scopeId": 4, "status": "SCHEDULED", "opensAt": "2026-11-24" }
```
- 400 SCOPE_INCOMPLETE "주제와 연습 문제를 한 개 이상 넣어 주세요."

### A24. AI 연습 문제 생성 `POST /prof/scopes/ai/exercises` — Bearer(교수만)
"✦ AI로 연습 만들기". PDF 쪽 범위와 교수가 고른 출제 유형으로 문제를 만들어 미리보기에 보여줌. 저장하지 않음(게시할 때 PUT → publish). 회화 문항은 질문 음성(TTS)도 만듦. 주제 직접 입력·AI 추천 주제 단계는 없어짐.
```json
// request
{ "courseId": 1, "materialId": 1, "startPage": 29, "endPage": 30, "exerciseType": "GRAMMAR", "count": 10 }
// 200 data
{ "exerciseType": "GRAMMAR", "scopeTitle": "부정관사와 명사의 성·수 일치", "instruction": "문장을 읽고 알맞은 관사를 골라 보세요.",
  "questions": [
    { "format": "FILL_BLANK", "sentence": "Eu quero ___ café, por favor.", "answer": "um", "sourcePage": 29 },
    { "format": "MULTIPLE_CHOICE", "sentence": "Eu quero ___ café, por favor.", "choices": ["um", "uma"], "answer": "um", "sourcePage": 29 },
    { "format": "REWRITE", "sentence": "관사를 넣어 문장을 다시 써 보세요: Ela quer água.", "answer": "Ela quer uma água.", "sourcePage": 30 } ] }
```
- scopeTitle: AI가 뽑은 집중 범위 이름(범위 목록·학생 홈에 표시)
- 400 INVALID_EXERCISE_TYPE "출제 유형을 선택해 주세요."

---

## B · 연습·교정·분석

### B1. 과목 홈 `GET /student/courses/{courseId}/home` — Bearer(학생만)
학생 홈 상단: 인사, "이번 주 학습" 카드, "학습하기"로 들어갈 연습 대상. 아래 주차 목록은 B2.
```json
// 200 data
{ "week": 3, "level": "A1", "greeting": { "word": "Olá", "meaning": "안녕하세요" },
  "course": { "courseId": 1, "title": "포르투갈어 문법", "typeLabel": "문법" },
  "scope": { "scopeId": 3, "title": "부정관사와 명사의 성·수 일치", "pdfPages": "29–30", "dueDate": "2026-11-23" },
  "practice": { "type": "GRAMMAR", "targetId": 11 } }
```
- practice.type: GRAMMAR(연습 세트 setId) / WRITING(작문 과제 taskId) / SPEAKING(회화 세트 setId). 이번 주 범위가 없으면 scope·practice 는 null
- 403 COURSE_NOT_ENROLLED "연결되지 않은 과목이에요. 마이페이지에서 다시 연결해 주세요."

### B2. 주차 목록 `GET /student/courses/{courseId}/weeks` — Bearer(학생만)
학생 홈 아래 "주차 목록".
```json
// 200 data
{ "courseTitle": "PORTUGUÊS A1", "totalWeeks": 6, "currentWeek": 3,
  "weeks": [
    { "week": 1, "scopeId": 1, "title": "인사와 자기소개", "startDate": "2026-11-03", "endDate": "2026-11-09", "pdfPages": "8–12",
      "status": "DONE", "participation": 92, "accuracy": 88 },
    { "week": 4, "scopeId": null, "title": "시장에서 가격 묻기", "startDate": "2026-11-24", "endDate": "2026-11-30", "pdfPages": "38–42",
      "status": "LOCKED", "opensAt": "2026-11-24" } ] }
```

### B3. 연습 세트 조회 `GET /practice-sets/{setId}` — Bearer(학생만)
학습 문제 화면(문법·읽기와 쓰기·회화 모두)이 이 API로 문항 5개를 받음. 정답·해설은 내리지 않음(B4/B6 응답에서 받음).
```json
// 200 data (기본 예시)
{ "setId": 11, "title": "문법 · 빈칸 채우기", "week": 3,
  "textbook": { "materialId": 1, "title": "포르투갈어 읽기와 쓰기", "page": 29, "pageImageUrl": "https://.../materials/1/pages/29.png" },
  "currentIndex": 0,
  "questions": [
    { "questionId": 101, "type": "FILL_BLANK", "typeLabel": "빈칸 채우기", "sourcePage": 29, "instruction": "빈칸에 알맞은 부정관사를 입력하세요.",
      "sentence": "Eu quero ____ água, por favor.", "hint": "água는 여성 명사예요.", "choices": null },
    { "questionId": 102, "type": "MULTIPLE_CHOICE", "sentence": "Eu quero ____ café, por favor.", "choices": ["um", "uma", "uns", "umas"] } ] }
```
학습 문제 화면용 문항 추가 필드:
```json
{ "questionId": 301, "number": 1, "format": "LISTEN", "formatLabel": "듣고 이해하기",
  "instruction": "캐릭터가 무엇을 물었는지 한국어로 짧게 적으세요.", "prompt": null,
  "audioUrl": "https://.../tts/301.mp3", "answerType": "TEXT", "choices": null }
```
- audioUrl: 회화 질문 음성(TTS). 음성이 아니면 null

### B4. 문제 채점(한 문항) `POST /practice-sets/{setId}/questions/{questionId}/answers` — Bearer(학생만)
"채점하기". 답을 저장하고 정답 여부와 교정을 돌려줌. REWRITE 는 AI 교정, 틀리면 교정 기록에 쌓임. "다시 풀기"는 같은 API 재호출.
```json
// request
{ "answer": "um" }
// 200 data (오답 예시)
{ "correct": false, "answer": "um", "correctAnswer": "uma",
  "correction": { "correctionId": 501, "tag": "관사", "original": "Eu quero um água.", "corrected": "Eu quero uma água.",
                  "explanation": "água는 여성 명사라서 uma를 씁니다." },
  "isLast": false }
```
- 400 INVALID_INPUT "답을 입력해 주세요."

### B5. 답변 녹음 변환 `POST /practice-sets/{setId}/questions/{questionId}/transcriptions` — Bearer(학생만), multipart
회화 '직접 말하기'·'소리 내어 읽기'에서 녹음을 멈추면 호출. STT, 원본 음성은 저장하지 않음. 제출 때 transcriptionId 를 답으로 보냄.
- `audio`: 녹음 파일(webm/m4a, 최대 60초)
```json
// 200 data
{ "transcriptionId": 12, "text": "O meu jardim é grande.", "durationSec": 3.1 }
```
- 400 INVALID_AUDIO "녹음을 다시 해 주세요." (녹음 문항 아님·파일 없음·너무 김)
- 발음 평가는 미정

### B6. 학습 문제 제출 `POST /practice-sets/{setId}/submit` — Bearer(학생만)
"제출하고 해설 보기 →". 5문항 답을 한 번에 제출하고 문항별 정답·예시 답안·해설을 받음. 객관식·단답은 규칙 채점, 서술형(문장 바꾸기·쓰기·말하기)은 AI가 판단하고 틀린 문장은 교정 기록에 쌓음. 풀이 시간도 기록.
```json
// request
{ "elapsedSeconds": 180,
  "answers": [ { "questionId": 201, "text": "sou" }, { "questionId": 205, "choice": "um" }, { "questionId": 303, "transcriptionId": 12 } ] }
// 200 data
{ "results": [
    { "questionId": 201, "number": 1, "format": "FORM_WRITE", "formatLabel": "형태 쓰기", "myAnswer": "sou", "correct": true,
      "answer": "sou", "explanation": "eu와 함께 쓰는 ser의 현재형은 sou예요." },
    { "questionId": 204, "number": 4, "format": "REWRITE", "formatLabel": "문장 바꾸기", "myAnswer": "A cozinha está sujo.", "correct": false,
      "answer": "A cozinha está suja.", "explanation": "cozinha는 여성 명사라 sujo가 suja로 바뀌어요." } ],
  "summary": { "correctCount": 4, "total": 5, "elapsedMinutes": 3 } }
```
- 400 SET_NOT_FINISHED "아직 답하지 않은 문항이 있어요."
- 409: 이미 제출한 세트

### B7. 연습 세트 완료(요약) `POST /practice-sets/{setId}/complete` — Bearer(학생만)
세트를 완료 처리하고 학습 완료(요약) 화면 데이터를 돌려줌. 요약 화면 버튼은 "홈으로" 하나. 요약 형식은 C4·C9 와 같음.
```json
// request
{ "elapsedSeconds": 180 }
// 200 data
{ "summary": { "subject": "GRAMMAR", "eyebrow": "LEITURA · 3주차", "title": "Muito bem!", "message": "부정관사 10문제를 모두 풀었어요.",
    "stats": [ { "label": "정답", "value": 8, "suffix": "/ 10" }, { "label": "정확도", "value": 80, "suffix": "%" },
               { "label": "연습 시간", "value": 3, "suffix": "분" } ],
    "corrections": [ { "tag": "부정관사", "original": "Eu quero um água.", "corrected": "Eu quero uma água." } ] } }
```
- elapsedSeconds 가 비정상이면 서버 값으로 보정
- 400 SET_NOT_FINISHED "아직 풀지 않은 문제가 있어요."

### B8. 교정 기록 조회 `GET /student/corrections?week=&courseId=&cursor=&size=20` — Bearer(학생만)
교정 기록 화면. 주차 필터(전체/1/2/3주차). 명세 원문: 상단 "맞춤 연습 시작"은 이동만 함(API 없음).
```json
// 200 data
{ "weeks": [1, 2, 3],
  "items": [ { "correctionId": 701, "week": 3, "tag": "관사", "original": "Eu quero café.", "corrected": "Eu quero um café.",
               "explanation": "셀 수 있는 남성 명사 앞에는 um이 필요해요.", "createdAt": "2026-11-23T10:40:00" } ],
  "nextCursor": "eyJpZCI6NzAwfQ" }
```
- 기록이 없으면 items 빈 배열, 화면은 '교정 기록이 아직 없어요.'

### B9. 맞춤 연습 생성 `POST /student/custom-practice` — Bearer(학생만)
교정 기록의 반복 오류를 우선으로 5문제. 명세 원문은 "예전에 틀린 문장을 올바르게 고쳐 쓰는 형식". 기록이 없으면 빈 목록.
```json
// request
{ "courseId": null, "size": 5 }
// 201 data
{ "practiceId": 91,
  "questions": [ { "questionId": 1, "tag": "관사", "courseTitle": "포르투갈어 문법", "repeatCount": 3,
                   "instruction": "이전에 틀렸던 문장이에요. 올바르게 고쳐 써 보세요.", "sentence": "Eu quero café." } ] }
```
- courseId 가 없으면 전체 과목 기준

### B10. 맞춤 연습 답 확인 `POST /student/custom-practice/{practiceId}/questions/{questionId}/answers` — Bearer(학생만)
"정답 확인". 마지막 문제면 결과를 함께 내려줌.
```json
// request
{ "answer": "Eu quero um café." }
// 200 data
{ "correct": true, "correctAnswer": "Eu quero um café.", "isLast": false, "result": null }
// 마지막 문제: "isLast": true, "result": { "correctCount": 4, "total": 5 }
```
- 400 INVALID_INPUT "문장을 입력해 주세요."

### B11. 피드백 신고(학생) `POST /corrections/{correctionId}/reports` — Bearer(학생만)
교정 카드의 "피드백이 이상해요". 담당 교수의 AI 오류 신고 화면으로 감.
```json
// request
{ "type": "OVER_CORRECTION", "comment": "맞게 쓴 것 같은데 틀렸다고 나왔어요." }
// 201 data
{ "reportId": 31, "status": "OPEN" }
```
- type: OVER_CORRECTION(과잉 교정) / TERM_CONFUSION(문법 용어 혼동) / WRONG_CORRECTION / OTHER
- 409 ALREADY_REPORTED "이미 신고한 교정이에요."

### B12. 반 현황 `GET /prof/dashboard?courseId=&sectionId=&week=` — Bearer(교수만)
교수 홈. 학습 기록 활용에 동의한 학생만, 이름·학번 일부 가림.
```json
// 200 data
{ "courseTitle": "포르투갈어 문법", "section": "01분반", "week": 3, "startDate": "2026-11-17", "endDate": "2026-11-23", "studentCount": 48,
  "kpi": { "activeStudents": 41, "avgProgress": 64, "avgErrorRate": 22, "openReports": 2 },
  "students": [ { "studentId": 101, "maskedName": "김*윤", "maskedStudentNo": "2025****11", "progress": 78, "practiceCount": 12,
                  "errorRate": 34, "mainError": "관사·전치사", "lastActiveAt": "2026-11-23T10:42:00" } ] }
```

### B13. AI 오류 신고 목록 `GET /prof/feedback-reports?courseId=&sectionId=&week=&status=OPEN|RESOLVED` — Bearer(교수만)
```json
// 200 data
{ "counts": { "open": 2, "resolved": 0 },
  "reports": [ { "reportId": 31, "type": "OVER_CORRECTION", "typeLabel": "과잉 교정", "reportedAt": "2026-11-21T10:42:00", "week": 3, "sourcePage": 29,
                 "student": { "maskedName": "김*윤", "maskedStudentNo": "2025****11" },
                 "studentSentence": "Eu estou cansada.", "aiCorrection": "Eu sou cansada.", "aiExplanation": "estar를 ser로 바꾸는 편이 자연스럽습니다.",
                 "comment": "맞게 쓴 것 같은데 틀렸다고 나왔어요.", "status": "OPEN" } ],
  "quality": { "reportRate": 0.8, "reportCount": 2, "correctionCount": 386,
               "byType": [ { "typeLabel": "과잉 교정", "count": 1 }, { "typeLabel": "문법 용어 혼동", "count": 1 } ] } }
```

### B14. AI 오류 신고 처리 `PATCH /prof/feedback-reports/{reportId}` — Bearer(교수만)
"AI 교정이 맞아요" / "AI 오류로 표시" / "올바른 교정 입력". AI 오류이거나 교수가 고친 경우 학생 교정 기록에도 반영.
```json
// request
{ "resolution": "CUSTOM", "correctedText": "Eu estou cansada.", "explanation": "일시적인 상태는 estar를 씁니다. 학생 문장이 맞아요." }
// 200 data ("신고를 처리했어요.")
{ "reportId": 31, "status": "RESOLVED", "resolution": "CUSTOM" }
```
- resolution: AI_CORRECT / AI_ERROR / CUSTOM (CUSTOM 이면 correctedText 필수)
- 400: CUSTOM 인데 correctedText 없음 / 409: 이미 처리된 신고

### B15. 신고 처리 되돌리기 `POST /prof/feedback-reports/{reportId}/reopen` — Bearer(교수만)
처리 결과를 지우고 OPEN 으로. 학생 교정 기록 변경도 되돌림.
```json
// 200 data ("신고 처리를 되돌렸어요.")
{ "reportId": 31, "status": "OPEN", "resolution": null }
```
- 409 REPORT_NOT_RESOLVED "아직 처리하지 않은 신고예요."

### B16. AI 주간 분석 `GET /prof/insights?courseId=&sectionId=&week=` — Bearer(교수만)
취약점 리포트 "AI 주간 분석" 카드. 오류 집계는 규칙 계산, 요약 문장만 AI. 주차당 한 번 만들어 캐시 권장.
```json
// 200 data
{ "headline": "관사와 명사의 성·수 일치 오류가 가장 많이 반복됐어요.",
  "body": "학생들은 부정관사 um/uma의 형태는 알고 있지만, 뒤에 오는 명사의 성·수와 맞추는 과정에서 실수해요. 전치사 축약 오류는 지난주보다 늘어 짧은 문장 연습이 효과적일 것으로 보여요.",
  "generatedAt": "2026-11-23T06:00:00" }
```

### B17. 취약점 리포트 `GET /prof/reports/weekly?courseId=&sectionId=&week=` — Bearer(교수만)
"오류 유형 상세". 주차별 추이·다음 수업 반영·복습 예문·해당 학생 목록은 빠짐(명세 원문). "인쇄 / PDF 내보내기"는 브라우저 인쇄(API 없음).
```json
// 200 data
{ "week": 3, "startDate": "2026-11-17", "endDate": "2026-11-23",
  "errors": [ { "rank": 1, "tag": "관사와 명사의 성·수 일치", "studentCount": 19, "rate": 42,
                "example": { "original": "uma café", "corrected": "um café" },
                "moreExamples": ["Eu quero uma café.", "A conta são oito euros."] } ] }
```
- 데이터가 부족하면 data: null

---

## C · 지금 화면에 없는 API (예전 화면 기준, 유지 여부 미정)
타입과 목 함수만 만들고 화면에는 연결하지 않습니다.

### C1. 회화 세션 시작 `POST /speaking-sessions` — Bearer(학생만)
회화 역할극 진입. 진행 중인 세션이 있으면 그 세션을 돌려줌.
```json
// request
{ "setId": 31 }
// 201 data
{ "sessionId": 77, "title": "카페에서 주문하기", "estimatedMinutes": 10, "role": { "me": "카페 손님", "tutor": "종업원" },
  "scope": { "title": "카페에서 주문하고 가격 묻기", "pdfPages": "48–49", "week": 3 },
  "goals": [ { "goalId": "ORDER", "label": "음료 주문하기", "done": false }, { "goalId": "PRICE", "label": "가격 묻기", "done": false } ],
  "keyExpressions": ["Eu quero um café, por favor.", "Quanto custa o café?", "Um pastel de nata, por favor.", "Obrigado!"],
  "messages": [ { "messageId": 1, "sender": "TUTOR", "content": "Olá! Bem-vindo ao café. O que você gostaria de pedir?",
                  "translation": "안녕하세요! 카페에 오신 것을 환영해요. 무엇을 주문하시겠어요?", "correction": null } ],
  "suggestions": ["Eu quero café, por favor.", "Um pastel de nata, por favor.", "Quanto custa o café?"] }
```

### C2. 회화 메시지 전송 `POST /speaking-sessions/{sessionId}/messages` — Bearer(학생만)
학생 문장을 보내면 즉시 교정 + 튜터 답변 + 미션 진행 + 추천 문장. 음성은 C3로 텍스트를 받은 뒤 보냄.
```json
// request
{ "content": "Eu quero café, por favor.", "inputType": "TEXT" }
// 201 data
{ "myMessage": { "messageId": 2, "sender": "STUDENT", "content": "Eu quero café, por favor.",
                 "correction": { "correctionId": 701, "tag": "관사", "original": "Eu quero café.", "corrected": "Eu quero um café.",
                                 "explanation": "셀 수 있는 남성 명사 앞에는 um이 필요해요." } },
  "reply": { "messageId": 3, "sender": "TUTOR", "content": "Claro! Mais alguma coisa?", "translation": "물론이죠! 더 필요한 건 없으세요?" },
  "goals": [ { "goalId": "ORDER", "done": true }, { "goalId": "PRICE", "done": false } ],
  "suggestions": ["Quanto custa o café?"] }
```
- inputType: TEXT / VOICE
- 400 INVALID_INPUT "메시지를 입력해 주세요." / 409: 이미 끝난 세션

### C3. 회화 음성 변환 `POST /speaking-sessions/{sessionId}/transcriptions` — Bearer(학생만), multipart
`audio`: webm/m4a, 최대 60초. 원본 음성 저장 안 함.
```json
// 200 data
{ "text": "Quanto custa o café?", "durationSec": 3.2 }
```
- 400 INVALID_AUDIO "녹음을 다시 해 주세요."

### C4. 회화 종료·피드백 `POST /speaking-sessions/{sessionId}/finish` — Bearer(학생만)
```json
// 200 data
{ "summary": { "subject": "SPEAKING", "courseTitle": "포르투갈어 회화", "typeLabel": "역할극", "title": "카페 미션 완료!",
    "message": "카페 미션을 마쳤어요. 연습 결과를 확인해 보세요.",
    "stats": [ { "label": "말한 문장", "value": 6, "suffix": "문장" }, { "label": "미션", "value": "2/2" } ],
    "corrections": [ { "tag": "관사", "original": "Eu quero café.", "corrected": "Eu quero um café." } ] } }
```
- 400 NO_MESSAGE "먼저 한 문장 이상 말해 주세요." / 409 SESSION_FINISHED "이미 끝난 대화예요."

### C5. 작문 과제 조회 `GET /writing-tasks/{taskId}` — Bearer(학생만)
```json
// 200 data
{ "taskId": 21, "week": 3, "title": "학교 파티 일기", "prompt": "지난주 학교 파티에서 있었던 일을 포르투갈어 일기로 써 보세요.",
  "minWords": 80, "maxWords": 120, "pdfPages": "93", "dueDate": "2026-11-23",
  "checklist": [ { "key": "PLACE", "label": "장소를 말했나요?", "met": true }, { "key": "FOOD", "label": "먹은 음식을 말했나요?", "met": true },
                 { "key": "FEELING", "label": "느낌을 말했나요?", "met": false } ],
  "expressions": ["foi muito divertido", "eu comi bolo", "eu encontrei meus amigos", "foi um dia feliz"],
  "draft": { "content": "Ontem eu fui na festa da escola...", "wordCount": 31, "sentenceCount": 5, "savedAt": "2026-11-23T10:12:00" },
  "corrections": [], "status": "DRAFT" }
```
- status: DRAFT / SUBMITTED

### C6. 작문 초안 저장 `PUT /writing-tasks/{taskId}/draft` — Bearer(학생만)
입력이 멈추면(디바운스) 호출. 체크리스트 자동 확인 결과도 돌려줌.
```json
// request
{ "content": "Ontem eu fui na festa da escola. A festa foi muito legal..." }
// 200 data
{ "wordCount": 31, "sentenceCount": 5,
  "checklist": [ { "key": "PLACE", "met": true }, { "key": "FOOD", "met": true }, { "key": "FEELING", "met": false } ],
  "savedAt": "2026-11-23T10:12:00" }
```
- 409 ALREADY_SUBMITTED "이미 제출한 과제예요."

### C7. 작문 AI 교정 요청 `POST /writing-tasks/{taskId}/corrections` — Bearer(학생만)
저장된 초안을 AI가 교정(교수 설정의 교정 엄격도·문법 용어집 반영). request 없음.
```json
// 200 data
{ "corrections": [
    { "correctionId": 601, "tag": "전치사", "original": "na festa", "corrected": "à festa",
      "explanation": "festa 앞에는 전치사 a가 필요하고, a + a는 à로 축약됩니다.", "start": 13, "end": 21, "applied": false },
    { "correctionId": 602, "tag": "형용사 성 일치", "original": "muito legal", "corrected": "muito divertida",
      "explanation": "festa는 여성 명사라서 형용사 divertida를 씁니다.", "start": 46, "end": 57, "applied": false } ],
  "tip": "관사는 명사의 성과 수를 먼저 확인하면 헷갈리지 않아요." }
```
- 400 EMPTY_DRAFT "먼저 초안을 써 주세요."

### C8. 교정 반영 `PATCH /writing-tasks/{taskId}/corrections` — Bearer(학생만)
```json
// request (모두 반영은 { "all": true })
{ "correctionIds": [601, 602] }
// 200 data
{ "appliedIds": [601, 602], "draft": { "content": "Ontem eu fui à festa da escola. A festa foi muito divertida...", "wordCount": 31, "sentenceCount": 5 } }
```

### C9. 작문 제출 `POST /writing-tasks/{taskId}/submit` — Bearer(학생만)
저장된 초안 기준으로 제출. request 없음.
```json
// 200 data
{ "summary": { "subject": "WRITING", "courseTitle": "포르투갈어 읽기와 쓰기", "typeLabel": "작문", "title": "일기 제출 완료!",
    "message": "학교 파티 일기를 완성했어요. 교정 결과를 확인해 보세요.",
    "stats": [ { "label": "단어 수", "value": 96, "suffix": "단어" } ],
    "corrections": [ { "tag": "전치사", "original": "na festa", "corrected": "à festa" } ] } }
```
- 400 EMPTY_DRAFT "먼저 한 문장 이상 써 주세요." / 409: 이미 제출
