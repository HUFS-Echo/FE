# HUFS Echo — 지구본 인트로 리디자인 구현 계획

## 1. 목표

HUFS Echo(한국외국어대학교 특수외국어 AI 말하기·쓰기 연습 서비스)의 첫 화면을
"요즘 인터랙티브 웹사이트" 수준의 임팩트로 재설계한다. 기존 제품 흐름
(포르투갈 클릭 → 여행가방 부엉이 → 타일 전환 → 축구복 부엉이 → 로그인)과
`languages` 설정, mock 로그인은 그대로 유지한다.

이번 작업은 새 저장소에서 시작하므로, 기존 흐름을 동일한 순서·역할로 재구현하고
인트로를 요구사항대로 새로 만든다. 실제 인증/서버는 붙이지 않는다(데모).

## 2. 사용자 요구사항 (원문 보존)

### 2.1 배경과 지구본
- 배경: 짙은 남색(#0B1530 → #13213D 그라디언트) + 아주 작은 별 파티클(느리게 반짝임) + 은은한 노이즈 질감
- 지구본: 국기 채우기 제거, 대륙을 작은 점(도트)으로 표현(cobe 스타일)
  - 점 색: 연한 하늘색, 바다는 비움, 가장자리에 파란 대기 글로우(#2856A8~#5B8DEF)
  - coming_soon 핀: 작은 흰 점 / active(포르투갈, 브라질): 더 크고 밝은 파란 점 + pulse
  - 국기는 핀에 마우스를 올렸을 때 툴팁 안에서만 작게 표시
- 툴팁은 반투명 유리 느낌(backdrop-blur), 다른 핀과 겹치지 않게 위치 자동 조정

### 2.2 서울에서 세계로 뻗는 빛 (Echo 연출)
- 서울(37.59, 127.06) 핀에서 각 언어 국가로 포물선 빛이 순서대로 날아가는 애니메이션 반복
- 포르투갈·브라질 줄기는 가장 밝고 굵게, 끊기지 않고 계속 흐름
- 서울 핀에서 동그란 물결(ripple)이 2~3초 간격으로 퍼져 나감

### 2.3 여러 언어로 바뀌는 인사말 제목
- 첫 줄: 인사말이 타자 치듯 바뀜 + 오른쪽 위 작은 언어 라벨
  Olá → Halo → Xin chào → Merhaba → Namaste → Sain baina uu → Jambo → Cześć → Szia → 반복
- 둘째 줄 고정: "AI와 말하고, 바로 교정받기"
- 핀 hover 시 즉시 그 언어 인사말로 전환, mouseleave 시 순환 복귀
- 인사말은 `languages` 설정 파일에 `greeting` 필드로 추가
- 글꼴이 문자를 지원하는지 확인하고, 미지원 문자는 로마자 표기 사용

### 2.4 배치와 마우스 반응
- 비대칭 배치: 왼쪽 소개·제목·버튼, 오른쪽 아래 아주 큰 지구본(화면 높이 120%, 아래쪽 화면 밖으로 잘림)
- 마우스 위치에 따라 지구본이 살짝 기울어짐(패럴랙스, 최대 6~8°), 드래그로 회전
- "포르투갈어로 시작하기" 버튼: 마그네틱 효과 + 호버 시 빛 번짐
- 제목 아래 숫자 2개 카운트업: "21개 특수외국어", "856명 특수외국어 전공 입학정원"

### 2.5 첫 진입 연출 (약 1.5초)
- 배경 → 지구본 아래에서 떠오르며 페이드인 → 제목 한 줄씩 아래에서 올라옴 → 버튼 등장
- 이후 빛 줄기와 인사말 순환 시작

### 2.6 성능·접근성
- 별 파티클·빛 줄기 개수를 상수로 조절, 저사양 자동 축소
- WebGL 미지원 시 정지 이미지 대체, prefers-reduced-motion 시 순환·파티클·패럴랙스 끄기
- 모바일(768px 이하) 지구본을 제목 아래 가운데 배치, 패럴랙스 끄기
- "건너뛰기" 버튼 유지

### 2.7 유지되는 기존 흐름
- 포르투갈 클릭 → 여행가방 부엉이 → 아줄레주 타일 전환 → 축구복 부엉이 → 로그인(mock)
- `languages` 설정 파일과 mock 로그인 유지

## 3. 디자인

### 스타일 후보 (확률)
- **A. Echo Cartography — 0.07**: 17세기 포르투갈 항해 지도 + 아줄레주 점묘 + cobe식 WebGL 미니멀리즘
- **B. Neo-Seoul Glass — 0.02**: 유리 질감 카드와 보라-시안 그라디언트의 일반적인 SaaS 히어로
- **C. Azulejo Arcade — 0.03**: 청백 타일을 풀스크린 그래픽 언어로 쓰는 장식적·유희적 방향

**선택: A. Echo Cartography.** 지구본의 점을 아줄레주의 점묘로, 서울에서 퍼지는 빛을 항해 지도의
경로선으로 읽게 한다. 인트로와 온보딩(아줄레주 타일 전환)이 하나의 시각 언어로 이어진다.

- **Design Movement**: 포르투갈 항해 지도(cartografia)와 아줄레주 점묘, 현대 WebGL 데이터 미니멀리즘의 결합.
- **Core Principles**
  1. 장식은 데이터에서 나온다 — 점은 언어, 호는 메아리, 숫자는 실제 통계.
  2. 빛은 서울에서 시작된다 — 모든 시선의 출발점을 한 점으로 고정.
  3. 거대한 지구본을 화면 밖으로 잘라 여백과 긴장을 만든다.
  4. 정보는 조용히, 감동은 크게 — 작은 좌표 라벨과 큰 세리프 인사말의 대비.
- **Color Philosophy**: 심해 남색(#0B1530→#13213D)은 밤의 대서양, 연한 하늘색 도트(#A9CBFF)는 항해 지도의 별,
  대기 글로우(#2856A8→#5B8DEF)는 아줄레주 코발트. 포르투갈만의 웜톤을 따로 쓰지 않고 같은 블루 계열로 통일해
  "특수외국어 전체를 품는 학교"라는 메시지를 색으로도 지킨다.
- **Layout Paradigm**: 7vw 왼쪽 편집 칼럼 + 오른쪽 아래로 120vh 지구본을 크롭. 중앙 정렬을 피하고,
  숫자·좌표·힌트를 하단의 가로 "좌표 스트립"에 배치해 지도 도구 같은 인상을 준다.
- **Signature Elements**: ① 도트 지구본과 대기 림 ② 서울에서 퍼지는 원형 메아리 ③ 아줄레주 타일 와이프 전환
  ④ `37.59°N 127.06°E` 같은 모노 좌표 라벨.
- **Interaction Philosophy**: 화면은 조용하지만 손끝에 반응한다. 버튼은 가까이 오면 끌려오고,
  지구본은 드래그로 돌아가며, 핀에 닿으면 인사말이 즉시 그 언어로 바뀐다. 모든 반응은 과장 없이 정확하게.
- **Animation**: 1.5초 진입(지구본 상승 → 제목 라인 상승 → 버튼), 55ms/글자 타자, 2.4초 리플,
  1.6초 빛 줄기, 7° 이내 패럴랙스. 이징은 `cubic-bezier(.16,1,.3,1)` 계열의 감속.
- **Typography System**: 인사말 `Instrument Serif Italic`(라틴 확장 지원), 한국어 UI `Pretendard`,
  좌표·라벨 `IBM Plex Mono`. 인사말 96~120px / 고정 둘째 줄 40~48px / 본문 16px / 라벨 11px.
- **Brand Essence**: "서울의 목소리가 세계로 번지는, 특수외국어 교정의 메아리." — 고요한, 정교한, 빛나는.
- **Brand Voice**: 다정하지만 군더더기 없이. 예: "말해보세요. 교정은 바로 돌아옵니다." /
  "오늘의 한 문장이 다음 수업을 바꿉니다."
- **Wordmark & Logo**: 점 하나에서 세 개의 호가 퍼지는 에코 마크 + 넓은 자간의 `HUFS ECHO`.
  공식 로고 이미지는 사용하지 않고 텍스트/자체 SVG 마크만 사용한다.
- **Signature Brand Color**: Echo Blue `#5B8DEF`.

## 4. 구현 접근

### 스택
- Vite + React 18 + TypeScript, three.js(WebGL), 순수 CSS(디자인 토큰 + 섹션별 파일).
- 서버·DB 없음. mock 로그인은 sessionStorage. 정적 빌드(`dist`)로 배포 가능.
- 폰트: Google Fonts(Instrument Serif, IBM Plex Mono, Noto Sans 서브셋) + Pretendard CDN.
  인사말은 로마자 표기를 기본으로 하고, 툴팁의 원문 표기는 Noto Sans 서브셋으로 보완한다.
- 국기: flagcdn의 40px PNG를 로컬 `public/flags`에 벤더링(툴팁에서만 사용).

### 지구본
- 대륙 도트 좌표는 Natural Earth 110m land GeoJSON을 오프라인에서 균등 샘플링해 JSON으로 생성.
- three.js OrthographicCamera + 점(Points) 셰이더. 바다는 어두운 구체로 가려 뒷면 도트를 제거.
- 대기 글로우는 프레넬 셰이더 + 외곽 스프라이트. 핀은 작은 구체 + pulse 링.
- 서울→각국 호는 TubeGeometry + 진행도 셰이더. 포르투갈·브라질은 3개의 빛 패킷이 끊김 없이 순환,
  나머지는 순차 발사. 서울 리플은 접평면 링 3개.
- 마우스 패럴랙스(±7°), 포인터 드래그 회전(관성), 핀 레이캐스트, 화면 좌표 투영으로 HTML 툴팁 배치.
- WebGL 실패 시 같은 구도의 정지 PNG로 대체. `prefers-reduced-motion`이면 정적 1프레임.

### 화면 상태
`intro → suitcase → (azulejo wipe) → football → (azulejo wipe) → login → workspace`
- 해시(`#/login`, `#/app`)로 새로고침/뒤로가기 보조. 메인 문서는 `/` 하나.
- 건너뛰기: 인트로/온보딩을 건너뛰고 로그인으로.
- 로그인: 어떤 값이든 통과하는 mock, 체험 계정/교수 계정 버튼, 오류 상태 표시.

### 워크스페이스(데모)
- 학생: 이번 주 단원(카페에서 주문하기), AI 대화, 메시지별 교정 카드(원문→수정→한국어 설명),
  추천 표현 칩, 이번 주 교정 노트, 반 전체 취약점 미니 차트.
- 교수: 참여 현황, 취약 유형 Top 3, 익명 학생 테이블, 다음 수업 제안.
- 모두 mock 데이터이며 화면에 "데모"임을 명시.

## 5. 프로젝트 구조

```
hufsecho/
├─ index.html
├─ public/
│  ├─ flags/*.png                 # 툴팁용 국기 (40px)
│  ├─ fallback-globe.png          # WebGL 미지원 대체 이미지
│  ├─ favicon.svg
│  └─ manus-routes.json
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx                     # 화면 상태 머신
│  ├─ config/
│  │  ├─ tuning.ts                # ★ 속도·개수·색상 상수 + 저사양 감지
│  │  ├─ languages.ts             # ★ 21개 특수외국어 + greeting + 좌표 + 핀 상태
│  │  └─ demo.ts                  # mock 대화·교수 대시보드 데이터
│  ├─ globe/
│  │  ├─ GlobeScene.ts            # three.js 씬, 핀/호/리플/패럴랙스/드래그
│  │  ├─ geo.ts                   # latLon→vector, 호 커브
│  │  └─ landDots.json            # 생성된 대륙 도트 좌표
│  ├─ components/
│  │  ├─ Hero.tsx, GlobeStage.tsx, GreetingTitle.tsx, LanguageTooltip.tsx
│  │  ├─ MagneticButton.tsx, Starfield.tsx, StatsStrip.tsx, Wordmark.tsx
│  │  ├─ onboarding/ (SuitcaseScene, FootballScene, AzulejoWipe, LoginScreen, Owl)
│  │  └─ workspace/ (Workspace, StudentPractice, ProfessorDashboard, …)
│  └─ styles/ (base, hero, globe, onboarding, workspace)
```

## 6. 검증

- TypeScript/ESLint 수준의 정적 검사 + `pnpm build`.
- 데스크톱 1440×900, 태블릿 768, 모바일 375 스크린샷으로 레이아웃·크롭·툴팁 확인.
- 인트로 1.5초 시퀀스, 핀 hover 인사말 전환, 드래그, 마그네틱, 카운트업, 건너뛰기,
  온보딩→로그인→워크스페이스 전 구간을 브라우저에서 확인.
- reduced-motion/모바일 분기와 WebGL fallback을 코드·스크린샷으로 확인.
