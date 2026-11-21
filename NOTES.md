# HUFS Echo — 작업 노트

## 현재 상태 (2026-11-21)

프로젝트: `/home/ubuntu/hufsecho` · Vite 6 + React 18 + TypeScript(strict) + three.js · 정적 빌드.
프리뷰: `https://8328-ia3mpb3ygwlvvg7pok193-56df7cf5.sg2.manus.computer` · dev server `web` (port 3000).

### 완료된 화면
1. **인트로** — 도트 지구본, 서울 리플, 순차/연속 빛 줄기, 인사말 타자 순환, 핀 호버 툴팁,
   마그네틱 CTA, 카운트업 통계, 언어 지도(23핀).
2. **온보딩 1** — 여행가방 부엉이(`public/owls/suitcase.png`), 16초 자동 넘김 + `계속`.
3. **온보딩 2** — 축구복 부엉이(`public/owls/football.png`), `계속` → 로그인.
4. **로그인** — mock 로그인(어떤 값이든 통과), 체험 계정 `김하늘` / 교수 계정 `박민수`.
5. **학생 워크스페이스** — 카페 채팅, 관사 교정 카드(원문 취소선 → 교정문 + 설명),
   취약점 카드, 추천 표현, 역할 전환.
6. **교수 대시보드** — KPI 4개, 취약점 바, 다음 수업 제안, 익명 학생 테이블.

전환: intro → suitcase → (아줄레주 와이프) → football → (와이프) → login → workspace.
`건너뛰기`는 인트로/온보딩에서 로그인으로 이동.

### 검증 완료
- 데스크톱 인트로 1440×900: 지구본 오른쪽 아래 크롭, 도트 대륙, 대기광, 리스본↔서울 빛 줄기,
  서울 리플, 제목/라벨/본문/CTA/통계/힌트, 언어 지도 23핀.
- 모바일 인트로 375×812: 지구본이 제목 아래 중앙, 캔버스 마스크, CTA/통계 표시.
- 온보딩 1·2단계, 로그인, 학생 연습(교정 카드), 교수 대시보드 실제 스크린샷 확인.
- 핀 호버: 폴란드 핀 → 라벨 `폴란드어`, 인사말 `Cześć`, 툴팁 `폴란드어`로 즉시 전환.
  핀 밖으로 이동 → 툴팁 사라짐, 인사말 순환 재개(힌디어 `Namaste`), 커서 `grab`.
- `pnpm build`: 56 modules, JS 782.99 kB(gzip 213.78 kB), CSS 55.63 kB(gzip 11.74 kB). 성공.

### 알려진 사항
- `manus-tools` 브라우저 스크린샷에서 WebGL 캔버스가 검은 사각형으로 합성되는 경우가 있으나,
  `webdev.take_screenshot` 실제 렌더는 정상(투명 배경·도트·대기광). 앱 문제 아님.
- `manus-tools` 브라우저 뷰포트는 약 890×706이라 지구본 아래쪽이 더 잘려 보임.
  디자인 기준은 1440×900 / 375×812.
- `app.config.ts`는 이 프로젝트에 없음. Webdev 프로젝트 설정은 `webdev.config`가 관리하며
  `logoUrl` 미설정(파비콘·워드마크로 대체). `public/manus-routes.json` 존재.

## 파일 맵
- `src/config/tuning.ts` — 모든 속도/개수/색상, `getQuality()`, `applyTheme()`
- `src/config/languages.ts` — 22개 언어(21개 공식 + 베트남어), 23개 핀(포르투갈 2),
  `greeting`/`greetingNative`, `GREETING_CYCLE`
- `src/config/demo.ts` — 카페 단원, 채팅, 관사 교정, 취약점, 학생 테이블
- `src/globe/geo.ts` — 위경도→3D, 포물선 커브, 이징
- `src/globe/GlobeScene.ts` — 도트 지구본, 대기광, 핀/펄스, 서울 리플, 빛 줄기,
  패럴랙스, 드래그, 레이캐스트, 툴팁 좌표
- `src/globe/landDots.json` — 5,913개 대륙 도트
- `src/components/Hero.tsx` — 인트로, 진입 타이머, 핀 상호작용, 언어 지도 트리거
- `src/components/GreetingTitle.tsx` — 인사말 타자 순환, 긴 인사말 자동 축소, 라벨
- `src/components/GlobeStage.tsx` — GlobeScene 마운트, 툴팁 rAF 배치
- `src/components/LanguageTooltip.tsx` — 유리 툴팁(국기·원문 인사말)
- `src/components/LanguageIndex.tsx` — 23핀 언어 지도 패널
- `src/components/onboarding/OnboardingStage.tsx` — 2단계 온보딩(1단계 16초 자동)
- `src/components/onboarding/AzulejoWipe.tsx` — 아줄레주 타일 전환
- `src/components/onboarding/LoginScreen.tsx` — mock 로그인
- `src/components/workspace/Workspace.tsx` — 공통 헤더, 역할 전환
- `src/components/workspace/StudentPractice.tsx` — 카페 채팅·교정·추천 표현
- `src/components/workspace/ProfessorDashboard.tsx` — KPI·취약점·학생 테이블
- `src/lib/session.ts`, `src/lib/placeTooltip.ts`
- `src/App.tsx` — 화면 상태 머신, 와이프, toast, 로그인/로그아웃
- `src/styles/base.css` — 토큰, 리셋, 워드마크, 토스트, reveal, reduced motion
- `src/styles/hero.css` — 히어로 레이아웃, 지구본 위치, 타이틀, CTA, 통계, 반응형
- `src/styles/globe.css` — 지구본 스테이지, 유리 툴팁, 언어 지도 패널
- `src/styles/onboarding.css` — 아줄레주 와이프, 온보딩, 로그인
- `src/styles/workspace.css` — 워크스페이스, 학생 연습, 교수 대시보드
- `public/owls/suitcase.png`, `public/owls/football.png` — 사용자 첨부 이미지 배경 제거·크롭
- `public/fallback-globe.png`, `public/flags/*.png` 22개
- `scripts/build_globe_assets.py`, `scripts/process_owls.py`

## 핵심 결정
- 지구본 초기 시점: 위도 30°N, 경도 55°E (`TUNING.view`). 리스본(x≈-0.70R)과 서울(x≈+0.75R)이
  함께 보이고, 브라질은 뒤쪽. 브라질은 드래그 또는 `언어 지도`에서 선택하면 `focusPin`으로 회전.
- 지구본 112vh, 오른쪽 아래 크롭. `.hero__globe`에서 크기/위치 조절.
- 21개 공식 목록(교육부/국제처): 네덜란드·말레이-인도네시아·몽골어·포르투갈·스웨덴·스와힐리·이탈리아·
  그리스·체코·힌디·우즈베크·카자흐·태국·라오스·튀르키예·아제르바이잔·페르시아·폴란드·헝가리·우크라이나·크로아티아.
  베트남어는 인트로 인사말 순환(Xin chào)과 3단계 확장을 위해 `official:false`로 추가.
  힌디어는 아시아 그룹(중동·아프리카 4 / 아시아 8 / 유럽 9 / 파일럿 2).
- 인사말은 로마자 표기(요구사항과 동일). 원문은 툴팁에서만 Noto Sans 서브셋으로 표시.
- 국기는 툴팁에만 표시. 언어 지도 패널에는 상태 점만 사용.
- mock 로그인: sessionStorage 미사용(새로고침 시 인트로부터 다시), 어떤 값이든 통과.
- reduced motion: 인사말 순환·별·빛·리플·패럴랙스 정지, CSS 전역 애니메이션 최소화.
- WebGL 미지원: `/fallback-globe.png` 정지 이미지.
- 모바일(768px 이하): 지구본을 제목 아래 가운데로, 패럴랙스 끔, 핀 탭 안내.

## 조절 지점
- 속도/개수/색상: `src/config/tuning.ts` (`TUNING`, `COLORS`)
  - `intro` — eyebrow/title/body/stats/cta/hint/motion 지연
  - `greeting` — typeMs/eraseMs/holdMs/gapMs
  - `arcs` — 순차 빛 줄기 주기·지속, 연속 줄기 속도, 굵기
  - `ripples` — 간격/지속/최대 반경
  - `starCount`, `pinCount`, `dotCount` — 품질별 개수
- 언어/핀/인사말: `src/config/languages.ts` (`LANGUAGES`, `GREETING_CYCLE`)
- 레이아웃/지구본 크기·위치: `src/styles/hero.css`의 `.hero__globe` (112vh, right/크롭)
- 인사말 폰트 크기/자동 축소: `src/components/GreetingTitle.tsx`의 `greetingScale`, `.greeting` CSS
- 온보딩 1단계 자동 넘김: `src/components/onboarding/OnboardingStage.tsx`의 `STEP_ONE_SECONDS` (16)
- 아줄레주 타일 수/속도: `AzulejoWipe.tsx`의 `COLS`/`ROWS`, `onboarding.css`의 transition
- 데모 대화/교정: `src/config/demo.ts`
- 지구본 도트 재생성: `python3 scripts/build_globe_assets.py` (VIEW_LAT/VIEW_LON 동기화)

## 검증 메모
- `pnpm build`로 타입 체크 + 빌드.
- 개발 서버: `webdev.config PUT runtime/dev-commands` 포트 3000, `web` 이름으로 running.
- 스크린샷: `webdev.take_screenshot` (데스크톱 1440×900, 모바일 375×812).
- 브라우저 상호작용: `manus-tools`의 `browser_navigate/view/click/console_exec`.
