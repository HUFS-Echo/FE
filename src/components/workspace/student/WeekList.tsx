import { WEEKS, getSubject, type SubjectId } from '../../../config/learning';

type Props = {
  onOpen: (subject: SubjectId) => void;
};

export function WeekList({ onOpen }: Props) {
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

      <div className="week-grid">
        {WEEKS.filter((week) => week.status !== 'active').map((week) => {
          const done = week.status === 'done';
          const locked = week.status === 'locked';
          return (
            <article
              className={`week-card ${locked ? 'is-locked' : ''}`}
              key={week.no}
            >
              <div className="week-card__top">
                <span className="week-card__no">{String(week.no).padStart(2, '0')}</span>
                <span className={`week-card__status ${done ? 'is-done' : ''}`}>
                  {done ? '완료' : '미공개'}
                </span>
              </div>
              <h3>{week.range}</h3>
              <p>{week.dates} · {week.pdf}</p>
              {done ? (
                <>
                  <div className="week-card__stats">
                    <span>참여 {week.participation}%</span>
                    <span>정확도 {week.accuracy}%</span>
                  </div>
                  <button
                    type="button"
                    className="week-card__btn"
                    onClick={() => onOpen('reading')}
                  >
                    복습하기
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

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="4.5" y="9" width="11" height="7.5" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 9V6.8a3 3 0 0 1 6 0V9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
