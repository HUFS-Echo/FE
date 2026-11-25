import { getDemoState } from '../../../lib/demoStore';
import { useProfFilters } from './ProfFilterContext';

const statusLabel = { ended: '종료', active: '진행 중', scheduled: '예정' } as const;
const subjectName = { reading: '포르투갈어 문법', writing: '포르투갈어 읽기와 쓰기', speaking: '포르투갈어 회화' };

export function ScopeListCard() {
  const { filters } = useProfFilters();
  const scopes = getDemoState().scopes.filter(scope =>
    scope.subject === subjectName[filters.course] && (scope.section ?? '01') === filters.section,
  );
  const sectionSize = filters.section === '01' ? 48 : 32;

  return <section className="prof-card scope-list-card">
    <div className="section-title">
      <div><h2>학습 범위 목록</h2><p>총 {scopes.length}개 · 최신 주차순 · 선택한 주차를 강조 표시</p></div>
      <span className="tag">{filters.section}분반 · {sectionSize}명 · {filters.week}주차</span>
    </div>
    <div className="table-scroll">
      <table className="prof-table scope-table">
        <thead><tr><th>주차·기간</th><th>PDF 쪽</th><th>집중 범위</th><th>상태</th><th>참여</th><th>정확도</th></tr></thead>
        <tbody>
          {[...scopes].sort((a, b) => b.week - a.week).map(scope => {
            const status = scope.status === 'ended' || scope.status === 'active' ? scope.status : 'scheduled';
            return <tr key={scope.id} className={scope.week === filters.week ? 'is-selected' : ''}>
              <td><b>{scope.week}주차</b><small>{scope.dates}</small></td>
              <td>{scope.pages}쪽</td>
              <td>{scope.topic}</td>
              <td><span className={`scope-status scope-status--${status}`}>{statusLabel[status]}</span></td>
              <td>{status === 'scheduled' ? '—' : `${scope.participation ? Math.round(sectionSize * scope.participation / 100) : 0}/${sectionSize}`}</td>
              <td>{scope.accuracy ? `${scope.accuracy}%` : '—'}</td>
            </tr>;
          })}
          {!scopes.length && <tr><td colSpan={6}>선택한 과목·분반의 학습 범위가 아직 없어요.</td></tr>}
        </tbody>
      </table>
    </div>
  </section>;
}
