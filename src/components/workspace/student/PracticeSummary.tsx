import type { PracticeSummary as ApiPracticeSummary, SubmitResponse } from '../../../api/types';

export type SubjectId = 'grammar' | 'writing' | 'speaking';
export type SummaryData = {
  subject: SubjectId;
  weekLabel?: string;
  title: string;
  message: string;
  stats: { label: string; value: string; suffix?: string }[];
  correctionsTitle?: string;
  emptyCorrectionsMessage?: string;
  corrections: { original: string; corrected: string }[];
  responseData?: { results: SubmitResponse['results']; completion: ApiPracticeSummary };
};

type Props = { data: SummaryData; onHome: () => void };
const SUBJECT_NAMES: Record<SubjectId, string> = { grammar: '포르투갈어 문법', writing: '포르투갈어 읽기와 쓰기', speaking: '포르투갈어 회화' };

export function PracticeSummary({ data, onHome }: Props) {
  return (
    <div className="summary">
      <section className="summary__hero">
        <div className="summary__hero-copy">
          <p className="eyebrow">{SUBJECT_NAMES[data.subject]} · {data.weekLabel ?? '연습'}</p>
          <h1>{data.title}</h1>
          <p>{data.message}</p>
        </div>
        <img src="/owls/football.png" alt="" draggable={false} />
      </section>

      <div className="summary__stats">
        {data.stats.map((stat) => (
          <div className="summary-stat" key={stat.label}>
            <span>{stat.label}</span>
            <b>{stat.value}{stat.suffix && <small>{stat.suffix}</small>}</b>
          </div>
        ))}
      </div>

      <div className="summary__grid">
        <section className="summary__card">
          <header className="block-head block-head--small">
            <div><p className="eyebrow">REVISÃO</p><h2>{data.correctionsTitle ?? '오늘 고친 문장'}</h2></div>
            <span className="block-head__meta">{data.corrections.length}개</span>
          </header>
          {data.corrections.length > 0 ? (
            <div className="summary-corrections">
              {data.corrections.map((correction) => (
                <div className="summary-correction" key={`${correction.original}-${correction.corrected}`}>
                  <p><span className="strike">{correction.original}</span><ArrowIcon /><b>{correction.corrected}</b></p>
                </div>
              ))}
            </div>
          ) : <p className="summary__empty">{data.emptyCorrectionsMessage ?? '새로 고친 문장이 없어요. 깔끔하게 잘했어요!'}</p>}
        </section>

      </div>

      <div className="summary__actions"><button type="button" className="btn-ghost" onClick={onHome}>홈으로</button></div>
    </div>
  );
}

function ArrowIcon() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
