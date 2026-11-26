import { DEMO_PROFESSOR, DEMO_STUDENT, getSavedProfile, readSession, saveAccessToken, saveProfile, saveSession, type Session } from '../lib/session';
import { getDemoState, updateDemoState } from '../lib/demoStore';
import { fail, mockRequest } from './client';
import type { LoginRequest, LoginResponse, Role, SignupRequest, SignupResponse, UserPatch, UserProfile } from './types';
const toLegacyRole = (role: Role): Session['role'] => role === 'STUDENT' ? 'student' : 'professor';

/** A1 POST /auth/login — 권한 없음 */
export function login(input: LoginRequest) {
  return mockRequest<LoginResponse>('A1', () => {
    if (!input.password) fail(400, 'INVALID_INPUT', '비밀번호를 입력해 주세요.');
    if (!/^[a-zA-Z0-9._-]{2,}$/.test(input.emailId)) fail(400, 'INVALID_INPUT', '학교 메일 아이디를 확인해 주세요.');
    const email = `${input.emailId}@hufs.ac.kr`;
    const role = toLegacyRole(input.role);
    const saved = getSavedProfile(role, email);
    const demo = role === 'student' ? DEMO_STUDENT : DEMO_PROFESSOR;
    if (!saved && demo.email.toLowerCase() !== email.toLowerCase()) fail(404, 'USER_NOT_FOUND', '이 메일로 가입된 계정을 찾을 수 없어요. 먼저 회원가입해 주세요.');
    const session = saved ?? demo;
    const result: LoginResponse = { userId: role === 'student' ? 1 : 2, role: input.role, name: session.name, accessToken: `mock-${role}-${input.emailId}` };
    return result;
  }, '로그인 성공');
}
/** A2 POST /auth/logout — Bearer(학생·교수) */
export function logout() { return mockRequest<null>('A2', () => null, '로그아웃 성공'); }
/** A3 POST /auth/refresh — refresh token 미확정, 안전한 목 토큰을 반환 */
export function refreshToken() { return mockRequest<{ accessToken: string }>('A3', () => ({ accessToken: 'mock-refreshed-token' }), '토큰 재발급 성공'); }
/** A4 POST /auth/signup — 권한 없음 */
export function signup(input: SignupRequest) {
  return mockRequest<SignupResponse>('A4', () => {
    if (!input.name || !input.department || !input.emailId || !input.password || !input.passwordConfirm) fail(400, 'INVALID_INPUT', '필수 정보를 모두 입력해 주세요.');
    if (!/^[a-zA-Z0-9._-]{2,}$/.test(input.emailId)) fail(400, 'INVALID_EMAIL', '학교 메일 아이디를 확인해 주세요.');
    if (input.password.length < 8) fail(400, 'PASSWORD_TOO_SHORT', '비밀번호는 8자 이상 입력해 주세요.');
    if (input.password !== input.passwordConfirm) fail(400, 'PASSWORD_MISMATCH', '비밀번호가 서로 일치하지 않아요.');
    const profile: Session = { name: input.name, role: toLegacyRole(input.role), email: `${input.emailId}@hufs.ac.kr`, studentId: input.studentId ?? input.professorId ?? '', department: input.department, year: undefined, setupComplete: true };
    if (getSavedProfile(profile.role, profile.email)) fail(409, 'DUPLICATE_USER', '이미 가입된 계정이에요.');
    saveProfile(profile);
    return { userId: profile.role === 'student' ? 1 : 2, role: input.role, accessToken: `mock-${profile.role}-${input.emailId}` };
  }, '회원가입 성공');
}
/** A5 GET /users/me — Bearer(학생·교수) */
export function getMe() {
  return mockRequest<UserProfile>('A5', () => {
    const session = readSession() ?? DEMO_STUDENT;
    const role: Role = session.role === 'student' ? 'STUDENT' : 'PROFESSOR';
    return { userId: role === 'STUDENT' ? 1 : 2, role, name: session.name, email: session.email, studentId: role === 'STUDENT' ? session.studentId : undefined, professorId: role === 'PROFESSOR' ? session.studentId : undefined, department: session.department, year: session.year, room: session.room, emailVerified: true, language: 'KO', setupComplete: session.setupComplete };
  });
}
function sessionFromProfile(profile: UserProfile, fallback: Session): Session {
  return { ...fallback, name: profile.name, email: profile.email, studentId: profile.studentId ?? profile.professorId ?? fallback.studentId, department: profile.department, year: profile.year, room: profile.room, setupComplete: profile.setupComplete };
}
/** A1 + A5: establish the local mock session, then hydrate the signed-in profile through GET /users/me. */
export async function loginWithProfile(input: LoginRequest): Promise<Session> {
  const result = await login(input);
  saveAccessToken(result.accessToken);
  const role = result.role === 'STUDENT' ? 'student' : 'professor';
  const email = `${input.emailId}@hufs.ac.kr`;
  const fallback = getSavedProfile(role, email) ?? (role === 'student' ? DEMO_STUDENT : DEMO_PROFESSOR);
  const base = { ...fallback, name: result.name, email };
  saveSession(base);
  const profile = await getMe();
  const session = sessionFromProfile(profile, base);
  saveProfile(session);
  return session;
}
/** A4 + A5: create a mock account and hydrate its profile via GET /users/me. */
export async function signupWithProfile(input: SignupRequest): Promise<Session> {
  const result = await signup(input);
  saveAccessToken(result.accessToken);
  const role = input.role === 'STUDENT' ? 'student' : 'professor';
  const email = `${input.emailId}@hufs.ac.kr`;
  const base = getSavedProfile(role, email) ?? (role === 'student' ? DEMO_STUDENT : DEMO_PROFESSOR);
  const sessionBase = { ...base, name: input.name, email, studentId: input.studentId ?? input.professorId ?? '', department: input.department };
  saveSession(sessionBase);
  const profile = await getMe();
  const session = sessionFromProfile(profile, sessionBase);
  saveProfile(session);
  return session;
}
/** A6 PATCH /users/me — Bearer(학생·교수) */
export function updateMe(input: UserPatch) { return mockRequest<Partial<UserProfile>>('A6', () => { const session = readSession() ?? DEMO_STUDENT; return { userId: session.role === 'student' ? 1 : 2, role: session.role === 'student' ? 'STUDENT' : 'PROFESSOR', email: session.email, setupComplete: session.setupComplete, ...input }; }, '프로필을 수정했어요.'); }
/** A7 POST /users/me/consent — Bearer(학생만) */
export function agreeLearningConsent() { return mockRequest<{ agreed: true; agreedAt: string }>('A7', () => { const consent = { agreed: true as const, agreedAt: '2026-11-26' }; updateDemoState((state) => ({ ...state, studentSettings: { ...state.studentSettings, consent } })); return consent; }); }
/** A8 DELETE /users/me/consent — Bearer(학생만) */
export function revokeLearningConsent() { return mockRequest<{ agreed: false; agreedAt: string }>('A8', () => { const consent = { agreed: false as const, agreedAt: '' }; updateDemoState((state) => ({ ...state, studentSettings: { ...state.studentSettings, consent } })); return consent; }, '동의를 철회했어요.'); }
/** A9 GET /users/me/settings — Bearer(학생만) */
export function getUserSettings() { return mockRequest('A9', () => { const settings = getDemoState().studentSettings; return { notifications: settings.notifications as { newScope: boolean; dueTomorrow: boolean; weeklyReportMail: boolean }, consent: settings.consent as { agreed: boolean; agreedAt: string } }; }); }
/** A10 PATCH /users/me/settings — Bearer(학생만) */
export function updateUserSettings(patch: { notifications?: Partial<{ newScope: boolean; dueTomorrow: boolean; weeklyReportMail: boolean }> }) { return mockRequest('A10', () => { const current = getDemoState().studentSettings.notifications as { newScope: boolean; dueTomorrow: boolean; weeklyReportMail: boolean }; const notifications = { ...current, ...patch.notifications }; updateDemoState((state) => ({ ...state, studentSettings: { ...state.studentSettings, notifications } })); return { notifications }; }, '설정을 수정했어요.'); }
/** A11 GET /users/me/export?format=json|csv — Bearer(학생만) */
export function exportLearningData(format: 'json' | 'csv' = 'json') { return mockRequest('A11', () => ({ format, fileName: `hufs-echo-demo.${format}`, content: format === 'json' ? '{}' : '' }), '내 학습 기록을 준비했어요.'); }
