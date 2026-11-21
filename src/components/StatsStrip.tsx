import { useEffect, useState } from 'react';
import { ADMISSION_QUOTA, OFFICIAL_LANGUAGE_COUNT } from '../config/languages';
import { TUNING } from '../config/tuning';

type Props = {
  start: boolean;
  reducedMotion: boolean;
};

function useCountUp(target: number, start: boolean, reducedMotion: boolean): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (reducedMotion) {
      setValue(target);
      return;
    }
    let raf = 0;
    const startedAt = performance.now();
    const duration = TUNING.countUp.durationMs;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, reducedMotion]);

  return value;
}

export function StatsStrip({ start, reducedMotion }: Props) {
  const languages = useCountUp(OFFICIAL_LANGUAGE_COUNT, start, reducedMotion);
  const quota = useCountUp(ADMISSION_QUOTA, start, reducedMotion);

  return (
    <div className="stats" aria-label="한국외국어대학교 특수외국어 규모">
      <div className="stat">
        <div className="stat__value">
          <span className="stat__number">{languages}</span>
          <span className="stat__unit">개</span>
        </div>
        <p className="stat__label">특수외국어</p>
      </div>
      <div className="stat">
        <div className="stat__value">
          <span className="stat__number">{quota.toLocaleString('ko-KR')}</span>
          <span className="stat__unit">명</span>
        </div>
        <p className="stat__label">
          특수외국어 전공
          <br />
          입학정원
        </p>
      </div>
      <p className="stat__foot">2021년 기준 · 교육부 지정</p>
    </div>
  );
}
