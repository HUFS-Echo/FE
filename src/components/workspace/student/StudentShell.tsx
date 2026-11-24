import { useEffect, useRef, useState } from 'react';
import type { Session } from '../../../lib/session';
import { SUBJECTS, isCourseDisabled, type SubjectId } from '../../../config/learning';
import { getDemoState } from '../../../lib/demoStore';
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
  if (path === '/student/practice/custom') return 'customPractice';
  if (path.startsWith('/student/practice/')) {
    const subject = path.split('/')[3];
    return subject === 'writing' || subject === 'speaking' ? subject : 'reading';
  }
  if (path === '/student/history') return 'history';
  if (path === '/student/me') return 'me';
  if (path === '/student/summary' || path.startsWith('/student/summary/')) return 'summary';
  return 'home';
}
function subjectFromPath(path: string): SubjectId | null {
  const subject = path.split('/')[3];
  return (path.startsWith('/student/practice/') || path.startsWith('/student/course/') || path.startsWith('/student/summary/')) && (subject === 'reading' || subject === 'writing' || subject === 'speaking')
    ? subject : null;
}
function pathForView(view: View, subject: SubjectId): string {
  if (view === 'home') return `/student/course/${subject}`;
  if (view === 'customPractice') return '/student/practice/custom';
  if (view === 'reading' || view === 'writing' || view === 'speaking') return `/student/practice/${view}`;
  if (view === 'summary') return `/student/summary/${subject}`;
  return `/student/${view}`;
}

export function StudentShell({ session, path, onNavigate, onToast, onSessionUpdate, onLogout, onReset, onReplay }: Props) {
  const [view, setView] = useState<View>(() => viewFromPath(path));
  const [subject, setSubject] = useState<SubjectId>(() => subjectFromPath(path) ?? 'reading');
  const [summary, setSummary] = useState<SummaryData | null>(() => { try { return JSON.parse(sessionStorage.getItem('hufs-echo.practice-summary.v1') || 'null') as SummaryData | null; } catch { return null; } });
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nextView = viewFromPath(path);
    const nextSubject = subjectFromPath(path);
    if (nextView === 'summary' && !summary) {
      setView('home');
      onNavigate('/student');
      return;
    }
    const disabled = (getDemoState().studentSettings.disabledCourses as string[] | undefined) ?? [];
    const available = SUBJECTS.filter((item) => !isCourseDisabled(item.id, disabled));
    const requestedSubject = nextSubject ?? subject;
    const needsCourse = nextView === 'home' || nextView === 'reading' || nextView === 'writing' || nextView === 'speaking';
    if (needsCourse && isCourseDisabled(requestedSubject, disabled)) {
      const fallback = available[0]?.id ?? 'reading';
      setSubject(fallback);
      setView('home');
      onNavigate(pathForView('home', fallback));
      return;
    }
    if (nextSubject) setSubject(nextSubject);
    setView(nextView);
  }, [path, summary, onNavigate]);
  useEffect(() => { mainRef.current?.scrollTo({ top: 0, behavior: 'auto' }); }, [view]);

  const active: StudentNavKey = view === 'home' ? 'home'
    : view === 'history' || view === 'me' ? view : 'practice';

  function navigate(view: View, nextSubject = subject) {
    if (nextSubject !== subject) setSubject(nextSubject);
    setView(view);
    onNavigate(pathForView(view, nextSubject));
  }
  function openPractice(id: SubjectId) {
    const disabled = (getDemoState().studentSettings.disabledCourses as string[] | undefined) ?? [];
    if (isCourseDisabled(id, disabled)) { onToast('연결되지 않은 과목이에요. 마이페이지에서 다시 연결해 주세요.'); navigate('home', subject); return; }
    navigate(id, id);
  }
  function handleNavigate(key: StudentNavKey) {
    if (key === 'practice') navigate(subject, subject);
    else navigate(key);
  }
  function complete(data: SummaryData) {
    setSummary(data);
    sessionStorage.setItem('hufs-echo.practice-summary.v1', JSON.stringify(data));
    navigate('summary', data.subject);
  }

  return (
    <div className="student-shell">
      <StudentSidebar subject={subject} active={active} onNavigate={handleNavigate} onSubjectChange={(id) => navigate('home', id)} />
      <main className="student-main" ref={mainRef}>
        {view === 'home' && <StudentHome session={session} subject={subject} onOpen={openPractice} />}
        {view === 'reading' && <ReadingPractice onBack={() => navigate('home')} onComplete={complete} onToast={onToast} />}
        {view === 'writing' && <WritingPractice onBack={() => navigate('home')} onComplete={complete} onToast={onToast} />}
        {view === 'speaking' && <SpeakingPractice onBack={() => navigate('home')} onComplete={complete} onToast={onToast} />}
        {view === 'summary' && summary && <PracticeSummary data={summary} onHome={() => navigate('home')} />}
        {view === 'customPractice' && <CustomPractice onBack={() => navigate('history')} onHome={() => navigate('home')} />}
        {view === 'history' && <CorrectionHistory onCustomPractice={() => navigate('customPractice')} />}
        {view === 'me' && <StudentProfile session={session} onSessionUpdate={onSessionUpdate} onToast={onToast} onLogout={onLogout} onReset={onReset} onReplay={onReplay} />}
      </main>
    </div>
  );
}
