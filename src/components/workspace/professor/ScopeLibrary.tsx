import { useState } from 'react';
import { getDemoState, updateDemoState } from '../../../lib/demoStore';
import { useProfFilters } from './ProfFilterContext';

type Props = { onNavigate: (path: string) => void; onToast: (message: string) => void };
const statusLabel = { ended: '종료', active: '진행 중', scheduled: '예약됨', draft: '임시 저장', private: '비공개' } as const;
const subjectName = { reading: '포르투갈어 문법', writing: '포르투갈어 읽기와 쓰기', speaking: '포르투갈어 회화' };
const courseKey: Record<string, 'reading' | 'writing' | 'speaking'> = { '포르투갈어 문법': 'reading', '포르투갈어 읽기와 쓰기': 'writing', '포르투갈어 회화': 'speaking' };

export function ScopeLibrary({ onNavigate, onToast }: Props) {
  const [, refresh] = useState(0);
  const { filters, setFilters } = useProfFilters();
  const scopes = getDemoState().scopes.filter(scope => scope.subject === subjectName[filters.course] && (scope.section ?? '01') === filters.section);
  const sectionSize = filters.section === '01' ? 48 : 32;
  const published = scopes.filter(scope => ['active', 'ended'].includes(scope.status));
  const averageParticipation = published.length
    ? Math.round(published.reduce((sum, scope) => sum + scope.participation, 0) / published.length)
    : 0;
  const statusCount = (status: 'scheduled' | 'draft') => scopes.filter(scope => scope.status === status).length;

  function change(id: string, mode: 'private' | 'clone') {
    updateDemoState(state => ({
      ...state,
      scopes: mode === 'private'
        ? state.scopes.map(scope => scope.id !== id ? scope : scope.status === 'private'
          ? { ...scope, status: scope.previousStatus ?? 'active', previousStatus: undefined }
          : { ...scope, previousStatus: scope.status, status: 'private' })
        : (() => {
          const source = state.scopes.find(scope => scope.id === id);
          return source ? [...state.scopes, {
            ...source, id: `copy-${Date.now()}`, week: Math.min(5, source.week + 1),
            status: 'draft' as const, participation: 0, accuracy: 0,
          }] : state.scopes;
        })(),
    }));
    refresh(value => value + 1);
    onToast(mode === 'private' ? '공개 상태를 변경했어요. (데모)' : '다음 주차 범위 초안을 복제했어요. (데모)');
  }

  function edit(scope: ReturnType<typeof getDemoState>['scopes'][number]) {
    const [from, to] = scope.pages.split('–').map(Number);
    setFilters(filters => ({ ...filters, course: courseKey[scope.subject] ?? 'reading', section: scope.section ?? '01', week: scope.week }));
    updateDemoState(state => ({
      ...state,
      scopeDraft: {
        subject: scope.subject, section: scope.section ?? '01', week: scope.week, from: from || 1, to: to || from || 1,
        topic: scope.topic, chosen: scope.topic.split(' · '), fileName: 'Português_A1_2026.pdf',
        exercises: scope.exercises,
      },
    }));
    onNavigate('/prof/scope/new');
    onToast('선택한 범위를 편집하고 있어요.');
  }

  return <div className="prof-page">
    <header className="prof-page-head">
      <div><span className="eyebrow">LEARNING SCOPES</span><h1>범위 관리</h1><p>과목별 주차 학습 범위와 학생 참여를 확인해요.</p></div>
      <button className="btn-solid" onClick={() => onNavigate('/prof/scope/new')}>＋ 새 범위 설정</button>
    </header>
    <div className="subject-tabs">
      {(['reading', 'writing', 'speaking'] as const).map(course => <button key={course}
        className={filters.course === course ? 'is-active' : ''}
        onClick={() => setFilters(value => ({ ...value, course }))}>{subjectName[course]}</button>)}
      <button disabled>인도네시아어 · 준비 중</button>
    </div>
    <section className="prof-kpis prof-kpis--three">
      <article><span>게시된 범위</span><b>{published.length}<small>개</small></b><em>종료·진행 중</em></article>
      <article><span>예약 · 임시 저장</span><b>{statusCount('scheduled') + statusCount('draft')}<small>개</small></b><em>다음 주차 준비</em></article>
      <article><span>평균 참여율</span><b>{averageParticipation}<small>%</small></b><em>게시된 범위 기준</em></article>
    </section>
    <section className="prof-card">
      <div className="section-title"><div><h2>학습 범위 목록</h2><p>총 {scopes.length}개 · 최신 주차순 · 선택한 주차를 강조 표시</p></div>
        <span className="tag">{filters.section}분반 · {sectionSize}명 · {filters.week}주차</span></div>
      <div className="table-scroll"><table className="prof-table scope-table"><thead><tr><th>주차·기간</th><th>PDF 쪽</th><th>집중 범위</th><th>상태</th><th>참여</th><th>정확도</th><th>관리</th></tr></thead>
        <tbody>{[...scopes].sort((a, b) => b.week - a.week).map(scope => <tr key={scope.id} className={scope.week === filters.week ? 'is-selected' : ''}>
          <td><b>{scope.week}주차</b><small>{scope.dates}</small></td><td>{scope.pages}쪽</td><td>{scope.topic}</td>
          <td><span className={`scope-status scope-status--${scope.status}`}>{statusLabel[scope.status]}</span></td>
          <td>{scope.status === 'draft' ? '—' : `${scope.participation ? Math.round(sectionSize * scope.participation / 100) : 0}/${sectionSize}`}</td>
          <td>{scope.accuracy ? `${scope.accuracy}%` : '—'}</td>
          <td><div className="row-actions"><button onClick={() => edit(scope)}>수정</button>
            <button onClick={() => onToast(`${scope.week}주차 미리보기예요. (데모)`)}>미리보기</button>
            <button onClick={() => change(scope.id, 'clone')}>복제</button>
            <button onClick={() => change(scope.id, 'private')}>{scope.status === 'private' ? '공개' : '비공개'}</button>
          </div></td>
        </tr>)}</tbody></table></div>
    </section>
  </div>;
}
