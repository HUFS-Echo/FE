import { useCallback, useEffect, useRef, useState } from 'react';
import { Hero } from './components/Hero';
import { AzulejoWipe } from './components/onboarding/AzulejoWipe';
import { LoginScreen } from './components/onboarding/LoginScreen';
import { OnboardingStage } from './components/onboarding/OnboardingStage';
import { Workspace } from './components/workspace/Workspace';
import type { Session } from './lib/session';

type Screen = 'intro' | 'suitcase' | 'football' | 'login' | 'workspace';

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [session, setSession] = useState<Session | null>(null);
  const [wiping, setWiping] = useState(false);
  const [toast, setToast] = useState('');
  const targetRef = useRef<Screen | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [screen]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3400);
  }, []);

  const startWipe = useCallback((next: Screen) => {
    targetRef.current = next;
    setWiping(true);
  }, []);

  const handleCovered = useCallback(() => {
    if (targetRef.current) setScreen(targetRef.current);
  }, []);

  const handleDone = useCallback(() => {
    targetRef.current = null;
    setWiping(false);
  }, []);

  const handleLogin = useCallback(
    (next: Session) => {
      setSession(next);
      setScreen('workspace');
      notify(`${next.name}님, 오늘도 한 문장씩.`);
    },
    [notify],
  );

  const handleLogout = useCallback(() => {
    setSession(null);
    setScreen('intro');
    notify('로그아웃했어요. 다음에 또 만나요.');
  }, [notify]);

  const goFootball = useCallback(() => startWipe('football'), [startWipe]);
  const goLogin = useCallback(() => startWipe('login'), [startWipe]);
  const goIntro = useCallback(() => startWipe('intro'), [startWipe]);

  return (
    <div className="app" data-screen={screen}>
      {screen === 'intro' && (
        <Hero
          onStart={() => startWipe('suitcase')}
          onSkip={goLogin}
          onToast={notify}
        />
      )}

      {(screen === 'suitcase' || screen === 'football') && (
        <OnboardingStage
          step={screen === 'suitcase' ? 1 : 2}
          onNext={screen === 'suitcase' ? goFootball : goLogin}
          onExit={goIntro}
          onSkip={goLogin}
        />
      )}

      {screen === 'login' && <LoginScreen onLogin={handleLogin} onBack={goIntro} />}

      {screen === 'workspace' && session && (
        <Workspace session={session} onLogout={handleLogout} onToast={notify} />
      )}

      <AzulejoWipe active={wiping} onCovered={handleCovered} onDone={handleDone} />

      <div className={`toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}
