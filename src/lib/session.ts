export type Role = 'student' | 'professor';

export type Session = {
  name: string;
  role: Role;
  email: string;
  studentId: string;
  professorId?: string;
  department: string;
  year?: string;
  room?: string;
  avatar?: string;
  setupComplete: boolean;
};

const SESSION_KEY = 'hufs-echo.session.v2';
const PROFILE_KEY = 'hufs-echo.profiles.v2';

export const DEMO_STUDENT: Session = {
  name: '한하린', role: 'student', email: 'harin@hufs.ac.kr', studentId: '202503356',
  department: '포르투갈어과', year: '2학년', setupComplete: true,
};
export const DEMO_PROFESSOR: Session = {
  name: '김교수', role: 'professor', email: 'prof@hufs.ac.kr', studentId: 'prof-2024',
  department: '포르투갈어과', room: '본관 512호 · 화 14:00–16:00', setupComplete: true,
};

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Session;
    return value && (value.role === 'student' || value.role === 'professor') && value.setupComplete ? value : null;
  } catch { return null; }
}

export function saveSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  saveProfile(session);
}

export function clearSession() { localStorage.removeItem(SESSION_KEY); }

export function getSavedProfile(role: Role, email: string): Session | null {
  try {
    const profiles = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? '{}') as Record<string, Session>;
    const profile = profiles[`${role}:${email.toLowerCase()}`];
    return profile?.setupComplete ? profile : null;
  } catch { return null; }
}

export function saveProfile(profile: Session) {
  try {
    const profiles = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? '{}') as Record<string, Session>;
    profiles[`${profile.role}:${profile.email.toLowerCase()}`] = profile;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
  } catch { /* storage can be unavailable in private browsing */ }
}

export function clearDemoData() {
  localStorage.removeItem('hufs-echo-demo-v2');
  localStorage.removeItem('hufs-echo.student-settings.v1');
}
