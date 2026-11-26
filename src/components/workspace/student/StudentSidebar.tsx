import { useEffect } from 'react';
import type { SubjectId } from '../../../config/learning';
import { getCorrections } from '../../../api/corrections';
import { useApi, ApiEmptyState, ApiLoadingState } from '../../../api/useApi';
import { StudentCoursePicker } from './StudentCoursePicker';

export type StudentNavKey = 'home' | 'practice' | 'history' | 'me';
type Props = { subject: SubjectId; active: StudentNavKey; onNavigate: (key: StudentNavKey) => void; onSubjectChange: (id: SubjectId) => void };
const NAV: { key: StudentNavKey; label: string; icon: 'home' | 'practice' | 'history' | 'profile' }[] = [
  { key: 'home', label: '홈', icon: 'home' }, { key: 'practice', label: '연습하기', icon: 'practice' }, { key: 'history', label: '교정 기록', icon: 'history' }, { key: 'me', label: '마이페이지', icon: 'profile' },
];

export function StudentSidebar({ subject, active, onNavigate, onSubjectChange }: Props) {
  const corrections = useApi(() => getCorrections(), []);
  const count = corrections.data?.items.length ?? 0;
  useEffect(() => {
    const refreshCorrections = () => corrections.retry();
    window.addEventListener('hufs-demo-change', refreshCorrections);
    return () => window.removeEventListener('hufs-demo-change', refreshCorrections);
  }, [corrections.retry]);

  return <aside className="student-side">
    <StudentCoursePicker variant="sidebar" subject={subject} onChange={onSubjectChange} />
    <nav className="side-nav" aria-label="학생 메뉴">{NAV.map((item) => <button key={item.key} type="button" className={active === item.key ? 'is-active' : ''} aria-current={active === item.key ? 'page' : undefined} onClick={() => onNavigate(item.key)}><NavIcon name={item.icon} /><span>{item.label}</span>{item.key === 'history' && count > 0 && <i className="side-nav__count">{count}</i>}</button>)}</nav>
    {corrections.loading && <ApiLoadingState label="교정 기록을 불러오는 중…" />}
    {!corrections.loading && !corrections.error && count === 0 && <ApiEmptyState message="교정 기록이 아직 없어요." />}
  </aside>;
}

function NavIcon({ name }: { name: 'home' | 'practice' | 'history' | 'profile' }) {
  if (name === 'home') return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.2 9.2 10 3l6.8 6.2V17a.8.8 0 0 1-.8.8h-4.2v-5.1H8.2v5.1H4a.8.8 0 0 1-.8-.8Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>;
  if (name === 'practice') return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m3.5 16.5 1-4L14.2 2.8a1.8 1.8 0 0 1 2.6 2.6L7.1 15.1l-3.6 1.4Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="m12.8 4.2 2.6 2.6M4.5 12.5l3 3" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>;
  if (name === 'history') return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.2 6.5V3.2h3.3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><path d="M3.4 6.6A7.2 7.2 0 1 1 2.8 11" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><path d="M10 6v4.3l2.8 1.6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>;
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="6.4" r="3" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="M4.2 17c.5-3.1 2.4-4.8 5.8-4.8s5.3 1.7 5.8 4.8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>;
}
