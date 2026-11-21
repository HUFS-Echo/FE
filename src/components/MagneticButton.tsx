import { useRef, type ReactNode } from 'react';
import { TUNING } from '../config/tuning';

type Props = {
  children: ReactNode;
  onClick: () => void;
  reducedMotion?: boolean;
  className?: string;
  ariaLabel?: string;
};

export function MagneticButton({
  children,
  onClick,
  reducedMotion = false,
  className = '',
  ariaLabel,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const frame = useRef(0);

  const reset = () => {
    cancelAnimationFrame(frame.current);
    const button = buttonRef.current;
    if (!button) return;
    button.style.setProperty('--mx', '0px');
    button.style.setProperty('--my', '0px');
    button.style.setProperty('--gx', '50%');
    button.style.setProperty('--gy', '50%');
  };

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType === 'touch') return;
    const wrapper = wrapperRef.current;
    const button = buttonRef.current;
    if (!wrapper || !button) return;
    const rect = button.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const distance = Math.hypot(dx, dy);
    const radius = Math.max(TUNING.magnetic.radius, rect.width * 0.65);
    if (distance > radius) {
      reset();
      return;
    }
    const falloff = 1 - distance / radius;
    const pull = Math.min(TUNING.magnetic.maxPull, distance * TUNING.magnetic.pull) * falloff;
    const angle = Math.atan2(dy, dx);
    const x = Math.cos(angle) * pull;
    const y = Math.sin(angle) * pull;

    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      button.style.setProperty('--mx', `${x.toFixed(2)}px`);
      button.style.setProperty('--my', `${y.toFixed(2)}px`);
      const localX = ((event.clientX - rect.left) / rect.width) * 100;
      const localY = ((event.clientY - rect.top) / rect.height) * 100;
      button.style.setProperty('--gx', `${localX.toFixed(1)}%`);
      button.style.setProperty('--gy', `${localY.toFixed(1)}%`);
    });
  };

  return (
    <div
      ref={wrapperRef}
      className={`magnetic ${className}`}
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      <button
        ref={buttonRef}
        type="button"
        className="magnetic__button"
        onClick={onClick}
        onBlur={reset}
        aria-label={ariaLabel}
      >
        <span className="magnetic__glow" aria-hidden="true" />
        <span className="magnetic__shine" aria-hidden="true" />
        <span className="magnetic__label">{children}</span>
        <span className="magnetic__arrow" aria-hidden="true">
          <svg viewBox="0 0 20 20">
            <path
              d="M3.5 10h12M10.5 5l5 5-5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </div>
  );
}
