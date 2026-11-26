import { useEffect, useMemo, useState } from 'react';
import type { Session } from '../../../lib/session';
import { getProfessorCourses } from '../../../api/profCourses';
import { getFeedbackReports } from '../../../api/feedbackReports';
import { useApi, ApiErrorState } from '../../../api/useApi';
import { useProfFilters } from './ProfFilterContext';
import { useProfessorLanguage } from './ProfessorLanguageContext';
import { Overview } from './Overview';
import { ScopeBuilder } from './ScopeBuilder';
import { WeaknessReport } from './WeaknessReport';
import { FeedbackInbox } from './FeedbackInbox';
import { ProfessorProfile } from '../profile/MyPages';
type Props = { path: string; session: Session; onNavigate: (path: string) => void; onSessionUpdate: (session: Session) => void; onToast: (message: string) => void; onLogout: () => void; onReset: () => void; onReplay: () => void; externalError?: Error | null; onRetryExternal?: () => void };
const nav = [['/prof', '반 학습 현황', '◫'], ['/prof/scope/new', '학습 범위 설정', '＋'], ['/prof/report', '취약점 리포트', '⌁'], ['/prof/feedback', 'AI 오류 신고', 'aiError'], ['/prof/me', '마이페이지', 'profile']] as const;
const courseIdForFilter = { grammar: 1, writing: 2, speaking: 3 } as const;
export function ProfessorShell({ path, session, onNavigate, onSessionUpdate, onToast, onLogout, onReset, onReplay, externalError, onRetryExternal }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const { filters } = useProfFilters();
  const { t, language } = useProfessorLanguage();
  const courseId = courseIdForFilter[filters.course];
  const sectionId = Number(filters.section);
  const coursesApi = useApi(() => getProfessorCourses(), []);
  const feedbackApi = useApi(() => getFeedbackReports({ courseId, sectionId, week: filters.week }), [courseId, sectionId, filters.week]);
  useEffect(() => {
    const refreshBadge = () => feedbackApi.retry();
    window.addEventListener('hufs-demo-change', refreshBadge);
    return () => window.removeEventListener('hufs-demo-change', refreshBadge);
  }, [feedbackApi.retry]);
  const openCount = useMemo(() => filters.section === '01' ? (feedbackApi.data?.reports.filter((item) => item.week === filters.week && item.status === 'OPEN').length ?? 0) : 0, [feedbackApi.data, filters.section, filters.week]);
  const isScopeBuilderPath = path === '/prof/scope/new' || path.startsWith('/prof/scope/new/edit/');
  const route = isScopeBuilderPath ? '/prof/scope/new' : path;
  const shellError = externalError ?? coursesApi.error ?? feedbackApi.error;
  const retryShellData = () => { onRetryExternal?.(); coursesApi.retry(); feedbackApi.retry(); };
  const current = route === '/prof' ? '/prof' : route;
  const course = coursesApi.data?.courses.find((item) => item.courseId === courseId)?.title ?? { grammar: '포르투갈어 문법', writing: '포르투갈어 읽기와 쓰기', speaking: '포르투갈어 회화' }[filters.course];
  const sectionLabel = t(filters.section === '01' ? '01분반' : '02분반');
  const weekLabel = language === 'en' ? `Week ${filters.week}` : `${filters.week}주차`;
  return <div className={`prof-shell ${collapsed ? 'is-collapsed' : ''}`}>
    <aside className="prof-sidebar"><div className="prof-sidebar__top"><span className="prof-sidebar__eyebrow">TEACHING SPACE</span><button type="button" aria-label={t('사이드바 접기')} onClick={() => setCollapsed(value => !value)}>‹</button></div>
      <nav aria-label={t('교수 메뉴')}>
        {nav.map(([to, label, icon]) => <button key={to} className={current === to ? 'is-active' : ''} aria-current={current === to ? 'page' : undefined} onClick={() => onNavigate(to)}>
          <i aria-hidden="true">{icon === 'profile' ? <svg viewBox="0 0 20 20" width="18" height="18"><circle cx="10" cy="6.4" r="3" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M4.2 17c.5-3.1 2.4-4.8 5.8-4.8s5.3 1.7 5.8 4.8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> : icon === 'aiError' ? <svg viewBox="0 0 20 20" width="18" height="18"><path d="M4.1 3.8h11.8a1.3 1.3 0 0 1 1.3 1.3v6.8a1.3 1.3 0 0 1-1.3 1.3H9l-3.7 3v-3h-1a1.3 1.3 0 0 1-1.3-1.3V5.1a1.3 1.3 0 0 1 1.1-1.3Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M10 6.2v3.3m0 2v.1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> : icon}</i><span>{t(label)}</span>
          {to === '/prof/feedback' && openCount > 0 && <b className="nav-badge">{openCount}</b>}
        </button>)}
      </nav>
    </aside>
    <main className="prof-main" key={path}>
      {!isScopeBuilderPath && coursesApi.error && <ApiErrorState error={coursesApi.error} onRetry={coursesApi.retry}/>}
      {!isScopeBuilderPath && feedbackApi.error && <ApiErrorState error={feedbackApi.error} onRetry={feedbackApi.retry}/>}
      <div className="prof-filter-context">{t('현재 보기 기준')} <b>{t(course)}</b> · <b>{sectionLabel}</b> · <b>{weekLabel}</b></div>
      {route === '/prof' && <Overview onNavigate={onNavigate} onToast={onToast}/>}
      {isScopeBuilderPath && <ScopeBuilder onNavigate={onNavigate} onToast={onToast} externalError={shellError} onRetryExternal={retryShellData} editScopeId={path.match(/^\/prof\/scope\/new\/edit\/(\d+)$/) ? Number(path.match(/^\/prof\/scope\/new\/edit\/(\d+)$/)?.[1]) : undefined}/>}
      {route === '/prof/report' && <WeaknessReport/>}
      {route === '/prof/feedback' && <FeedbackInbox onToast={onToast}/>}
      {route === '/prof/me' && <ProfessorProfile session={session} onNavigate={onNavigate} onSessionUpdate={onSessionUpdate} onToast={onToast} onLogout={onLogout} onReset={onReset} onReplay={onReplay}/>}
      {!['/prof', '/prof/scope/new', '/prof/report', '/prof/feedback', '/prof/me'].includes(route) && <Overview onNavigate={onNavigate} onToast={onToast}/>}
    </main>
  </div>;
}
