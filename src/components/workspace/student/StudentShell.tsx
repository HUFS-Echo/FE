import { useEffect, useRef, useState } from 'react';
import { getDemoState, type Session, SUBJECTS, isCourseDisabled, type SubjectId } from '../../../api/adapters';
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
type View = 'home' | 'reading' | 'writing' | 'speaking' | 'summary' | 'history' | 'me' | 'customPractice';
type Props = { session: Session; path: string; onNavigate: (path: string) => void; onToast: (message: string) => void; onSessionUpdate: (session: Session) => void; onLogout: () => void; onReset: () => void; onReplay: () => void };
function viewFromPath(path: string): View {
  if (path.startsWith('/student/course/')) return 'home';
  if (path.startsWith('/student/practice/custom')) return 'customPractice';
  if (path.startsWith('/student/practice/')) { const subject = path.split('/')[3]; return subject === 'writing' || subject === 'speaking' ? subject : 'reading'; }
  if (path === '/student/history') return 'history';
  if (path === '/student/me') return 'me';
  if (path === '/student/summary' || path.startsWith('/student/summary/')) return 'summary';
  return 'home';
}
function subjectFromPath(path: string): SubjectId | null {
  const subject = path.split('/')[3];
  if (!(path.startsWith('/student/practice/') || path.startsWith('/student/course/') || path.startsWith('/student/summary/'))) return null;
  if (subject === 'grammar' || subject === 'reading') return 'reading';
  return subject === 'writing' || subject === 'speaking' ? subject : null;
}
function pathForView(view: View, subject: SubjectId, practiceId?: number): string {
  const routeSubject = subject === 'reading' ? 'grammar' : subject;
  if (view === 'home') return `/student/course/${routeSubject}`;
  if (view === 'customPractice') return practiceId ? `/student/practice/custom/${practiceId}` : '/student/practice/custom';
  if (view === 'reading' || view === 'writing' || view === 'speaking') return `/student/practice/${view === 'reading' ? 'grammar' : view}`;
  if (view === 'summary') return `/student/summary/${routeSubject}`;
  return `/student/${view}`;
}
export function StudentShell({ session, path, onNavigate, onToast, onSessionUpdate, onLogout, onReset, onReplay }: Props) {
  const [view, setView] = useState<View>(() => viewFromPath(path));
  const [subject, setSubject] = useState<SubjectId>(() => subjectFromPath(path) ?? 'reading');
  const [summary, setSummary] = useState<SummaryData | null>(() => { try { return JSON.parse(sessionStorage.getItem('hufs-echo.practice-summary.v1') || 'null') as SummaryData | null; } catch { return null; } });
  const mainRef = useRef<HTMLElement>(null);
  const customPracticeId = Number(path.split('/')[4]) || undefined;
  useEffect(() => {
    const nextView = viewFromPath(path);
    const nextSubject = subjectFromPath(path);
    if (/\/student\/(course|practice|summary)\/reading(?:\/|$)/.test(path)) { onNavigate(path.replace('/reading', '/grammar')); return; }
    if (nextView === 'customPractice' && !customPracticeId) {
      void createCustomPractice(null, 5).then((practice) => onNavigate(pathForView('customPractice', subject, practice.practiceId)));
      return;
    }
    if (nextView === 'summary' && !summary) { setView('home'); onNavigate('/student'); return; }
    const disabled = (getDemoState().studentSettings.disabledCourses as string[] | undefined) ?? [];
    const available = SUBJECTS.filter((item) => !isCourseDisabled(item.id, disabled));
    const requestedSubject = nextSubject ?? subject;
    const needsCourse = nextView === 'home' || nextView === 'reading' || nextView === 'writing' || nextView === 'speaking';
    if (needsCourse && isCourseDisabled(requestedSubject, disabled)) { const fallback = available[0]?.id ?? 'reading'; setSubject(fallback); setView('home'); onNavigate(pathForView('home', fallback)); return; }
    if (nextSubject) setSubject(nextSubject);
    setView(nextView);
  }, [path, summary, onNavigate, customPracticeId, subject]);
  useEffect(() => { mainRef.current?.scrollTo({ top: 0, behavior: 'auto' }); }, [view]);
  const active: StudentNavKey = view === 'home' ? 'home' : view === 'history' || view === 'me' ? view : 'practice';
  function navigate(nextView: View, nextSubject = subject) { if (nextSubject !== subject) setSubject(nextSubject); setView(nextView); onNavigate(pathForView(nextView, nextSubject)); }
  function openPractice(id: SubjectId) { const disabled = (getDemoState().studentSettings.disabledCourses as string[] | undefined) ?? []; if (isCourseDisabled(id, disabled)) { onToast('연결되지 않은 과목이에요. 마이페이지에서 다시 연결해 주세요.'); navigate('home', subject); return; } navigate(id, id); }
  function handleNavigate(key: StudentNavKey) { if (key === 'practice') navigate(subject, subject); else navigate(key); }
  function startCustomPractice() { void createCustomPractice(null, 5).then((practice) => onNavigate(pathForView('customPractice', subject, practice.practiceId))); }
  function complete(data: SummaryData) { setSummary(data); sessionStorage.setItem('hufs-echo.practice-summary.v1', JSON.stringify(data)); navigate('summary', data.subject); }
  return <div className="student-shell">
    <StudentSidebar subject={subject} active={active} onNavigate={handleNavigate} onSubjectChange={(id) => navigate('home', id)} />
    <main className="student-main" ref={mainRef}>
      {view === 'home' && <StudentHome session={session} subject={subject} onOpen={openPractice} />}
      {view === 'reading' && <ReadingPractice onBack={() => navigate('home')} onComplete={complete} onToast={onToast} />}
      {view === 'writing' && <WritingPractice onBack={() => navigate('home')} onComplete={complete} onToast={onToast} />}
      {view === 'speaking' && <SpeakingPractice onBack={() => navigate('home')} onComplete={complete} onToast={onToast} />}
      {view === 'summary' && summary && <PracticeSummary data={summary} onHome={() => navigate('home')} />}
      {view === 'customPractice' && customPracticeId && <CustomPractice key={customPracticeId} practiceId={customPracticeId} onBack={() => navigate('history')} />}
      {view === 'history' && <CorrectionHistory onCustomPractice={startCustomPractice} />}
      {view === 'me' && <StudentProfile session={session} onSessionUpdate={onSessionUpdate} onToast={onToast} onLogout={onLogout} onReset={onReset} onReplay={onReplay} />}
    </main>
  </div>;
}
