import type { Session } from '../../../lib/session';
import type { SubjectId } from '../../../config/learning';
import { MiniGlobe } from './MiniGlobe';
import { WeekList } from './WeekList';
import { ApiEmptyState, ApiErrorState, ApiLoadingState, useApi } from '../../../api/useApi';
import { getCourseHome, getCourseIdFromLegacySubject } from '../../../api/studentCourses';

type Props = { session: Session; subject: SubjectId; onOpen: (id: SubjectId | 'reading', setId?: number) => void };
const courseTone: Record<SubjectId, string> = { grammar: 'blue', writing: 'amber', speaking: 'mint' };

export function StudentHome({ session, subject, onOpen }: Props) {
  const courseId = getCourseIdFromLegacySubject(subject);
  const home = useApi(() => getCourseHome(courseId), [courseId]);
  if (home.loading) return <ApiLoadingState label="이번 주 학습을 불러오는 중…" />;
  if (home.error) return <ApiErrorState error={home.error} onRetry={home.retry} />;
  if (!home.data) return <ApiEmptyState message="이번 주 학습 정보를 찾을 수 없어요." />;
  const current = home.data;
  if (!current.scope) return <ApiEmptyState message="아직 게시된 학습 범위가 없어요." />;
  const weekLabel = `${current.week}주차`;
  return <div className="home">
    <header className="home__top"><div><p className="home__eyebrow">{weekLabel} · PORTUGUÊS A1</p><h1><span>Olá,</span> {session.name}님!</h1><p className="home__sub"><b>{current.greeting.word}</b>는 포르투갈어로 {current.greeting.meaning}예요.</p></div></header>
    <section className={`hero-card hero-card--${courseTone[subject]}`} aria-labelledby="weekly-study-title">
      <span className="hero-card__grid" aria-hidden="true" />
      <div className="hero-card__copy"><div className="hero-card__heading"><div className="hero-card__context"><span className="hero-card__week">{weekLabel}</span><p className="hero-card__eyebrow">이번 주 학습</p></div><span className="hero-card__subject">{current.course.title} <i aria-hidden="true">·</i> {current.course.typeLabel}</span></div>
        <h2 id="weekly-study-title">{current.scope.title}</h2>
        <div className="hero-card__footer"><div className="hero-card__details" role="group" aria-label="이번 주 학습 정보"><div className="hero-card__detail"><span>PDF 학습 범위</span><b>{current.scope.pdfPages}</b></div><div className="hero-card__detail"><span>학습 마감</span><b>{current.scope.dueDate}</b></div></div><button type="button" className="hero-card__cta" onClick={() => onOpen(subject, current.practice?.targetId)}>{'학습하기'}<ArrowIcon /></button></div>
      </div><div className="hero-card__visual" aria-hidden="true"><MiniGlobe /><p className="hero-card__caption">SEOUL → LISBOA</p></div>
    </section>
    <div className="home__grid"><WeekList subject={subject} onOpen={onOpen} /></div>
  </div>;
}
function ArrowIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
