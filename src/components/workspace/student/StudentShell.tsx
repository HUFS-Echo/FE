import { useEffect, useRef, useState } from 'react';
import type { Session } from '../../../lib/session';
import type { SubjectId } from '../../../config/learning';
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

type Props = {
  session: Session;
  onToast: (message: string) => void;
};

export function StudentShell({ session, onToast }: Props) {
  const [view, setView] = useState<View>('home');
  const [subject, setSubject] = useState<SubjectId>('reading');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [view]);

  const active: StudentNavKey =
    view === 'home'
      ? 'home'
      : view === 'history' || view === 'progress' || view === 'weeks'
        ? view
        : 'practice';

  function openPractice(id: SubjectId) {
    setSubject(id);
    setView(id);
  }

  function handleNavigate(key: StudentNavKey) {
    if (key === 'practice') {
      setView(subject);
      return;
    }
    setView(key);
  }

  function complete(data: SummaryData) {
    setSummary(data);
    setSubject(data.subject);
    setView('summary');
  }

  return (
    <div className="student-shell">
      <StudentSidebar
        subject={subject}
        active={active}
        onNavigate={handleNavigate}
        onSpeak={() => openPractice('speaking')}
      />

      <main className="student-main" ref={mainRef}>
        {view === 'home' && (
          <StudentHome
            session={session}
            subject={subject}
            onSubject={setSubject}
            onOpen={openPractice}
            onToast={onToast}
          />
        )}

        {view === 'reading' && (
          <ReadingPractice
            onBack={() => setView('home')}
            onComplete={complete}
            onToast={onToast}
          />
        )}

        {view === 'writing' && (
          <WritingPractice
            onBack={() => setView('home')}
            onComplete={complete}
            onToast={onToast}
          />
        )}

        {view === 'speaking' && (
          <SpeakingPractice
            onBack={() => setView('home')}
            onComplete={complete}
            onToast={onToast}
          />
        )}

        {view === 'summary' && summary && (
          <PracticeSummary
            data={summary}
            onHome={() => setView('home')}
            onRetry={() => setView(summary.subject)}
            onNext={(id) => openPractice(id)}
          />
        )}

        {view === 'history' && <CorrectionHistory onPractice={openPractice} onToast={onToast} />}
        {view === 'progress' && <ProgressView />}
        {view === 'weeks' && <WeekList onOpen={openPractice} />}
      </main>
    </div>
  );
}
