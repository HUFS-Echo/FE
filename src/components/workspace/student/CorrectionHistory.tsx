import { useEffect, useRef, useState } from 'react';
import { useApi, ApiErrorState, ApiLoadingState } from '../../../api/useApi';
import { getCorrections } from '../../../api/corrections';
import { getCourseIdFromLegacySubject, getCourseWeeks } from '../../../api/studentCourses';
import type { SubjectId } from '../../../config/learning';

type Props = { onCustomPractice: () => void; subject: SubjectId };

function formatCorrectionDate(value: string): string {
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return '날짜 미정';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return '오늘';
  if (date.toDateString() === yesterday.toDateString()) return '어제';
  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export function CorrectionHistory({ onCustomPractice, subject }: Props) {
  const [filter, setFilter] = useState(0);
  const tabRefs = useRef(new Map<number, HTMLButtonElement>());
  useEffect(() => { tabRefs.current.get(filter)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); }, [filter]);
  const courseId = getCourseIdFromLegacySubject(subject);
  const weeksApi = useApi(() => getCourseWeeks(courseId), [courseId]);
  const week = filter === 0 ? undefined : filter;
  const corrections = useApi(() => getCorrections({ week }), [week]);
  const items = corrections.data?.items ?? [];
  const weeks = weeksApi.data?.weeks ?? [];
  const selectedLabel = filter === 0 ? '전체' : `${filter}주차`;

  return <div className="history">
    <header className="page-head"><div><p className="eyebrow">REVISÃO · {selectedLabel} 기록</p><h1>교정 기록</h1><p className="page-head__sub">다시 틀리지 않도록, 고친 문장을 모아봤어요.</p></div><button type="button" className="btn-solid" onClick={onCustomPractice}>맞춤 연습 시작<ArrowIcon /></button></header>
    <div className="history__filter-wrap"><div className="history__filters" role="group" aria-label="주차 필터">
      <button ref={(node) => { if (node) tabRefs.current.set(0, node); }} type="button" className={filter === 0 ? 'is-active' : ''} aria-pressed={filter === 0} onClick={() => setFilter(0)}>전체</button>
      {weeks.map((item) => <button ref={(node) => { if (node) tabRefs.current.set(item.week, node); }} key={item.week} type="button" className={`${filter === item.week ? 'is-active' : ''} ${item.status === 'LOCKED' ? 'is-locked' : ''}`} aria-pressed={filter === item.week} disabled={item.status === 'LOCKED'} onClick={() => setFilter(item.week)}>{item.week}주차</button>)}
    </div></div>
    <div className="history__grid"><div className="history__list">
      {weeksApi.loading || corrections.loading ? <ApiLoadingState label="교정 기록을 불러오는 중…" /> : weeksApi.error ? <ApiErrorState error={weeksApi.error} onRetry={weeksApi.retry} /> : corrections.error ? <ApiErrorState error={corrections.error} onRetry={() => { corrections.retry(); window.dispatchEvent(new Event('hufs-demo-change')); }} /> : items.length === 0 ? <p className="history__empty">{filter === 0 ? '교정 기록이 아직 없어요.' : `${selectedLabel} 교정 기록은 아직 없어요.`}</p> : items.map((item) => <article className="history-item" key={item.correctionId}><div className="history-item__meta"><span>{formatCorrectionDate(item.createdAt)}</span><span>{item.week}주차</span></div><p className="history-item__line"><span className="strike">{item.original}</span><ArrowIcon /><b>{item.corrected}</b></p><p className="history-item__note">{item.explanation}</p></article>)}
    </div></div>
  </div>;
}

function ArrowIcon() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
