import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ALL_PINS, getPinById, type PinWithLanguage } from '../config/languages';
import { TUNING, getQuality } from '../config/tuning';
import { GlobeStage, type GlobeStageHandle } from './GlobeStage';
import { GreetingTitle } from './GreetingTitle';
import { LanguageIndex } from './LanguageIndex';
import { MagneticButton } from './MagneticButton';
import { Starfield } from './Starfield';
import { Wordmark } from './Wordmark';

type Props = {
  onStart: () => void;
  onSkip: () => void;
  onToast: (message: string) => void;
};

export function Hero({ onStart, onSkip, onToast }: Props) {
  const quality = useMemo(() => getQuality(), []);
  const [revealed, setRevealed] = useState(false);
  const [motionStarted, setMotionStarted] = useState(false);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const globeRef = useRef<GlobeStageHandle | null>(null);

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
  const activePin = activePinId ? getPinById(activePinId) : null;
  const hoveredLanguageId = activePin?.language.id ?? null;

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
      return;
    }
    if (pin.id === 'br') {
      onToast('브라질 포르투갈어는 파일럿 2단계에서 만나요.');
      return;
    }
    if (pin.id === 'pt' && !quality.mobile) {
      window.setTimeout(onStart, 420);
    }
  };

  const handlePickFromIndex = (pin: PinWithLanguage) => {
    setIndexOpen(false);
    setHoveredPin(null);
    setSelectedPin(pin.id);
    globeRef.current?.focusPin(pin.id);
    if (pin.status === 'coming_soon') {
      onToast(`${pin.countryKo} 핀으로 이동했어요. ${pin.language.nameKo}는 준비 중입니다.`);
    }
  };

  const handleResetView = () => {
    globeRef.current?.resetView();
    setSelectedPin(null);
    setHoveredPin(null);
  };

  return (
    <section className={`hero ${revealed ? 'is-in' : ''}`}>
      <Starfield count={quality.starCount} reducedMotion={quality.reducedMotion} />
      <div className="hero__aurora" aria-hidden="true" />
      <div className="hero__veil" aria-hidden="true" />

      <header className="site-header">
        <Wordmark />
        <button type="button" className="skip-button" onClick={onSkip}>
          <span>건너뛰기</span>
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M3 9h11M9.5 4.5 14 9l-4.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      <div className="hero__content">
        <div className="hero__lead">
          <p className="hero__eyebrow reveal" style={{ '--delay': `${TUNING.intro.eyebrowDelay}ms` } as CSSProperties}>
            <span className="hero__eyebrow-line" aria-hidden="true" />
            한국외국어대학교 · 21개 특수외국어
          </p>
          <GreetingTitle
            hoveredLanguageId={hoveredLanguageId}
            started={motionStarted}
            reducedMotion={quality.reducedMotion}
          />
        </div>

        <div className="hero__globe">
          <GlobeStage
            ref={globeRef}
            quality={quality}
            activePinId={activePinId}
            started={motionStarted}
            onHoverPin={handleHover}
            onSelectPin={handleSelect}
          />
        </div>

        <div className="hero__tail">
          <p className="hero__body reveal" style={{ '--delay': `${TUNING.intro.bodyDelay}ms` } as CSSProperties}>
            수업에서 배운 표현으로 AI와 말하고 쓰며 연습해요. 문장마다 바로 교정받고,
            학생들이 자주 어려워한 표현은 교수님의 다음 수업에 이어집니다.
          </p>

          <div className="hero__cta reveal" style={{ '--delay': `${TUNING.intro.ctaDelay}ms` } as CSSProperties}>
            <MagneticButton
              onClick={onStart}
              reducedMotion={quality.reducedMotion}
              ariaLabel="특수외국어에 대해 알아보기"
            >
              특수외국어란?
            </MagneticButton>
          </div>

          <p className="hero__hint reveal" style={{ '--delay': `${TUNING.intro.hintDelay}ms` } as CSSProperties}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <rect x="5" y="2.5" width="10" height="15" rx="5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M10 5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {quality.mobile ? (
              <span>핀을 탭해 인사말을 바꿔보세요</span>
            ) : (
              <>
                <span>지구본을 드래그해 돌려보세요</span>
                <i aria-hidden="true" />
                <span>핀에 올리면 인사말이 바뀝니다</span>
              </>
            )}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="index-trigger"
        onClick={() => setIndexOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={indexOpen}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M3.4 8h13.2M3.4 12h13.2M10 3v14" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />
        </svg>
        <span>언어 지도</span>
        <b>{ALL_PINS.length}</b>
      </button>

      <LanguageIndex
        open={indexOpen}
        onClose={() => setIndexOpen(false)}
        onPick={handlePickFromIndex}
        onReset={handleResetView}
      />
    </section>
  );
}
