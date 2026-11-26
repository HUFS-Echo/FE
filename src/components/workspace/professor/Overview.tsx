import { useProfFilters, type ProfFilters } from './ProfFilterContext';
import { useProfessorLanguage } from './ProfessorLanguageContext';
import { getDashboard } from '../../../api/dashboard';
import { getFeedbackReports } from '../../../api/feedbackReports';
import { useApi, ApiErrorState, ApiLoadingState, ApiEmptyState } from '../../../api/useApi';
type Props = { onNavigate: (path: string) => void; onToast: (message: string) => void };
const courseIdForFilter = { grammar: 1, writing: 2, speaking: 3 } as const;
const subjectNames: Record<ProfFilters['course'], string> = { writing: '포르투갈어 읽기와 쓰기', grammar: '포르투갈어 문법', speaking: '포르투갈어 회화' };
const weekDates: Record<number, string> = { 1: '11.03–11.09', 2: '11.10–11.16', 3: '11.17–11.23', 4: '11.24–11.30', 5: '12.01–12.07' };
const lastActivity = (value: string, language: string) => { const date = new Date(value); if (Number.isNaN(date.getTime())) return value; const time = date.toLocaleTimeString(language === 'en' ? 'en-US' : 'ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }); return language === 'en' ? `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${time}` : `${date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })} ${time}`; };
export function Overview({ onNavigate }: Props) {
  const { filters } = useProfFilters(); const { t, language } = useProfessorLanguage();
  const courseId = courseIdForFilter[filters.course]; const sectionId = Number(filters.section);
  const dashboardApi = useApi(() => getDashboard({ courseId, sectionId, week: filters.week }), [courseId, sectionId, filters.week]);
  const feedbackApi = useApi(() => getFeedbackReports({ courseId, sectionId, week: filters.week, status: 'OPEN' }), [courseId, sectionId, filters.week]);
  const dashboard = dashboardApi.data; const sectionSize = dashboard?.studentCount ?? 0;
  const subject = t(dashboard?.courseTitle ?? subjectNames[filters.course]); const sectionLabel = t(filters.section === '01' ? '01분반' : '02분반');
  const weekLabel = language === 'en' ? `Week ${filters.week}` : `${filters.week}주차`;
  const feedbackCount = filters.section === '01' ? feedbackApi.data?.reports.filter((report) => report.status === 'OPEN' && report.week === filters.week).length ?? 0 : 0;
  const rows = filters.section === '02' ? [] : dashboard?.students ?? [];
  const dateText = dashboard?.startDate && dashboard.endDate ? `${dashboard.startDate.slice(5).replace('-', '.')}–${dashboard.endDate.slice(5).replace('-', '.')}` : weekDates[filters.week] ?? '';
  const retryAll = () => { dashboardApi.retry(); feedbackApi.retry(); };
  return <div className="prof-page">
    {(dashboardApi.error || feedbackApi.error) && <ApiErrorState error={dashboardApi.error ?? feedbackApi.error!} onRetry={retryAll}/>}
    <header className="prof-page-head"><div><span className="eyebrow">PORTUGUÊS A1 · {sectionLabel}</span><h1>{t('반 학습 현황')} · {subject}</h1><p>{weekLabel} · {dateText} · {sectionLabel} · {dashboard ? (language === 'en' ? `${sectionSize} students` : `수강생 ${sectionSize}명`) : ''}</p></div></header>
    {dashboardApi.loading ? <ApiLoadingState label={t('학습 현황을 불러오는 중…')}/> : dashboard && <section className="prof-kpis">
      <article><span>{t('참여 학생')}</span><b>{dashboard.kpi.activeStudents} <small>/ {sectionSize}</small></b><em className="good">{t('선택한 과목·분반 기준')}</em></article>
      <article><span>{t('평균 진행률')}</span><b>{dashboard.kpi.avgProgress}<small>%</small></b><em>{t('선택 주차 평균')}</em></article>
      <article><span>{t('평균 오답률')}</span><b>{dashboard.kpi.avgErrorRate}<small>%</small></b><em>{t('선택한 범위 정확도 기준')}</em></article>
      <button type="button" onClick={() => onNavigate('/prof/feedback')}><span>{t('AI 오류 신고')}</span><b>{feedbackCount}<small>{language === 'en' ? ' reports' : '건'}</small></b><em className="warn">{t('확인 필요')}</em></button>
    </section>}
    {feedbackApi.loading && !dashboardApi.loading && <ApiLoadingState label={t('신고 건수를 불러오는 중…')}/>}
    <section className="prof-card roster-card"><div className="section-title"><div><h2>{t('학생별 연습 현황')}</h2><p>{subject} · {sectionLabel} · {t('이름·학번 일부 가림')}</p></div></div><div className="table-scroll"><table className="prof-table">
      <thead><tr><th>{t('학생')}</th><th>{t('진행률')}</th><th>{t('연습')}</th><th>{t('오답률')}</th><th>{t('주요 오류')}</th><th>{t('최근 활동')}</th></tr></thead>
      <tbody>{dashboardApi.loading ? <tr><td colSpan={6}><ApiLoadingState label={t('학생 기록을 불러오는 중…')}/></td></tr> : rows.length ? rows.map((row) => <tr key={row.studentId}><td><b>{row.maskedName}</b><small>{row.maskedStudentNo}</small></td><td><span className="mini-progress"><i style={{ width: `${row.progress}%` }}/></span>{row.progress}%</td><td>{row.practiceCount} {t('회')}</td><td><strong className={row.errorRate >= 30 ? 'text-danger' : ''}>{row.errorRate}%</strong></td><td>{t(row.mainError)}</td><td>{lastActivity(row.lastActiveAt, language)}</td></tr>) : <tr><td colSpan={6}><ApiEmptyState message={t(filters.section === '02' ? '선택한 분반의 학생 기록이 아직 없어요.' : '표시할 학생 기록이 아직 없어요.')}/></td></tr>}</tbody>
    </table></div><p className="privacy-note">{t('학생 데이터는 수업 지원 목적으로만 사용되며, 시범 사용에 동의한 학생만 표시돼요.')}</p></section>
  </div>;
}
