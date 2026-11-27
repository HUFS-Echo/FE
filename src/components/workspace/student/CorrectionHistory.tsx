import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError } from '../../../api/client';
import { useApi, ApiErrorState, ApiLoadingState } from '../../../api/useApi';
import { getCorrections, reportCorrection } from '../../../api/corrections';
import { getCourseIdFromLegacySubject, getCourseWeeks } from '../../../api/studentCourses';
import type { Correction, FeedbackReportType } from '../../../api/types';
import type { SubjectId } from '../../../config/learning';

type Props = { onCustomPractice: () => void; subject: SubjectId; onToast: (message: string) => void };
const reportTypes: Array<{ type: FeedbackReportType; label: string }> = [
  { type: 'OVER_CORRECTION', label: '맞게 썼는데 틀렸다고 나왔어요' },
  { type: 'TERM_CONFUSION', label: '문법 용어 설명이 헷갈려요' },
  { type: 'WRONG_CORRECTION', label: '교정한 문장이 틀린 것 같아요' },
  { type: 'OTHER', label: '기타' },
];

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

export function CorrectionHistory({ onCustomPractice, subject, onToast }: Props) {
  const [filter, setFilter] = useState(0);
  const [filterEdges, setFilterEdges] = useState({ left: false, right: false });
  const [reporting, setReporting] = useState<Correction | null>(null);
  const [reportType, setReportType] = useState<FeedbackReportType | null>(null);
  const [comment, setComment] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const tabRefs = useRef(new Map<number, HTMLButtonElement>());
  const filtersRef = useRef<HTMLDivElement>(null);
  const courseId = getCourseIdFromLegacySubject(subject);
  const weeksApi = useApi(() => getCourseWeeks(courseId), [courseId]);
  const week = filter === 0 ? undefined : filter;
  const corrections = useApi(() => getCorrections({ week }), [week]);
  const items = corrections.data?.items ?? [];
  const weeks = weeksApi.data?.weeks ?? [];
  const selectedLabel = filter === 0 ? '전체' : `${filter}주차`;

  useEffect(() => {
    const scroller = filtersRef.current;
    const selectedTab = tabRefs.current.get(filter);
    if (!scroller || !selectedTab) return;
    const scrollerBounds = scroller.getBoundingClientRect();
    const tabBounds = selectedTab.getBoundingClientRect();
    const horizontalDelta = tabBounds.left < scrollerBounds.left
      ? tabBounds.left - scrollerBounds.left
      : tabBounds.right > scrollerBounds.right
        ? tabBounds.right - scrollerBounds.right
        : 0;
    if (horizontalDelta) scroller.scrollTo({ left: scroller.scrollLeft + horizontalDelta, behavior: 'smooth' });
  }, [filter]);

  useEffect(() => {
    const scroller = filtersRef.current;
    if (!scroller) return;
    const updateEdges = () => {
      const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
      const left = scroller.scrollLeft > 1;
      const right = scroller.scrollLeft < maxScrollLeft - 1;
      setFilterEdges((current) => current.left === left && current.right === right ? current : { left, right });
    };
    updateEdges();
    scroller.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateEdges);
    resizeObserver?.observe(scroller);
    return () => {
      scroller.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
      resizeObserver?.disconnect();
    };
  }, [weeks.length]);

  useEffect(() => {
    if (!reporting || submittingReport) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setReporting(null);
        setReportType(null);
        setComment('');
        setReportError('');
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [reporting, submittingReport]);

  const openReport = (item: Correction) => {
    setReporting(item);
    setReportType(null);
    setComment('');
    setReportError('');
  };
  const closeReport = () => {
    if (submittingReport) return;
    setReporting(null);
    setReportType(null);
    setComment('');
    setReportError('');
  };
  const submitReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reporting || !reportType || (reportType === 'OTHER' && !comment.trim()) || submittingReport) return;
    setSubmittingReport(true);
    setReportError('');
    try {
      await reportCorrection(reporting.correctionId, { type: reportType, comment: comment.trim() });
      corrections.retry();
      setReporting(null);
      setReportType(null);
      setComment('');
      onToast('신고를 보냈어요. 교수님이 확인할 거예요.');
    } catch (error) {
      if (error instanceof ApiError && error.errorCode === 'ALREADY_REPORTED') {
        corrections.retry();
        setReporting(null);
        setReportType(null);
        setComment('');
        onToast('이미 신고한 교정이에요.');
      } else {
        setReportError('보내지 못했어요. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setSubmittingReport(false);
    }
  };

  return <div className="history">
    <header className="page-head"><div><p className="eyebrow">REVISÃO · {selectedLabel} 기록</p><h1>교정 기록</h1><p className="page-head__sub">다시 틀리지 않도록, 고친 문장을 모아봤어요.</p></div><button type="button" className="btn-solid" onClick={onCustomPractice}>맞춤 연습 시작<ArrowIcon /></button></header>
    <div className={`history__filter-wrap${filterEdges.left ? ' has-overflow-left' : ''}${filterEdges.right ? ' has-overflow-right' : ''}`}><div className="history__filters" ref={filtersRef} role="group" aria-label="주차 필터">
      <button ref={(node) => { if (node) tabRefs.current.set(0, node); }} type="button" className={filter === 0 ? 'is-active' : ''} aria-pressed={filter === 0} onClick={() => setFilter(0)}>전체</button>
      {weeks.map((item) => <button ref={(node) => { if (node) tabRefs.current.set(item.week, node); }} key={item.week} type="button" className={`${filter === item.week ? 'is-active' : ''} ${item.status === 'LOCKED' ? 'is-locked' : ''}`} aria-pressed={filter === item.week} disabled={item.status === 'LOCKED'} onClick={() => setFilter(item.week)}>{item.week}주차</button>)}
    </div></div>
    <div className="history__grid"><div className="history__list">
      {weeksApi.loading || corrections.loading ? <ApiLoadingState label="교정 기록을 불러오는 중…" /> : weeksApi.error ? <ApiErrorState error={weeksApi.error} onRetry={weeksApi.retry} /> : corrections.error ? <ApiErrorState error={corrections.error} onRetry={() => { corrections.retry(); window.dispatchEvent(new Event('hufs-demo-change')); }} /> : items.length === 0 ? <p className="history__empty">{filter === 0 ? '교정 기록이 아직 없어요.' : `${selectedLabel} 교정 기록은 아직 없어요.`}</p> : items.map((item) => <article className="history-item" key={item.correctionId}>
        <div className="history-item__meta"><span>{formatCorrectionDate(item.createdAt)}</span><span>{item.week}주차</span></div>
        <p className="history-item__line"><span className="strike">{item.original}</span><ArrowIcon /><b>{item.corrected}</b></p>
        <div className="history-item__note-row"><p className="history-item__note">{item.explanation}</p>{item.reported ? <span className="history-item__report-state">신고함 · 교수님 확인 중</span> : <button type="button" className="history-item__report-button" onClick={() => openReport(item)}>피드백이 이상해요</button>}</div>
      </article>)}
    </div></div>
    {reporting && <div className="modal-backdrop" onClick={closeReport}>
      <form className="simple-modal history-report-modal" role="dialog" aria-modal="true" aria-labelledby="history-report-title" onSubmit={(event) => void submitReport(event)} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" aria-label="닫기" disabled={submittingReport} onClick={closeReport}>×</button>
        <h2 id="history-report-title">피드백이 이상한가요?</h2>
        <p>담당 교수님께 전달돼요. 교수님이 확인하고 교정을 바로잡아요.</p>
        <div className="history-report__summary"><p className="history-item__line"><span className="strike">{reporting.original}</span><ArrowIcon /><b>{reporting.corrected}</b></p></div>
        <fieldset className="history-report__fieldset" disabled={submittingReport}>
          <legend>어떤 점이 이상한가요?</legend>
          <div className="history-report__options">{reportTypes.map((option) => <label className="history-report__option" key={option.type}>
            <input type="radio" name="feedback-report-type" value={option.type} checked={reportType === option.type} onChange={() => { setReportType(option.type); setReportError(''); }} />
            <span>{option.label}</span>
          </label>)}</div>
        </fieldset>
        <label className="history-report__comment">의견 (선택){reportType === 'OTHER' ? ' · 필수' : ''}
          <textarea value={comment} maxLength={200} rows={4} placeholder="어떤 점이 이상했는지 적어 주세요." disabled={submittingReport} onChange={(event) => { setComment(event.target.value); setReportError(''); }} />
        </label>
        <div className="history-report__counter" aria-live="polite">{comment.length}/200</div>
        {reportError && <p className="history-report__error" role="alert">{reportError}</p>}
        <div className="prof-actions"><button type="button" className="btn-ghost" disabled={submittingReport} onClick={closeReport}>취소</button><button type="submit" className="btn-solid" disabled={!reportType || (reportType === 'OTHER' && !comment.trim()) || submittingReport}>{submittingReport ? '보내는 중…' : '신고 보내기'}</button></div>
      </form>
    </div>}
  </div>;
}

function ArrowIcon() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
