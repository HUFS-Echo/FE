import { useEffect, useState } from 'react';
import { Wordmark } from '../Wordmark';

type Props = {
  step: 1 | 2;
  onNext: () => void;
  onExit: () => void;
  onSkip: () => void;
};

const STEP_ONE_SECONDS = 16;

export function OnboardingStage({ step, onNext, onExit, onSkip }: Props) {
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (step !== 1 || !auto) return;
    const timer = window.setTimeout(() => onNext(), STEP_ONE_SECONDS * 1000);
    return () => window.clearTimeout(timer);
  }, [step, auto, onNext]);

  const isSuitcase = step === 1;

  return (
    <section className={`onboarding onboarding--${isSuitcase ? 'suitcase' : 'football'}`}>
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
            <span>{isSuitcase ? 'PASSO 01 · PARTIDA' : 'PASSO 02 · EQUIPE'}</span>
            <i aria-hidden="true" />
          </p>
          <h2 className="onboarding__title">
            {isSuitcase ? (
              <>
                여행가방을 싸고,
                <br />
                <em>포르투갈로</em> 떠나요.
              </>
            ) : (
              <>
                준비 완료.
                <br />
                이제 <em>말해볼까요?</em>
              </>
            )}
          </h2>
          <p className="onboarding__body">
            {isSuitcase
              ? '오늘의 단원은 리스본 카페에서 주문하기. 이사벨라가 작은 카페에서 기다리고 있어요. 배운 표현으로 첫 문장을 건네볼까요?'
              : '이번 주 배운 표현으로 AI와 대화하면, 문장마다 교정이 돌아옵니다. 반 전체가 자주 틀린 표현은 교수님의 다음 수업으로 이어져요.'}
          </p>

          <ul className="onboarding__chips">
            {isSuitcase ? (
              <>
                <li>3주차 · 카페에서 주문하기</li>
                <li>A1 · 기초 회화</li>
                <li>12개 표현</li>
              </>
            ) : (
              <>
                <li>이사벨라 · AI 튜터</li>
                <li>즉시 교정</li>
                <li>교수 요약</li>
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
            {isSuitcase ? 'Olá' : 'Vamos'}
          </span>
          <div className="onboarding__spot" aria-hidden="true" />
          <div className="onboarding__owl">
            <img
              src={isSuitcase ? '/owls/suitcase.png' : '/owls/football.png'}
              alt={
                isSuitcase
                  ? '여행가방을 메고 걷는 파란 부엉이 캐릭터'
                  : '포르투갈 축구 유니폼을 입고 공을 차는 부엉이 캐릭터'
              }
              draggable={false}
            />
          </div>
          <span className="onboarding__float onboarding__float--one">
            {isSuitcase ? 'Um café, por favor' : 'Bom jogo!'}
          </span>
          <span className="onboarding__float onboarding__float--two">
            {isSuitcase ? 'Obrigado' : 'Eu quero aprender'}
          </span>
          <span className="onboarding__float onboarding__float--three">
            {isSuitcase ? 'Lisboa · 38.72°N' : '3주차 · 12 expressions'}
          </span>
          <div className="onboarding__floor" aria-hidden="true" />
        </div>
      </div>

      <footer className="onboarding__foot">
        <span>HUFS ECHO · 특수외국어 AI 연습</span>
        <span>SEOUL → LISBOA</span>
      </footer>
    </section>
  );
}
