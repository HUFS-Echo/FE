import { useCallback, useEffect, useRef, useState } from 'react';
import { Hero } from './components/Hero';
import { LoginScreen } from './components/onboarding/LoginScreen';
import { SignupScreen } from './components/onboarding/SignupScreen';
import { Workspace } from './components/workspace/Workspace';
import { clearSession, readSession, saveSession, type Session } from './lib/session';
import { navigateTo, roleForPath, roleHome } from './lib/router';
import { resetDemoState } from './lib/demoStore';

type Screen = 'intro' | 'login' | 'signup' | 'workspace';
function startingScreen(): Screen {
  if (readSession()) return 'workspace';
  return roleForPath(window.location.pathname) ? 'login' : 'intro';
}
export default function App() {
  const [screen, setScreen] = useState<Screen>(startingScreen);
  const [session, setSession] = useState<Session | null>(readSession);
  const [path, setPath] = useState(window.location.pathname);
  const [toast, setToast] = useState('');
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
  const handleLogin = useCallback((next: Session) => {
    saveSession(next); setSession(next); navigateTo(roleHome(next.role)); setScreen('workspace'); notify(`${next.name}님, 오늘도 한 문장씩.`);
  }, [notify]);
  const handleSessionUpdate = useCallback((next: Session) => { saveSession(next); setSession(next); }, []);
  const handleLogout = useCallback(() => {
    clearSession(); setSession(null); navigateTo('/'); setScreen('intro'); notify('로그아웃했어요.');
  }, [notify]);
  const handleReset = useCallback(() => { resetDemoState(); notify('데모 데이터를 기본값으로 초기화했어요.'); }, []);
  const handleReplay = useCallback(() => { clearSession(); setSession(null); navigateTo('/'); setScreen('intro'); }, []);
  const goLogin = useCallback(() => setScreen('login'), []);
  const goSignup = useCallback(() => setScreen('signup'), []);
  const goIntro = useCallback(() => setScreen('intro'), []);
  const onNavigate = useCallback((nextPath: string) => navigateTo(nextPath), []);

  return <div className="app" data-screen={screen}>
    {screen === 'intro' && <Hero onLogin={goLogin} onSignup={goSignup} onToast={notify}/>}
    {screen === 'login' && <LoginScreen onLogin={handleLogin} onBack={goIntro} onSignup={goSignup}/>}
    {screen === 'signup' && <SignupScreen onSignup={handleLogin} onBack={goIntro} onLogin={goLogin}/>}
    {screen === 'workspace' && session && <Workspace session={session} path={path} onNavigate={onNavigate} onSessionUpdate={handleSessionUpdate} onLogout={handleLogout} onToast={notify} onReset={handleReset} onReplay={handleReplay}/>}
    <div className={`toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">{toast}</div>
  </div>;
}
