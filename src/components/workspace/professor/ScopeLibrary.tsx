import { useEffect } from 'react';
import { useProfFilters } from './ProfFilterContext';
import { useProfessorLanguage } from './ProfessorLanguageContext';
import { getScopes } from '../../../api/scopes';
import { useApi, ApiLoadingState, ApiEmptyState } from '../../../api/useApi';
import { displayDateRange } from './scopeDate';
import type { ScopeList } from '../../../api/types';
import { getScopeStatusLabel } from '../../../lib/statusLabels';
const courseIdForFilter = { grammar: 1, writing: 2, speaking: 3 } as const;
type Props = { refreshToken: number; onErrorChange: (error: Error | null) => void; onDataChange: (data: ScopeList | null) => void; onNavigate: (path: string) => void };
export function ScopeListCard({ refreshToken, onErrorChange, onDataChange, onNavigate }: Props) {
  const { filters } = useProfFilters(); const { t, language } = useProfessorLanguage();
  const courseId = courseIdForFilter[filters.course]; const sectionId = Number(filters.section);
  const scopesApi = useApi(() => getScopes(courseId, sectionId), [courseId, sectionId, refreshToken]);
  useEffect(() => { const refresh = () => scopesApi.retry(); window.addEventListener('hufs-demo-change', refresh); return () => window.removeEventListener('hufs-demo-change', refresh); }, [scopesApi.retry]);
  useEffect(() => { onErrorChange(scopesApi.error); }, [onErrorChange, scopesApi.error]);
  useEffect(() => { onDataChange(scopesApi.data ?? null); }, [onDataChange, scopesApi.data]);
  const scopes = scopesApi.data?.scopes ?? []; const sectionLabel = t(filters.section === '01' ? '01분반' : '02분반');
  const weekLabel = language === 'en' ? `Week ${filters.week}` : `${filters.week}주차`; const sectionSize = scopesApi.data?.studentCount ?? 0;
  const countLabel = scopesApi.error ? '' : scopesApi.loading ? (language === 'en' ? 'Scope information loading…' : '학습 범위 정보를 불러오는 중…') : language === 'en' ? `Total ${scopes.length} scopes · Newest week first · Selected week highlighted` : `총 ${scopes.length}개 · 최신 주차순 · 선택한 주차를 강조 표시`;
  const sectionMeta = scopesApi.error ? (language === 'en' ? '— students' : '—명') : scopesApi.loading ? (language === 'en' ? 'Loading data…' : '정보 불러오는 중…') : language === 'en' ? `${sectionSize} students` : `${sectionSize}명`;
  return <section className="prof-card scope-list-card"><div className="section-title"><div><h2>{t('학습 범위 목록')}</h2><p>{countLabel}</p></div><span className="tag">{sectionLabel} · {sectionMeta} · {weekLabel}</span></div>
    <div className="table-scroll"><table className="prof-table scope-table"><thead><tr><th>{t('주차·기간')}</th><th>{t('PDF 쪽')}</th><th>{t('집중 범위')}</th><th>{t('상태')}</th><th>{t('참여')}</th><th>{t('정확도')}</th></tr></thead><tbody>
      {scopesApi.loading ? <tr><td colSpan={6}><ApiLoadingState label={t('학습 범위 정보를 불러오는 중…')}/></td></tr> : !scopesApi.error && [...scopes].sort((a, b) => b.week - a.week).map(scope => <tr key={scope.scopeId} className={`${scope.week === filters.week ? 'is-selected' : ''} ${scope.status === 'DONE' ? '' : 'scope-table__editable'}`} onClick={() => { if (scope.status !== 'DONE') onNavigate(`/prof/scope/new/edit/${scope.scopeId}`); }}><td><b>{language === 'en' ? `Week ${scope.week}` : `${scope.week}주차`}</b><small>{displayDateRange(scope.startDate, scope.endDate)}</small></td><td>{language === 'en' ? `${scope.pdfPages} pages` : `${scope.pdfPages}쪽`}</td><td>{t(scope.title)}</td><td><span className={`scope-status scope-status--${scope.status === 'DONE' ? 'ended' : scope.status === 'IN_PROGRESS' ? 'active' : 'scheduled'}`}>{getScopeStatusLabel(scope.status, language)}</span></td><td>{scope.participants == null ? '—' : `${scope.participants}/${sectionSize}`}</td><td>{scope.accuracy == null ? '—' : `${scope.accuracy}%`}{scope.status !== 'DONE' && <small className="scope-table__edit-hint">{language === 'en' ? 'Edit →' : '편집 →'}</small>}</td></tr>)}
      {!scopesApi.loading && !scopesApi.error && !scopes.length && <tr><td colSpan={6}><ApiEmptyState message={t('선택한 과목·분반의 학습 범위가 아직 없어요.')}/></td></tr>}
    </tbody></table></div></section>;
}
