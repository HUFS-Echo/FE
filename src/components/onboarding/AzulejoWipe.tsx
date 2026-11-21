import { useEffect, useState, type CSSProperties } from 'react';

type Props = {
  active: boolean;
  onCovered: () => void;
  onDone: () => void;
};

const COLS = 7;
const ROWS = 5;

export function AzulejoWipe({ active, onCovered, onDone }: Props) {
  const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle');

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      return;
    }
    setPhase('in');
    const coverTimer = window.setTimeout(() => {
      setPhase('out');
      onCovered();
    }, 680);
    const doneTimer = window.setTimeout(() => {
      setPhase('idle');
      onDone();
    }, 1420);
    return () => {
      window.clearTimeout(coverTimer);
      window.clearTimeout(doneTimer);
    };
  }, [active, onCovered, onDone]);

  if (phase === 'idle') return null;

  return (
    <div className={`wipe wipe--${phase}`} aria-hidden="true">
      <div className="wipe__grid">
        {Array.from({ length: COLS * ROWS }, (_, index) => {
          const row = Math.floor(index / COLS);
          const col = index % COLS;
          return (
            <span
              key={index}
              className="wipe__tile"
              style={
                {
                  '--d': `${(row + col) * 34}ms`,
                  '--tilt': `${((row * 3 + col) % 3) - 1}deg`,
                } as CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
}
