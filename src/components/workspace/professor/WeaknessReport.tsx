import { useEffect, useState } from 'react';
import { useProfFilters } from './ProfFilterContext';
import { useProfessorLanguage } from './ProfessorLanguageContext';
import { getInsights, getWeeklyReport } from '../../../api/reports';
import { useApi, ApiErrorState, ApiLoadingState, ApiEmptyState } from '../../../api/useApi';
import { displayDateRange } from './scopeDate';
type ReportRow = { name: string; count: number; rate: number; bad: string; good: string; examples: string[] };
const courseIdForFilter = { grammar: 1, writing: 2, speaking: 3 } as const;
const subjects = { grammar: '포르투갈어 문법', writing: '포르투갈어 읽기와 쓰기', speaking: '포르투갈어 회화' } as const;
const weekDateFallback: Record<number, string> = { 1: '11.03–11.09', 2: '11.10–11.16', 3: '11.17–11.23', 4: '11.24–11.30', 5: '12.01–12.07' };
export function WeaknessReport() {
  const { filters } = useProfFilters(); const { t, language } = useProfessorLanguage();
  const courseId = courseIdForFilter[filters.course]; const sectionId = Number(filters.section); const params = { courseId, sectionId, week: filters.week };
  const insightsApi = useApi(() => getInsights(params), [courseId, sectionId, filters.week]);
  const reportApi = useApi(() => getWeeklyReport(params), [courseId, sectionId, filters.week]);
  const [open, setOpen] = useState(0); const [showAll, setShowAll] = useState(false);
  useEffect(() => { setOpen(0); setShowAll(false); }, [filters.course, filters.section, filters.week]);
  const subjectLabel = t(subjects[filters.course]); const weekLabel = language === 'en' ? `Week ${filters.week}` : `${filters.week}주차`;
  const report = reportApi.data;
  const reportRows: ReportRow[] = filters.section === '02' ? [] : (report?.errors ?? []).map((item) => ({ name: item.tag, count: item.studentCount, rate: item.rate, bad: item.example.original, good: item.example.corrected, examples: item.moreExamples }));
  const visibleRows = showAll ? reportRows : reportRows.slice(0, 2);
  const dates = report ? displayDateRange(report.startDate, report.endDate) : weekDateFallback[filters.week] ?? '';
  const retryAll = () => { insightsApi.retry(); reportApi.retry(); };
  return <div className="prof-page">
    {(insightsApi.error || reportApi.error) && <ApiErrorState error={insightsApi.error ?? reportApi.error!} onRetry={retryAll}/>}
    <header className="prof-page-head"><div><span className="eyebrow">WEEKLY WEAKNESS REPORT</span><h1>{t('취약점 리포트')}</h1><p>{weekLabel} · {dates} · {subjectLabel} · {t(filters.section === '01' ? '01분반' : '02분반')}</p></div><button className="btn-ghost" onClick={() => window.print()}>{t('인쇄 / PDF 내보내기')}</button></header>
    <section className="prof-ai-card report-summary"><div className="ai-avatar"><img src="/owls/football.png" alt=""/><b>AI</b></div><div className="prof-ai-card__body"><span className="eyebrow">{t('AI 주간 분석')}</span>{insightsApi.loading ? <><h2>{t('AI가 선택한 조건을 분석하고 있어요…')}</h2><p>{t('과목·분반·주차별 데이터를 살펴보는 중입니다.')}</p></> : insightsApi.data ? <><h2>{t(insightsApi.data.headline)}</h2><p>{t(insightsApi.data.body)}</p></> : <ApiEmptyState message={t('선택한 조건의 분석 결과가 아직 없어요.')}/>}</div></section>
    <section className="prof-card"><div className="section-title"><div><h2>{t('오류 유형 상세')}</h2><p>{t('오류를 펼쳐 대표 예시를 확인하세요.')}</p></div><button className="btn-solid" onClick={() => setShowAll((current) => !current)} disabled={!reportRows.length}>{t(showAll ? '상위만 보기' : '전체 보기')}</button></div>
      <div className="weakness-list">{reportApi.loading ? <ApiLoadingState label={t('주간 오류 데이터를 불러오는 중…')}/> : reportRows.length ? visibleRows.map((row, index) => <article className="weakness-item" key={`${row.name}-${index}`}>
        <button className="weakness-item__head" onClick={() => setOpen(open === index ? -1 : index)}><span className="rank">{String(index + 1).padStart(2, '0')}</span><b>{t(row.name)}</b><span>{row.count} {t('명')}</span><strong>{row.rate}%</strong><i>{open === index ? '−' : '＋'}</i></button>
        <div className="correction-pair"><span className="strike">{row.bad}</span><span>→</span><b>{row.good}</b><small>{t('다음 수업에 반영')}</small></div>
        {open === index && <div className="weakness-examples"><b>{t('추가 오답 예시')}</b>{row.examples.map((example, i) => <p key={`${example}-${i}`}>“{example}”</p>)}</div>}
      </article>) : !reportApi.error && <ApiEmptyState message={t(filters.section === '02' ? '02분반 취약점 데이터가 아직 없어요.' : '선택한 조건의 취약점 데이터가 아직 없어요.')}/>}</div>
    </section>
  </div>;
}
