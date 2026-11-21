import { useCallback, useEffect, useRef, useState } from 'react';
import { Hero } from './components/Hero';
import { AzulejoWipe } from './components/onboarding/AzulejoWipe';
import { LoginScreen } from './components/onboarding/LoginScreen';
import { OnboardingStage } from './components/onboarding/OnboardingStage';
import { Workspace } from './components/workspace/Workspace';
import { clearSession, readSession, saveSession, type Session } from './lib/session';
import { navigateTo, roleForPath, roleHome } from './lib/router';
import { resetDemoState } from './lib/demoStore';

type Screen = 'intro' | 'suitcase' | 'football' | 'login' | 'workspace';
function startingScreen(): Screen {
  if (readSession()) return 'workspace';
  return roleForPath(window.location.pathname) ? 'login' : 'intro';
}
export default function App() {
  const [screen, setScreen] = useState<Screen>(startingScreen);
  const [session, setSession] = useState<Session | null>(readSession);
  const [path, setPath] = useState(window.location.pathname);
  const [wiping, setWiping] = useState(false);
  const [toast, setToast] = useState('');
  const targetRef = useRef<Screen | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    const sync = () => setPath(window.location.pathname);
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  useEffect(() => {
    if (session) {
      const targetRole = roleForPath(path);
      if (!targetRole || targetRole !== session.role) navigateTo(roleHome(session.role));
      setScreen('workspace');
    } else if (roleForPath(path)) setScreen('login');
  }, [session, path]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [screen, path]);
  useEffect(() => () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3400);
  }, []);
  const startWipe = useCallback((next: Screen) => { targetRef.current = next; setWiping(true); }, []);
  const handleCovered = useCallback(() => { if (targetRef.current) setScreen(targetRef.current); }, []);
  const handleDone = useCallback(() => { targetRef.current = null; setWiping(false); }, []);
  const handleLogin = useCallback((next: Session) => {
    saveSession(next); setSession(next); navigateTo(roleHome(next.role)); setScreen('workspace'); notify(`${next.name}님, 오늘도 한 문장씩.`);
  }, [notify]);
  const handleSessionUpdate = useCallback((next: Session) => { saveSession(next); setSession(next); }, []);
  const handleLogout = useCallback(() => {
    clearSession(); setSession(null); navigateTo('/'); setScreen('intro'); notify('로그아웃했어요. 다른 역할로 다시 로그인할 수 있어요.');
  }, [notify]);
  const handleReset = useCallback(() => { resetDemoState(); notify('데모 데이터를 기본값으로 초기화했어요.'); }, [notify]);
  const handleReplay = useCallback(() => { clearSession(); setSession(null); navigateTo('/'); setScreen('intro'); }, []);
  const goFootball = useCallback(() => startWipe('football'), [startWipe]);
  const goLogin = useCallback(() => startWipe('login'), [startWipe]);
  const goIntro = useCallback(() => startWipe('intro'), [startWipe]);
  const onNavigate = useCallback((nextPath: string) => navigateTo(nextPath), []);

  return <div className="app" data-screen={screen}>
    {screen === 'intro' && <Hero onStart={() => startWipe('suitcase')} onSkip={goLogin} onToast={notify}/>}
    {(screen === 'suitcase' || screen === 'football') && <OnboardingStage step={screen === 'suitcase' ? 1 : 2} onNext={screen === 'suitcase' ? goFootball : goLogin} onExit={goIntro} onSkip={goLogin}/>}
    {screen === 'login' && <LoginScreen onLogin={handleLogin} onBack={goIntro}/>}
    {screen === 'workspace' && session && <Workspace session={session} path={path} onNavigate={onNavigate} onSessionUpdate={handleSessionUpdate} onLogout={handleLogout} onToast={notify} onReset={handleReset} onReplay={handleReplay}/>}
    <AzulejoWipe active={wiping} onCovered={handleCovered} onDone={handleDone}/>
    <div className={`toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">{toast}</div>
  </div>;
}
