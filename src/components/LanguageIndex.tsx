import { useEffect, useRef } from 'react';
import {
  ALL_PINS,
  REGION_LABELS,
  type PinWithLanguage,
  type Region,
} from '../config/languages';

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (pin: PinWithLanguage) => void;
  onReset: () => void;
};

const REGION_ORDER: Region[] = ['pilot', 'mea', 'asia', 'europe'];

export function LanguageIndex({ open, onClose, onPick, onReset }: Props) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    window.setTimeout(() => closeRef.current?.focus(), 40);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="index-layer" role="presentation">
      <button
        type="button"
        className="index-scrim"
        onClick={onClose}
        aria-label="언어 지도 닫기"
        tabIndex={-1}
      />
      <aside className="index-panel" role="dialog" aria-modal="true" aria-label="언어 지도">
        <header className="index-panel__head">
          <div>
            <p className="index-panel__eyebrow">ECHO NETWORK</p>
            <h2 className="index-panel__title">언어 지도</h2>
            <p className="index-panel__meta">
              23개 핀 · 21개 특수외국어
              <span>파일럿 2 · 준비 중 20 · 확장 검토 1</span>
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="index-panel__close"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M5 5l10 10M15 5 5 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="index-panel__body">
          {REGION_ORDER.map((region) => {
            const pins = ALL_PINS.filter((pin) => pin.language.region === region).sort((a, b) => {
              if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
              return a.language.nameKo.localeCompare(b.language.nameKo, 'ko');
            });
            if (pins.length === 0) return null;
            return (
              <section key={region} className="index-group">
                <h3 className="index-group__label">
                  {REGION_LABELS[region]}
                  <span>{pins.length}</span>
                </h3>
                <ul className="index-list">
                  {pins.map((pin) => (
                    <li key={pin.id}>
                      <button type="button" className="index-row" onClick={() => onPick(pin)}>
                        <span
                          className={`index-row__dot index-row__dot--${pin.status}`}
                          aria-hidden="true"
                        />
                        <span className="index-row__names">
                          <strong>{pin.language.nameKo}</strong>
                          <span>
                            {pin.countryKo} · {pin.language.nameNative}
                          </span>
                        </span>
                        <span className="index-row__status">{pin.statusLabel}</span>
                        <span className="index-row__code">{pin.language.code}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <footer className="index-panel__foot">
          <p>핀을 고르면 지구본이 그 나라로 돌아갑니다.</p>
          <button type="button" className="index-reset" onClick={onReset}>
            처음 시점으로
          </button>
        </footer>
      </aside>
    </div>
  );
}
