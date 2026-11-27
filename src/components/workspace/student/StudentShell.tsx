import { useEffect, useRef, useState } from 'react';
import type { Session } from '../../../lib/session';
import type { SubjectId } from '../../../config/learning';
import { getStudentCourses } from '../../../api/studentCourses';
import { useApi } from '../../../api/useApi';
import { createCustomPractice } from '../../../api/customPractice';
import { StudentSidebar, type StudentNavKey } from './StudentSidebar';
import { StudentHome } from './StudentHome';
import { ReadingPractice } from './ReadingPractice';
import { WritingPractice } from './WritingPractice';
import { SpeakingPractice } from './SpeakingPractice';
import { PracticeSummary, type SummaryData } from './PracticeSummary';
import { CorrectionHistory } from './CorrectionHistory';
import { CustomPractice } from './CustomPractice';
import { StudentProfile } from '../profile/MyPages';
type View = 'home' | 'grammar' | 'writing' | 'speaking' | 'summary' | 'history' | 'me' | 'customPractice';
type Props = { session: Session; path: string; onNavigate: (path: string) => void; onToast: (message: string) => void; onSessionUpdate: (session: Session) => void; onLogout: () => void; onReset: () => void; onReplay: () => void };
const typeForSubject: Record<SubjectId, 'GRAMMAR' | 'WRITING' | 'SPEAKING'> = { grammar: 'GRAMMAR', writing: 'WRITING', speaking: 'SPEAKING' };
function viewFromPath(path: string): View {
  if (path.startsWith('/student/course/')) return 'home';
  if (path.startsWith('/student/practice/custom')) return 'customPractice';
  if (path.startsWith('/student/practice/')) { const subject = path.split('/')[3]; return subject === 'writing' || subject === 'speaking' ? subject : 'grammar'; }
  if (path === '/student/history') return 'history';
  if (path === '/student/me') return 'me';
  if (path === '/student/summary' || path.startsWith('/student/summary/')) return 'summary';
  return 'home';
}
function subjectFromPath(path: string): SubjectId | null {
  const subject = path.split('/')[3];
  if (!(path.startsWith('/student/practice/') || path.startsWith('/student/course/') || path.startsWith('/student/summary/'))) return null;
  if (subject === 'grammar' || subject === 'reading') return 'grammar';
  return subject === 'writing' || subject === 'speaking' ? subject : null;
}
function pathForView(view: View, subject: SubjectId, practiceId?: number): string {
  if (view === 'home') return `/student/course/${subject}`;
  if (view === 'customPractice') return practiceId ? `/student/practice/custom/${practiceId}` : '/student/practice/custom';
  if (view === 'grammar' || view === 'writing' || view === 'speaking') return `/student/practice/${view}`;
  if (view === 'summary') return `/student/summary/${subject}`;
  return `/student/${view}`;
}
export function StudentShell({ session, path, onNavigate, onToast, onSessionUpdate, onLogout, onReset, onReplay }: Props) {
  const coursesApi = useApi(() => getStudentCourses(), [session.email]);
  const [view, setView] = useState<View>(() => viewFromPath(path));
  const [subject, setSubject] = useState<SubjectId>(() => subjectFromPath(path) ?? 'grammar');
  const [summary, setSummary] = useState<SummaryData | null>(() => { try { return JSON.parse(sessionStorage.getItem('hufs-echo.practice-summary.v1') || 'null') as SummaryData | null; } catch { return null; } });
  const [practiceSetId, setPracticeSetId] = useState<number | undefined>();
  const mainRef = useRef<HTMLElement>(null);
  const customPracticeId = Number(path.split('/')[4]) || undefined;
  useEffect(() => { const refresh = () => coursesApi.retry(); window.addEventListener('hufs-demo-change', refresh); return () => window.removeEventListener('hufs-demo-change', refresh); }, [coursesApi.retry]);
  useEffect(() => {
    const nextView = viewFromPath(path);
    const nextSubject = subjectFromPath(path);
    if (/\/student\/(course|practice|summary)\/reading(?:\/|$)/.test(path)) { onNavigate(path.replace('/reading', '/grammar')); return; }
    if (nextView === 'customPractice' && !customPracticeId) { void createCustomPractice(null, 5).then((practice) => onNavigate(pathForView('customPractice', subject, practice.practiceId))); return; }
    if (nextView === 'summary' && !summary) { setView('home'); onNavigate('/student'); return; }
    const requestedSubject = nextSubject ?? subject;
    const needsCourse = nextView === 'home' || nextView === 'grammar' || nextView === 'writing' || nextView === 'speaking';
    if (needsCourse && coursesApi.data) {
      const selected = coursesApi.data.courses.find((course) => course.type === typeForSubject[requestedSubject]);
      if (!selected?.enrolled) {
        const firstAvailable = coursesApi.data.courses.find((course) => course.enrolled);
        const fallback: SubjectId = firstAvailable?.type === 'WRITING' ? 'writing' : firstAvailable?.type === 'SPEAKING' ? 'speaking' : 'grammar';
        setSubject(fallback); setView('home'); onNavigate(pathForView('home', fallback)); return;
      }
    }
    if (nextSubject) setSubject(nextSubject);
    setView(nextView);
  }, [path, summary, onNavigate, customPracticeId, subject, coursesApi.data]);
  useEffect(() => { mainRef.current?.scrollTo({ top: 0, behavior: 'auto' }); }, [view]);
  const active: StudentNavKey = view === 'home' ? 'home' : view === 'history' || view === 'me' ? view : 'practice';
  function navigate(nextView: View, nextSubject = subject, setId?: number) { if (nextSubject !== subject) setSubject(nextSubject); setPracticeSetId(setId); setView(nextView); onNavigate(pathForView(nextView, nextSubject)); }
  function openPractice(requestedId: SubjectId | 'reading', setId?: number) {
    const id: SubjectId = requestedId === 'reading' ? 'grammar' : requestedId;
    const course = coursesApi.data?.courses.find((item) => item.type === typeForSubject[id]);
    if (course && !course.enrolled) { onToast('연결되지 않은 과목이에요. 마이페이지에서 다시 연결해 주세요.'); navigate('home', subject); return; }
    navigate(id, id, setId);
  }
  function handleNavigate(key: StudentNavKey) { if (key === 'practice') navigate(subject, subject); else navigate(key); }
  function startCustomPractice() { void createCustomPractice(null, 5).then((practice) => onNavigate(pathForView('customPractice', subject, practice.practiceId))); }
  function complete(data: SummaryData) { setSummary(data); sessionStorage.setItem('hufs-echo.practice-summary.v1', JSON.stringify(data)); navigate('summary', data.subject); }
  return <div className="student-shell"><StudentSidebar subject={subject} active={active} onNavigate={handleNavigate} onSubjectChange={(id) => navigate('home', id)} /><main className="student-main" ref={mainRef}>
    {view === 'home' && <StudentHome session={session} subject={subject} onOpen={openPractice} />}
    {view === 'grammar' && <ReadingPractice setId={practiceSetId} onBack={() => navigate('home')} onComplete={complete} onToast={onToast} />}
    {view === 'writing' && <WritingPractice setId={practiceSetId} onBack={() => navigate('home')} onComplete={complete} onToast={onToast} />}
    {view === 'speaking' && <SpeakingPractice setId={practiceSetId} onBack={() => navigate('home')} onComplete={complete} onToast={onToast} />}
    {view === 'summary' && summary && <PracticeSummary data={summary} onHome={() => navigate('home')} />}
    {view === 'customPractice' && customPracticeId && <CustomPractice key={customPracticeId} practiceId={customPracticeId} onBack={() => navigate('history')} />}
    {view === 'history' && <CorrectionHistory subject={subject} onCustomPractice={startCustomPractice} />}
    {view === 'me' && <StudentProfile session={session} onSessionUpdate={onSessionUpdate} onToast={onToast} onLogout={onLogout} onReset={onReset} onReplay={onReplay} />}
  </main></div>;
}
