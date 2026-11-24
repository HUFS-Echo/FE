import { WEEK, getSubject, type SubjectId } from '../../../config/learning';

export type SummaryData = {
  subject: SubjectId;
  title: string;
  message: string;
  stats: { label: string; value: string; suffix?: string }[];
  next?: { title: string; desc: string; cta: string; subject: SubjectId };
};

type Props = {
  data: SummaryData;
  onHome: () => void;
  onNext: (subject: SubjectId) => void;
};

export function PracticeSummary({ data, onHome, onNext }: Props) {
  const next = data.subject === 'reading' ? undefined : data.next;

  return (
    <div className="summary">
      <section className="summary__hero">
        <div className="summary__hero-copy">
          <p className="eyebrow">{getSubject(data.subject).name} · {WEEK.label}</p>
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

      {next && (
        <div className="summary__grid summary__grid--single">
          <section className="summary-next">
            <p className="eyebrow">PRÓXIMO PASSO</p>
            <h3>{next.title}</h3>
            <p>{next.desc}</p>
            <button type="button" onClick={() => onNext(next.subject)}>
              {next.cta}
              <ArrowIcon />
            </button>
          </section>
        </div>
      )}

      <div className="summary__actions">
        <button type="button" className="btn-ghost" onClick={onHome}>
          홈으로
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
