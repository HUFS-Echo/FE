import { useState } from 'react';
import { useApi, ApiEmptyState, ApiErrorState, ApiLoadingState } from '../../../api/useApi';
import { getCorrections } from '../../../api/corrections';

type Props = { onCustomPractice: () => void };
function formatCorrectionDate(value: string, index: number): string {
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return '오늘';
    if (date.toDateString() === yesterday.toDateString()) return '어제';
    return `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')}`;
  }
  return index < 2 ? '오늘' : '어제';
}
export function CorrectionHistory({ onCustomPractice }: Props) {
  const [filter, setFilter] = useState('전체');
  const week = filter === '전체' ? undefined : Number(filter.replace(/\D/g, ''));
  const corrections = useApi(() => getCorrections({ week }), [week]);
  const items = corrections.data?.items ?? [];
  const filters = ['전체', ...(corrections.data?.weeks ?? []).slice().sort((a, b) => a - b).map((value) => `${value}주차`)];
  return <div className="history">
    <header className="page-head"><div><p className="eyebrow">REVISÃO · {filter === '전체' ? '전체 기록' : filter}</p><h1>교정 기록</h1><p className="page-head__sub">다시 틀리지 않도록, 고친 문장을 모아봤어요.</p></div><button type="button" className="btn-solid" onClick={onCustomPractice}>맞춤 연습 시작<ArrowIcon /></button></header>
    <div className="history__filters" role="group" aria-label="주차 필터">{filters.map((tag) => <button key={tag} type="button" className={filter === tag ? 'is-active' : ''} aria-pressed={filter === tag} onClick={() => setFilter(tag)}>{tag}</button>)}</div>
    <div className="history__grid"><div className="history__list">
      {corrections.loading ? <ApiLoadingState label="교정 기록을 불러오는 중…" /> : corrections.error ? <ApiErrorState error={corrections.error} onRetry={corrections.retry} /> : items.length === 0 ? <ApiEmptyState message={filter === '전체' ? '교정 기록이 아직 없어요.' : `${filter} 교정 기록은 아직 없어요.`} /> : items.map((item, index) => <article className="history-item" key={item.correctionId}><div className="history-item__meta"><span>{formatCorrectionDate(item.createdAt, index)}</span><span>{item.week}주차</span></div><p className="history-item__line"><span className="strike">{item.original}</span><ArrowIcon /><b>{item.corrected}</b></p><p className="history-item__note">{item.explanation}</p></article>)}
    </div></div>
  </div>;
}
function ArrowIcon() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
