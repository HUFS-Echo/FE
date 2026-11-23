import { WEEK, getSubject, type SubjectId } from '../../../config/learning';
import type { Session } from '../../../lib/session';
import { MiniGlobe } from './MiniGlobe';
import { WeekList } from './WeekList';

type Props = {
  session: Session;
  subject: SubjectId;
  onOpen: (id: SubjectId) => void;
  onToast: (message: string) => void;
};

export function StudentHome({ session, subject, onOpen, onToast }: Props) {
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
          <p className="hero-card__eyebrow">THIS WEEK · {WEEK.label}</p>
          <h2>{current.rangeTitle}</h2>
          <p className="hero-card__meta">
            <span>{current.pdf}</span>
            <i aria-hidden="true" />
            <span>{current.deadline}</span>
            <i aria-hidden="true" />
            <span>A1</span>
          </p>

          <div className="hero-card__progress">
            <div className="hero-card__progress-top">
              <span>이번 주 진행률</span>
              <b>{current.progress}%</b>
            </div>
            <div className="hero-card__bar">
              <i style={{ width: `${current.progress}%` }} />
            </div>
          </div>

          <div className="hero-card__actions">
            <button type="button" className="hero-card__cta" onClick={() => onOpen(current.id)}>
              {current.cta}
              <ArrowIcon />
            </button>
            <button
              type="button"
              className="hero-card__ghost"
              onClick={() => onToast('이번 주 교재 범위를 확인했어요. (데모)')}
            >
              범위 보기
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
