import { useEffect, useRef, useState } from 'react';
import type { Session } from '../../../lib/session';
import { SUBJECTS, type SubjectId } from '../../../config/learning';
import { getDemoState } from '../../../lib/demoStore';
import { StudentSidebar, type StudentNavKey } from './StudentSidebar';
import { StudentHome } from './StudentHome';
import { ReadingPractice } from './ReadingPractice';
import { WritingPractice } from './WritingPractice';
import { SpeakingPractice } from './SpeakingPractice';
import { PracticeSummary, type SummaryData } from './PracticeSummary';
import { CorrectionHistory } from './CorrectionHistory';
import { ProgressView } from './ProgressView';
import { WeekList } from './WeekList';

type View = 'home' | 'reading' | 'writing' | 'speaking' | 'summary' | 'history' | 'progress' | 'weeks';
type Props = { session: Session; path: string; onNavigate: (path: string) => void; onToast: (message: string) => void };

function viewFromPath(path: string): View {
  if (path.startsWith('/student/course/')) return 'home';
  if (path.startsWith('/student/practice/')) {
    const subject = path.split('/')[3];
    return subject === 'writing' || subject === 'speaking' ? subject : 'reading';
  }
  if (path === '/student/history') return 'history';
  if (path === '/student/progress') return 'progress';
  if (path === '/student/weeks') return 'weeks';
  if (path === '/student/summary') return 'summary';
  return 'home';
}
function subjectFromPath(path: string): SubjectId | null {
  const subject = path.split('/')[3];
  return (path.startsWith('/student/practice/') || path.startsWith('/student/course/')) && (subject === 'reading' || subject === 'writing' || subject === 'speaking')
    ? subject : null;
}
function pathForView(view: View, subject: SubjectId): string {
  if (view === 'home') return `/student/course/${subject}`;
  if (view === 'reading' || view === 'writing' || view === 'speaking') return `/student/practice/${view}`;
  if (view === 'summary') return '/student/summary';
  return `/student/${view}`;
}

export function StudentShell({ session, path, onNavigate, onToast }: Props) {
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
    const courseName: Record<SubjectId, string> = { reading: '읽기와 쓰기', writing: '작문', speaking: '회화' };
    const available = SUBJECTS.filter((item) => !disabled.includes(courseName[item.id]));
    const requestedSubject = nextSubject ?? subject;
    if (disabled.includes(courseName[requestedSubject])) {
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
    : view === 'history' || view === 'progress' || view === 'weeks' ? view : 'practice';

  function navigate(view: View, nextSubject = subject) {
    if (nextSubject !== subject) setSubject(nextSubject);
    setView(view);
    onNavigate(pathForView(view, nextSubject));
  }
  function openPractice(id: SubjectId) {
    const disabled = (getDemoState().studentSettings.disabledCourses as string[] | undefined) ?? [];
    const courseName: Record<SubjectId, string> = { reading: '읽기와 쓰기', writing: '작문', speaking: '회화' };
    if (disabled.includes(courseName[id])) { onToast('연결되지 않은 과목이에요. 마이페이지에서 다시 연결해 주세요.'); navigate('home', subject); return; }
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
      <StudentSidebar subject={subject} active={active} onNavigate={handleNavigate} onSpeak={() => openPractice('speaking')} />
      <main className="student-main" ref={mainRef}>
        {view === 'home' && <StudentHome session={session} subject={subject} onSubject={(id) => navigate('home', id)} onOpen={openPractice} onToast={onToast} />}
        {view === 'reading' && <ReadingPractice onBack={() => navigate('home')} onComplete={complete} onToast={onToast} />}
        {view === 'writing' && <WritingPractice onBack={() => navigate('home')} onComplete={complete} onToast={onToast} />}
        {view === 'speaking' && <SpeakingPractice onBack={() => navigate('home')} onComplete={complete} onToast={onToast} />}
        {view === 'summary' && summary && <PracticeSummary data={summary} onHome={() => navigate('home')} onRetry={() => openPractice(summary.subject)} onNext={openPractice} />}
        {view === 'history' && <CorrectionHistory onPractice={openPractice} onToast={onToast} />}
        {view === 'progress' && <ProgressView />}
        {view === 'weeks' && <WeekList onOpen={openPractice} />}
      </main>
    </div>
  );
}
