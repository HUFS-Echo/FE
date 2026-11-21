import type { PinWithLanguage } from '../config/languages';

type Props = {
  pin: PinWithLanguage;
};

export function LanguageTooltip({ pin }: Props) {
  const native = pin.language.greetingNative ?? pin.language.greeting;
  return (
    <div className="lang-tip" aria-hidden="true">
      <div className="lang-tip__top">
        <img
          className="lang-tip__flag"
          src={`/flags/${pin.flag}.png`}
          alt=""
          width={30}
          height={20}
          draggable={false}
        />
        <div className="lang-tip__names">
          <strong>{pin.language.nameKo}</strong>
          <span>{pin.language.nameNative}</span>
        </div>
        <span className={`lang-tip__status lang-tip__status--${pin.status}`}>
          <i aria-hidden="true" />
          {pin.statusLabel}
        </span>
      </div>
      <p className="lang-tip__greeting">{native}</p>
      <div className="lang-tip__foot">
        <span>
          {pin.countryKo} · {pin.note}
        </span>
        {pin.status === 'active' && (
          <span className="lang-tip__go">
            {pin.id === 'br' ? '2단계' : '클릭해서 시작'}
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}
