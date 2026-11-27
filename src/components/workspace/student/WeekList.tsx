import type { SubjectId } from '../../../config/learning';
import { ApiEmptyState, ApiErrorState, ApiLoadingState, useApi } from '../../../api/useApi';
import { getCourseIdFromLegacySubject, getCourseWeeks } from '../../../api/studentCourses';

type Props = { subject: SubjectId; onOpen: (subject: SubjectId) => void };

const subjectLabels: Record<SubjectId, string> = {
  grammar: '포르투갈어 문법',
  writing: '포르투갈어 읽기와 쓰기',
  speaking: '포르투갈어 회화',
};

function displayPages(value: string) {
  return value.replace(/\s*(?:쪽|pages?)\s*$/i, '').trim();
}

function displayOpenDate(value: string) {
  return `${value.replace(/\s*에\s*열려요\s*$/, '').trim()}에 열려요`;
}

export function WeekList({ subject, onOpen }: Props) {
  const courseId = getCourseIdFromLegacySubject(subject);
  const weeksApi = useApi(() => getCourseWeeks(courseId), [courseId]);
  const data = weeksApi.data;
  const items = data?.weeks.map((week) => ({
    no: week.week,
    dates: `${week.startDate} – ${week.endDate}`,
    range: week.title,
    pdf: `PDF ${displayPages(week.pdfPages)}쪽`,
    status: week.status,
    participation: week.participation,
    accuracy: week.accuracy,
    openAt: week.opensAt ? displayOpenDate(week.opensAt) : undefined,
  })) ?? [];
  const orderedItems = items.slice().sort((a, b) => Number(b.status === 'IN_PROGRESS') - Number(a.status === 'IN_PROGRESS'));

  return <div className="weeks">
    <header className="page-head"><div><p className="eyebrow">CRONOGRAMA · PORTUGUÊS A1</p><h1>주차 목록</h1><p className="page-head__sub">{data ? `이번 학기 ${data.totalWeeks}주 중 ${data.currentWeek}주차를 지나고 있어요.` : '학습 주차 정보를 불러옵니다.'}</p></div><span className="page-head__pill">{data ? `전체 ${data.totalWeeks}주` : '주차 목록'}</span></header>
    {weeksApi.loading ? <ApiLoadingState label="주차 목록을 불러오는 중…" /> : weeksApi.error ? <ApiErrorState error={weeksApi.error} onRetry={weeksApi.retry} /> : !items.length ? <ApiEmptyState message="아직 등록된 주차가 없어요." /> : <div className="week-grid">{orderedItems.map((week) => {
      const done = week.status === 'DONE';
      const locked = week.status === 'SCHEDULED' || week.status === 'DRAFT' || week.status === 'LOCKED';
      return <article className={`week-card ${locked ? 'is-locked' : ''}`} key={week.no}>
        <div className="week-card__top"><span className="week-card__no">{String(week.no).padStart(2, '0')}</span><span className={`week-card__status ${done ? 'is-done' : ''}`}>{done ? '완료' : '미공개'}</span></div>
        <h3>{week.range}</h3><p>{week.dates} · {week.pdf}</p>
        {done ? <><div className="week-card__stats"><span>참여 {week.participation ?? 0}%</span><span>정확도 {week.accuracy ?? 0}%</span></div><button type="button" className="week-card__btn" onClick={() => onOpen(subject)}>복습하기</button></> : week.status === 'IN_PROGRESS' ? <button type="button" className="week-card__btn" onClick={() => onOpen(subject)}>학습하기</button> : <div className="week-card__locked"><LockIcon /><span>{week.openAt ?? '아직 공개되지 않았어요.'}</span></div>}
      </article>;
    })}</div>}
    {data && <p className="weeks__note">{subjectLabels[subject]} · {items.find((week) => week.status === 'IN_PROGRESS')?.range ?? '이번 주'} 범위는 이번 주 일요일까지 열려 있어요.</p>}
  </div>;
}

function LockIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4.5" y="9" width="11" height="7.5" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="M7 9V6.8a3 3 0 0 1 6 0V9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>;
}
