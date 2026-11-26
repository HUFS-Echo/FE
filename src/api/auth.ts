import { DEMO_PROFESSOR, DEMO_STUDENT, getSavedProfile, readSession, saveProfile, type Session } from '../lib/session';
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
/** A6 PATCH /users/me — Bearer(학생·교수) */
export function updateMe(input: UserPatch) { return mockRequest<Partial<UserProfile>>('A6', () => { const session = readSession() ?? DEMO_STUDENT; return { userId: session.role === 'student' ? 1 : 2, role: session.role === 'student' ? 'STUDENT' : 'PROFESSOR', email: session.email, setupComplete: session.setupComplete, ...input }; }, '프로필을 수정했어요.'); }
/** A7 POST /users/me/consent — Bearer(학생만) */
export function agreeLearningConsent() { return mockRequest<{ agreed: true; agreedAt: string }>('A7', () => ({ agreed: true, agreedAt: '2026-11-26' })); }
/** A8 DELETE /users/me/consent — Bearer(학생만) */
export function revokeLearningConsent() { return mockRequest<{ agreed: false }>('A8', () => ({ agreed: false }), '동의를 철회했어요.'); }
/** A9 GET /users/me/settings — Bearer(학생만) */
export function getUserSettings() { return mockRequest('A9', () => ({ notifications: { newScope: true, dueTomorrow: true, weeklyReportMail: false }, consent: { agreed: true, agreedAt: '2026-11-17' } })); }
/** A10 PATCH /users/me/settings — Bearer(학생만) */
export function updateUserSettings(patch: { notifications?: Partial<{ newScope: boolean; dueTomorrow: boolean; weeklyReportMail: boolean }> }) { return mockRequest('A10', () => ({ notifications: { newScope: true, dueTomorrow: true, weeklyReportMail: false, ...patch.notifications } }), '설정을 수정했어요.'); }
/** A11 GET /users/me/export?format=json|csv — Bearer(학생만) */
export function exportLearningData(format: 'json' | 'csv' = 'json') { return mockRequest('A11', () => ({ format, fileName: `hufs-echo-demo.${format}`, content: format === 'json' ? '{}' : '' }), '내 학습 기록을 준비했어요.'); }
