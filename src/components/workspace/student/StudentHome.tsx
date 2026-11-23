import { WEEK, getSubject, type SubjectId } from '../../../config/learning';
import type { Session } from '../../../lib/session';
import { MiniGlobe } from './MiniGlobe';
import { WeekList } from './WeekList';

type Props = {
  session: Session;
  subject: SubjectId;
  onOpen: (id: SubjectId) => void;
};

export function StudentHome({ session, subject, onOpen }: Props) {
  const current = getSubject(subject);

  return (
    <div className="home">
      <header className="home__top">
        <div>
          <p className="home__eyebrow">{WEEK.label} · PORTUGUÊS A1</p>
          <h1>
            <span>Olá,</span> {session.name}님!
          </h1>
          <p className="home__sub">
            <b>Olá</b>는 포르투갈어로 안녕하세요예요.
          </p>
        </div>
      </header>

      <section className={`hero-card hero-card--${current.tone}`}>
        <span className="hero-card__grid" aria-hidden="true" />
        <div className="hero-card__copy">
          <p className="hero-card__eyebrow">{WEEK.label} · 이번 주 학습 범위</p>
          <h2>{current.rangeTitle}</h2>
          <div className="hero-card__details">
            <div className="hero-card__detail">
              <span>학습 범위</span>
              <b>{current.pdf}</b>
            </div>
            <div className="hero-card__detail">
              <span>기한</span>
              <b>{current.deadline}</b>
            </div>
          </div>

          <div className="hero-card__actions">
            <button type="button" className="hero-card__cta" onClick={() => onOpen(current.id)}>
              {current.cta}
              <ArrowIcon />
            </button>
          </div>
        </div>

        <div className="hero-card__visual">
          <MiniGlobe />
          <p className="hero-card__caption">SEOUL → LISBOA</p>
        </div>
      </section>

      <div className="home__grid">
        <WeekList onOpen={onOpen} />
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
