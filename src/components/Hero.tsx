import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { getPinById } from '../config/languages';
import { TUNING, getQuality } from '../config/tuning';
import { GlobeStage } from './GlobeStage';
import { GreetingTitle } from './GreetingTitle';
import { MagneticButton } from './MagneticButton';
import { Starfield } from './Starfield';
import { Wordmark } from './Wordmark';

type Props = {
  onLogin: () => void;
  onSignup: () => void;
  onToast: (message: string) => void;
};

export function Hero({ onLogin, onSignup, onToast }: Props) {
  const quality = useMemo(() => getQuality(), []);
  const [revealed, setRevealed] = useState(false);
  const [motionStarted, setMotionStarted] = useState(false);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [greetingPinId, setGreetingPinId] = useState('pt');

  useEffect(() => {
    const reduced = quality.reducedMotion;
    const raf = requestAnimationFrame(() => setRevealed(true));
    const motionTimer = window.setTimeout(
      () => setMotionStarted(true),
      reduced ? 0 : TUNING.intro.motionStart,
    );
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(motionTimer);
    };
  }, [quality.reducedMotion]);

  const activePinId = hoveredPin ?? selectedPin;
  const hoveredLanguageId = hoveredPin ? getPinById(hoveredPin)?.languageId ?? null : null;
  const highlightPinId = activePinId ?? greetingPinId;
  const handleGreetingLanguageChange = useCallback((id: string) => setGreetingPinId(id), []);

  const handleHover = (id: string | null) => {
    setHoveredPin(id);
    if (id) setSelectedPin(null);
  };

  const handleSelect = (id: string) => {
    const pin = getPinById(id);
    if (!pin) return;
    setHoveredPin(null);
    setSelectedPin(id);
    if (pin.status === 'coming_soon') {
      onToast(`${pin.language.nameKo} 학습은 순차적으로 열릴 예정이에요.`);
    } else if (pin.id === 'br') {
      onToast('브라질 포르투갈어는 파일럿 2단계에서 만나요.');
    }
  };

  return (
    <section className={`hero ${revealed ? 'is-in' : ''}`}>
      <Starfield count={quality.starCount} reducedMotion={quality.reducedMotion} />
      <div className="hero__aurora" aria-hidden="true" />
      <div className="hero__veil" aria-hidden="true" />

      <header className="site-header">
        <Wordmark />
      </header>

      <div className="hero__content">
        <div className="hero__globe">
          <GlobeStage
            quality={quality}
            activePinId={activePinId}
            highlightPinId={highlightPinId}
            started={motionStarted}
            onHoverPin={handleHover}
            onSelectPin={handleSelect}
          />
        </div>

        <div className="hero__lead">
          <p className="hero__eyebrow reveal" style={{ '--delay': `${TUNING.intro.eyebrowDelay}ms` } as CSSProperties}>
            <span className="hero__eyebrow-line" aria-hidden="true" />
            한국외국어대학교 · 21개 특수외국어
          </p>
          <GreetingTitle
            hoveredLanguageId={hoveredLanguageId}
            started={motionStarted}
            reducedMotion={quality.reducedMotion}
            onLanguageChange={handleGreetingLanguageChange}
          />
        </div>

        <div className="hero__tail">
          <p className="hero__body reveal" style={{ '--delay': `${TUNING.intro.bodyDelay}ms` } as CSSProperties}>
            이번 주 수업 범위에서 문법 문제를 풀고, 짧은 글을 쓰고, 소리 내어 말해 보세요.
          </p>

          <div className="hero__cta hero__auth-actions reveal" style={{ '--delay': `${TUNING.intro.ctaDelay}ms` } as CSSProperties}>
            <MagneticButton onClick={onSignup} reducedMotion={quality.reducedMotion} ariaLabel="회원가입">
              회원가입
            </MagneticButton>
            <button type="button" className="hero__login-button" onClick={onLogin}>
              기존 회원 로그인
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3.5 10h12M10.5 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
