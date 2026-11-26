import { WEEK, getSubject, type SubjectId } from '../../../api/adapters';
import type { Session } from '../../../api/adapters';
import { MiniGlobe } from './MiniGlobe';
import { WeekList } from './WeekList';
import { useApi, ApiErrorState } from '../../../api/useApi';
import { getCourseHome, getCourseIdFromLegacySubject } from '../../../api/studentCourses';

type Props = {
  session: Session;
  subject: SubjectId;
  onOpen: (id: SubjectId) => void;
};

export function StudentHome({ session, subject, onOpen }: Props) {
  const current = getSubject(subject);
  const courseId = getCourseIdFromLegacySubject(subject);
  const home = useApi(() => getCourseHome(courseId), [courseId]);
  const studyTitle = home.data?.scope?.title ?? current.rangeTitle;
  const studyPages = home.data?.scope?.pdfPages ?? current.pdf;
  const studyDeadline = home.data?.scope?.dueDate ?? current.deadline;

  return (
    <div className="home">
      {home.error && <ApiErrorState error={home.error} onRetry={home.retry} />}
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

      <section
        className={`hero-card hero-card--${current.tone}`}
        aria-labelledby="weekly-study-title"
      >
        <span className="hero-card__grid" aria-hidden="true" />
        <div className="hero-card__copy">
          <div className="hero-card__heading">
            <div className="hero-card__context">
              <span className="hero-card__week">{WEEK.label}</span>
              <p className="hero-card__eyebrow">이번 주 학습</p>
            </div>
            <span className="hero-card__subject">
              {current.name} <i aria-hidden="true">·</i> {current.type}
            </span>
          </div>
          <h2 id="weekly-study-title">{studyTitle}</h2>
          <div className="hero-card__footer">
            <div className="hero-card__details" role="group" aria-label="이번 주 학습 정보">
              <div className="hero-card__detail">
                <span>PDF 학습 범위</span>
                  <b>{studyPages}</b>
              </div>
              <div className="hero-card__detail">
                <span>학습 마감</span>
                  <b>{studyDeadline}</b>
              </div>
            </div>
            <button type="button" className="hero-card__cta" onClick={() => onOpen(current.id)}>
              {current.cta}
              <ArrowIcon />
            </button>
          </div>
        </div>

        <div className="hero-card__visual" aria-hidden="true">
          <MiniGlobe />
          <p className="hero-card__caption">SEOUL → LISBOA</p>
        </div>
      </section>

      <div className="home__grid">
        <WeekList subject={subject} onOpen={onOpen} />
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
