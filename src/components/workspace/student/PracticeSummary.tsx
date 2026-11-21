import type { SubjectId } from '../../../config/learning';

export type SummaryData = {
  subject: SubjectId;
  eyebrow: string;
  title: string;
  message: string;
  stats: { label: string; value: string; suffix?: string }[];
  corrections: { original: string; corrected: string; tag: string }[];
  words: string[];
  next: { title: string; desc: string; cta: string; subject: SubjectId };
};

type Props = {
  data: SummaryData;
  onHome: () => void;
  onRetry: () => void;
  onNext: (subject: SubjectId) => void;
};

export function PracticeSummary({ data, onHome, onRetry, onNext }: Props) {
  return (
    <div className="summary">
      <section className="summary__hero">
        <div className="summary__hero-copy">
          <p className="eyebrow">{data.eyebrow}</p>
          <h1>{data.title}</h1>
          <p>{data.message}</p>
        </div>
        <img src="/owls/football.png" alt="" draggable={false} />
      </section>

      <div className="summary__stats">
        {data.stats.map((stat) => (
          <div className="summary-stat" key={stat.label}>
            <span>{stat.label}</span>
            <b>
              {stat.value}
              {stat.suffix && <small>{stat.suffix}</small>}
            </b>
          </div>
        ))}
      </div>

      <div className="summary__grid">
        <section className="summary__card">
          <header className="block-head block-head--small">
            <div>
              <p className="eyebrow">REVISÃO</p>
              <h2>오늘 고친 문장</h2>
            </div>
            <span className="block-head__meta">{data.corrections.length}개</span>
          </header>
          {data.corrections.length > 0 ? (
            <div className="summary-corrections">
              {data.corrections.map((correction) => (
                <div className="summary-correction" key={`${correction.original}-${correction.corrected}`}>
                  <span className="tag">{correction.tag}</span>
                  <p>
                    <span className="strike">{correction.original}</span>
                    <ArrowIcon />
                    <b>{correction.corrected}</b>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="summary__empty">새로 고친 문장이 없어요. 깔끔하게 잘했어요!</p>
          )}
        </section>

        <section className="summary__card">
          <header className="block-head block-head--small">
            <div>
              <p className="eyebrow">VOCABULÁRIO</p>
              <h2>새로 만난 단어</h2>
            </div>
          </header>
          <div className="word-chips">
            {data.words.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </div>
          <div className="summary-next">
            <p className="eyebrow">PRÓXIMO PASSO</p>
            <h3>{data.next.title}</h3>
            <p>{data.next.desc}</p>
            <button type="button" onClick={() => onNext(data.next.subject)}>
              {data.next.cta}
              <ArrowIcon />
            </button>
          </div>
        </section>
      </div>

      <div className="summary__actions">
        <button type="button" className="btn-ghost" onClick={onHome}>
          홈으로
        </button>
        <button type="button" className="btn-solid" onClick={onRetry}>
          한 번 더
          <ArrowIcon />
        </button>
      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
