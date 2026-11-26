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
const ACCESS_TOKEN_KEY = 'hufs-echo.access-token.v1';
type StoredSession = Omit<Session, 'role'> & { role: Role | 'STUDENT' | 'PROFESSOR' };
function normalizeStoredSession(value: unknown): Session | null {
  if (!value || typeof value !== 'object') return null;
  const stored = value as StoredSession;
  const role = stored.role === 'STUDENT' ? 'student' : stored.role === 'PROFESSOR' ? 'professor' : stored.role;
  if ((role !== 'student' && role !== 'professor') || !stored.setupComplete) return null;
  return { ...stored, role };
}
function serializeSession(session: Session): StoredSession {
  return { ...session, role: session.role === 'student' ? 'STUDENT' : 'PROFESSOR' };
}

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
    const value = normalizeStoredSession(JSON.parse(raw));
    if (value && (JSON.parse(raw) as StoredSession).role !== (value.role === 'student' ? 'STUDENT' : 'PROFESSOR')) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(serializeSession(value)));
    }
    return value;
  } catch { return null; }
}

export function saveSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(serializeSession(session)));
  saveProfile(session);
}

export function saveAccessToken(token: string) { localStorage.setItem(ACCESS_TOKEN_KEY, token); }
export function readAccessToken() { return localStorage.getItem(ACCESS_TOKEN_KEY) ?? undefined; }
export function clearSession() { localStorage.removeItem(SESSION_KEY); localStorage.removeItem(ACCESS_TOKEN_KEY); }

export function getSavedProfile(role: Role, email: string): Session | null {
  try {
    const profiles = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? '{}') as Record<string, unknown>;
    const apiRole = role === 'student' ? 'STUDENT' : 'PROFESSOR';
    const profile = normalizeStoredSession(profiles[`${apiRole}:${email.toLowerCase()}`] ?? profiles[`${role}:${email.toLowerCase()}`]);
    if (profile && !profiles[`${apiRole}:${email.toLowerCase()}`]) saveProfile(profile);
    return profile;
  } catch { return null; }
}

export function saveProfile(profile: Session) {
  try {
    const profiles = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? '{}') as Record<string, StoredSession>;
    const apiRole = profile.role === 'student' ? 'STUDENT' : 'PROFESSOR';
    profiles[`${apiRole}:${profile.email.toLowerCase()}`] = serializeSession(profile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
  } catch { /* storage can be unavailable in private browsing */ }
}

export function clearDemoData() {
  localStorage.removeItem('hufs-echo-demo-v2');
  localStorage.removeItem('hufs-echo.student-settings.v1');
}
