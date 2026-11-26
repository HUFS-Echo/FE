import { useEffect } from 'react';
import { useProfFilters } from './ProfFilterContext';
import { useProfessorLanguage } from './ProfessorLanguageContext';
import { getScopes } from '../../../api/scopes';
import { useApi, ApiErrorState, ApiLoadingState, ApiEmptyState } from '../../../api/useApi';
const displayDateRange = (start: string, end: string) => { const short = (value: string) => { const date = new Date(`${value}T00:00:00`); return Number.isNaN(date.getTime()) ? value : `${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`; }; return `${short(start)}–${short(end)}`; };
const statusLabel = { DONE: '종료', IN_PROGRESS: '진행 중', SCHEDULED: '예정', DRAFT: '초안', LOCKED: '잠김' } as const;
const courseIdForFilter = { grammar: 1, writing: 2, speaking: 3 } as const;
export function ScopeListCard() {
  const { filters } = useProfFilters(); const { t, language } = useProfessorLanguage();
  const courseId = courseIdForFilter[filters.course]; const sectionId = Number(filters.section);
  const scopesApi = useApi(() => getScopes(courseId, sectionId), [courseId, sectionId]);
  useEffect(() => { const refresh = () => scopesApi.retry(); window.addEventListener('hufs-demo-change', refresh); return () => window.removeEventListener('hufs-demo-change', refresh); }, [scopesApi.retry]);
  const scopes = scopesApi.data?.scopes ?? []; const sectionLabel = t(filters.section === '01' ? '01분반' : '02분반');
  const weekLabel = language === 'en' ? `Week ${filters.week}` : `${filters.week}주차`; const sectionSize = scopesApi.data?.studentCount ?? 0;
  return <section className="prof-card scope-list-card"><div className="section-title"><div><h2>{t('학습 범위 목록')}</h2><p>{language === 'en' ? `Total ${scopes.length} scopes · Newest week first · Selected week highlighted` : `총 ${scopes.length}개 · 최신 주차순 · 선택한 주차를 강조 표시`}</p></div><span className="tag">{sectionLabel} · {language === 'en' ? `${sectionSize} students` : `${sectionSize}명`} · {weekLabel}</span></div>
    {scopesApi.error && <ApiErrorState error={scopesApi.error} onRetry={scopesApi.retry}/>}
    <div className="table-scroll"><table className="prof-table scope-table"><thead><tr><th>{t('주차·기간')}</th><th>{t('PDF 쪽')}</th><th>{t('집중 범위')}</th><th>{t('상태')}</th><th>{t('참여')}</th><th>{t('정확도')}</th></tr></thead><tbody>
      {scopesApi.loading ? <tr><td colSpan={6}><ApiLoadingState label={t('학습 범위를 불러오는 중…')}/></td></tr> : [...scopes].sort((a, b) => b.week - a.week).map(scope => <tr key={scope.scopeId} className={scope.week === filters.week ? 'is-selected' : ''}><td><b>{language === 'en' ? `Week ${scope.week}` : `${scope.week}주차`}</b><small>{displayDateRange(scope.startDate, scope.endDate)}</small></td><td>{language === 'en' ? `${scope.pdfPages} pages` : `${scope.pdfPages}쪽`}</td><td>{t(scope.title)}</td><td><span className={`scope-status scope-status--${scope.status === 'DONE' ? 'ended' : scope.status === 'IN_PROGRESS' ? 'active' : 'scheduled'}`}>{t(statusLabel[scope.status])}</span></td><td>{['SCHEDULED', 'DRAFT', 'LOCKED'].includes(scope.status) ? '—' : `${scope.participants ?? 0}/${sectionSize}`}</td><td>{scope.accuracy == null ? '—' : `${scope.accuracy}%`}</td></tr>)}
      {!scopesApi.loading && !scopesApi.error && !scopes.length && <tr><td colSpan={6}><ApiEmptyState message={t('선택한 과목·분반의 학습 범위가 아직 없어요.')}/></td></tr>}
    </tbody></table></div></section>;
}
