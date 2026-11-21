import { WEEKS, WEEK, getSubject, type SubjectId } from '../../../config/learning';

type Props = {
  onOpen: (subject: SubjectId) => void;
};

export function WeekList({ onOpen }: Props) {
  const current = WEEKS.find((week) => week.status === 'active') ?? WEEKS[2];
  const subject = getSubject('reading');

  return (
    <div className="weeks">
      <header className="page-head">
        <div>
          <p className="eyebrow">CRONOGRAMA · PORTUGUÊS A1</p>
          <h1>주차 목록</h1>
          <p className="page-head__sub">이번 학기 6주 중 3주차를 지나고 있어요.</p>
        </div>
        <span className="page-head__pill">전체 6주</span>
      </header>

      <section className="week-current">
        <div className="week-current__copy">
          <span className="week-current__badge">이번 주</span>
          <p className="eyebrow">SEMANA {current.no} · {current.dates}</p>
          <h2>{current.range}</h2>
          <p className="week-current__meta">
            {current.pdf} · 마감 {WEEK.deadline}
          </p>
          <div className="week-current__progress">
            <div>
              <span>이번 주 목표</span>
              <b>{WEEK.goalDone} / {WEEK.goalTotal} 완료</b>
            </div>
            <i>
              <em style={{ width: `${(WEEK.goalDone / WEEK.goalTotal) * 100}%` }} />
            </i>
          </div>
          <button type="button" className="week-current__cta" onClick={() => onOpen('reading')}>
            이어서 하기
            <ArrowIcon />
          </button>
        </div>
        <div className="week-current__art" aria-hidden="true">
          <img src="/owls/football.png" alt="" draggable={false} />
          <span className="week-current__stamp">SEMANA<br />03</span>
        </div>
      </section>

      <div className="week-grid">
        {WEEKS.map((week) => {
          const done = week.status === 'done';
          const active = week.status === 'active';
          const locked = week.status === 'locked';
          return (
            <article
              className={`week-card ${active ? 'is-active' : ''} ${locked ? 'is-locked' : ''}`}
              key={week.no}
            >
              <div className="week-card__top">
                <span className="week-card__no">{String(week.no).padStart(2, '0')}</span>
                <span className={`week-card__status ${done ? 'is-done' : active ? 'is-active' : ''}`}>
                  {done ? '완료' : active ? '진행 중' : '미공개'}
                </span>
              </div>
              <h3>{week.range}</h3>
              <p>{week.dates} · {week.pdf}</p>
              {done || active ? (
                <>
                  <div className="week-card__stats">
                    <span>참여 {week.participation}%</span>
                    <span>정확도 {week.accuracy}%</span>
                  </div>
                  <button
                    type="button"
                    className={`week-card__btn ${active ? 'is-solid' : ''}`}
                    onClick={() => onOpen('reading')}
                  >
                    {done ? '복습하기' : '이어서 하기'}
                  </button>
                </>
              ) : (
                <div className="week-card__locked">
                  <LockIcon />
                  <span>{week.openAt}</span>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <p className="weeks__note">
        {subject.name} · {subject.rangeTitle} 범위는 이번 주 일요일까지 열려 있어요.
      </p>
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

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="4.5" y="9" width="11" height="7.5" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 9V6.8a3 3 0 0 1 6 0V9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
