import { useEffect, useState } from 'react';
import { Wordmark } from '../Wordmark';

type Props = {
  step: 1 | 2;
  onNext: () => void;
  onExit: () => void;
  onSkip: () => void;
};

const STEP_ONE_SECONDS = 16;
const WAVING_OWL = '/manus-storage/waving-owl_c4d09c1b.png';

export function OnboardingStage({ step, onNext, onExit, onSkip }: Props) {
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (step !== 1 || !auto) return;
    const timer = window.setTimeout(() => onNext(), STEP_ONE_SECONDS * 1000);
    return () => window.clearTimeout(timer);
  }, [step, auto, onNext]);

  const isSuitcase = step === 1;

  return (
    <section className={`onboarding onboarding--${isSuitcase ? 'suitcase' : 'welcome'}`}>
      <div className="onboarding__pattern" aria-hidden="true" />
      <div className="onboarding__glow" aria-hidden="true" />

      <header className="onboarding__head">
        <Wordmark compact />
        <div className="onboarding__steps" aria-label={`온보딩 ${step} / 2`}>
          <span className={step >= 1 ? 'is-on' : ''}>01</span>
          <i aria-hidden="true" />
          <span className={step >= 2 ? 'is-on' : ''}>02</span>
          <b>{step} / 2</b>
        </div>
        <div className="onboarding__head-actions">
          <button type="button" className="onboarding__text-button" onClick={onSkip}>
            건너뛰기
          </button>
          <button type="button" className="onboarding__icon-button" onClick={onExit} aria-label="인트로로 돌아가기">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 5l10 10M15 5 5 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <div className="onboarding__main">
        <div className="onboarding__copy">
          <p className="onboarding__eyebrow">
            <span>{isSuitcase ? 'HUFS · 21 LANGUAGES' : 'READY · ECHO'}</span>
            <i aria-hidden="true" />
          </p>
          <h2 className="onboarding__title">
            {isSuitcase ? (
              <>
                언어 가방을 챙겨,
                <br />
                <em>세계의 말</em>을 만나러 가요.
              </>
            ) : (
              <>
                준비 완료.
                <br />
                <em>이제 함께 공부해볼까요?</em>
              </>
            )}
          </h2>
          <p className="onboarding__body">
            {isSuitcase
              ? '특수외국어는 국가 발전을 위해 전략적으로 필요한 언어로, 대통령령으로 정해집니다. 한국외대에서 만나는 21개 언어와 문화를 살펴보고, 배운 표현을 AI와 연습해 보세요.'
              : '관심 있는 특수외국어를 선택해 AI와 말하고 써 보세요. 문장마다 바로 교정받고, 연습은 다음 수업을 더 알차게 만드는 데 이어집니다.'}
          </p>

          <ul className="onboarding__chips">
            {isSuitcase ? (
              <>
                <li>21개 특수외국어</li>
                <li>언어와 문화</li>
                <li>말하기·쓰기 연습</li>
              </>
            ) : (
              <>
                <li>AI와 언어 연습</li>
                <li>즉시 교정</li>
                <li>함께 성장하기</li>
              </>
            )}
          </ul>

          <div className="onboarding__actions">
            <button type="button" className="onboarding__primary" onClick={onNext}>
              {isSuitcase ? '계속' : '로그인하고 시작하기'}
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M3.5 10h12M10.5 5l5 5-5 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button type="button" className="onboarding__secondary" onClick={onExit}>
              인트로로
            </button>
          </div>

          {isSuitcase && (
            <div className="onboarding__auto">
              <span className="onboarding__auto-track">
                <i
                  className={auto ? 'is-running' : 'is-paused'}
                  style={{ animationDuration: `${STEP_ONE_SECONDS}s` }}
                />
              </span>
              <button
                type="button"
                className="onboarding__auto-label"
                onClick={() => setAuto((value) => !value)}
              >
                {auto ? '자동으로 넘어갑니다' : '자동 넘김 일시정지'}
              </button>
            </div>
          )}
        </div>

        <div className="onboarding__stage">
          <span className="onboarding__ghost" aria-hidden="true">
            {isSuitcase ? 'Hello' : 'Echo'}
          </span>
          <div className="onboarding__spot" aria-hidden="true" />
          <div className="onboarding__owl">
            <img
              src={isSuitcase ? '/owls/suitcase.png' : WAVING_OWL}
              alt={
                isSuitcase
                  ? '여행가방을 메고 걷는 파란 부엉이 캐릭터'
                  : '반갑게 인사하는 HUFS Echo 부엉이 캐릭터'
              }
              draggable={false}
            />
          </div>
          <span className="onboarding__float onboarding__float--one">
            {isSuitcase ? 'Olá · Halo · Cześć' : '안녕하세요 · Hello'}
          </span>
          <span className="onboarding__float onboarding__float--two">
            {isSuitcase ? '말하기와 쓰기로 연습' : '한 문장부터 시작해요'}
          </span>
          <span className="onboarding__float onboarding__float--three">
            {isSuitcase ? 'SEOUL → THE WORLD' : 'HUFS · 21 LANGUAGES'}
          </span>
          <div className="onboarding__floor" aria-hidden="true" />
        </div>
      </div>

      <footer className="onboarding__foot">
        <span>HUFS ECHO · 특수외국어 AI 연습</span>
        <span>SEOUL → THE WORLD</span>
      </footer>
    </section>
  );
}
